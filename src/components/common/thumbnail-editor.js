import React, { useState, useEffect, useRef, useCallback } from 'react'

import { Button } from 'antd'
import { CameraOutlined } from '@ant-design/icons'

import './rtc-video.css'

export default function(props) {
  const _video = useRef()
  const _canvas = useRef()
  const _canvasBack = useRef()
  const { stream, width, setThumbnail } = props
  const [thumbnail, _setThumbnail] = useState('')

  useEffect( _ => {
    if( _canvas.current && _video.current ) {
      const cvs = _canvas.current
        , video = _video.current
      cvs.width = video.offsetWidth
      cvs.height = video.offsetHeight

      const ctx = cvs.getContext('2d')

      const _draw = _ => {
        if( video.videoHeight !== 0) {
          const ratio = video.offsetHeight / video.videoHeight
          const w = cvs.offsetWidth
            , h = cvs.height
            , r = Math.ceil( h / 4 )
            , _w = Math.ceil( video.videoWidth * ratio)

          ctx.beginPath()
          ctx.strokeStyle = '#ccc'
          ctx.arc( Math.ceil( w / 2 ), Math.ceil( h / 2 ), r, 0, 2 * Math.PI, false)
          ctx.clip()
          ctx.drawImage( video, 0, 0, video.videoWidth, video.videoHeight, Math.ceil( (w - _w) / 2 ), 0, Math.ceil( _w), h)

          // const base64 = cvs.toDataURL('image/png')
          // _img.current.src = base64
        }

        requestAnimationFrame(_draw)
      }
      _draw()
    }
  }, [_canvas, _video, _canvasBack])

  useEffect( _ => {
    if( stream ) {
      _video.current.srcObject = stream
    }
  }, [_video, stream])

  const handleClick = useCallback( _ => {
    const cvs = _canvas.current
    if( cvs ) {
      const _thumbnail = cvs.toDataURL('image/png')
      if( _setThumbnail ) _setThumbnail(_thumbnail )
      if( setThumbnail ) setThumbnail(_thumbnail)
    } 
  }, [_canvas, _setThumbnail, setThumbnail])

  const visibility = 'visible' // 'hidden'

  return (
    <div className="ThumbnailEditor">
      <div className="video-ratio-wrapper" style={{ width }}>
        <video ref={e => _video.current = e} style={{ visibility, filter: "blur(5px)" }} muted={true} autoPlay playsInline />
        <canvas ref={e => _canvas.current = e} style={{visibility}}></canvas>
      </div>
      <div className="space"></div>
      <div style={{textAlign: "center"}}>
        <Button 
          type="primary" 
          shape="circle" 
          icon={<CameraOutlined />} 
          danger 
          size="large" 
          onClick={handleClick}
        />
      </div>
      { !!thumbnail && (
      <div>
        <img src={thumbnail} alt="thubmnail" />
      </div>
      )}
    </div>
  )
}