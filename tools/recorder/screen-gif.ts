import { ScreenGifEngine } from "../_engines/engine-screen-gif";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "screen-gif",
  category: "utility",
  icon: "film",
  engine: { component: ScreenGifEngine },
  related: ["screen-recorder", "webcam-recorder"],
  copy: {
    en: {
      name: "Screen to GIF",
      tagline:
        "Turn anything on your screen into an animated GIF entirely in your browser — capture, preview, export. No upload, no watermark.",
      intro: [
        "Pick a frame rate (5, 10 or 15 fps), a maximum length (10, 30 or 60 seconds) and a width (480, 720 or 1080 px), then capture whatever is happening on your screen. The tool samples one frame per tick onto a canvas at your chosen width, keeps the frames in your browser's memory, and stops at the cap — nothing is streamed anywhere while you capture.",
        "Before exporting you get an honest preview: the exact frames you captured, played back at exactly the frame rate of the final GIF. Export encodes every frame to the GIF format locally (a 256-color palette per frame) and hands you the file. Because GIFs store each frame as a full image, short and punchy captures at 480 px usually look better and weigh far less than long ones.",
      ],
      steps: [
        "Choose the frame rate, maximum duration and GIF width for the animation you want.",
        "Click “Capture screen”, pick what to share, and act out the moment — capture stops automatically at the cap.",
        "Watch the frame-for-frame preview; recapture if the take is not right.",
        "Export the GIF and download it — encoding and saving both happen on your device.",
      ],
      faqs: [
        {
          q: "Do my frames leave my computer?",
          a: "Recording happens entirely on your device. Nothing is uploaded, stored, or transmitted — frames are held in your browser's memory, the GIF is encoded locally, and the file is saved only when you click download.",
        },
        {
          q: "Which frame rate should I pick?",
          a: "5 fps is ideal for cursor tours and UI walkthroughs; 10 fps suits most demos; 15 fps makes motion feel smooth but roughly doubles the file size versus 10 fps at the same length. Since every GIF frame is stored in full, more frames means a bigger file — pick the lowest rate that still reads well.",
        },
        {
          q: "Why does the export take a moment?",
          a: "GIF encoding is real work: every frame gets analyzed and reduced to a 256-color palette. A 30-second 720 px GIF is hundreds of frames, and the encoder processes them one by one on your machine — the progress bar shows exactly where it is. No upload happens at any point.",
        },
        {
          q: "Which browsers are supported?",
          a: "Desktop Chrome, Edge and Firefox capture the screen and allow per-frame canvas access. Safari's screen-capture support is partial, so results there are not guaranteed. If the browser cannot capture, the tool tells you up front instead of pretending.",
        },
      ],
    },
    zh: {
      name: "屏幕转 GIF",
      tagline:
        "把屏幕上的一切直接在浏览器里做成动图——捕获、预览、导出。不上传、无水印。",
      intro: [
        "先选帧率(5、10 或 15 fps)、最长时长(10、30 或 60 秒)和宽度(480、720 或 1080 px),然后捕获屏幕上正在发生的一切。工具按节拍逐帧采样到一张目标宽度的画布上,帧保存在浏览器内存里,到达上限自动停——捕获期间没有任何数据流向别处。",
        "导出前有一个诚实的预览:正是你捕获的那些帧,按最终 GIF 的帧率逐帧回放。导出时在本地把每一帧编码成 GIF 格式(每帧 256 色调色板)并交给你。由于 GIF 每一帧都完整存储,480px 下短小精悍的捕获通常比长片段更好看、体积也小得多。",
      ],
      steps: [
        "选好帧率、最长时长和 GIF 宽度。",
        "点击“开始捕获屏幕”,选择要共享的内容,然后演示你要的动作——到达上限自动停止。",
        "看逐帧回放的预览;不满意就重新捕获。",
        "导出 GIF 并下载——编码和保存都发生在你的设备上。",
      ],
      faqs: [
        {
          q: "我的帧会离开电脑吗?",
          a: "录制完全发生在你的设备上。不上传、不存储、不传输任何内容——帧保存在浏览器内存里,GIF 在本地编码,文件只有在你点下载时才落盘。",
        },
        {
          q: "该选哪个帧率?",
          a: "5 fps 适合光标导览和界面走查;10 fps 满足大多数演示;15 fps 让动作更顺滑,但同样时长下体积约为 10 fps 的两倍。GIF 每帧都完整存储,帧越多文件越大——选看着舒服的最低帧率即可。",
        },
        {
          q: "为什么导出要等一会儿?",
          a: "GIF 编码是真正的计算活:每一帧都要被分析并压缩成 256 色调色板。30 秒 720px 的 GIF 有几百帧,编码器在你的机器上一帧帧处理——进度条会精确显示进度。整个过程没有任何上传。",
        },
        {
          q: "支持哪些浏览器?",
          a: "桌面版 Chrome、Edge、Firefox 支持屏幕捕获并允许 canvas 逐帧访问。Safari 对屏幕捕获支持不完整,效果不作保证。如果浏览器无法捕获,工具会直接告诉你,而不是装作能行。",
        },
      ],
    },
    ja: {
      name: "画面を GIF に",
      tagline:
        "画面の何でもブラウザ内だけでアニメーション GIF に——キャプチャ、プレビュー、書き出し。アップロードなし、透かしなし。",
      intro: [
        "フレームレート(5・10・15 fps)、最長時間(10・30・60 秒)、幅(480・720・1080 px)を選び、画面上で起きていることをキャプチャします。ツールは指定した幅の canvas に一定間隔で 1 フレームずつサンプリングし、フレームはブラウザのメモリに保持して上限に達したら自動停止——キャプチャ中にどこかへデータが流れることはありません。",
        "書き出しの前に正直なプレビューがあります:キャプチャしたそのままのフレームを、最終 GIF とまったく同じフレームレートで再生します。書き出しでは各フレームをローカルで GIF 形式にエンコード(フレームごとに 256 色パレット)してファイルを渡します。GIF は毎フレームをフルで保存するため、480px の短く冴えたキャプチャの方が、長いものより見た目もファイルサイズも優れることが多いです。",
      ],
      steps: [
        "欲しいアニメーションに合わせてフレームレート・最長時間・GIF の幅を選びます。",
        "「画面をキャプチャ」を押して共有対象を選び、見せたい操作をします——上限で自動停止します。",
        "フレーム単位のプレビューを確認し、納得いかなければ撮り直します。",
        "GIF を書き出してダウンロード——エンコードも保存も端末の中で完結します。",
      ],
      faqs: [
        {
          q: "フレームは PC の外に出ますか?",
          a: "録画は完全にあなたの端末の中で行われます。アップロードも保存も転送も一切ありません——フレームはブラウザのメモリに置かれ、GIF はローカルでエンコードされ、ダウンロードを押したときだけファイルが保存されます。",
        },
        {
          q: "フレームレートはどれを選ぶべきですか?",
          a: "5 fps はカーソル解説や UI ウォークスルーに最適。10 fps はほとんどのデモに合います。15 fps は動きがなめらかになりますが、同じ長さなら 10 fps の約 2 倍のサイズになります。GIF は全フレームをフルで保存するので、フレームが多いほどファイルは大きくなります——見て分かる最低のレートを選びましょう。",
        },
        {
          q: "書き出しに時間がかかるのはなぜですか?",
          a: "GIF エンコードは本物の計算処理です。各フレームを解析して 256 色パレットに落とし込みます。30 秒・720px の GIF は数百フレームあり、エンコーダはあなたのマシン上で 1 枚ずつ処理します——進捗バーが正確な位置を示します。アップロードは一切発生しません。",
        },
        {
          q: "対応ブラウザは?",
          a: "デスクトップの Chrome・Edge・Firefox は画面キャプチャと canvas のフレーム単位アクセスに対応しています。Safari の画面キャプチャは部分的なため、結果は保証されません。キャプチャできない場合は、できるふりをせず最初に伝えます。",
        },
      ],
    },
    es: {
      name: "Pantalla a GIF",
      tagline:
        "Convierta lo que sea de su pantalla en un GIF animado por completo en su navegador — capturar, previsualizar, exportar. Sin subidas, sin marca de agua.",
      intro: [
        "Elija una tasa de fotogramas (5, 10 o 15 fps), una duración máxima (10, 30 o 60 segundos) y un ancho (480, 720 o 1080 px), y capture lo que ocurra en su pantalla. La herramienta muestrea un fotograma por tick sobre un canvas al ancho elegido, guarda los fotogramas en la memoria del navegador y se detiene al llegar al tope — mientras captura, no fluye nada hacia ningún sitio.",
        "Antes de exportar recibe una previsualización honesta: los fotogramas exactos que capturó, reproducidos a la tasa exacta del GIF final. La exportación codifica cada fotograma al formato GIF en local (una paleta de 256 colores por fotograma) y le entrega el archivo. Como los GIF almacenan cada fotograma completo, las capturas cortas y punteros a 480 px suelen verse mejor y pesar mucho menos que las largas.",
      ],
      steps: [
        "Elija la tasa de fotogramas, la duración máxima y el ancho del GIF para la animación que quiere.",
        "Pulse «Capturar pantalla», decida qué compartir y represente el momento — la captura se detiene sola al llegar al tope.",
        "Vea la previsualización fotograma a fotograma; si la toma no está bien, vuelva a capturar.",
        "Exporte el GIF y descárguelo — codificar y guardar ocurren en su dispositivo.",
      ],
      faqs: [
        {
          q: "¿Mis fotogramas salen de mi ordenador?",
          a: "La grabación ocurre por completo en su dispositivo. No se sube, no se almacena ni se transmite nada — los fotogramas se guardan en la memoria del navegador, el GIF se codifica en local y el archivo solo se escribe cuando pulsa descargar.",
        },
        {
          q: "¿Qué tasa de fotogramas debo elegir?",
          a: "5 fps es ideal para recorridos de cursor y walkthroughs de interfaz; 10 fps sirve para la mayoría de demos; 15 fps da suavidad pero casi duplica el tamaño frente a 10 fps a igual duración. Como cada fotograma de un GIF se guarda entero, más fotogramas significa un archivo mayor — elija la tasa más baja que aún se lea bien.",
        },
        {
          q: "¿Por qué la exportación tarda un momento?",
          a: "Codificar un GIF es trabajo de verdad: cada fotograma se analiza y se reduce a una paleta de 256 colores. Un GIF de 30 segundos a 720 px son cientos de fotogramas, y el codificador los procesa uno a uno en su máquina — la barra de progreso muestra exactamente dónde va. No ocurre ninguna subida en ningún momento.",
        },
        {
          q: "¿Qué navegadores son compatibles?",
          a: "Chrome, Edge y Firefox de escritorio capturan la pantalla y permiten el acceso fotograma a fotograma del canvas. La captura de pantalla de Safari es parcial, así que allí el resultado no está garantizado. Si el navegador no puede capturar, la herramienta se lo dice de entrada en lugar de aparentar.",
        },
      ],
    },
    pt: {
      name: "Tela para GIF",
      tagline:
        "Transforme o que quiser da sua tela num GIF animado inteiramente no navegador — capturar, pré-visualizar, exportar. Sem envio, sem marca d'água.",
      intro: [
        "Escolha uma taxa de quadros (5, 10 ou 15 fps), uma duração máxima (10, 30 ou 60 segundos) e uma largura (480, 720 ou 1080 px) e capture o que estiver acontecendo na sua tela. A ferramenta amostra um quadro por batida num canvas na largura escolhida, guarda os quadros na memória do navegador e para no limite — enquanto você captura, nada é transmitido para lugar algum.",
        "Antes de exportar você recebe uma pré-visualização honesta: exatamente os quadros que capturou, reproduzidos exatamente à taxa do GIF final. A exportação codifica cada quadro no formato GIF localmente (uma paleta de 256 cores por quadro) e entrega o arquivo. Como os GIFs guardam cada quadro por inteiro, capturas curtas e certeiras a 480 px costumam ficar melhores e pesar muito menos que as longas.",
      ],
      steps: [
        "Escolha a taxa de quadros, a duração máxima e a largura do GIF para a animação que quer.",
        "Clique em “Capturar tela”, decida o que compartilhar e encene o momento — a captura para sozinha no limite.",
        "Assista à pré-visualização quadro a quadro; se a tomada não ficou boa, capture de novo.",
        "Exporte o GIF e baixe — codificar e salvar acontecem no seu dispositivo.",
      ],
      faqs: [
        {
          q: "Meus quadros saem do meu computador?",
          a: "A gravação acontece por completo no seu dispositivo. Nada é enviado, armazenado ou transmitido — os quadros ficam na memória do navegador, o GIF é codificado localmente e o arquivo só é salvo quando você clica em baixar.",
        },
        {
          q: "Qual taxa de quadros escolher?",
          a: "5 fps é ideal para passeios de cursor e walkthroughs de interface; 10 fps serve para a maioria das demos; 15 fps deixa o movimento suave, mas quase dobra o tamanho frente a 10 fps na mesma duração. Como cada quadro de um GIF é guardado inteiro, mais quadros significa arquivo maior — escolha a taxa mais baixa que ainda leia bem.",
        },
        {
          q: "Por que a exportação demora um pouco?",
          a: "Codificar um GIF é trabalho de verdade: cada quadro é analisado e reduzido a uma paleta de 256 cores. Um GIF de 30 segundos a 720 px são centenas de quadros, e o codificador os processa um a um na sua máquina — a barra de progresso mostra exatamente onde está. Nenhum envio acontece em momento algum.",
        },
        {
          q: "Quais navegadores são suportados?",
          a: "Chrome, Edge e Firefox no desktop capturam a tela e permitem acesso quadro a quadro do canvas. A captura de tela do Safari é parcial, então lá o resultado não é garantido. Se o navegador não consegue capturar, a ferramenta avisa de cara em vez de fingir.",
        },
      ],
    },
  },
});
