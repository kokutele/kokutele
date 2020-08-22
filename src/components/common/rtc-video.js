import React, { useEffect, useRef } from 'react'

import './rtc-video.css'

export default function(props) {
  const _video = useRef()
  const { stream, width } = props

  useEffect( _ => {
    if( stream ) {
      _video.current.srcObject = stream
    }
  }, [_video, stream])
  return (
    <div className="RTCVideo">
      <div className="video-ratio-wrapper" style={{ width }}>
        <video ref={e => _video.current = e} autoPlay playsInline />
      </div>
    </div>
  )
}