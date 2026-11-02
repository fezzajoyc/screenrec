import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  GIF_DURATION_OPTIONS,
  GIF_FPS_OPTIONS,
  GIF_WIDTH_OPTIONS,
  MIME_CANDIDATES,
  combineAudioTracks,
  formatBytes,
  formatDuration,
  gifDelayMs,
  gifFrameCount,
  pickMimeType,
  pickMimeTypeFromList,
  supportedRecordingInfo,
} from "@/tools/_lib/recording";

/* ------------------------------------------------------------------ */
/* pickMimeType — MediaRecorder.isTypeSupported 以 mock 注入            */
/* ------------------------------------------------------------------ */

describe("pickMimeType", () => {
  it("prefers vp9,opus over everything else", () => {
    const seen: string[] = [];
    const picked = pickMimeType((m) => {
      seen.push(m);
      return m === "video/webm;codecs=vp9,opus";
    });
    expect(picked).toBe("video/webm;codecs=vp9,opus");
    // 探测顺序与偏好顺序一致:第一个问的就是最优候选
    expect(seen[0]).toBe("video/webm;codecs=vp9,opus");
  });

  it("falls through vp9 to vp8,opus to plain webm to mp4, in that order", () => {
    expect(pickMimeType((m) => m === "video/webm;codecs=vp8,opus")).toBe("video/webm;codecs=vp8,opus");
    expect(pickMimeType((m) => m === "video/webm")).toBe("video/webm");
    expect(pickMimeType((m) => m === "video/mp4")).toBe("video/mp4");
    expect(pickMimeType((m) => m === "video/webm;codecs=vp9" || m === "video/mp4")).toBe("video/webm;codecs=vp9");
  });

  it("returns empty string when nothing is supported (documented not-recordable fallback)", () => {
    expect(pickMimeType(() => false)).toBe("");
  });

  it("asks candidates in the documented preference order", () => {
    const order: string[] = [];
    pickMimeType((m) => {
      order.push(m);
      return false;
    });
    expect(order).toEqual([...MIME_CANDIDATES]);
  });
});

describe("pickMimeTypeFromList", () => {
  it("picks the preferred candidate present in the list", () => {
    expect(pickMimeTypeFromList(["video/mp4", "video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus"])).toBe(
      "video/webm;codecs=vp9,opus",
    );
    expect(pickMimeTypeFromList(["video/webm;codecs=vp8,opus"])).toBe("video/webm;codecs=vp8,opus");
  });

  it("loosely falls back to any webm, then any mp4 the list does have", () => {
    expect(pickMimeTypeFromList(["video/webm;codecs=hTotallyUnknown"])).toBe("video/webm");
    expect(pickMimeTypeFromList(["video/mp4;codecs=avc1.unknown"])).toBe("video/mp4;codecs=avc1.unknown");
  });

  it("returns null for empty, non-string or unusable lists (never throws)", () => {
    expect(pickMimeTypeFromList([])).toBeNull();
    expect(pickMimeTypeFromList(["audio/ogg", ""])).toBeNull();
    expect(pickMimeTypeFromList(undefined as unknown as string[])).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* formatBytes — 0→"0 B",1024→"1.0 KB",1048576→"1.0 MB" 锁死           */
/* ------------------------------------------------------------------ */

describe("formatBytes", () => {
  it("meets the pinned contract values", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1048576)).toBe("1.0 MB");
  });

  it("keeps sub-KB bytes as integers", () => {
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("uses one decimal inside each unit and climbs to GB/TB", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 ** 3)).toBe("1.0 GB");
    expect(formatBytes(1024 ** 4 * 1.5)).toBe("1.5 TB");
  });

  it("caps climbing at the last unit instead of overflowing the table", () => {
    expect(formatBytes(1024 ** 5)).toBe("1024.0 TB");
  });

  it("degrades honestly on negative / non-finite input", () => {
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe("0 B");
  });
});

/* ------------------------------------------------------------------ */
/* formatDuration — 计时器字符串                                       */
/* ------------------------------------------------------------------ */

describe("formatDuration", () => {
  it("formats the contract cases", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65000)).toBe("1:05");
  });

  it("pads seconds and minutes", () => {
    expect(formatDuration(59000)).toBe("0:59");
    expect(formatDuration(60000)).toBe("1:00");
    expect(formatDuration(1000)).toBe("0:01");
  });

  it("grows an hours place past one hour", () => {
    expect(formatDuration(3600000)).toBe("1:00:00");
    expect(formatDuration(3754000)).toBe("1:02:34");
  });

  it("floors partial seconds (a live timer never jumps ahead)", () => {
    expect(formatDuration(1999)).toBe("0:01");
    expect(formatDuration(65999)).toBe("1:05");
  });

  it("degrades honestly on negative / non-finite input", () => {
    expect(formatDuration(-1)).toBe("0:00");
    expect(formatDuration(Number.NaN)).toBe("0:00");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});

/* ------------------------------------------------------------------ */
/* combineAudioTracks — mock MediaStream 验证合并规则                   */
/* ------------------------------------------------------------------ */

class FakeTrack {
  constructor(
    public kind: "video" | "audio",
    public id: string,
  ) {}
}

class FakeMediaStream {
  private tracks: FakeTrack[] = [];
  addTrack(t: FakeTrack) {
    this.tracks.push(t);
  }
  getVideoTracks() {
    return this.tracks.filter((t) => t.kind === "video");
  }
  getAudioTracks() {
    return this.tracks.filter((t) => t.kind === "audio");
  }
}

describe("combineAudioTracks", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).MediaStream = FakeMediaStream;
  });
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).MediaStream;
  });

  it("merges display video + display audio + mic audio in a fixed order", () => {
    const display = new FakeMediaStream();
    display.addTrack(new FakeTrack("video", "dv1"));
    display.addTrack(new FakeTrack("audio", "da1"));
    display.addTrack(new FakeTrack("audio", "da2"));
    const mic = new FakeMediaStream();
    mic.addTrack(new FakeTrack("audio", "mic1"));

    const out = combineAudioTracks(display as unknown as MediaStream, mic as unknown as MediaStream);
    const video = out.getVideoTracks() as unknown as FakeTrack[];
    const audio = out.getAudioTracks() as unknown as FakeTrack[];
    expect(video.map((t) => t.id)).toEqual(["dv1"]);
    expect(audio.map((t) => t.id)).toEqual(["da1", "da2", "mic1"]);
  });

  it("keeps mic audio out when no mic stream is given", () => {
    const display = new FakeMediaStream();
    display.addTrack(new FakeTrack("video", "v"));
    const out = combineAudioTracks(display as unknown as MediaStream);
    expect(out.getVideoTracks()).toHaveLength(1);
    expect(out.getAudioTracks()).toHaveLength(0);
  });

  it("tolerates a display stream with no audio track (Firefox-style screen capture)", () => {
    const display = new FakeMediaStream();
    display.addTrack(new FakeTrack("video", "v"));
    const mic = new FakeMediaStream();
    mic.addTrack(new FakeTrack("audio", "m"));
    const out = combineAudioTracks(display as unknown as MediaStream, mic as unknown as MediaStream);
    expect((out.getAudioTracks() as unknown as FakeTrack[]).map((t) => t.id)).toEqual(["m"]);
  });
});

/* ------------------------------------------------------------------ */
/* GIF 预算 — fps × 时长的纯算术                                        */
/* ------------------------------------------------------------------ */

describe("gif frame budget", () => {
  it("counts frames as fps × seconds, rounded up", () => {
    expect(gifFrameCount(10, 10)).toBe(100);
    expect(gifFrameCount(15, 60)).toBe(900);
    expect(gifFrameCount(5, 30)).toBe(150);
    expect(gifFrameCount(7.5, 2)).toBe(15);
  });

  it("rejects zero, negative and non-finite fps/duration with null", () => {
    expect(gifFrameCount(0, 10)).toBeNull();
    expect(gifFrameCount(10, 0)).toBeNull();
    expect(gifFrameCount(-5, 10)).toBeNull();
    expect(gifFrameCount(Number.NaN, 10)).toBeNull();
    expect(gifFrameCount(10, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("derives the per-frame delay from fps", () => {
    expect(gifDelayMs(5)).toBe(200);
    expect(gifDelayMs(10)).toBe(100);
    expect(gifDelayMs(15)).toBe(67);
    expect(gifDelayMs(0)).toBeNull();
    expect(gifDelayMs(Number.NaN)).toBeNull();
  });

  it("exposes exactly the documented option sets", () => {
    expect([...GIF_FPS_OPTIONS]).toEqual([5, 10, 15]);
    expect([...GIF_DURATION_OPTIONS]).toEqual([10, 30, 60]);
    expect([...GIF_WIDTH_OPTIONS]).toEqual([480, 720, 1080]);
  });
});

/* ------------------------------------------------------------------ */
/* supportedRecordingInfo — 能力判定(注入环境,Node 无浏览器也真话)    */
/* ------------------------------------------------------------------ */

describe("supportedRecordingInfo", () => {
  it("in a bare Node env (no navigator APIs, no MediaRecorder) nothing is recordable — reported honestly", () => {
    const info = supportedRecordingInfo({});
    expect(info.mediaRecorder).toBe(false);
    expect(info.mimeType).toBeNull();
    expect(info.screenCapture).toBe(false);
    expect(info.webcam).toBe(false);
    expect(info.container).toBeNull();
    expect(info.note).toContain("No MediaRecorder");
  });

  it("a full Chrome-like environment gets webm + both capture paths", () => {
    const info = supportedRecordingInfo({
      hasGetDisplayMedia: true,
      hasGetUserMedia: true,
      hasMediaRecorder: true,
      isTypeSupported: (m) => m.startsWith("video/webm"),
    });
    expect(info.screenCapture).toBe(true);
    expect(info.webcam).toBe(true);
    expect(info.mimeType).toBe("video/webm;codecs=vp9,opus");
    expect(info.container).toBe("webm");
    expect(info.note).toContain("Ready to record");
  });

  it("Safari-like: MediaRecorder + webcam yes, screen capture no", () => {
    const info = supportedRecordingInfo({
      hasGetDisplayMedia: false,
      hasGetUserMedia: true,
      hasMediaRecorder: true,
      isTypeSupported: (m) => m === "video/mp4",
    });
    expect(info.screenCapture).toBe(false);
    expect(info.webcam).toBe(true);
    expect(info.mimeType).toBe("video/mp4");
    expect(info.container).toBe("mp4");
  });

  it("MediaRecorder with a codec-less checker still resolves the generic fallback", () => {
    const info = supportedRecordingInfo({
      hasGetDisplayMedia: true,
      hasMediaRecorder: true,
      isTypeSupported: (m) => m === "video/webm",
    });
    expect(info.mimeType).toBe("video/webm");
    expect(info.screenCapture).toBe(true);
  });

  it("never throws on partial or hostile input", () => {
    expect(() => supportedRecordingInfo()).not.toThrow();
    expect(() => supportedRecordingInfo({ isTypeSupported: () => false })).not.toThrow();
    const info = supportedRecordingInfo({ hasGetDisplayMedia: true, isTypeSupported: () => false });
    // Node 里没有 MediaRecorder(未注入 hasMediaRecorder)→ mimeType 为 null,不能开始录制
    expect(info.screenCapture).toBe(false);
    expect(info.mimeType).toBeNull();

    const browser = supportedRecordingInfo({ hasMediaRecorder: true, isTypeSupported: () => false });
    // 真浏览器但一个编码都不支持 → mimeType 空串(不可录制回退),同样不能开始
    expect(browser.mediaRecorder).toBe(true);
    expect(browser.mimeType).toBe("");
    expect(browser.screenCapture).toBe(false);
  });
});
