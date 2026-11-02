import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "@/mcp/server";

async function connect() {
  const server = createServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe("screenrec MCP server", () => {
  it("exposes exactly the 3 recording-decision tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "format_duration",
      "pick_mime_type",
      "supported_recording_info",
    ]);
    await client.close();
  });

  it("formats durations against the clock string contract", async () => {
    const client = await connect();
    const cases: [number, string][] = [
      [0, "0:00"],
      [65000, "1:05"],
      [59000, "0:59"],
      [3754000, "1:02:34"],
    ];
    for (const [ms, want] of cases) {
      const r = await client.callTool({ name: "format_duration", arguments: { ms } });
      expect((r.content as any)[0].text).toBe(want);
    }
    await client.close();
  });

  it("format_duration rejects negative and non-finite input at the logic layer (isError, not throw)", async () => {
    const client = await connect();
    const neg = await client.callTool({ name: "format_duration", arguments: { ms: -1 } });
    expect((neg as any).isError).toBe(true);
    expect((neg.content as any)[0].text).toContain("finite");
    // JSON 里 NaN 会序列化成 null,客户端无法判 NaN —— 必须由 handler 用 isError 表达
    const nan = await client.callTool({ name: "format_duration", arguments: { ms: "NaN" as unknown as number } });
    expect((nan as any).isError).toBe(true);
    await client.close();
  });

  it("format_duration schema violations come back as isError results (-32602), not rejections", async () => {
    const client = await connect();
    const schemaBad = await client.callTool({ name: "format_duration", arguments: { ms: "lots" } });
    expect((schemaBad as any).isError).toBe(true);
    expect((schemaBad.content as any)[0].text).toContain("-32602");
    await client.close();
  });

  it("pick_mime_type negotiates the preference order from a browser support list", async () => {
    const client = await connect();
    const vp9 = await client.callTool({
      name: "pick_mime_type",
      arguments: { supports: ["video/mp4", "video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus"] },
    });
    expect(JSON.parse((vp9.content as any)[0].text).mimeType).toBe("video/webm;codecs=vp9,opus");

    const vp8 = await client.callTool({
      name: "pick_mime_type",
      arguments: { supports: ["video/mp4", "video/webm;codecs=vp8,opus"] },
    });
    expect(JSON.parse((vp8.content as any)[0].text).mimeType).toBe("video/webm;codecs=vp8,opus");

    const loose = await client.callTool({
      name: "pick_mime_type",
      arguments: { supports: ["video/webm"] },
    });
    expect(JSON.parse((loose.content as any)[0].text).mimeType).toBe("video/webm");
    await client.close();
  });

  it("pick_mime_type returns the preference order without arguments and isError when nothing is usable", async () => {
    const client = await connect();
    const bare = await client.callTool({ name: "pick_mime_type", arguments: {} });
    const parsed = JSON.parse((bare.content as any)[0].text);
    expect(parsed.best_default).toBe("video/webm;codecs=vp9,opus");
    expect(parsed.preference_order.length).toBeGreaterThanOrEqual(5);

    const none = await client.callTool({ name: "pick_mime_type", arguments: { supports: ["audio/ogg"] } });
    expect((none as any).isError).toBe(true);
    expect((none.content as any)[0].text).toContain("none of the listed");
    await client.close();
  });

  it("supported_recording_info reports Node honestly and computes a Chrome-like env from overrides", async () => {
    const client = await connect();
    const here = await client.callTool({ name: "supported_recording_info", arguments: {} });
    const hereParsed = JSON.parse((here.content as any)[0].text);
    // vitest 跑在 Node:没有浏览器媒体 API —— 诚实报告,不假装能录
    expect(hereParsed.media_recorder).toBe(false);
    expect(hereParsed.mime_type).toBeNull();
    expect(hereParsed.screen_capture).toBe(false);

    const chrome = await client.callTool({
      name: "supported_recording_info",
      arguments: {
        has_get_display_media: true,
        has_get_user_media: true,
        has_media_recorder: true,
        supports_mime_types: ["video/webm;codecs=vp8,opus", "video/webm"],
      },
    });
    const chromeParsed = JSON.parse((chrome.content as any)[0].text);
    expect(chromeParsed.screen_capture).toBe(true);
    expect(chromeParsed.webcam).toBe(true);
    expect(chromeParsed.mime_type).toBe("video/webm;codecs=vp8,opus");
    expect(chromeParsed.container).toBe("webm");
    expect(chromeParsed.privacy).toContain("nothing is uploaded");

    const noCam = await client.callTool({
      name: "supported_recording_info",
      arguments: { has_get_display_media: false, has_get_user_media: true, has_media_recorder: true, supports_mime_types: ["video/webm"] },
    });
    const noCamParsed = JSON.parse((noCam.content as any)[0].text);
    expect(noCamParsed.screen_capture).toBe(false);
    expect(noCamParsed.webcam).toBe(true);
    await client.close();
  });
});
