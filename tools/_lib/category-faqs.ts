import type { CategoryId, Locale } from "@/lib/site";
import type { ToolCopy } from "./types";

/**
 * 类目 FAQ 池:工具页 FAQ 不足 6 条时按类目补齐(JSON-LD 同源走 toolCopy)。
 * 内容写"这个类目共同的真问题"(隐私/收费/格式/精度/浏览器支持),不是凑数占位。
 * 只写核心 5 语(en/zh/ja/es/pt);其他 locale toolCopy 本来就走 overlay 或回退 en。
 */
type Faq = { q: string; a: string };

const GLOBAL: Partial<Record<Locale, Faq[]>> = {
  en: [
    { q: "Are my files uploaded to a server?", a: "No. ScreenRec handles screen and webcam recording entirely inside your browser — your files are read from disk into memory, processed, and offered back as a download. Nothing is transmitted." },
    { q: "Is there a file size or time limit?", a: "The practical limit is your device's memory and battery. ScreenRec has no artificial caps and no queue: processing starts the moment you drop the file." },
    { q: "Why is there no account system?", a: "ScreenRec works without one. screen and webcam recording processing is local, so there is nothing to sign into and nothing to store about you." },
  ],
  zh: [
    { q: "文件会被上传到服务器吗?", a: "不会。ScreenRec的屏幕与摄像头录制处理完全在浏览器内 — 文件从磁盘读入内存、处理、然后供你下载,全程不传输。" },
    { q: "有文件大小或时长限制吗?", a: "实际上限是你设备的内存和电量。ScreenRec没有人造上限也没有排队:文件一拖进来就开始处理。" },
    { q: "为什么没有账号系统?", a: "ScreenRec不需要。屏幕与摄像头录制处理在本地完成,没有可登录的东西,也没有关于你的任何存储。" },
  ],
  ja: [
    { q: "ファイルはサーバーにアップロードされますか?", a: "されません。ScreenRecのscreen and webcam recording処理は完全にブラウザ内で完結し、ファイルはディスクからメモリへ読み込まれ、処理後にダウンロードとして返るだけです。" },
    { q: "ファイルサイズや時間の制限は?", a: "実質的な上限は端末のメモリとバッテリーです。ScreenRecに人為的な制限や待ち行列はなく、ファイルをドロップした瞬間に処理が始まります。" },
    { q: "アカウントシステムがないのはなぜ?", a: "不要だからです。screen and webcam recording処理はローカルで完結するため、ログインする対象も、ユーザーについて保存するものもありません。" },
  ],
  es: [
    { q: "¿Mis archivos se suben a un servidor?", a: "No. ScreenRec procesa screen and webcam recording por completo dentro de tu navegador — los archivos se leen a memoria, se procesan y se te ofrecen como descarga. No se transmite nada." },
    { q: "¿Hay límite de tamaño o duración?", a: "El límite práctico es la memoria y batería de tu equipo. ScreenRec no tiene topes artificiales ni colas: el procesado empieza al soltar el archivo." },
    { q: "¿Por qué no hay cuentas?", a: "ScreenRec no las necesita. El procesado de screen and webcam recording es local, así que no hay nada que iniciar sesión ni nada que almacenar sobre ti." },
  ],
  pt: [
    { q: "Meus arquivos são enviados para um servidor?", a: "Não. O ScreenRec processa screen and webcam recording inteiramente no navegador — os arquivos são lidos na memória, processados e devolvidos como download. Nada é transmitido." },
    { q: "Existe limite de tamanho ou duração?", a: "O limite prático é a memória e a bateria do seu aparelho. O ScreenRec não tem tetos artificiais nem filas: o processamento começa ao soltar o arquivo." },
    { q: "Por que não há sistema de contas?", a: "O ScreenRec não precisa. O processamento de screen and webcam recording é local, então não há login nem nada armazenado sobre você." },
  ],
};

const BY_CATEGORY: Partial<Record<CategoryId, Partial<Record<Locale, Faq[]>>>> = {

};

/** 取某类目的补充 FAQ 池(global 池 + 类目池,en 缺省回退) */
export function categoryFaqPool(category: CategoryId, locale: Locale): Faq[] {
  const extra = BY_CATEGORY[category]?.[locale] ?? BY_CATEGORY[category]?.en ?? [];
  const global = GLOBAL[locale] ?? GLOBAL.en ?? [];
  return [...extra, ...global];
}
