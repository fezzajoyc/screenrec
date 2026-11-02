"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { downloadBlob } from "@/components/client-ui";
import { formatBytes, formatDuration, pickMimeType, supportedRecordingInfo } from "../_lib/recording";
import { ActionButton, Alert, Field, Note, pick, RecDot, Select, Stat } from "./rec-ui";

/**
 * 摄像头录制引擎:getUserMedia(仅视频)→ MediaRecorder → WebM 下载。
 * 预览镜像只发生在 <video> 的 CSS 上(scaleX(-1)),录进文件的是原始画面——
 * 这正是"镜像看自己舒服、成片方向正确"的标准做法,引擎内注释与 FAQ 都写明。
 */

const S = {
  quality: {
    en: "Camera quality",
    zh: "摄像头画质",
    ja: "カメラ品質",
    es: "Calidad de cámara",
    pt: "Qualidade da câmera",
  },
  q480: { en: "480p", zh: "480p", ja: "480p", es: "480p", pt: "480p" },
  q720: { en: "720p", zh: "720p", ja: "720p", es: "720p", pt: "720p" },
  q1080: { en: "1080p", zh: "1080p", ja: "1080p", es: "1080p", pt: "1080p" },
  start: {
    en: "Start camera recording",
    zh: "开始录制摄像头",
    ja: "カメラ録画を開始",
    es: "Empezar a grabar la cámara",
    pt: "Começar a gravar a câmera",
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
  mirrorNote: {
    en: "The preview is mirrored so it feels like a mirror — the saved file is not flipped, text behind you stays readable.",
    zh: "预览做了镜像,看起来像照镜子——保存的文件不会翻转,身后的文字依然是正的。",
    ja: "プレビューは鏡のように左右反転表示ですが、保存されるファイルは反転しません。背後の文字もそのまま読めます。",
    es: "La vista previa está en espejo para que se sienta natural — el archivo guardado no va invertido: el texto detrás de usted se sigue leyendo bien.",
    pt: "A pré-visualização é espelhada para parecer um espelho — o arquivo salvo não é invertido: o texto atrás de você continua legível.",
  },
  unsupported: {
    en: "This browser can't record the camera here. Recording needs getUserMedia plus MediaRecorder — desktop Chrome, Edge and Firefox work; Safari supports it only partially.",
    zh: "当前浏览器无法在这里录制摄像头。录制需要 getUserMedia 和 MediaRecorder——桌面版 Chrome、Edge、Firefox 可用,Safari 仅部分支持。",
    ja: "このブラウザではカメラを録画できません。録画には getUserMedia と MediaRecorder が必要です。デスクトップの Chrome・Edge・Firefox は対応、Safari は部分的です。",
    es: "Este navegador no puede grabar la cámara aquí. La grabación necesita getUserMedia y MediaRecorder: funcionan en Chrome, Edge y Firefox de escritorio; Safari solo en parte.",
    pt: "Este navegador não consegue gravar a câmera aqui. A gravação precisa de getUserMedia e MediaRecorder: funcionam no Chrome, Edge e Firefox de desktop; Safari só em parte.",
  },
  perm: {
    en: "Camera access was denied, so nothing was recorded. Allow the camera for this site and click start again.",
    zh: "摄像头访问被拒绝,没有录到任何内容。请在浏览器里允许本站使用摄像头,然后重新点击开始。",
    ja: "カメラへのアクセスが拒否されたため、何も録画されていません。このサイトにカメラを許可して、もう一度開始してください。",
    es: "Se denegó el acceso a la cámara y no se grabó nada. Permita la cámara para este sitio y pulse empezar de nuevo.",
    pt: "O acesso à câmera foi negado e nada foi gravado. Permita a câmera para este site e clique em começar de novo.",
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
  previewAria: {
    en: "Live webcam preview, mirrored",
    zh: "摄像头实时预览(镜像)",
    ja: "カメラのライブプレビュー(反転)",
    es: "Vista previa en vivo de la cámara, en espejo",
    pt: "Pré-visualização ao vivo da câmera, espelhada",
  },
  resultAria: {
    en: "Finished webcam recording",
    zh: "已完成的摄像头录制",
    ja: "完了したカメラ録画",
    es: "Grabación de cámara terminada",
    pt: "Gravação de câmera concluída",
  },
};

type Quality = "480p" | "720p" | "1080p";

type Result = { url: string; blob: Blob };

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

const IDEAL: Record<Quality, { w: number; h: number }> = {
  "480p": { w: 640, h: 480 },
  "720p": { w: 1280, h: 720 },
  "1080p": { w: 1920, h: 1080 },
};

export function WebcamRecorderEngine() {
  const { locale } = useI18n();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [quality, setQuality] = useState<Quality>("720p");
  const [phase, setPhase] = useState<"idle" | "recording" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<"perm" | "generic" | null>(null);

  const camRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const finalizedRef = useRef(false);

  useEffect(() => {
    const info = supportedRecordingInfo();
    setSupported(info.webcam);
    setMimeType(info.mimeType ?? "");
  }, []);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    camRef.current?.getTracks().forEach((t) => t.stop());
    camRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  }, []);

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    teardown();
    const mime = recorderRef.current?.mimeType ?? "video/webm";
    const blob = new Blob(chunksRef.current, { type: mime.split(";")[0] });
    chunksRef.current = [];
    if (blob.size === 0) {
      setPhase("idle");
      setError("generic");
      return;
    }
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { url: URL.createObjectURL(blob), blob };
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
    if (!md || typeof md.getUserMedia !== "function" || typeof window.MediaRecorder === "undefined") {
      setSupported(false);
      return;
    }
    const mime = pickMimeType();
    if (!mime) {
      setSupported(false);
      return;
    }
    finalizedRef.current = false;
    try {
      const ideal = IDEAL[quality];
      const cam = await md.getUserMedia({
        video: { width: { ideal: ideal.w }, height: { ideal: ideal.h }, frameRate: { ideal: 30 } },
        audio: false,
      });
      camRef.current = cam;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = cam;
        void liveVideoRef.current.play().catch(() => {});
      }
      chunksRef.current = [];
      const recorder = new MediaRecorder(cam, {
        mimeType: mime,
        videoBitsPerSecond: quality === "1080p" ? 8_000_000 : quality === "720p" ? 5_000_000 : 2_500_000,
      });
      recorderRef.current = recorder;
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          setBytes((b) => b + e.data.size);
        }
      };
      recorder.onstop = finalize;
      setElapsed(0);
      setBytes(0);
      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startedAt);
      }, 250);
      recorder.start(1000);
      setPhase("recording");
    } catch (e) {
      teardown();
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" || name === "NotFoundError" ? "perm" : "generic");
    }
  }, [finalize, quality, teardown]);

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

  const filename = `screenrec-webcam-${stamp()}.webm`;

  return (
    <ToolPanel>
      {supported === false ? (
        <Alert kind="error">{pick(locale, S.unsupported)}</Alert>
      ) : (
        <>
          {phase === "idle" && (
            <div className="grid gap-5 sm:max-w-xs">
              <Field label={pick(locale, S.quality)}>
                <Select
                  value={quality}
                  onChange={(v) => setQuality(v as Quality)}
                  aria={pick(locale, S.quality)}
                  options={[
                    { value: "480p", label: pick(locale, S.q480) },
                    { value: "720p", label: pick(locale, S.q720) },
                    { value: "1080p", label: pick(locale, S.q1080) },
                  ]}
                />
              </Field>
              <div className="flex flex-wrap items-center gap-4">
                <ActionButton onClick={start} aria={pick(locale, S.start)}>
                  ● {pick(locale, S.start)}
                </ActionButton>
                {mimeType && (
                  <span className="mono text-[12px] text-[var(--color-sub)]">
                    {pick(locale, S.mimeNote)}: {mimeType}
                  </span>
                )}
              </div>
            </div>
          )}

          {phase === "recording" && (
            <>
              <div className="flex items-center gap-3">
                <RecDot />
                <span className="text-[13.5px] font-medium text-[var(--color-sub)]">{quality}</span>
              </div>
              <div className="mt-4 max-w-2xl overflow-hidden rounded-2xl border hairline bg-black/90">
                <video
                  ref={liveVideoRef}
                  muted
                  playsInline
                  autoPlay
                  aria-label={pick(locale, S.previewAria)}
                  className="w-full"
                  style={{ transform: "scaleX(-1)" }}
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
            </>
          )}

          {phase === "done" && result && (
            <>
              <div className="max-w-2xl overflow-hidden rounded-2xl border hairline bg-black/90">
                <video
                  src={result.url}
                  controls
                  playsInline
                  aria-label={pick(locale, S.resultAria)}
                  className="w-full"
                />
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
              <Alert kind="error">{error === "perm" ? pick(locale, S.perm) : pick(locale, S.genericErr)}</Alert>
            </div>
          )}

          <div className="mt-4"><Note>{pick(locale, S.mirrorNote)}</Note></div>
        </>
      )}
    </ToolPanel>
  );
}
