const video = document.querySelector(".capture video")
  , canvasRes = document.querySelector('.capture canvas#result')
  , buttonStart = document.querySelector('.capture button#start')
  , buttonCapture = document.querySelector('.capture button#capture')
  , imgCapture = document.querySelector('.capture img')
  , vbCheck = document.querySelector('.capture input#vb')

let enableVirtual = true

const img = document.createElement('img')
  , imgSample = document.createElement('img')
  , canvas = document.createElement('canvas')
  , canvasSample = document.createElement('canvas')
  
const ctx = canvas.getContext('2d')
  , ctxRes = canvasRes.getContext('2d')
  , ctxSample = canvasSample.getContext('2d')

let w, h

const run = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
  video.srcObject = stream

  video.addEventListener('loadedmetadata', () => {
    w = video.videoWidth
    h = video.videoHeight
    canvas.width = w
    canvas.height = h
    canvasRes.width = w
    canvasRes.height = h
    canvasSample.width = w
    canvasSample.height = h

    let bgImg
    const _img = new Image(w, h)
    _img.src = '../imgs/Blue_wall_red_sofa.jpg'
    _img.addEventListener('load', e => {
      ctxSample.drawImage(_img, 0, 0)
      bgImg = ctxSample.getImageData(0, 0, w, h)
    })

    buttonCapture.addEventListener('click', () => {
      const base64 = canvasRes.toDataURL('image/png')
      imgCapture.src = base64
    })

    buttonStart.addEventListener('click', async () => {
      do {
        enableVirtual = vb.checked
        ctx.drawImage( video, 0, 0, w, h)
        const base64 = canvas.toDataURL('image/png')
        img.src = base64
        const seg = await loadAndPredict(img);

        const orig = ctx.getImageData(0, 0, w, h)

        const imgData = new ImageData(w, h)
        let p = 0
        for(let y = 0; y < h; y++ ) {
          for(let x = 0; x < w; x++ ) {
            imgData.data[ p * 4 ] = !!seg.data[p] ? orig.data[ p * 4 ] : bgImg.data[ p * 4 ]
            imgData.data[ p * 4 + 1 ] = !!seg.data[p] ? orig.data[ p * 4 + 1 ] : bgImg.data[ p * 4 + 1]
            imgData.data[ p * 4 + 2 ] = !!seg.data[p] ? orig.data[ p * 4 + 2 ] : bgImg.data[ p * 4 + 2]
            imgData.data[ p * 4 + 3 ] = 255 * (enableVirtual? 1 : seg.data[p])
            p++
          }
        }
        ctxRes.putImageData( imgData, 0, 0)
      } while(true)
    })
  })
}

async function loadAndPredict(img) {
  const net = await bodyPix.load();
  const segmentation = await net.segmentPerson(img);
  return segmentation
}
run()