// @flow

export type PropTypes = {
  video: HTMLVideoElement; // input
  canvas: HTMLCanvasElement; // output
}

export default class ThumbnailRenderer {
  _video: HTMLVideoElement // input
  _canvas: HTMLCanvasElement // output
  _ctx: CanvasRenderingContext2D // output

  static create(props: PropTypes):ThumbnailRenderer {
    return new ThumbnailRenderer( props )
  }

  constructor(props:PropTypes) {
    this._video = props.video
    this._canvas = props.canvas
    this._ctx = this._canvas.getContext('2d')
  } 

  start():void {
    const _draw:function = _ => {
      if( this._video.videoHeight !== 0) {
        const ratio:number = 
          this._video.offsetHeight / this._video.videoHeight
        const w:number = this._canvas.offsetWidth
          , h:number = this._canvas.offsetHeight
          , r:number = Math.ceil( h / 4 )
          , _w:number = Math.ceil( 
            this._video.videoWidth * ratio
          )

        this._ctx.beginPath()
        this._ctx.strokeStyle = '#ccc'
        this._ctx.arc( Math.ceil( w / 2 ), Math.ceil( h / 2 ), r, 0, 2 * Math.PI, false)
        this._ctx.clip()
        this._ctx.drawImage( this._video, 0, 0, this._video.videoWidth, this._video.videoHeight, Math.ceil( (w - _w) / 2 ), 0, Math.ceil( _w), h)
      }

      requestAnimationFrame(_draw)
    }
    _draw()
  }
}