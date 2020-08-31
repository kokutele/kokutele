
const checkSupported = () => {
  const isSupported
  return window.VideoEncoder
}

//////////////////////////////////////////////////////////////////////////////
const run = async () => {
  document.querySelector("#insertable-streams-supported").innerHTML = 
    checkSupported() ? "yes" : "no"
}

run()