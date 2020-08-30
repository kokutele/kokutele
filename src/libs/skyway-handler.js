import Peer from 'skyway-js'
import EventEmitter from 'events'
import { apikey } from '../config'


export default class SkywayHandler extends EventEmitter {
  static create( props ) {
    const { debug } = !!props ? props : { debug: 2 }
    return new Promise((resolve, reject) => {
      if( apikey === '' ) {
        reject(new TypeError('REACT_APP_APIKEY does not specified.'))
      } else {
        const skywayHandler = new SkywayHandler({debug})
        skywayHandler.peer.once('open', id => {
          skywayHandler.peer.removeAllListeners()
          resolve(skywayHandler)
        })
        skywayHandler.peer.on('error', err => {
          skywayHandler.peer.removeAllListeners()
          reject(err)
        })
      }
    })
  }

  constructor(props) {
    super(props)
    const { debug } = props

    this.peer = new Peer({key: apikey, debug})
  }

  join( roomId, localStream ) {
    return new Promise( (resolve, reject) => {
      this.room = this.peer.joinRoom( roomId, {
        mode: 'mesh',
        stream: localStream
      })

      this.room.once('open', _ => {
        this.room.removeAllListeners('close')
        this._setEventListners()
        resolve()
      })

      this.room.once('close', _ => {
        this.room.removeAllListeners()
        reject( new TypeError('room closed before joined'))
      })
    })
  }

  _setEventListners() {

    this.room.on('peerJoin', peerId => {
      this.emit('peerJoin', peerId)
    })

    this.room.on('peerLeave', peerId => {
      this.emit('peerLeave', peerId)
    })

    this.room.on('stream', stream => {
      this.emit('stream', stream)
    })

    this.room.on('data', ({ src, data }) => {
      this.emit('data', {src, data})
    })

    // todo - should not I write close listener?
  }


  leave() {
    return new Promise( (resolve, _) => {
      this.room.close()

      this.room.once('close', _ => {
        this.room.removeAllListeners()
        resolve()
      })
    })
  }

  replaceStream( stream ) {
    // for future use
    this.room.replaceStream( stream )
  }

  send( data ) {
    this.room.send( data )
  }
}