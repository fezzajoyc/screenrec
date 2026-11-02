import { ScreenRecorderEngine } from "../_engines/engine-screen-recorder";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "screen-recorder",
  category: "utility",
  icon: "video",
  featured: true,
  engine: { component: ScreenRecorderEngine },
  related: ["webcam-recorder", "screen-gif"],
  copy: {
    en: {
      name: "Screen Recorder",
      h1: "Free online screen recorder — nothing leaves your device",
      tagline:
        "Record your screen to a WebM video without uploading it anywhere — no watermark, no signup, no time limit, no install.",
      intro: [
        "Click start, choose a tab, window or the whole screen in your browser's own picker, and record. The capture runs on two browser APIs — getDisplayMedia and MediaRecorder — entirely inside this page: frames are encoded on your device, the video is assembled in memory, and the finished file is handed straight to you as a .webm download. There is no upload step because there is no server to upload to.",
        "Most “free screen recorders” are trials: a watermark in the corner, a 5-minute cap, an account wall, or a render queue on someone else's server. This one records first and asks nothing — pick a quality (720p, 1080p or the source resolution), add your microphone or system audio if you want them, and stop whenever you are done. The timer and file-size counter you see while recording are measured live from the actual encoded bytes, not estimated.",
      ],
      steps: [
        "Pick a video quality and, if you need them, the microphone or system-audio options.",
        "Click “Start recording” and choose what to share in your browser's picker — a single tab, a window or the entire screen.",
        "Record as long as you like; watch the live timer and size counter, and stop from the page or your browser's native “Stop sharing” button.",
        "Preview the result and download it as a WebM file — the whole recording never left your device.",
      ],
      faqs: [
        {
          q: "Where does my recording go?",
          a: "Recording happens entirely on your device. Nothing is uploaded, stored, or transmitted — the video is encoded by your browser, assembled in memory, and saved only when you click download. Close the tab and it is gone.",
        },
        {
          q: "Which browsers can record the screen?",
          a: "Chrome, Edge, Firefox, Opera and other desktop Chromium/Firefox browsers support full screen capture. Safari supports screen recording only partially, so Chrome or Edge give the most complete result. System audio additionally depends on your operating system — it works best in Chrome and Edge on Windows.",
        },
        {
          q: "Why is the file a .webm and not .mp4?",
          a: "WebM (VP9 or VP8 video with Opus audio) is what browsers can encode natively in real time, so the recording is written live with zero conversion. If you need MP4, any local converter can transcode it — but the recording itself never touches a server.",
        },
        {
          q: "Can I record my microphone and the screen together?",
          a: "Yes — tick “Include microphone” before you start. The microphone track is merged with the screen capture into a single recording. If the browser denies the microphone, the recording continues without it and you are told so.",
        },
      ],
    },
    zh: {
      name: "屏幕录制",
      h1: "免费在线屏幕录制——画面不离开你的设备",
      tagline:
        "在浏览器里直接把屏幕录成 WebM 视频,不经过任何上传——无水印、无注册、无时长限制、无需安装。",
      intro: [
        "点击开始,在浏览器自带的共享选择器里挑一个标签页、窗口或整块屏幕,然后录制。捕获依靠两个浏览器 API——getDisplayMedia 和 MediaRecorder——全部在本页内完成:画面在你的设备上编码,视频在内存中拼装,成品以 .webm 文件直接交给你下载。不存在上传环节,因为根本没有上传的服务器。",
        "大多数“免费录屏工具”其实是试用装:角落的水印、5 分钟的时长上限、注册墙,或者别人服务器上的渲染队列。这一个先录制、什么都不问——选一个画质(720p、1080p 或原始分辨率),需要的话勾上麦克风或系统声音,随时停止。录制时看到的计时器和体积计数,都是按真实编码字节实时统计的,不是估算。",
      ],
      steps: [
        "选好视频画质,需要的话勾选麦克风或系统声音。",
        "点击“开始录制”,在浏览器选择器里决定共享哪个标签页、窗口或整块屏幕。",
        "想录多久就录多久;盯着实时计时和体积,用页面按钮或浏览器自带的“停止共享”结束。",
        "预览结果并下载 WebM 文件——整段录制从未离开你的设备。",
      ],
      faqs: [
        {
          q: "我的录制去哪儿了?",
          a: "录制完全发生在你的设备上。不上传、不存储、不传输任何内容——视频由你的浏览器编码、在内存中拼装,只有你点下载时才落盘。关掉标签页,它就消失了。",
        },
        {
          q: "哪些浏览器能录屏?",
          a: "Chrome、Edge、Firefox、Opera 等桌面版 Chromium/Firefox 浏览器支持完整的屏幕捕获。Safari 对屏幕录制仅部分支持,想要最完整的效果请用 Chrome 或 Edge。系统声音还取决于操作系统——Windows 上的 Chrome 和 Edge 支持最好。",
        },
        {
          q: "为什么文件是 .webm 而不是 .mp4?",
          a: "WebM(VP9 或 VP8 视频 + Opus 音频)是浏览器能实时原生编码的格式,录制即写入、零转换。如果需要 MP4,任何本地转换器都能转码——但录制本身从不经过服务器。",
        },
        {
          q: "能同时录麦克风和屏幕吗?",
          a: "可以——开始前勾选“包含麦克风”。麦克风音轨会与屏幕捕获合并成一条录音。如果浏览器拒绝了麦克风,录制会在没有麦克风的情况下继续,并明确提示你。",
        },
      ],
    },
    ja: {
      name: "画面録画",
      h1: "無料のオンライン画面録画——データは端末から出ません",
      tagline:
        "ブラウザだけで画面を WebM 動画に録画。アップロード一切なし——透かしなし、登録なし、時間制限なし、インストール不要。",
      intro: [
        "開始を押し、ブラウザ本来の共有ピッカーでタブ・ウィンドウ・全画面を選んで録画します。capture は getDisplayMedia と MediaRecorder という 2 つのブラウザ API だけで、このページの中で完結します。フレームは端末上でエンコードされ、動画はメモリ内で組み立てられ、完成品は .webm として直接ダウンロードされます。アップロード先のサーバーが存在しないので、アップロードという工程自体がありません。",
        "多くの「無料画面録画」は体験版です:隅の透かし、5 分制限、アカウント登録、他人のサーバーでのレンダリング待ち。このツールは先に録画して、何も求めません。品質(720p・1080p・ソース解像度)を選び、必要ならマイクやシステム音声を追加し、好きなときに止めるだけ。録画中のタイマーとサイズ表示は、実際にエンコードされたバイト数を実測したライブ値です。",
      ],
      steps: [
        "動画品質を選び、必要ならマイクやシステム音声のオプションをオンにします。",
        "「録画を開始」を押し、ブラウザのピッカーで共有するタブ・ウィンドウ・画面を選びます。",
        "好きなだけ録画します。ライブのタイマーとサイズを見ながら、ページのボタンかブラウザ本来の「共有を停止」で終了します。",
        "結果を確認して WebM ファイルとしてダウンロード——録画は一度も端末を離れていません。",
      ],
      faqs: [
        {
          q: "録画データはどこへ行きますか?",
          a: "録画は完全にあなたの端末の中で行われます。アップロードも保存も転送も一切ありません——動画はブラウザがエンコードし、メモリ内で組み立て、ダウンロードを押したときだけディスクに書き込まれます。タブを閉じれば消えます。",
        },
        {
          q: "どのブラウザで画面を録画できますか?",
          a: "Chrome・Edge・Firefox・Opera などデスクトップの Chromium/Firefox 系ブラウザは画面キャプチャに完全対応しています。Safari は部分的な対応なので、完全に動かすなら Chrome か Edge を。システム音声は OS にも依存し、Windows の Chrome/Edge が最も確実です。",
        },
        {
          q: "ファイルが .webm で .mp4 ではないのはなぜですか?",
          a: "WebM(VP9 または VP8 動画 + Opus 音声)はブラウザがリアルタイムでネイティブ エンコードできる形式だからです。録画しながらそのまま書き込み、変換は不要です。MP4 が必要ならローカルのコンバータで変換できます——録画自体は一切サーバーを経由しません。",
        },
        {
          q: "マイクと画面を一緒に録音できますか?",
          a: "はい。開始前に「マイクを含める」にチェックを入れてください。マイクの音声トラックを画面キャプチャと 1 本の録画にまとめます。マイクが拒否された場合は、マイクなしで録画を続け、その旨を表示します。",
        },
      ],
    },
    es: {
      name: "Grabadora de pantalla",
      h1: "Grabadora de pantalla online gratis — nada sale de su dispositivo",
      tagline:
        "Grabe su pantalla como vídeo WebM sin subirlo a ningún sitio — sin marca de agua, sin registro, sin límite de tiempo, sin instalación.",
      intro: [
        "Pulse empezar, elija una pestaña, una ventana o toda la pantalla en el selector del propio navegador, y grabe. La captura se apoya en dos API del navegador — getDisplayMedia y MediaRecorder — y ocurre por completo dentro de esta página: los fotogramas se codifican en su dispositivo, el vídeo se ensambla en memoria y el archivo terminado se le entrega como descarga .webm. No hay paso de subida porque no hay servidor al que subir.",
        "La mayoría de las «grabadoras de pantalla gratis» son demos: una marca de agua en la esquina, un límite de 5 minutos, un muro de registro o una cola de renderizado en el servidor de otro. Esta graba primero y no pide nada — elija una calidad (720p, 1080p o la resolución de origen), añada micrófono o audio del sistema si los quiere, y pare cuando termine. El cronómetro y el contador de tamaño que ve durante la grabación miden los bytes realmente codificados, no una estimación.",
      ],
      steps: [
        "Elija la calidad del vídeo y, si las necesita, las opciones de micrófono o audio del sistema.",
        "Pulse «Empezar a grabar» y decida qué compartir en el selector del navegador: una pestaña, una ventana o toda la pantalla.",
        "Grabe lo que quiera; vigile el tiempo y el tamaño en vivo, y detenga desde la página o desde el «Dejar de compartir» nativo del navegador.",
        "Previsualice el resultado y descárguelo como archivo WebM — la grabación nunca salió de su dispositivo.",
      ],
      faqs: [
        {
          q: "¿A dónde va mi grabación?",
          a: "La grabación ocurre por completo en su dispositivo. No se sube, no se almacena ni se transmite nada — el navegador codifica el vídeo, lo ensambla en memoria y solo lo escribe en disco cuando pulsa descargar. Cierre la pestaña y desaparece.",
        },
        {
          q: "¿Qué navegadores pueden grabar la pantalla?",
          a: "Chrome, Edge, Firefox, Opera y demás navegadores de escritorio Chromium/Firefox admiten la captura completa de pantalla. Safari solo la admite en parte, así que Chrome o Edge dan el resultado más completo. El audio del sistema depende además del sistema operativo: funciona mejor en Chrome y Edge sobre Windows.",
        },
        {
          q: "¿Por qué el archivo es .webm y no .mp4?",
          a: "WebM (vídeo VP9 o VP8 con audio Opus) es lo que los navegadores saben codificar de forma nativa en tiempo real, así que la grabación se escribe en vivo sin conversión. Si necesita MP4, cualquier conversor local puede transcodificarlo — pero la grabación jamás toca un servidor.",
        },
        {
          q: "¿Puedo grabar el micrófono y la pantalla juntos?",
          a: "Sí — marque «Incluir micrófono» antes de empezar. La pista del micrófono se fusiona con la captura de pantalla en una sola grabación. Si el navegador deniega el micrófono, la grabación continúa sin él y se le avisa.",
        },
      ],
    },
    pt: {
      name: "Gravador de tela",
      h1: "Gravador de tela online grátis — nada sai do seu dispositivo",
      tagline:
        "Grave sua tela como vídeo WebM sem enviar para lugar nenhum — sem marca d'água, sem cadastro, sem limite de tempo, sem instalar nada.",
      intro: [
        "Clique em começar, escolha uma aba, uma janela ou a tela inteira no seletor do próprio navegador e grave. A captura usa duas APIs do navegador — getDisplayMedia e MediaRecorder — e acontece por completo nesta página: os quadros são codificados no seu dispositivo, o vídeo é montado na memória e o arquivo pronto chega até você como download .webm. Não existe etapa de envio porque não existe servidor para onde enviar.",
        "A maioria dos “gravadores de tela grátis” é uma versão de teste: marca d'água no canto, limite de 5 minutos, muro de cadastro ou uma fila de renderização no servidor dos outros. Este grava primeiro e não pede nada — escolha a qualidade (720p, 1080p ou a resolução de origem), adicione microfone ou áudio do sistema se quiser e pare quando terminar. O cronômetro e o contador de tamanho que você vê durante a gravação medem os bytes realmente codificados, ao vivo — não é estimativa.",
      ],
      steps: [
        "Escolha a qualidade do vídeo e, se precisar, as opções de microfone ou áudio do sistema.",
        "Clique em “Começar a gravar” e decida o que compartilhar no seletor do navegador: uma aba, uma janela ou a tela inteira.",
        "Grave o quanto quiser; acompanhe o tempo e o tamanho ao vivo e pare pelo botão da página ou pelo “Parar compartilhamento” nativo do navegador.",
        "Pré-visualize o resultado e baixe como arquivo WebM — a gravação inteira nunca saiu do seu dispositivo.",
      ],
      faqs: [
        {
          q: "Para onde vai a minha gravação?",
          a: "A gravação acontece por completo no seu dispositivo. Nada é enviado, armazenado ou transmitido — o navegador codifica o vídeo, monta tudo na memória e só grava no disco quando você clica em baixar. Feche a aba e ele desaparece.",
        },
        {
          q: "Quais navegadores conseguem gravar a tela?",
          a: "Chrome, Edge, Firefox, Opera e os demais navegadores desktop Chromium/Firefox suportam captura completa de tela. O Safari suporta apenas em parte, então o Chrome ou o Edge dão o resultado mais completo. O áudio do sistema depende ainda do sistema operacional: funciona melhor no Chrome e no Edge no Windows.",
        },
        {
          q: "Por que o arquivo é .webm e não .mp4?",
          a: "WebM (vídeo VP9 ou VP8 com áudio Opus) é o que os navegadores conseguem codificar nativamente em tempo real, então a gravação é escrita ao vivo, sem conversão. Se precisar de MP4, qualquer conversor local transcodifica — mas a gravação em si nunca passa por um servidor.",
        },
        {
          q: "Dá para gravar o microfone e a tela juntos?",
          a: "Sim — marque “Incluir microfone” antes de começar. A faixa do microfone é mesclada com a captura de tela numa única gravação. Se o navegador negar o microfone, a gravação continua sem ele e você é avisado.",
        },
      ],
    },
  },
});
