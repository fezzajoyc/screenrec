"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { downloadBlob } from "@/components/client-ui";
import {
  GIF_DURATION_OPTIONS,
  GIF_FPS_OPTIONS,
  GIF_WIDTH_OPTIONS,
  formatBytes,
  gifDelayMs,
  gifFrameCount,
} from "../_lib/recording";
import { ActionButton, Alert, Field, Note, pick, RecDot, Select, Stat } from "./rec-ui";

/**
 * 屏幕 → GIF 引擎:getDisplayMedia → 定时抽帧(canvas.toBlob/webp 存每帧)
 * → 帧序列预览(逐帧解码回放)→ gifenc 逐帧量化编码 → .gif 下载。
 *
 * 内存策略(诚实工程):帧以压缩 webp Blob 形式暂存(每帧几十 KB 量级),
 * 预览与编码都按需 createImageBitmap 逐帧解码,不缓存位图 —— 60s×15fps 的
 * 极限档也不会把内存打爆。gifenc(≈10KB)只在点击导出时 dynamic import。
 */

const S = {
  fps: {
    en: "Frames per second",
    zh: "帧率",
    ja: "フレームレート",
    es: "Fotogramas por segundo",
    pt: "Quadros por segundo",
  },
  duration: {
    en: "Max duration",
    zh: "最长时长",
    ja: "最長時間",
    es: "Duración máxima",
    pt: "Duração máxima",
  },
  width: {
    en: "GIF width",
    zh: "GIF 宽度",
    ja: "GIF の幅",
    es: "Ancho del GIF",
    pt: "Largura do GIF",
  },
  seconds: { en: "s", zh: "秒", ja: "秒", es: "s", pt: "s" },
  start: {
    en: "Capture screen",
    zh: "开始捕获屏幕",
    ja: "画面をキャプチャ",
    es: "Capturar pantalla",
    pt: "Capturar tela",
  },
  stop: {
    en: "Finish capture",
    zh: "结束捕获",
    ja: "キャプチャを終了",
    es: "Terminar captura",
    pt: "Terminar captura",
  },
  stopHint: {
    en: "Capture ends automatically at the max duration, or stop it any time — you keep exactly the frames taken so far.",
    zh: "到达最长时间会自动结束,也可以随时手动停止——保留到目前为止捕获的全部帧。",
    ja: "最長時間で自動終了しますが、いつでも手動で止められます。その時点までのフレームがそのまま使われます。",
    es: "La captura termina sola al llegar a la duración máxima, o deténgala cuando quiera: se conservan exactamente los fotogramas tomados hasta entonces.",
    pt: "A captura termina sozinha na duração máxima, ou pare quando quiser: você fica exatamente com os quadros capturados até então.",
  },
  frames: { en: "Frames", zh: "帧数", ja: "フレーム", es: "Fotogramas", pt: "Quadros" },
  previewTitle: {
    en: "Preview",
    zh: "预览",
    ja: "プレビュー",
    es: "Vista previa",
    pt: "Pré-visualização",
  },
  previewNote: {
    en: "This loop is your GIF, played back frame for frame before you export it.",
    zh: "这段循环就是你的 GIF——导出前逐帧回放给你确认。",
    ja: "このループがそのまま GIF です。書き出し前にフレーム単位で再生して確認できます。",
    es: "Este bucle es su GIF, reproducido fotograma a fotograma antes de exportarlo.",
    pt: "Este loop é o seu GIF, reproduzido quadro a quadro antes de exportar.",
  },
  export: {
    en: "Export GIF",
    zh: "导出 GIF",
    ja: "GIF を書き出す",
    es: "Exportar GIF",
    pt: "Exportar GIF",
  },
  discard: {
    en: "Discard and recapture",
    zh: "丢弃并重新捕获",
    ja: "破棄して撮り直す",
    es: "Descartar y volver a capturar",
    pt: "Descartar e capturar de novo",
  },
  encoding: {
    en: "Encoding frame {i} of {n}…",
    zh: "正在编码第 {i} / {n} 帧……",
    ja: "フレーム {i} / {n} をエンコード中…",
    es: "Codificando fotograma {i} de {n}…",
    pt: "Codificando quadro {i} de {n}…",
  },
  cancel: {
    en: "Cancel encoding",
    zh: "取消编码",
    ja: "エンコードを中止",
    es: "Cancelar codificación",
    pt: "Cancelar codificação",
  },
  download: {
    en: "Download GIF",
    zh: "下载 GIF",
    ja: "GIF をダウンロード",
    es: "Descargar GIF",
    pt: "Baixar GIF",
  },
  again: {
    en: "Make another GIF",
    zh: "再做一张",
    ja: "もう一枚作る",
    es: "Hacer otro GIF",
    pt: "Fazer outro GIF",
  },
  unsupported: {
    en: "This browser can't capture your screen here. GIF capture needs getDisplayMedia plus canvas frame access — desktop Chrome, Edge and Firefox work; Safari supports screen capture only partially.",
    zh: "当前浏览器无法在这里捕获屏幕。GIF 捕获需要 getDisplayMedia 和 canvas 逐帧访问——桌面版 Chrome、Edge、Firefox 可用,Safari 对屏幕捕获仅部分支持。",
    ja: "このブラウザでは画面をキャプチャできません。GIF キャプチャには getDisplayMedia と canvas のフレームアクセスが必要です。デスクトップの Chrome・Edge・Firefox は対応、Safari は部分的です。",
    es: "Este navegador no puede capturar su pantalla aquí. La captura necesita getDisplayMedia y acceso a fotogramas del canvas: funcionan en Chrome, Edge y Firefox de escritorio; Safari solo en parte.",
    pt: "Este navegador não consegue capturar sua tela aqui. A captura precisa de getDisplayMedia e acesso a quadros do canvas: funcionam no Chrome, Edge e Firefox de desktop; Safari só em parte.",
  },
  perm: {
    en: "Permission was denied, so nothing was captured. Click start again and pick a tab, window or screen in the browser's own prompt.",
    zh: "授权被拒绝,没有捕获到任何内容。请重新点击开始,并在浏览器弹窗里选择要共享的标签页、窗口或屏幕。",
    ja: "権限が拒否されたため、何もキャプチャされていません。もう一度開始を押し、ブラウザのダイアログで選んでください。",
    es: "Se denegó el permiso y no se capturó nada. Pulse empezar de nuevo y elija pestaña, ventana o pantalla en el aviso del navegador.",
    pt: "A permissão foi negada e nada foi capturado. Clique em começar de novo e escolha aba, janela ou tela no aviso do navegador.",
  },
  empty: {
    en: "No frames were captured. Try again — if the browser prompt is cancelled, nothing is recorded.",
    zh: "没有捕获到任何帧。请重试——如果取消了浏览器弹窗,就不会有任何记录。",
    ja: "フレームが 1 枚も取れませんでした。もう一度お試しください。ダイアログをキャンセルした場合は何も記録されません。",
    es: "No se capturó ningún fotograma. Inténtelo de nuevo: si cancela el aviso del navegador, no queda nada.",
    pt: "Nenhum quadro foi capturado. Tente de novo: se você cancelar o aviso do navegador, nada fica registrado.",
  },
  genericErr: {
    en: "Something failed. Nothing was stored anywhere — you can retry immediately.",
    zh: "出了点问题。没有在任何地方保存任何内容——可以立即重试。",
    ja: "問題が発生しました。どこにも保存されていないので、すぐ再試行できます。",
    es: "Algo falló. No se guardó nada en ningún sitio: puede reintentarlo enseguida.",
    pt: "Algo falhou. Nada foi armazenado — você pode tentar de novo já.",
  },
  budget: {
    en: "Up to {n} frames at {fps} fps",
    zh: "最多 {n} 帧({fps} 帧/秒)",
    ja: "最大 {n} フレーム({fps} fps)",
    es: "Hasta {n} fotogramas a {fps} fps",
    pt: "Até {n} quadros a {fps} fps",
  },
  heavyNote: {
    en: "Long GIFs at large widths are heavy to encode. For 60 s, 480 px is the smooth choice; 1080 px is best kept short.",
    zh: "时长长、宽度大的 GIF 编码较重。60 秒建议选 480px;1080px 适合短片段。",
    ja: "長時間・大幅の GIF はエンコードが重くなります。60 秒なら 480px が快適で、1080px は短めがおすすめです。",
    es: "Los GIF largos y anchos cuestan de codificar. Para 60 s, 480 px va fluido; 1080 px mejor en clips cortos.",
    pt: "GIFs longos e largos pesam na codificação. Para 60 s, 480 px vai liso; 1080 px melhor para clipes curtos.",
  },
  captureAria: {
    en: "Live preview of the screen being captured",
    zh: "正在捕获的屏幕实时预览",
    ja: "キャプチャ中の画面のライブプレビュー",
    es: "Vista previa en vivo de la pantalla capturada",
    pt: "Pré-visualização ao vivo da tela capturada",
  },
  previewAria: {
    en: "Animated preview of the captured frames",
    zh: "捕获帧的动画预览",
    ja: "キャプチャしたフレームのアニメーションプレビュー",
    es: "Vista previa animada de los fotogramas capturados",
    pt: "Pré-visualização animada dos quadros capturados",
  },
};

function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

type Phase = "idle" | "capturing" | "preview" | "exporting" | "done";

export function ScreenGifEngine() {
  const { locale } = useI18n();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [fps, setFps] = useState("10");
  const [duration, setDuration] = useState("10");
  const [width, setWidth] = useState("480");
  const [phase, setPhase] = useState<Phase>("idle");
  const [frameCount, setFrameCount] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [progress, setProgress] = useState({ i: 0, n: 0 });
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [error, setError] = useState<"perm" | "empty" | "generic" | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const drawVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);
  const stopFlagRef = useRef(false);
  const cancelExportRef = useRef(false);

  useEffect(() => {
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function" &&
      typeof HTMLCanvasElement !== "undefined" &&
      typeof createImageBitmap === "function";
    setSupported(ok);
  }, []);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  const stopCapture = useCallback(async () => {
    if (stopFlagRef.current) return;
    stopFlagRef.current = true;
    clearTimers();
    // 等最后一张 in-flight 的 toBlob 落地
    await new Promise((r) => setTimeout(r, 180));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    drawVideoRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    if (framesRef.current.length === 0) {
      setPhase("idle");
      setError("empty");
      return;
    }
    setFrameCount(framesRef.current.length);
    setPhase("preview");
  }, [clearTimers]);

  const startCapture = useCallback(async () => {
    setError(null);
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!md || typeof md.getDisplayMedia !== "function") {
      setSupported(false);
      return;
    }
    const fpsN = Number(fps);
    const durN = Number(duration);
    const widthN = Number(width);
    const budget = gifFrameCount(fpsN, durN);
    const delay = gifDelayMs(fpsN);
    if (!budget || !delay) {
      setError("generic");
      return;
    }
    stopFlagRef.current = false;
    cancelExportRef.current = false;
    try {
      const stream = await md.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: false,
      });
      streamRef.current = stream;

      // 离屏 video 专门供 canvas 抽帧(不在 DOM 里也能解码)
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("video metadata failed"));
      });
      await video.play().catch(() => {});
      drawVideoRef.current = video;

      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;
      const w = widthN;
      const h = Math.max(2, Math.round((w * vh) / vw / 2) * 2);
      setDims({ w, h });

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");

      framesRef.current = [];
      setFrameCount(0);
      setPhase("capturing");

      let pending = false;
      const tick = () => {
        if (stopFlagRef.current) return;
        const v = drawVideoRef.current;
        if (!v || v.readyState < 2 || pending) return;
        pending = true;
        ctx.drawImage(v, 0, 0, w, h);
        canvas.toBlob(
          (b) => {
            pending = false;
            if (b) {
              framesRef.current.push(b);
              setFrameCount(framesRef.current.length);
              if (framesRef.current.length >= budget) void stopCapture();
            }
          },
          "image/webp",
          0.8,
        );
      };
      intervalRef.current = window.setInterval(tick, delay);
      autoStopRef.current = window.setTimeout(() => void stopCapture(), durN * 1000 + 250);
    } catch (e) {
      clearTimers();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      drawVideoRef.current = null;
      stopFlagRef.current = true;
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" ? "perm" : "generic");
      setPhase("idle");
    }
  }, [clearTimers, duration, fps, stopCapture, width]);

  // 捕获中:把流接到可见预览
  useEffect(() => {
    if (phase === "capturing" && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      void liveVideoRef.current.play().catch(() => {});
    }
  }, [phase]);

  // 预览:逐帧解码回放(不缓存位图,内存恒定)
  useEffect(() => {
    if (phase !== "preview" || !dims) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    const delay = gifDelayMs(Number(fps)) ?? 100;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    void (async () => {
      let i = 0;
      while (!cancelled) {
        const blob = framesRef.current[i];
        if (!blob) {
          i = 0;
          await sleep(delay);
          continue;
        }
        try {
          const bmp = await createImageBitmap(blob);
          if (cancelled) {
            bmp.close();
            return;
          }
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
          bmp.close();
        } catch {
          /* 解码失败的帧跳过 */
        }
        i = (i + 1) % framesRef.current.length;
        await sleep(delay);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, dims, fps]);

  const exportGif = useCallback(async () => {
    if (!dims || framesRef.current.length === 0) return;
    setPhase("exporting");
    setProgress({ i: 0, n: framesRef.current.length });
    cancelExportRef.current = false;
    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const delay = gifDelayMs(Number(fps)) ?? 100;
      const gif = GIFEncoder();
      const work = document.createElement("canvas");
      work.width = dims.w;
      work.height = dims.h;
      const wctx = work.getContext("2d", { willReadFrequently: true });
      if (!wctx) throw new Error("no 2d context");
      const n = framesRef.current.length;
      for (let i = 0; i < n; i++) {
        if (cancelExportRef.current) {
          setPhase("preview");
          return;
        }
        const bmp = await createImageBitmap(framesRef.current[i]);
        wctx.drawImage(bmp, 0, 0, dims.w, dims.h);
        bmp.close();
        const { data } = wctx.getImageData(0, 0, dims.w, dims.h);
        const palette = quantize(data, 256, { format: "rgb565" });
        const index = applyPalette(data, palette, "rgb565");
        gif.writeFrame(index, dims.w, dims.h, { palette, delay });
        setProgress({ i: i + 1, n });
        // 让出主线程,进度条能呼吸
        await new Promise((r) => setTimeout(r, 0));
      }
      gif.finish();
      const u8 = gif.bytes();
      const buf = new ArrayBuffer(u8.byteLength);
      new Uint8Array(buf).set(u8);
      const blob = new Blob([buf], { type: "image/gif" });
      if (blob.size === 0) throw new Error("empty gif");
      const url = URL.createObjectURL(blob);
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url, blob };
      });
      setPhase("done");
    } catch {
      setError("generic");
      setPhase("preview");
    }
  }, [dims, fps]);

  // 卸载清理
  useEffect(() => {
    return () => {
      stopFlagRef.current = true;
      cancelExportRef.current = true;
      clearTimers();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
      framesRef.current = [];
    };
  }, [clearTimers]);

  const reset = () => {
    framesRef.current = [];
    setFrameCount(0);
    setDims(null);
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setPhase("idle");
    setError(null);
  };

  const budget = gifFrameCount(Number(fps), Number(duration));
  const filename = `screenrec-${Number(duration)}s.gif`;

  return (
    <ToolPanel>
      {supported === false ? (
        <Alert kind="error">{pick(locale, S.unsupported)}</Alert>
      ) : (
        <>
          {phase === "idle" && (
            <>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label={pick(locale, S.fps)}>
                  <Select
                    value={fps}
                    onChange={setFps}
                    aria={pick(locale, S.fps)}
                    options={GIF_FPS_OPTIONS.map((v) => ({ value: String(v), label: String(v) }))}
                  />
                </Field>
                <Field label={pick(locale, S.duration)}>
                  <Select
                    value={duration}
                    onChange={setDuration}
                    aria={pick(locale, S.duration)}
                    options={GIF_DURATION_OPTIONS.map((v) => ({
                      value: String(v),
                      label: `${v} ${pick(locale, S.seconds)}`,
                    }))}
                  />
                </Field>
                <Field label={pick(locale, S.width)}>
                  <Select
                    value={width}
                    onChange={setWidth}
                    aria={pick(locale, S.width)}
                    options={GIF_WIDTH_OPTIONS.map((v) => ({ value: String(v), label: `${v} px` }))}
                  />
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <ActionButton onClick={() => void startCapture()} aria={pick(locale, S.start)}>
                  ● {pick(locale, S.start)}
                </ActionButton>
                {budget && (
                  <span className="mono text-[12px] text-[var(--color-sub)]">
                    {fill(pick(locale, S.budget), { n: budget, fps })}
                  </span>
                )}
              </div>
              <div className="mt-4"><Note>{pick(locale, S.heavyNote)}</Note></div>
            </>
          )}

          {phase === "capturing" && (
            <>
              <div className="flex items-center gap-3">
                <RecDot />
                <span className="text-[13.5px] font-medium text-[var(--color-sub)]">
                  {fps} fps · {width} px · {Number(duration)} {pick(locale, S.seconds)}
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border hairline bg-black/90">
                <video
                  ref={liveVideoRef}
                  muted
                  playsInline
                  autoPlay
                  aria-label={pick(locale, S.captureAria)}
                  className="max-h-[50vh] w-full"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
                <Stat label={pick(locale, S.frames)} value={String(frameCount)} />
                <Stat
                  label={pick(locale, S.duration)}
                  value={`${Number(duration)} ${pick(locale, S.seconds)}`}
                />
              </div>
              <div className="mt-5">
                <ActionButton tone="stop" onClick={() => void stopCapture()} aria={pick(locale, S.stop)}>
                  ■ {pick(locale, S.stop)}
                </ActionButton>
              </div>
              <div className="mt-4"><Note>{pick(locale, S.stopHint)}</Note></div>
            </>
          )}

          {(phase === "preview" || phase === "exporting") && dims && (
            <>
              <div className="flex items-center gap-3">
                {phase === "exporting" ? <RecDot /> : <span className="text-[15px] font-semibold text-[var(--color-ink)]">{pick(locale, S.previewTitle)}</span>}
                <span className="mono text-[12.5px] text-[var(--color-sub)]">
                  {frameCount} {pick(locale, S.frames)} · {dims.w}×{dims.h} · {fps} fps
                </span>
              </div>
              <div className="mt-4 max-w-2xl overflow-hidden rounded-2xl border hairline bg-black/90">
                <canvas
                  ref={previewCanvasRef}
                  width={dims.w}
                  height={dims.h}
                  aria-label={pick(locale, S.previewAria)}
                  className="w-full"
                />
              </div>
              {phase === "preview" ? (
                <>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <ActionButton onClick={() => void exportGif()} aria={pick(locale, S.export)}>
                      {pick(locale, S.export)}
                    </ActionButton>
                    <ActionButton tone="ghost" onClick={reset}>
                      {pick(locale, S.discard)}
                    </ActionButton>
                  </div>
                  <div className="mt-4"><Note>{pick(locale, S.previewNote)}</Note></div>
                </>
              ) : (
                <>
                  <div className="mt-5">
                    <Note>{fill(pick(locale, S.encoding), { i: progress.i, n: progress.n })}</Note>
                    <div
                      className="mt-3 h-2 w-full max-w-sm overflow-hidden rounded-full bg-[var(--color-surface)]"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={progress.n}
                      aria-valuenow={progress.i}
                    >
                      <div
                        className="h-full bg-[var(--color-ink)] transition-[width]"
                        style={{ width: `${progress.n > 0 ? (progress.i / progress.n) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-4">
                      <ActionButton tone="ghost" onClick={() => (cancelExportRef.current = true)}>
                        {pick(locale, S.cancel)}
                      </ActionButton>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {phase === "done" && result && (
            <>
              <div className="max-w-2xl overflow-hidden rounded-2xl border hairline bg-[var(--color-surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.url} alt={pick(locale, S.previewAria)} className="w-full" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ActionButton onClick={() => downloadBlob(result.blob, filename)} aria={pick(locale, S.download)}>
                  ▼ {pick(locale, S.download)}
                </ActionButton>
                <ActionButton tone="ghost" onClick={reset}>
                  {pick(locale, S.again)}
                </ActionButton>
                <span className="mono text-[12.5px] text-[var(--color-sub)]">
                  {filename} · {formatBytes(result.blob.size)}
                </span>
              </div>
            </>
          )}

          {error && (
            <div className="mt-5">
              <Alert kind={error === "generic" || error === "perm" ? "error" : "warn"}>
                {error === "perm"
                  ? pick(locale, S.perm)
                  : error === "empty"
                    ? pick(locale, S.empty)
                    : pick(locale, S.genericErr)}
              </Alert>
            </div>
          )}
        </>
      )}
    </ToolPanel>
  );
}
