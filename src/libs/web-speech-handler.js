//@flow

// normarize
const SpeechRecognition:function = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechGrammarList:function = window.SpeechGrammarList || window.webkitSpeechGrammarList
const SpeechRecognitionEvent:function = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent


export const checkWebSpeechSupported = ():boolean => {
  return !!( SpeechRecognition && SpeechGrammarList && SpeechRecognitionEvent )
}

type PropTypes = {
  onResult: Function;
  onError: Function;
}

export class WebSpeechHandler {
  static create(props:PropTypes):WebSpeechHandler {
    return new WebSpeechHandler(props)
  }

  recognition: Object;
  speechGrammarList: Object;
  onResult: Function;
  onError: Function;
  idx: number;
  destroyed: boolean;

  constructor(props:PropTypes) {
    this.recognition = new SpeechRecognition();
    this.speechGrammarList = new SpeechGrammarList();

    // todo - add grammer from userName
    // grammer MUST be JSFG
    // for more detail, see - https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
    //
    // const grammer = '<some jsfg format text>'
    // this.speechGrammarList.addFromString(grammar, 1);

    this.recognition.grammars = this.speechGrammarList
    this.recognition.continuous = true
    this.recognition.lang = 'ja'
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1
    this.idx = 0
    this.destroyed = false

    this.onResult = props.onResult
    this.onError  = props.onError
  }

  start():void {
    this.recognition.start()
    this._setSpeechHandler()
  }

  destroy():void {
    this.destroyed = true
    this.recognition.stop()
  }

  _setSpeechHandler() {
    this.recognition.onstart = () => {
      console.log("start")
    }
    this.recognition.onspeechstart = () => {
    }
    this.recognition.onresult = e => {
      const result = e.results[this.idx]

      this.onResult( {
        timestamp: Date.now(),
        transcript: result[0].transcript,
        isFinal: result.isFinal
      } )
      if(result.isFinal) {
        this.idx++
      }
    }
    this.recognition.onend = () => {
      console.log("end")
      if( !this.destroyed ) {
        this.idx = 0
        this.recognition.start()
      }
    }
    this.recognition.onspeechend = () => {
      this.recognition.stop()
    }
    this.recognition.ononmatch = () => {
      this.onResult({
        timestamp: Date.now(),
        transcript: '認識できませんでした',
        isFinal: false
      })
    }
    this.recognition.onerror = err => {
      this.onError( new TypeError('認識エラーが発生しました'))
    }
  }
}


//const run = () => {
//  const recClient = MyRecognition.create()
//  const $start = document.querySelector('#start')
//
//  $start.onclick = () => {
//    recClient.start()
//  }
//}
//
//document.querySelector("#web-speech-supported").innerHTML = checkSupport() ? 'yes' : 'no'
//
//if(!checkSupport()) {
//  alert('this browser does not support WebSpeechAPI, use Chrome or Edge.')
//} else {
//  run()
//}
//