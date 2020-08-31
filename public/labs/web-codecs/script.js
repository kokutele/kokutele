const $encoderVideo = document.querySelector(".encoder video")
const $encoderTimestamp = document.querySelector(".encoder .timestamp")
const $encoderType = document.querySelector(".encoder .type")
const $encoderByteLength = document.querySelector(".encoder .byte-length")

const $sendPLI = document.querySelector("#send-pli")
const $packetLostRatio = document.querySelector("#packet-lost-ratio")
const $start = document.querySelector("#start")

const $decoderCanvas = document.querySelector(".decoder canvas")
const ctx = $decoderCanvas.getContext('2d')

let packetLostRatio = 0.1
let sendPLI = true

const setInputHandler = () => {
  $sendPLI.checked = sendPLI
  $sendPLI.onclick = e => {
    sendPLI = e.target.checked
    e.target.checked = sendPLI
    console.log( "sendPLI:", e.target.checked )
  }

  $packetLostRatio.value = packetLostRatio
  $packetLostRatio.onchange = e => {
    let value = e.target.value
    if( value < 0) value = 0
    if( value > 1) value = 1

    packetLostRatio = value
    e.target.value = value
    console.log( "packetLostRatio", packetLostRatio )
  }
}

let seq = 0

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

  let prev = 0, synched = true
  const send = (seqNum, chunk) => {
    if( seqNum != prev + 1 ) {
      // lost detected
      if(sendPLI) {
        setTimeout( e => {
          reqKeyFrame = true
        }, 200)
      }

      synched = false

      prev = seqNum
    } else {
      if( chunk.type === "key" ) synched = true
      if( synched) videoDecoder.decode(chunk)
      prev = seqNum
    }
  }


  let reqKeyFrame = false
  const videoEncoder = new VideoEncoder({
    output: chunk => {
      // Emulate packet lost
      const lost = Math.random() < packetLostRatio
      seq++

      if( !lost ) {
        const { type, timestamp, data } = chunk
        $encoderType.innerHTML = type
        $encoderTimestamp.innerHTML = timestamp
        $encoderByteLength.innerHTML = data.byteLength

        send( seq, chunk)
      } else {
        console.info("packet lost by emulator", packetLostRatio)
      }
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
  const interval = 10 * 30 // 10 sec
  videoReader.start( frame => {
    const _reqKeyFrame = reqKeyFrame || !(idx++ % interval)
    videoEncoder.encode(frame, {keyFrame: _reqKeyFrame})
    reqKeyFrame = false
  })
}

const getLocalMedia = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .catch( err => { throw(err) })

  return stream
}


//////////////////////////////////////////////////////////////////////////////
const run = async () => {
  $start.setAttribute("disabled", "disabled")

  const localStream = await getLocalMedia()
  $encoderVideo.srcObject = localStream

  startEncode(localStream)
}

document.querySelector("#web-codecs-supported").innerHTML = 
  checkSupported() ? "yes" : "no"
setInputHandler()
$start.onclick = run

alert(
  ['Notice!: Since `WebCodecs API` is experimental feature currently,',
   'it will be danger to run this demo app too long.',
   'It will leads to OS freezing, ocationally :\\'].join(" ")
)