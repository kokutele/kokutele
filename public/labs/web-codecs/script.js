const checkSupported = () => {
  return !!window.VideoEncoder
}

//////////////////////////////////////////////////////////////////////////////
const run = async () => {
  document.querySelector("#web-codecs-supported").innerHTML = 
    checkSupported() ? "yes" : "no"
}

run()