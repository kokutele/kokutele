// insertable-streams/script.js
// ref - https://webrtc.github.io/samples/src/content/peerconnection/pc1/

const queue = {
  audio: new Map(), // <Array>
  video: new Map(), // <Array>
}

/**
 * WebRTC handler
 * @class 
 * 
 */
class RTCHandler {
  pc1;           // local peerConnection object
  pc2;           // remote peerConnection object
  localStraem;   // local MediaStream object
  remoteStream; // Array of remote MediaStream object
  configuration; // PeerConnectionConfguration object
  offerOptions;  // offer options
  idx;           // index
  $views;        // views DOMElement
  $remoteVideo;
  $sendVideoLen;
  $sendAudioLen;
  $recvVideoLen;
  $recvAudioLen;
  enableTransform;


  static async call(localStream, {$views, idx, enableTransform}) {
    const handler = new RTCHandler({$views, idx, enableTransform })
    handler._call(localStream)
  }

  constructor(props) {
    this.configuration = {
      forceEncodedVideoInsertableStreams: true,
      forceEncodedAudioInsertableStreams: true
    }

    this.$views = props.$views
    this.idx = props.idx
    this.enableTransform = props.enableTransform

    // generate received video view
    this._appendRemoteVideoElement()

    // these options means `one way stream`
    this.offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }
  }

  async _call(localStream) {
    this.localStream = localStream

    // setup sender
    this.pc1 = new RTCPeerConnection(this.configuration);
    this.pc1.addEventListener('icecandidate', e => this._onIceCandidate(this.pc1, e));
    this.localStream.getTracks()
      .forEach(track => this.pc1.addTrack(track, this.localStream));

    // setup receiver
    this.pc2 = new RTCPeerConnection(this.configuration);
    this.pc2.addEventListener('icecandidate', e => this._onIceCandidate(this.pc2, e));
    this.pc2.addEventListener('track', this._gotRemoteStream.bind(this));

    // signaling - offer
    const offer = await this.pc1.createOffer(this.offerOptions);
    await this.pc1.setLocalDescription(offer);
    await this.pc2.setRemoteDescription(offer);

    // signaling - answer
    const answer = await this.pc2.createAnswer();
    await this.pc2.setLocalDescription(answer);
    await this.pc1.setRemoteDescription(answer);

    // setup sender
    this.pc1.getSenders().forEach( this._setupSenderTransform.bind(this) )
  }

  _textElement(text){
    const span = document.createElement('span')
    span.innerHTML = text
    return span
  }

  _brElement() {
    return document.createElement('br')
  }

  _appendRemoteVideoElement() {
    this.$remoteVideo = document.createElement('video')
    this.$remoteVideo.setAttribute('autoPlay', true)
    this.$remoteVideo.setAttribute('muted', true)
    this.$remoteVideo.setAttribute('controls', true)

    this.$sendVideoLen = document.createElement('span')
    this.$sendAudioLen = document.createElement('span')
    this.$recvVideoLen = document.createElement('span')
    this.$recvAudioLen = document.createElement('span')

    const $div = document.createElement('div')
    {
      $div.appendChild( this.$remoteVideo )
      $div.appendChild( this._brElement() )

      $div.appendChild( this._textElement('send: video ') )
      $div.appendChild( this.$sendVideoLen )
      $div.appendChild( this._textElement(' / audio ') )
      $div.appendChild( this.$sendAudioLen )
      $div.appendChild( this._brElement() )

      $div.appendChild( this._textElement('recv: video ') )
      $div.appendChild( this.$recvVideoLen )
      $div.appendChild( this._textElement(' / audio ') )
      $div.appendChild( this.$recvAudioLen )
    }


    this.$views.appendChild($div)
  }

  _gotRemoteStream(e) {
    const stream = e.streams[0]

    this.remoteStream = stream
    this.$remoteVideo.srcObject = stream

    this.pc2.getReceivers().forEach( this._setupReceiverTransform.bind(this) )
  }

  async _onIceCandidate(pc, event) {
    const _pc = (pc === this.pc1) ? this.pc2 : this.pc1
    await _pc.addIceCandidate(event.candidate)
  }

  _setupSenderTransform(sender) {
    const kind = sender.track.kind
    const senderStreams = sender.createEncodedStreams();
    const readableStream = senderStreams.readableStream;
    const writableStream = senderStreams.writableStream;

    const transformStream = new TransformStream({
      transform: (chunk, controller) => {
        if( this.enableTransform ) {
          if( this.idx === 0 ) {
            const size = queue[kind].size
            if( size > 0 ) {
              for( let i = 0; i < size; i++ ) {
                queue[kind].get(i + 1).push( chunk.data )
              }
            }
          } else {
            const dataArr = queue[kind].get( this.idx )
            if( !dataArr ) {
              queue[kind].set( this.idx, [])
            } else {
              const data = dataArr.shift()
              if( !!data ) chunk.data = data
            }
          }
        }


        const len = chunk.data.byteLength
        if( kind === 'audio' ) {
          this.$sendAudioLen.innerHTML = len
        } else {
          this.$sendVideoLen.innerHTML = len
        }
        controller.enqueue( chunk )
      },
    });
    readableStream
      .pipeThrough(transformStream)
      .pipeTo(writableStream);
  }

  _setupReceiverTransform(receiver) {
    try {
      const kind = receiver.track.kind
      const receiverStreams = receiver.createEncodedStreams()
      const readableStream = receiverStreams.readableStream;
      const writableStream = receiverStreams.writableStream;

      const transformStream = new TransformStream({
        transform: (chunk, controller) => {
          const len = chunk.data.byteLength
          if( kind === 'audio' ) {
            this.$recvAudioLen.innerHTML = len
          } else {
            this.$recvVideoLen.innerHTML = len
          }
          controller.enqueue(chunk)
        },
      });
      readableStream
        .pipeThrough(transformStream)
        .pipeTo(writableStream);
      console.log( `setup ReceiverTransform finished - ${kind}`)
    } catch(err) {
      console.warn( err.message)
    }
  }
}

/**
 * Get local stream
 * @params {object} params
 * @params {boolean} params.disabled - disable VideoTrack
 * @function
 * 
 */
const getLocalStream = async ({disabled}) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {width: 640, height: 480}, audio: true
  })
  if( disabled ) {
    stream.getVideoTracks().forEach( t => t.enabled = false)
  }

  return stream
}


//////////////////////////////////////////////////////////////////////////////
const run = async () => {
  const $sourceVideo = document.querySelector(".source video#local-stream")
  const $disabledVideo = document.querySelector(".source video#disabled-stream")

  const $views = document.querySelector(".received .videos-view")
  const $btn = document.querySelector(".received button#add-stream")
  const $enableTransform = document.querySelector(".received input#enable-transform")
  const $useDisabledStream = document.querySelector(".received input#use-disabled-stream")
  const isSupported =
    !!RTCRtpSender.prototype.createEncodedVideoStreams;
  
  document.querySelector("#insertable-streams-supported").innerHTML = 
    isSupported ? "yes" : "no"

  const localStream = await getLocalStream({disabled: false})
  const disabledStream = await getLocalStream({disabled: true})
  $sourceVideo.srcObject = localStream
  $disabledVideo.srcObject = disabledStream

  $btn.addEventListener('click', async () => {
    const idx = $views.childElementCount
    const enableTransform = !!$enableTransform.checked
    const useDisabledStream = !!$useDisabledStream.checked

    if( idx === 0 ) {
      await RTCHandler.call( localStream, {$views, idx, enableTransform} )
    } else {
      await RTCHandler.call( 
        useDisabledStream ? disabledStream: localStream, 
        {$views, idx, enableTransform} 
      )
    }
  })
}

run()