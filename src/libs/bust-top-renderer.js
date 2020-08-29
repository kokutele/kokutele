// @flow

const bodyPix:Object = window.bodyPix

export type PropsObj = {
  video: HTMLVideoElement; // input - video element
  canvas: HTMLCanvasElement;   // output - canvas context
}

export default class BustTopRenderer {
  _video: HTMLVideoElement // video element (input)
  _canvas: HTMLCanvasElement // canvas elemet ( output )
  _ctx: CanvasRenderingContext2D   // canvas context (output)
  _isStarted: boolean // true if processing is started

  static create(props: PropsObj):BustTopRenderer {
    return new BustTopRenderer( props )
  }

  constructor( props: PropsObj ) {
    this._video = props.video
    this._canvas = props.canvas
    this._ctx = this._canvas.getContext('2d')

    this._isStarted = false
    
    this._setupDomForWS()
  }

  _setupDomForWS():void {
  }

  async start():Promise<void> {
    if( !this._isStarted ) {
      this._isStarted = true
      let imgWS:HTMLImageElement = document.createElement('img')
        , canvasWS:HTMLCanvasElement = document.createElement('canvas')
        , ctxWS:CanvasRenderingContext2D = canvasWS.getContext('2d')
 
      do {
        const h:number = this._video.offsetHeight
            , r:number = this._video.videoWidth / this._video.videoHeight
            , w:number = Math.ceil(h * r)

        if( h > 0 && !isNaN(w) ) {
          if( canvasWS.width !== w ||
            canvasWS.height !== h
          ) {
            canvasWS.width = w
            canvasWS.height = h
          }
          ctxWS.drawImage( this._video, 0, 0, w, h)
          const base64:string = canvasWS.toDataURL('image/png')
          imgWS.src = base64
          const seg:Object = await this._loadAndPredict(imgWS);

          const orig:ImageData = ctxWS.getImageData( 0, 0, w, h )
          const imgData:ImageData = new ImageData( w, h )

          let p: number = 0
          for(let y:number = 0; y < h; y++ ) {
            for(let x:number = 0; x < w; x++ ) {
              imgData.data[ p * 4 ] = orig.data[ p * 4 ]
              imgData.data[ p * 4 + 1 ] = orig.data[ p * 4 + 1 ]
              imgData.data[ p * 4 + 2 ] = orig.data[ p * 4 + 2 ]
              imgData.data[ p * 4 + 3 ] = 255 * seg.data[p]
              p++
            }
          }
          const dx:number = this._video.offsetWidth - w
          this._ctx.putImageData( imgData, Math.ceil(dx / 2), 0)

        }
        // insert delay timer (100msec)
        await new Promise( r => setTimeout(r, 100) )
      } while(this._isStarted)
    }
  }

  stop():void {
    this._isStarted = false
  }

  async _loadAndPredict(img:HTMLImageElement) {
    const net = await bodyPix.load();
    const segmentation = await net.segmentPerson(img);
    return segmentation
  }
}