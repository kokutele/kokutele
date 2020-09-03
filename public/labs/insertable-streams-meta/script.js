// insertable-streams/script.js
// ref - https://webrtc.github.io/samples/src/content/peerconnection/pc1/

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
  $views;        // views DOMElement
  $remoteVideo;
  $sendVideoLen;
  $sendAudioLen;
  $recvVideoLen;
  $recvAudioLen;
  _red;
  _green;
  _blue;

  static async call(localStream, props) {
    const handler = new RTCHandler(props)
    handler._call(localStream)
    return handler
  }

  constructor(props) {
    this.configuration = {
      forceEncodedVideoInsertableStreams: true,
      forceEncodedAudioInsertableStreams: true
    }

    this.$views = props.$views
    this._red = props.red;
    this._green = props.green;
    this._blue = props.blue;

    // generate received video view
    this._appendRemoteVideoElement()

    // these options means `one way stream`
    this.offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }
  }

  set red(num) {
    this._red = num
  }
  set blue(num) {
    this._blue = num
  }
  set green(num) {
    this._green = num
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
    this.$remoteVideo.setAttribute('muted', "muted")
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
        const len = chunk.data.byteLength
        if( kind === 'video' ) {
          this.$sendVideoLen.innerHTML = len
          // 最後に 3 バイトの固定フィールドを足す（RGBそれぞれの値を1バイトづつ指定）
          const container = new Uint8Array(len + 3)
          const rgb = new Uint8Array( 3 )
          rgb[0] = this._red
          rgb[1] = this._green
          rgb[2] = this._blue

          container.set( new Uint8Array( chunk.data ), 0)
          container.set( rgb, chunk.data.byteLength)

          // chunk.data をRGBデータが追加されたものに差し替える
          chunk.data = container.buffer
        } else {
          this.$sendAudioLen.innerHTML = len
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
            const rgb = new Uint8Array( chunk.data.slice(-3) )

            // 最後の3バイト（RGB） を取り出し、border color としてセットする
            const strRGB = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
            this.$remoteVideo.style.border=`10px solid ${strRGB}`
            
            // 最後の3バイトを除外した映像データをとりだす
            const mediaData = new Uint8Array( chunk.data.slice(0, -3) )

            // chunk.data を映像データのみのものに差し替える　
            chunk.data = mediaData.buffer
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
  const videoConstraints = {width: 720, height:480 }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: videoConstraints, audio: true
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
  const isSupported =
    !!RTCRtpSender.prototype.createEncodedVideoStreams;
  
  document.querySelector("#insertable-streams-supported").innerHTML = 
    isSupported ? "yes" : "no"

  const localStream = await getLocalStream({disabled: false})
  $sourceVideo.srcObject = localStream

  const handlers = []

  $btn.addEventListener('click', async () => {
    const red = document.querySelector("#red").value
    const green = document.querySelector("#green").value
    const blue = document.querySelector("#blue").value
    const handler = await RTCHandler.call( localStream, {
      $views, red, green, blue
    } )
    handlers.push( handler)
  })

  document.querySelector("#red").addEventListener("change", e => {
    handlers.forEach( h => h.red = e.target.value )
  }, false)
  document.querySelector("#green").addEventListener("change", e => {
    handlers.forEach( h => h.green = e.target.value )
  }, false)
  document.querySelector("#blue").addEventListener("change", e => {
    handlers.forEach( h => h.blue = e.target.value )
  }, false)
}

run()