const $encoderVideo = document.querySelector(".encoder video")
const $encoderTimestamp = document.querySelector(".encoder .timestamp")
const $encoderType = document.querySelector(".encoder .type")
const $encoderByteLength = document.querySelector(".encoder .byte-length")

const $sendPLI = document.querySelector("#send-pli")
const $ignoreSync = document.querySelector("#ignore-sync")
const $delay = document.querySelector("#delay")
const $packetLostRatio = document.querySelector("#packet-lost-ratio")
const $start = document.querySelector("#start")

const $decoderCanvas = document.querySelector(".decoder canvas")
const ctx = $decoderCanvas.getContext('2d')

let packetLostRatio = 0.0
let delay = 100
let sendPLI = true
let ignoreSync = false

const setInputHandler = () => {
  $sendPLI.checked = sendPLI
  $sendPLI.onclick = e => {
    sendPLI = e.target.checked
    e.target.checked = sendPLI
    console.log( "sendPLI:", e.target.checked )
  }

  $ignoreSync.checked = ignoreSync
  $ignoreSync.onclick = e => {
    ignoreSync = e.target.checked
    e.target.checked = ignoreSync
    console.log( "ignoreSync", ignoreSync )
  }

  $packetLostRatio.value = packetLostRatio
  $packetLostRatio.onchange = e => {
    let value = parseFloat(e.target.value)

    packetLostRatio = value
    e.target.value = value
    console.log( "packetLostRatio", packetLostRatio )
  }

  $delay.value = delay
  $delay.onchange = e => {
    let value = e.target.value

    delay = parseFloat(value)
    e.target.value = value
    console.log( "delay", delay )
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

  /**
   * This method will be used for sending encoded dato to decoder.
   * when seqNum
   * 
   * @params {number} seqNum - sequence number
   * @params {chunk} object - chunked encoded data
   */
  let prev = 0, synched = true
  const send = async (seqNum, chunk) => {
    if( seqNum != prev + 1 ) {
      // when packet lost is detected
      if(sendPLI) {
        setTimeout( e => {
          reqKeyFrame = true
        }, delay)
      }

      synched = false

      prev = seqNum
    } else {
      prev = seqNum
      if( chunk.type === "key" ) synched = true

      await new Promise( r => setTimeout(r, delay))
      if( ignoreSync ) {
        videoDecoder.decode(chunk)
      } else if(synched) {
        videoDecoder.decode(chunk)
      }
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

const supported = checkSupported()
document.querySelector("#web-codecs-supported").innerHTML = 
  supported ? "yes" : "no"
setInputHandler()
$start.onclick = run

if( !supported ) {
  alert(
    [
      "Your browser does not support WebCodecs.",
      "use Chrome with M87 and enable `#enable-experimental-web-platform-features`",
      "for experiencing this experimental web app."
    ].join(" ")
  )
}