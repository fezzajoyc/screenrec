/**
 * ScreenRec 录制核心纯逻辑(Node 可测,零 DOM 运行时依赖)。
 *
 * 浏览器引擎(engine-*)负责 UI 编排和真实的 getDisplayMedia/getUserMedia/
 * MediaRecorder/canvas 调用;这里只放"可独立验证"的决策:
 *   - 编码格式协商(pickMimeType / pickMimeTypeFromList)
 *   - 轨道合并规则(combineAudioTracks)
 *   - 体积 / 时长格式化(formatBytes / formatDuration)
 *   - GIF 帧预算与延时(gifFrameCount / gifDelayMs)
 *   - 能力探测(supportedRecordingInfo,输入可注入,Node 里也可调用)
 *
 * 约定:所有函数对非法输入不抛异常,返回显式回退值(空串 / null / 0),
 * 让调用方总能走"诚实降级"路径。
 */

export const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
] as const;

export type TypeSupported = (mimeType: string) => boolean;

function defaultTypeSupported(m: string): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof MediaRecorder.isTypeSupported === "function" &&
    MediaRecorder.isTypeSupported(m)
  );
}

/**
 * 挑选当前环境最好的 MediaRecorder 编码格式:
 * vp9,opus > vp8,opus > 其他 webm 变体 > mp4。一个都不支持 → ""(不可录制)。
 * `supported` 可注入(mock 测试 / 换探测源);默认用 MediaRecorder.isTypeSupported。
 */
export function pickMimeType(supported: TypeSupported = defaultTypeSupported): string {
  for (const m of MIME_CANDIDATES) {
    if (supported(m)) return m;
  }
  return "";
}

/**
 * 给定一份"已确认支持"的 mimeType 列表,返回其中按偏好排序的最佳者。
 * 严格命中 MIME_CANDIDATES 优先;否则宽松回退(任意 webm → video/webm,任意 mp4 → 第一条)。
 * 无任何可用项 → null。
 */
export function pickMimeTypeFromList(supports: readonly string[]): string | null {
  if (!Array.isArray(supports)) return null;
  const set = new Set(supports.filter((s): s is string => typeof s === "string" && s.length > 0));
  if (set.size === 0) return null;
  for (const m of MIME_CANDIDATES) {
    if (set.has(m)) return m;
  }
  if ([...set].some((s) => s.startsWith("video/webm"))) return "video/webm";
  const mp4 = [...set].find((s) => s.startsWith("video/mp4"));
  return mp4 ?? null;
}

/**
 * 合成一条供 MediaRecorder 用的流:屏幕/窗口画面 + 屏幕自带音频 + 麦克风音频。
 * 轨道顺序固定:video → 屏幕音频 → 麦克风;不复制流,直接引用原轨道。
 * 返回新 MediaStream(不持有 display/mic 的生命周期,由调用方负责停轨)。
 */
export function combineAudioTracks(display: MediaStream, mic?: MediaStream): MediaStream {
  const out = new MediaStream();
  for (const track of display.getVideoTracks()) out.addTrack(track);
  for (const track of display.getAudioTracks()) out.addTrack(track);
  if (mic) {
    for (const track of mic.getAudioTracks()) out.addTrack(track);
  }
  return out;
}

/** 字节数 → 人读字符串:0→"0 B",1023→"1023 B",1024→"1.0 KB",1048576→"1.0 MB"。 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = -1;
  do {
    value /= 1024;
    i++;
  } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(1)} ${units[i]}`;
}

/** 毫秒 → 计时器字符串:65000→"1:05",0→"0:00",3754000→"1:02:34"(超一小时带小时位)。 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/* ------------------------------------------------------------------ */
/* GIF(帧预算在录制前就能算,属于纯决策;像素编码留在引擎里)          */
/* ------------------------------------------------------------------ */

export const GIF_FPS_OPTIONS = [5, 10, 15] as const;
export const GIF_DURATION_OPTIONS = [10, 30, 60] as const;
export const GIF_WIDTH_OPTIONS = [480, 720, 1080] as const;

/** GIF 总帧数预算 = fps × 秒数。任一输入非有限或 ≤0 → null。 */
export function gifFrameCount(fps: number, maxDurationSec: number): number | null {
  if (!Number.isFinite(fps) || !Number.isFinite(maxDurationSec) || fps <= 0 || maxDurationSec <= 0) return null;
  return Math.ceil(fps * maxDurationSec);
}

/** GIF 每帧延时(ms)= round(1000/fps)。非法 fps → null。 */
export function gifDelayMs(fps: number): number | null {
  if (!Number.isFinite(fps) || fps <= 0) return null;
  return Math.round(1000 / fps);
}

/* ------------------------------------------------------------------ */
/* 能力探测:纯函数 + 可注入环境,MCP 与浏览器共用同一份判定             */
/* ------------------------------------------------------------------ */

export type RecordingEnv = {
  hasGetDisplayMedia?: boolean;
  hasGetUserMedia?: boolean;
  hasMediaRecorder?: boolean;
  isTypeSupported?: TypeSupported;
};

export type RecordingSupportInfo = {
  /** 能开始屏幕录制 = 有 getDisplayMedia 且有 MediaRecorder */
  screenCapture: boolean;
  /** 能开始摄像头录制 = 有 getUserMedia 且有 MediaRecorder */
  webcam: boolean;
  mediaRecorder: boolean;
  /** 本环境会选中的编码格式;MediaRecorder 不存在 → null */
  mimeType: string | null;
  /** mimeType 的封装家族;不可录制 → null */
  container: "webm" | "mp4" | null;
  /** 一句话人读结论(AI 客户端直接可引用) */
  note: string;
};

/**
 * 探测当前环境的录制能力。默认从全局 navigator / MediaRecorder 读,
 * Node(或测试)里通过 env 注入;永不抛异常。
 */
export function supportedRecordingInfo(env?: RecordingEnv): RecordingSupportInfo {
  const e = env ?? {};
  const hasGetDisplayMedia =
    e.hasGetDisplayMedia ??
    (typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function");
  const hasGetUserMedia =
    e.hasGetUserMedia ??
    (typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function");
  const hasMediaRecorder = e.hasMediaRecorder ?? typeof MediaRecorder !== "undefined";
  const mimeType = hasMediaRecorder ? pickMimeType(e.isTypeSupported ?? defaultTypeSupported) : null;
  const container = mimeType ? (mimeType.includes("webm") ? "webm" : "mp4") : null;
  const screenCapture = hasGetDisplayMedia && hasMediaRecorder;
  const webcam = hasGetUserMedia && hasMediaRecorder;
  const note = !hasMediaRecorder
    ? "No MediaRecorder in this environment, so video encoding is unavailable."
    : !screenCapture && !webcam
      ? `MediaRecorder is available (best format: ${mimeType}), but no media capture API was found.`
      : `Ready to record (${mimeType}). Screen capture: ${screenCapture ? "yes" : "no"}. Webcam: ${webcam ? "yes" : "no"}. Recording happens entirely on the user's device.`;
  return { screenCapture, webcam, mediaRecorder: hasMediaRecorder, mimeType, container, note };
}
