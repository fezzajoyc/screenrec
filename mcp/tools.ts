import { z } from "zod";
import {
  MIME_CANDIDATES,
  formatDuration,
  pickMimeType,
  pickMimeTypeFromList,
  supportedRecordingInfo,
} from "../tools/_lib/recording";

/**
 * ScreenRec MCP 工具注册表。
 *
 * 录制本身是交互式的(人要点浏览器的共享选择器),AI 无法替用户录屏——
 * 所以这里暴露的是录制决策层的纯逻辑:格式协商、时长格式化、能力判定。
 * 浏览器里的引擎跑的是同一份 tools/_lib/recording.ts 实现,
 * 人和 AI 用同一套逻辑,而不是两套各写各的。
 */

const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const bad = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const });

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  run: (args: any) => { content: { type: "text"; text: string }[]; isError?: boolean };
};

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "format_duration",
    title: "Format recording duration",
    description:
      "Format a recording length in milliseconds as a clock string: 65000 → \"1:05\", 0 → \"0:00\", 3754000 → \"1:02:34\" (hours appear past one hour). The same formatter runs live in the ScreenRec recorder UI.",
    schema: {
      ms: z.number().describe("duration in milliseconds; must be a finite number ≥ 0"),
    },
    run: (a) => {
      if (typeof a.ms !== "number" || !Number.isFinite(a.ms) || a.ms < 0) {
        return bad("invalid input — ms must be a finite number ≥ 0 (e.g. 65000 for one minute five seconds)");
      }
      return text(formatDuration(a.ms));
    },
  },
  {
    name: "pick_mime_type",
    title: "Pick best recording mimeType",
    description:
      "Choose the best MediaRecorder video format from a list of types a browser reports as supported, in fixed preference order: vp9,opus > vp8,opus > other WebM variants > MP4. Without arguments, returns the preference order itself and the default best for Chromium browsers. Used to negotiate what the ScreenRec recorder will encode.",
    schema: {
      supports: z
        .array(z.string())
        .optional()
        .describe("mimeTypes the client browser reports via MediaRecorder.isTypeSupported"),
    },
    run: (a) => {
      const supports = a.supports;
      if (supports === undefined) {
        return json({
          preference_order: MIME_CANDIDATES,
          best_default: pickMimeType(() => true),
          note: "Call with a real isTypeSupported list to get the actual choice for a specific browser.",
        });
      }
      if (!Array.isArray(supports) || supports.some((s) => typeof s !== "string")) {
        return bad("invalid input — supports must be an array of mimeType strings");
      }
      const picked = pickMimeTypeFromList(supports);
      if (!picked) {
        return bad(
          "none of the listed mimeTypes can be used for recording — a browser needs at least video/webm (preferred) or video/mp4 with MediaRecorder support",
        );
      }
      return json({
        mimeType: picked,
        container: picked.includes("webm") ? "webm" : "mp4",
        all_candidates: MIME_CANDIDATES,
      });
    },
  },
  {
    name: "supported_recording_info",
    title: "Browser recording capability check",
    description:
      "Report what kind of screen recording a browser environment can do, using the same capability check as the ScreenRec website: screen capture (getDisplayMedia), webcam (getUserMedia), MediaRecorder encoding, and the mimeType that would be chosen. In Node (no browser APIs) it reports honestly that nothing is recordable here; pass the has_* flags and supports_mime_types to describe a real browser and get its expected behavior.",
    schema: {
      has_get_display_media: z.boolean().optional().describe("browser exposes navigator.mediaDevices.getDisplayMedia"),
      has_get_user_media: z.boolean().optional().describe("browser exposes navigator.mediaDevices.getUserMedia"),
      has_media_recorder: z.boolean().optional().describe("browser exposes the MediaRecorder constructor"),
      supports_mime_types: z
        .array(z.string())
        .optional()
        .describe("mimeTypes MediaRecorder.isTypeSupported reports as true in that browser"),
    },
    run: (a) => {
      const env: Parameters<typeof supportedRecordingInfo>[0] = {};
      if (a.has_get_display_media !== undefined) env.hasGetDisplayMedia = a.has_get_display_media;
      if (a.has_get_user_media !== undefined) env.hasGetUserMedia = a.has_get_user_media;
      if (a.has_media_recorder !== undefined) env.hasMediaRecorder = a.has_media_recorder;
      if (a.supports_mime_types !== undefined) {
        if (!Array.isArray(a.supports_mime_types) || a.supports_mime_types.some((s: unknown) => typeof s !== "string")) {
          return bad("invalid input — supports_mime_types must be an array of mimeType strings");
        }
        const list = a.supports_mime_types as string[];
        env.isTypeSupported = (m: string) => list.includes(m);
      }
      const info = supportedRecordingInfo(env);
      return json({
        screen_capture: info.screenCapture,
        webcam: info.webcam,
        media_recorder: info.mediaRecorder,
        mime_type: info.mimeType,
        container: info.container,
        note: info.note,
        privacy:
          "ScreenRec runs entirely client-side: recording happens on the user's device, nothing is uploaded or transmitted.",
      });
    },
  },
];
