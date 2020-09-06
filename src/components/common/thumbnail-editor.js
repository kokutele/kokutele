// @flow
import React, { useState, useEffect, useRef, useCallback } from 'react'

import { Button } from 'antd'
import { CameraOutlined } from '@ant-design/icons'

import ThumbnailRenderer from '../../libs/thumbnail-renderer'
import BustTopRenderer from '../../libs/bust-top-renderer'

import './rtc-video.css'

type PropTypes = {
  stream: MediaStream;
  width: number; // output video width
  setThumbnail: Function; // aims to return thumbnail image
  useBustUp: boolean;
}

export default function(props:PropTypes):Object {
  const _video:Object = useRef()
  const _canvas:Object = useRef()
  const _canvasBack:Object = useRef()
  const _renderer:Object = useRef(null)

  const { 
    stream, 
    width, 
    setThumbnail,
    useBustUp,
  }:PropTypes = props

  const [
    thumbnail:string, _setThumbnail:Function
  ] = useState('')

  useEffect( _ => {
    if( _canvas.current && _video.current ) {
      const canvas:HTMLCanvasElement = _canvas.current
        , video:HTMLVideoElement  = _video.current
      canvas.width = video.offsetWidth
      canvas.height = video.offsetHeight

      //const renderer = ThumbnailRenderer.create({
      _renderer.current = useBustUp ?
        BustTopRenderer.create({
          video, canvas
        }):
        ThumbnailRenderer.create({
          video, canvas
        })

      _renderer.current.start()
    }
    
    return function clenaup() {
      if( _renderer.current && _renderer.current.stop) {
        _renderer.current.stop()
        _renderer.current = null
        console.log('cleanup')
      }
    }
  }, [_canvas, _video, _canvasBack, useBustUp])

  useEffect( _ => {
    if( stream ) {
      _video.current.srcObject = stream
    }
  }, [_video, stream])

  const handleClick:Function = useCallback( _ => {
    const cvs:HTMLCanvasElement = _canvas.current
    if( cvs ) {
      const _thumbnail:string = cvs.toDataURL('image/png')
      if( _setThumbnail ) _setThumbnail(_thumbnail )
      if( setThumbnail  ) setThumbnail(_thumbnail )
    } 
  }, [_canvas, _setThumbnail, setThumbnail])

  const visibility:string = 'visible' // 'hidden'

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