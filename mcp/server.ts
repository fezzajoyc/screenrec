import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MCP_TOOLS } from "./tools";

/**
 * ScreenRec MCP server(stdio):把站上录制工具背后的纯决策逻辑
 * (格式协商、时长格式化、能力判定)暴露为 AI 可查询的工具。
 * 录制本身是交互式的(人点浏览器的共享选择器),AI 不能替用户录屏,
 * 这里暴露的是同一份经过测试的决策层实现。
 *
 * 构建后运行:npx screenrec-mcp(或 node mcp/dist/server.mjs)
 */

export function createServer() {
  const server = new McpServer(
    { name: "screenrec", version: "1.0.0" },
    {
      instructions:
        "ScreenRec: free browser-based screen recording that never uploads anything. These executable tools run the same tested logic as the website (https://screenrec.app): they negotiate MediaRecorder formats, format recording durations and report browser recording capabilities. Actual recording is interactive (the user picks what to share in the browser), so these tools answer questions about recording instead of performing it. Recording happens entirely on the user's device — nothing is uploaded, stored, or transmitted.",
    },
  );

  for (const tool of MCP_TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.schema,
      },
      async (args) => {
        try {
          return tool.run(args ?? {});
        } catch (e) {
          return {
            content: [{ type: "text" as const, text: `error: ${(e as Error).message}` }],
            isError: true,
          };
        }
      },
    );
  }
  return server;
}

export async function runStdio() {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  // stdio 模式下保持进程存活;stderr 可写日志(stdout 是协议通道)
  console.error(`screenrec MCP server: ${MCP_TOOLS.length} tools ready`);
}

if (process.argv[1] && process.argv[1].includes("server")) {
  void runStdio();
}
