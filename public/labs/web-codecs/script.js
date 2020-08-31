const $encoderVideo = document.querySelector(".encoder video")
const $encoderTimestamp = document.querySelector(".encoder .timestamp")
const $encoderType = document.querySelector(".encoder .type")
const $encoderByteLength = document.querySelector(".encoder .byte-length")

const $start = document.querySelector("#start")

const $decoderCanvas = document.querySelector(".decoder canvas")
const ctx = $decoderCanvas.getContext('2d')



const checkSupported = () => {
  return !!window.VideoEncoder
}

const startEncode = stream => {
  const [track] = stream.getVideoTracks()

  const videoDecoder = new VideoDecoder({
    output: async chunk => {
      const {
        codedWidth, codedHeight
      } = chunk
      $decoderCanvas.width = codedWidth
      $decoderCanvas.height = codedHeight

      const img = await chunk.createImageBitmap()
      ctx.drawImage( img, 0, 0 )
    },
    error: console.error
  })
  videoDecoder.configure({
    codec: 'vp8'
  })


  const videoEncoder = new VideoEncoder({
    output: chunk => {
      const { type, timestamp, data } = chunk
      $encoderType.innerHTML = type
      $encoderTimestamp.innerHTML = timestamp
      $encoderByteLength.innerHTML = data.byteLength
      
      videoDecoder.decode(chunk)
    },
    error: console.error
  })
  videoEncoder.configure({
    codec: 'vp8',
    width: 640,
    height: 480,
    framerate: 30
  })

  const videoReader = new VideoTrackReader(track)

  let idx = 0
  videoReader.start( frame => {
    videoEncoder.encode(frame, {keyFrame: !(idx++ % 60)})
  })
}

const getLocalMedia = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .catch( err => { throw(err) })

  return stream
}


//////////////////////////////////////////////////////////////////////////////
const run = async () => {
  document.querySelector("#web-codecs-supported").innerHTML = 
    checkSupported() ? "yes" : "no"

  const localStream = await getLocalMedia()
  $encoderVideo.srcObject = localStream

  startEncode(localStream)
}

$start.onclick = run