"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { downloadBlob } from "@/components/client-ui";
import {
  combineAudioTracks,
  formatBytes,
  formatDuration,
  pickMimeType,
  supportedRecordingInfo,
} from "../_lib/recording";
import { ActionButton, Alert, Check, Field, Note, pick, RecDot, Select, Stat } from "./rec-ui";

/**
 * 屏幕录制引擎:getDisplayMedia → MediaRecorder → WebM 下载。
 * 纯决策在 tools/_lib/recording.ts;这里只做编排与真实浏览器 API 调用。
 * 生命周期:开始(拿屏 + 可选麦克风)→ 合流 → 录制(1s timeslice,实时体积)
 * → 停止(浏览器原生"停止共享"或本页按钮)→ 内存里拼 Blob → 下载,全程零上传。
 */

const S = {
  quality: {
    en: "Video quality",
    zh: "视频画质",
    ja: "動画品質",
    es: "Calidad de vídeo",
    pt: "Qualidade do vídeo",
  },
  q720: { en: "720p", zh: "720p", ja: "720p", es: "720p", pt: "720p" },
  q1080: { en: "1080p", zh: "1080p", ja: "1080p", es: "1080p", pt: "1080p" },
  qsrc: {
    en: "Source (native resolution)",
    zh: "原始(原生分辨率)",
    ja: "ソース(ネイティブ解像度)",
    es: "Fuente (resolución nativa)",
    pt: "Original (resolução nativa)",
  },
  mic: {
    en: "Include microphone",
    zh: "包含麦克风",
    ja: "マイクを含める",
    es: "Incluir micrófono",
    pt: "Incluir microfone",
  },
  sys: {
    en: "Include system audio",
    zh: "包含系统声音",
    ja: "システム音声を含める",
    es: "Incluir audio del sistema",
    pt: "Incluir áudio do sistema",
  },
  sysNote: {
    en: "System audio depends on the browser and OS: Chrome and Edge on Windows capture it best, and many browsers on macOS omit it. Your microphone is a separate, reliable option.",
    zh: "系统声音取决于浏览器和系统:Windows 上的 Chrome/Edge 支持最好,macOS 上不少浏览器会直接忽略它。想要可靠的音频,请用麦克风选项。",
    ja: "システム音声はブラウザと OS 次第です。Windows の Chrome/Edge が最も確実で、macOS の多くのブラウザは収録できません。確実なのはマイクです。",
    es: "El audio del sistema depende del navegador y del sistema: Chrome y Edge en Windows lo capturan mejor y muchos navegadores en macOS lo omiten. Para audio fiable, use el micrófono.",
    pt: "O áudio do sistema depende do navegador e do sistema: Chrome e Edge no Windows capturam melhor e muitos navegadores no macOS omitem. Para áudio confiável, use o microfone.",
  },
  start: {
    en: "Start recording",
    zh: "开始录制",
    ja: "録画を開始",
    es: "Empezar a grabar",
    pt: "Começar a gravar",
  },
  stop: {
    en: "Stop recording",
    zh: "停止录制",
    ja: "録画を停止",
    es: "Detener grabación",
    pt: "Parar gravação",
  },
  elapsed: { en: "Time", zh: "时长", ja: "時間", es: "Tiempo", pt: "Tempo" },
  size: { en: "Size", zh: "大小", ja: "サイズ", es: "Tamaño", pt: "Tamanho" },
  download: {
    en: "Download video",
    zh: "下载视频",
    ja: "動画をダウンロード",
    es: "Descargar vídeo",
    pt: "Baixar vídeo",
  },
  again: {
    en: "Record again",
    zh: "再录一段",
    ja: "もう一度録画",
    es: "Grabar de nuevo",
    pt: "Gravar de novo",
  },
  unsupported: {
    en: "This browser can't record your screen here. Screen recording needs getDisplayMedia plus MediaRecorder — desktop Chrome, Edge and Firefox work; Safari supports it only partially.",
    zh: "当前浏览器无法在这里录制屏幕。屏幕录制需要 getDisplayMedia 和 MediaRecorder——桌面版 Chrome、Edge、Firefox 可用,Safari 仅部分支持。",
    ja: "このブラウザでは画面を録画できません。画面録画には getDisplayMedia と MediaRecorder が必要です。デスクトップの Chrome・Edge・Firefox は対応、Safari は部分的です。",
    es: "Este navegador no puede grabar su pantalla aquí. La grabación necesita getDisplayMedia y MediaRecorder: funcionan en Chrome, Edge y Firefox de escritorio; Safari solo en parte.",
    pt: "Este navegador não consegue gravar sua tela aqui. A gravação precisa de getDisplayMedia e MediaRecorder: funcionam no Chrome, Edge e Firefox de desktop; Safari só em parte.",
  },
  perm: {
    en: "Permission was denied, so nothing was recorded. Click start again and pick a tab, window or screen in the browser's own prompt.",
    zh: "授权被拒绝,没有录到任何内容。请重新点击开始,并在浏览器弹窗里选择要共享的标签页、窗口或屏幕。",
    ja: "権限が拒否されたため、何も録画されていません。もう一度開始を押し、ブラウザのダイアログでタブ・ウィンドウ・画面を選んでください。",
    es: "Se denegó el permiso y no se grabó nada. Pulse empezar de nuevo y elija pestaña, ventana o pantalla en el aviso del navegador.",
    pt: "A permissão foi negada e nada foi gravado. Clique em começar de novo e escolha aba, janela ou tela no aviso do próprio navegador.",
  },
  micDenied: {
    en: "Microphone unavailable — continuing without it.",
    zh: "麦克风不可用——将继续不带麦克风录制。",
    ja: "マイクが使えないため、マイクなしで続行します。",
    es: "Micrófono no disponible: se continúa sin él.",
    pt: "Microfone indisponível — continuando sem ele.",
  },
  genericErr: {
    en: "Recording failed. Nothing was stored anywhere — you can retry immediately.",
    zh: "录制失败。没有在任何地方保存任何内容——可以立即重试。",
    ja: "録画に失敗しました。どこにも保存されていないので、すぐ再試行できます。",
    es: "La grabación falló. No se guardó nada en ningún sitio: puede reintentarlo enseguida.",
    pt: "A gravação falhou. Nada foi armazenado — você pode tentar de novo já.",
  },
  mimeNote: {
    en: "Format chosen for this browser",
    zh: "为当前浏览器选择的编码格式",
    ja: "このブラウザで選択された形式",
    es: "Formato elegido para este navegador",
    pt: "Formato escolhido para este navegador",
  },
  stopHint: {
    en: "You can also finish from your browser's native “Stop sharing” button — the file is assembled the same way.",
    zh: "也可以用浏览器自带的“停止共享”按钮结束——文件同样会完整生成。",
    ja: "ブラウザ本来の「共有を停止」ボタンで終わっても構いません。同じようにファイルが生成されます。",
    es: "También puede terminar con el botón nativo «Dejar de compartir» del navegador: el archivo se genera igual.",
    pt: "Você também pode terminar pelo botão nativo \"Parar compartilhamento\" do navegador: o arquivo é gerado do mesmo jeito.",
  },
  previewAria: {
    en: "Live preview of the screen being recorded",
    zh: "正在录制的屏幕实时预览",
    ja: "録画中の画面のライブプレビュー",
    es: "Vista previa en vivo de la pantalla grabada",
    pt: "Pré-visualização ao vivo da tela gravada",
  },
  resultAria: {
    en: "Finished recording",
    zh: "已完成的录制",
    ja: "完了した録画",
    es: "Grabación terminada",
    pt: "Gravação concluída",
  },
};

type Quality = "720p" | "1080p" | "source";

type Result = { url: string; blob: Blob; ext: string };

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export function ScreenRecorderEngine() {
  const { locale } = useI18n();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [quality, setQuality] = useState<Quality>("1080p");
  const [wantMic, setWantMic] = useState(false);
  const [wantSys, setWantSys] = useState(false);
  const [phase, setPhase] = useState<"idle" | "recording" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<{ kind: "perm" | "generic"; extra?: string } | null>(null);

  const displayRef = useRef<MediaStream | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const finalizedRef = useRef(false);
  const mimeRef = useRef<string>("");

  useEffect(() => {
    const info = supportedRecordingInfo();
    setSupported(info.screenCapture);
    setMimeType(info.mimeType ?? "");
  }, []);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    displayRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current?.getTracks().forEach((t) => t.stop());
    displayRef.current = null;
    micRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  }, []);

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    teardown();
    const mime = mimeRef.current || "video/webm";
    const blob = new Blob(chunksRef.current, { type: mime.split(";")[0] });
    chunksRef.current = [];
    if (blob.size === 0) {
      setPhase("idle");
      setError({ kind: "generic" });
      return;
    }
    const ext = mime.includes("mp4") ? "mp4" : "webm";
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { url: URL.createObjectURL(blob), blob, ext };
    });
    setPhase("done");
  }, [teardown]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else finalize();
  }, [finalize]);

  const start = useCallback(async () => {
    setError(null);
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!md || typeof md.getDisplayMedia !== "function" || typeof window.MediaRecorder === "undefined") {
      setSupported(false);
      return;
    }
    const mime = pickMimeType();
    if (!mime) {
      setSupported(false);
      return;
    }
    mimeRef.current = mime;
    finalizedRef.current = false;
    try {
      const video = quality === "source" ? true : {
        width: { ideal: quality === "1080p" ? 1920 : 1280 },
        height: { ideal: quality === "1080p" ? 1080 : 720 },
        frameRate: { ideal: 30 },
      };
      const display = await md.getDisplayMedia({ video, audio: wantSys });
      displayRef.current = display;

      let micDenied = false;
      if (wantMic) {
        try {
          micRef.current = await md.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
        } catch {
          micDenied = true;
          micRef.current = null;
        }
      }

      const combined = combineAudioTracks(display, micRef.current ?? undefined);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = combined;
        void liveVideoRef.current.play().catch(() => {});
      }

      chunksRef.current = [];
      const recorder = new MediaRecorder(combined, {
        mimeType: mime,
        videoBitsPerSecond: quality === "1080p" ? 8_000_000 : quality === "720p" ? 5_000_000 : undefined,
      });
      recorderRef.current = recorder;
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          setBytes((b) => b + e.data.size);
        }
      };
      recorder.onstop = finalize;
      // 浏览器原生"停止共享"按钮 → 轨道 ended → 与页面内停止同一收尾
      display.getVideoTracks()[0]?.addEventListener("ended", stop);

      startedAtRef.current = Date.now();
      setElapsed(0);
      setBytes(0);
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startedAtRef.current);
      }, 250);
      recorder.start(1000);
      setPhase("recording");
      if (micDenied) setError({ kind: "perm", extra: "mic" });
    } catch (e) {
      teardown();
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" ? { kind: "perm" } : { kind: "generic" });
    }
  }, [finalize, quality, stop, teardown, wantMic, wantSys]);

  // 卸载清理:停轨、清计时器、释放 URL
  useEffect(() => {
    return () => {
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      teardown();
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
    };
  }, [teardown]);

  const reset = () => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setPhase("idle");
    setElapsed(0);
    setBytes(0);
    setError(null);
  };

  const res = result;
  const filename = `screenrec-${stamp()}.${res?.ext ?? "webm"}`;

  return (
    <ToolPanel>
      {supported === false ? (
        <Alert kind="error">{pick(locale, S.unsupported)}</Alert>
      ) : (
        <>
          {phase === "idle" && (
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={pick(locale, S.quality)}>
                <Select
                  value={quality}
                  onChange={(v) => setQuality(v as Quality)}
                  aria={pick(locale, S.quality)}
                  options={[
                    { value: "720p", label: pick(locale, S.q720) },
                    { value: "1080p", label: pick(locale, S.q1080) },
                    { value: "source", label: pick(locale, S.qsrc) },
                  ]}
                />
              </Field>
              <div className="pt-6">
                <Check checked={wantMic} onChange={setWantMic} label={pick(locale, S.mic)} />
              </div>
              <div className="pt-6">
                <Check checked={wantSys} onChange={setWantSys} label={pick(locale, S.sys)} />
              </div>
            </div>
          )}

          {phase === "idle" && (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <ActionButton onClick={start} aria={pick(locale, S.start)}>
                ● {pick(locale, S.start)}
              </ActionButton>
              {mimeType && (
                <span className="mono text-[12px] text-[var(--color-sub)]">
                  {pick(locale, S.mimeNote)}: {mimeType}
                </span>
              )}
            </div>
          )}

          {phase === "idle" && <div className="mt-4"><Note>{pick(locale, S.sysNote)}</Note></div>}

          {phase === "recording" && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <RecDot />
                <span className="text-[13.5px] font-medium text-[var(--color-sub)]">
                  {wantSys ? `${pick(locale, S.sys)} · ` : ""}
                  {wantMic ? `${pick(locale, S.mic)} · ` : ""}
                  {quality}
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border hairline bg-black/90">
                <video
                  ref={liveVideoRef}
                  muted
                  playsInline
                  autoPlay
                  aria-label={pick(locale, S.previewAria)}
                  className="max-h-[60vh] w-full"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
                <Stat label={pick(locale, S.elapsed)} value={formatDuration(elapsed)} />
                <Stat label={pick(locale, S.size)} value={formatBytes(bytes)} />
              </div>
              <div className="mt-5">
                <ActionButton tone="stop" onClick={stop} aria={pick(locale, S.stop)}>
                  ■ {pick(locale, S.stop)}
                </ActionButton>
              </div>
              <div className="mt-4"><Note>{pick(locale, S.stopHint)}</Note></div>
            </>
          )}

          {phase === "done" && res && (
            <>
              <div className="overflow-hidden rounded-2xl border hairline bg-black/90">
                <video
                  src={res.url}
                  controls
                  playsInline
                  aria-label={pick(locale, S.resultAria)}
                  className="max-h-[60vh] w-full"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ActionButton onClick={() => downloadBlob(res.blob, filename)} aria={pick(locale, S.download)}>
                  ▼ {pick(locale, S.download)}
                </ActionButton>
                <ActionButton tone="ghost" onClick={reset}>
                  {pick(locale, S.again)}
                </ActionButton>
                <span className="mono text-[12.5px] text-[var(--color-sub)]">
                  {filename} · {formatBytes(res.blob.size)}
                </span>
              </div>
            </>
          )}

          {error && (
            <div className="mt-5">
              {error.kind === "perm" && !error.extra ? (
                <Alert kind="error">{pick(locale, S.perm)}</Alert>
              ) : error.extra === "mic" ? (
                <Alert>{pick(locale, S.micDenied)}</Alert>
              ) : (
                <Alert kind="error">{pick(locale, S.genericErr)}</Alert>
              )}
            </div>
          )}
        </>
      )}
    </ToolPanel>
  );
}
