import { WebcamRecorderEngine } from "../_engines/engine-webcam-recorder";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "webcam-recorder",
  category: "utility",
  icon: "camera",
  engine: { component: WebcamRecorderEngine },
  related: ["screen-recorder", "screen-gif"],
  copy: {
    en: {
      name: "Webcam Recorder",
      tagline:
        "Record your webcam straight to a video file in the browser — face-only takes for tutorials, with no upload and no watermark.",
      intro: [
        "This is a camera recorder in the purest sense: your webcam's video is encoded by the browser's own MediaRecorder while it streams, and the finished file is saved from memory with one click. There is no middle step — no upload, no render queue, no account — so a take of you talking to the camera stays exactly as private as thinking out loud in your own room.",
        "The live preview is mirrored like a real mirror, because that is how humans expect to see themselves. The saved file is not flipped — the video is stored exactly as the camera captured it, so text behind you reads correctly in the final take. Pick 480p for a small talking-head clip, or 720p/1080p when the recording deserves the sharpness.",
      ],
      steps: [
        "Choose a quality — 480p is plenty for a talking head, 720p or 1080p for sharper tutorials.",
        "Click “Start camera recording” and allow the browser to use your webcam.",
        "Record your take while watching the mirrored live preview and the live timer and size.",
        "Stop and download the video — it was created on your device and stays there.",
      ],
      faqs: [
        {
          q: "Does the video get uploaded anywhere?",
          a: "Recording happens entirely on your device. Nothing is uploaded, stored, or transmitted — the file exists in your browser's memory and is written to disk only when you click download.",
        },
        {
          q: "Why is the preview mirrored but the file is not?",
          a: "Mirroring is how you are used to seeing yourself, and it makes steering your eyes and gestures natural. The camera's raw frames are what get encoded, so the downloaded video matches what the camera saw — the way your viewers will see it.",
        },
        {
          q: "Does this record audio?",
          a: "No — this tool is deliberately face-only: video straight from the webcam, nothing else. For tutorials with narration, record your voice with the screen recorder (its microphone option captures audio together with the screen), or add a voiceover afterwards.",
        },
        {
          q: "Which browsers work?",
          a: "Chrome, Edge, Firefox and Safari on desktop all support webcam capture and in-browser encoding. If the camera light never turns on, check the browser's site-permission icon in the address bar.",
        },
      ],
    },
    zh: {
      name: "摄像头录制",
      tagline:
        "在浏览器里把摄像头画面直接录成视频文件——教程用的人像镜头,不上传、无水印。",
      intro: [
        "这是一个最纯粹意义上的摄像头录制器:摄像头视频在传输的同时由浏览器自带的 MediaRecorder 编码,成品一键从内存保存。没有中间环节——不上传、不排队渲染、不需要账号——你对镜头说的话,和你在自己房间里自言自语一样私密。",
        "实时预览做了镜像,像照镜子一样,因为人习惯这样看自己。保存的文件不会翻转——视频按摄像头捕获的原样存储,所以你身后的文字在成片里依然是正的。小的口播镜头选 480p 就够;值得更清晰时选 720p 或 1080p。",
      ],
      steps: [
        "选一个画质——口播镜头 480p 足够,更锐利的教程选 720p 或 1080p。",
        "点击“开始录制摄像头”,允许浏览器使用你的摄像头。",
        "对着镜头录制,同时看镜像预览和实时计时、体积。",
        "停止并下载视频——它在你的设备上生成,也留在你的设备上。",
      ],
      faqs: [
        {
          q: "视频会被上传到哪里吗?",
          a: "录制完全发生在你的设备上。不上传、不存储、不传输任何内容——文件只存在于浏览器的内存里,点下载时才写入磁盘。",
        },
        {
          q: "为什么预览是镜像的,文件却不是?",
          a: "镜像符合人看自己的习惯,能让眼神和手势更自然。编码的是摄像头的原始画面,所以下载的视频与摄像头看到的一致——也就是观众将看到的样子。",
        },
        {
          q: "这个工具录声音吗?",
          a: "不——它刻意只做人像:只有摄像头画面,不含其他。需要旁白的教程,请用屏幕录制的麦克风选项(画面和声音一起录),或者后期再配画外音。",
        },
        {
          q: "哪些浏览器可用?",
          a: "桌面版 Chrome、Edge、Firefox、Safari 都支持摄像头捕获和浏览器内编码。如果摄像头指示灯一直不亮,检查地址栏里该站点的权限图标。",
        },
      ],
    },
    ja: {
      name: "ウェブカム録画",
      tagline:
        "ブラウザでウェブカムの映像をそのまま動画ファイルに録画。チュートリアル向けの顔だけの撮影に——アップロードなし、透かなし。",
      intro: [
        "最も純粋な意味でのカメラ録画ツールです。ウェブカムの映像はストリーミングされながらブラウザ本来の MediaRecorder でエンコードされ、完成ファイルはメモリからワンクリックで保存できます。中間工程がありません——アップロードなし、レンダリング待ちなし、アカウント登録なし。カメラに向かって話す撮影は、自分の部屋で独り言を言うのと同じだけプライベートです。",
        "ライブ プレビューは本物の鏡のように左右反転表示されます。人はそう見ることに慣れているからです。保存されるファイルは反転しません——カメラが捉えた通りの映像がそのまま記録されるので、背後の文字は完成したテイクでも正しく読めます。小さなトーキングヘッドなら 480p、鮮明さが欲しいチュートリアルなら 720p/1080p を。",
      ],
      steps: [
        "品質を選びます——トーキングヘッドなら 480p で十分、鋭いチュートリアルには 720p か 1080p。",
        "「カメラ録画を開始」を押し、ブラウザにウェブカムの使用を許可します。",
        "反転プレビューとライブのタイマー・サイズを見ながら撮影します。",
        "停止して動画をダウンロード——端末上で作られ、端末に残ります。",
      ],
      faqs: [
        {
          q: "動画はどこかにアップロードされますか?",
          a: "録画は完全にあなたの端末の中で行われます。アップロードも保存も転送も一切ありません——ファイルはブラウザのメモリに存在し、ダウンロードを押したときだけディスクに書き込まれます。",
        },
        {
          q: "プレビューは反転しているのにファイルは反転しないのはなぜですか?",
          a: "反転表示は自分を見るときの習慣で、視線やジェスチャーが自然に決まります。エンコードされるのはカメラの生フレームなので、ダウンロードした動画はカメラが見た通りの、視聴者が見る通りの映像です。",
        },
        {
          q: "音声も録音されますか?",
          a: "いいえ——このツールは意図的に「顔だけ」です。ウェブカムの映像のみで、それ以外は含みません。ナレーション付きのチュートリアルなら、画面録画のマイク オプション(画面と音声を一緒に録音)を使うか、後から声を当ててください。",
        },
        {
          q: "対応ブラウザは?",
          a: "デスクトップの Chrome・Edge・Firefox・Safari はすべてカメラ キャプチャとブラウザ内エンコードに対応しています。カメラのランプが付かない場合は、アドレスバーのサイト権限アイコンを確認してください。",
        },
      ],
    },
    es: {
      name: "Grabadora de cámara web",
      tagline:
        "Grabe su cámara web directamente como archivo de vídeo en el navegador — tomas de solo cara para tutoriales, sin subidas y sin marca de agua.",
      intro: [
        "Esta es una grabadora de cámara en el sentido más puro: el vídeo de su cámara web lo codifica el MediaRecorder del propio navegador mientras llega, y el archivo terminado se guarda desde la memoria con un clic. No hay paso intermedio — ni subida, ni cola de renderizado, ni cuenta — así que una toma suya hablando a la cámara es tan privada como pensar en voz alta en su propia habitación.",
        "La vista previa está en espejo, como un espejo de verdad, porque así esperamos vernos. El archivo guardado no va invertido — el vídeo se almacena tal cual lo captó la cámara, así que el texto que hay detrás de usted se lee correctamente en la toma final. Elija 480p para un clip de cabeza parlante, o 720p/1080p cuando la grabación merezca nitidez.",
      ],
      steps: [
        "Elija la calidad — 480p basta para una cabeza parlante; 720p o 1080p para tutoriales más nítidos.",
        "Pulse «Empezar a grabar la cámara» y permita que el navegador use su cámara web.",
        "Grabe su toma mientras mira la vista previa en espejo y el tiempo y tamaño en vivo.",
        "Detenga y descargue el vídeo — se creó en su dispositivo y allí se queda.",
      ],
      faqs: [
        {
          q: "¿El vídeo se sube a algún sitio?",
          a: "La grabación ocurre por completo en su dispositivo. No se sube, no se almacena ni se transmite nada — el archivo existe en la memoria del navegador y solo se escribe en el disco cuando pulsa descargar.",
        },
        {
          q: "¿Por qué la vista previa está en espejo y el archivo no?",
          a: "El espejo es como estamos acostumbrados a vernos y hace naturales la mirada y los gestos. Lo que se codifica son los fotogramas originales de la cámara, así que el vídeo descargado coincide con lo que vio la cámara — lo que verán sus espectadores.",
        },
        {
          q: "¿Esto graba audio?",
          a: "No — esta herramienta es a propósito de solo cara: vídeo directo de la cámara web, nada más. Para tutoriales narrados, grabe su voz con la grabadora de pantalla (su opción de micrófono captura audio junto con la pantalla) o añada una locución después.",
        },
        {
          q: "¿Qué navegadores funcionan?",
          a: "Chrome, Edge, Firefox y Safari de escritorio admiten captura de cámara y codificación en el navegador. Si la lucecita de la cámara nunca se enciende, revise el icono de permisos del sitio en la barra de direcciones.",
        },
      ],
    },
    pt: {
      name: "Gravador de webcam",
      tagline:
        "Grave sua webcam direto para um arquivo de vídeo no navegador — tomadas só de rosto para tutoriais, sem envio e sem marca d'água.",
      intro: [
        "Este é um gravador de câmera no sentido mais puro: o vídeo da sua webcam é codificado pelo próprio MediaRecorder do navegador enquanto chega, e o arquivo pronto é salvo da memória com um clique. Não existe etapa intermediária — sem envio, sem fila de renderização, sem conta — então uma tomada sua falando para a câmera fica exatamente tão privada quanto pensar em voz alta no seu quarto.",
        "A pré-visualização é espelhada como um espelho de verdade, porque é assim que esperamos nos ver. O arquivo salvo não é invertido — o vídeo é armazenado tal como a câmera capturou, então o texto atrás de você continua legível na tomada final. Escolha 480p para um clipe simples de rosto, ou 720p/1080p quando a gravação merecer nitidez.",
      ],
      steps: [
        "Escolha a qualidade — 480p basta para um rosto falando; 720p ou 1080p para tutoriais mais nítidos.",
        "Clique em “Começar a gravar a câmera” e permita que o navegador use sua webcam.",
        "Grave sua tomada acompanhando a pré-visualização espelhada e o tempo e tamanho ao vivo.",
        "Pare e baixe o vídeo — ele foi criado no seu dispositivo e fica nele.",
      ],
      faqs: [
        {
          q: "O vídeo é enviado para algum lugar?",
          a: "A gravação acontece por completo no seu dispositivo. Nada é enviado, armazenado ou transmitido — o arquivo existe na memória do navegador e só é escrito no disco quando você clica em baixar.",
        },
        {
          q: "Por que a pré-visualização é espelhada mas o arquivo não?",
          a: "O espelho é como estamos acostumados a nos ver e deixa olhar e gestos naturais. O que é codificado são os quadros originais da câmera, então o vídeo baixado corresponde ao que a câmera viu — do jeito que seus espectadores vão vê-lo.",
        },
        {
          q: "Isso grava áudio?",
          a: "Não — esta ferramenta é de propósito só de rosto: vídeo direto da webcam, nada além. Para tutoriais com narração, grave sua voz com o gravador de tela (a opção de microfone captura áudio junto com a tela) ou adicione uma locução depois.",
        },
        {
          q: "Quais navegadores funcionam?",
          a: "Chrome, Edge, Firefox e Safari no desktop suportam captura de webcam e codificação no navegador. Se a luzinha da câmera nunca acende, confira o ícone de permissões do site na barra de endereços.",
        },
      ],
    },
  },
});
