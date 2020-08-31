const sourceVideo = document.querySelector(".source video")

const checkSupported = () => {
  return !!window.VideoEncoder
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
  sourceVideo.srcObject = localStream
  console.log( localStream)
}

run()