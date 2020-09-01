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
  startTimestamp: number;
  onResult: Function;
  onError: Function;

  constructor(props:PropTypes) {
    this.recognition = new SpeechRecognition();
    this.speechGrammarList = new SpeechGrammarList();

    this.recognition.grammars = this.speechGrammarList
    this.recognition.continuous = false
    this.recognition.lang = 'ja'
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.onResult = props.onResult
    this.onError  = props.onError

    this.startTimestamp = 0
  }

  start():void {
    this.recognition.start()
    this._setSpeechHandler()
  }

  _setSpeechHandler() {
    this.recognition.onstart = () => {
    }
    this.recognition.onspeechstart = () => {
      this.startTimestamp = Date.now()
    }
    this.recognition.onresult = e => {
      const result = e.results[0]
      this.onResult( {
        timestamp: this.startTimestamp,
        transcript: result[0].transcript,
        isFinal: result.isFinal
      } )
    }
    this.recognition.onend = () => {
      this.recognition.start()
    }
    this.recognition.onspeechend = () => {
      this.recognition.stop()
    }
    this.recognition.ononmatch = () => {
      this.onResult({
        timestamp: this.startTimestamp,
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