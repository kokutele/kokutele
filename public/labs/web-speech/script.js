// script.js for webspeech api

// normarize
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

const checkSupport = () => {
  return SpeechRecognition && SpeechGrammarList && SpeechRecognitionEvent
}


const $output = document.querySelector("#results output")
class MyRecognition {
  static create() {
    return new MyRecognition()
  }

  constructor() {
    this.recognition = new SpeechRecognition();
    this.speechGrammarList = new SpeechGrammarList();

    this.recognition.grammars = this.speechGrammarList
    this.recognition.continuous = false
    this.recognition.lang = 'ja'
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.idx = 0
    this.transcripts = new Map() // @type <HTMLDOMElement>

    this.startTimestamp = 0
  }

  start() {
    this.recognition.start()
    this._setSpeechHandler()
  }

  _createTranscriptBox() {
    const $div = document.createElement('div')
    $div.innerHTML = ' '
    $output.appendChild($div)
    this.transcripts.set(this.idx, $div)
    this.startTimestamp = Date.now()
  }

  _changeTranscript( text, isFinal ) {
    const $div = this.transcripts.get(this.idx)
    $div.style.color = isFinal ? "black":"gray"
    $div.innerHTML = `${this._getFormattedTimestamp()} - ${text}`
  }

  _getFormattedTimestamp() {
    const date = new Date(this.startTimestamp)
    const hour    = ('00' + date.getHours()  ).slice(-2)
    const minutes = ('00' + date.getMinutes()).slice(-2)
    const seconds = ('00' + date.getSeconds()).slice(-2)
   
    return `${hour}:${minutes}:${seconds}`
  }

  _setSpeechHandler() {
    this.recognition.onstart = () => {
      const $div = document.createElement('div')
    }
    this.recognition.onspeechstart = () => {
      this.idx++
      this._createTranscriptBox()
    }
    this.recognition.onresult = e => {
      const result = e.results[0]
      this._changeTranscript( result[0].transcript, result.isFinal )
    }
    this.recognition.onend = () => {
      this.recognition.start()
    }
    this.recognition.onspeechend = () => {
      this.recognition.stop()
    }
    this.recognition.ononmatch = () => {
      this._changeTranscript( "認識できませんでした", false )
    }
    this.recognition.onerror = err => {
      console.warn("rec error")
    }
  }
}


const run = () => {
  const recClient = MyRecognition.create()
  const $start = document.querySelector('#start')

  $start.onclick = () => {
    recClient.start()
    $start.disabled = true
  }
}

document.querySelector("#web-speech-supported").innerHTML = checkSupport() ? 'yes' : 'no'

if(!checkSupport()) {
  alert('this browser does not support WebSpeechAPI, use Chrome or Edge.')
} else {
  run()
}
