import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  setPeerId,
  selectPeerId,
  selectUserName, 
  selectThumbnail, 
  selectAvatarColor,
  addTranscripts,
  selectTranscripts,
  setLastLocalTranscript,
  selectLastLocalTranscript,
  selectBgImage
} from './room-slice'
import { Alert, Button, Col, Row, List } from 'antd'
import { AudioOutlined, AudioMutedOutlined, CopyOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { WebSpeechHandler, checkWebSpeechSupported } from '../../libs/web-speech-handler'

import SkywayHandler from '../../libs/skyway-handler'
import RTCVideo from '../common/rtc-video'
import Avatar from 'antd/lib/avatar/avatar'

import { getSkywayHandler, setSkywayHandler } from './skyway-handler-manager'

import { getFormattedTimestamp, shortenText } from '../../libs/util'

const UserView = props => {
  return (
    <div style={{position: "relative"}}>
      <RTCVideo 
        style={{position: "absolute", zIndex: 1000}}
        {...props}
      />
    </div>
  )
}

const LocalView = props => {
  const {voiceOnly} = props
  const {transcript, isFinal} = useSelector( selectLastLocalTranscript )
  // todo - move to bottom, automaticallly
  return (
    <div style={{width: props.width, position: "absolute", textAlign: "left", bottom: 0, right: 0}}>
      <UserView {...props} muted={true} showAudioWave={voiceOnly}/>
      <div style={{color: isFinal ? "#fff": "#aaa", height: "4em", overflowY: "auto"}}>
        {shortenText(transcript, 16)}
      </div>
    </div>
  )
}

const RemoteView = props => {
  const { roomId, userName, localStream, type, avatarBgColor, thumbnail, bgImage } = props
  const [_remotes, setRemotes] = useState([])
  const [ _errMessage, setErrMessage ] = useState('')
  const [ _copied, setCopied ] = useState(false)

  const dispatch = useDispatch()

  /**
   * @params {Object} remoteObj
   * @params {string} remoteObj.peerId
   * @params {string} remoteObj.userName
   * @params {string} remoteObj.type - `small` or `audio`
   * @params {string} remoteObj.thumbnail - base64 thumbnail image
   * @params {MediaStream} remoteObj.stream
   */
  const addRemotes = useCallback( remoteObj => {
    setRemotes( prev => {
      prev = prev.filter( o => o.peerId !== remoteObj.peerId)
      return [...prev, remoteObj]
    })
  }, [setRemotes])

  const deleteRemotes = useCallback( peerId => {
    setRemotes( prev => {
      return prev.filter( o => o.peerId !== peerId )
    })
  }, [setRemotes])

  useEffect( _ => {
    const db = new Map()

    SkywayHandler.create()
      .then( async handler => {
        setSkywayHandler( handler )

        dispatch( setPeerId( handler.peer.id ))
        await handler.join( roomId, localStream )

        handler.on('peerJoin', peerId => {
          handler.send({
            type: 'meta',
            payload: {
              userName, peerId, thumbnail, avatarBgColor, bgImage
            }
          })
        })

        handler.on('peerLeave', peerId => {
          db.delete( peerId )
          deleteRemotes(peerId)
        })

        handler.on('stream', stream => {
          const o = db.get( stream.peerId )

          if( o ) {
            db.set( stream.peerId, Object.assign( {}, o, { stream }))

            addRemotes({
              peerId: stream.peerId,
              userName: o.userName,
              thumbnail: o.thumbnail,
              avatarBgColor: o.avatarBgColor,
              bgImage: o.bgImage,
              stream
            })
          } else {
            db.set( stream.peerId, { stream } )
          }
        })

        /**
         * 
         * 他の参加者からメッセージがきた時のハンドラー
         * 参加時のメタデータ通知や、音声認識時の結果通知など
         * 
         * @params {sring} src - peerId of remote peer
         * @params {object} data
         * @params {string} data.type - 'meta', 'recognition'
         * @params {object} data.payload - structure is depeends on each type
         * 
         * payload structure
         * 
         * case type === 'meta'
         * @params {string} userName
         * @params {string} peerId
         * @params {string} thumbnail - base64 encoded
         * @params {string} avatarBgColor
         * 
         * case type === 'recognition'
         * @params {number} timestamp,
         * @params {string} transcript,
         * @params {string} peerId,
         * @params {string} userName,
         * @params {string} thumbnail,
         * @params {string} avatarBgColor
         *
         */
        handler.on('data', ({src, data}) => {
          const { type, payload } = data
          console.log( data )

          if( type === 'meta') {
            const o = db.get( src )

            if( o ) {
              db.set( src, Object.assign( {}, o, { userName: payload.userName, thumbnail: payload.thumbnail, bgImage: payload.bgImage }))
              addRemotes({
                peerId: src, ...payload, stream: o.stream
              })
            } else {
              db.set( src, { ...payload })
            }
          }

          if( type === 'recognition' ) {
            dispatch(addTranscripts( payload ))
          }
        })

        handler.send({
          type: 'meta',
          payload: {
            userName, peerId: handler.peer.id, thumbnail, avatarBgColor, bgImage
          }
        })
      })
      .catch( err => {
        console.error(err)
        setErrMessage( err.message )
      })
  }, [ setErrMessage, roomId, userName, localStream, addRemotes, deleteRemotes, thumbnail, avatarBgColor, bgImage, dispatch ])


  return (
    <div style={{ position: "absolute", textAlign: "left", left: 0, top: 0, width: "100%", height: "100%", backgroundColor: "#000"}}>
      { !!_errMessage && (
        <div>
          <Alert description={_errMessage} message="エラーが発生しました" type="error"  showIcon />
        </div>
      )}
      { _remotes.length === 0 && (
        <div>
          <Alert 
            description={<div>このURLを共有しよう： {window.location.href} <Button type="link" onClick={ _ => {
              const listener = function(e){
                e.clipboardData.setData("text/plain" , window.location.href);    
                setCopied(true)
                e.preventDefault();
                document.removeEventListener("copy", listener);
                setTimeout( _ => setCopied(false), 3000)
              }
              document.addEventListener("copy" , listener);
              document.execCommand("copy")
            }}><CopyOutlined /></Button>{ _copied && ' コピーしました' }</div>} 
            message={<div>今この部屋にいるのは、あなただけです</div>}
            showIcon 
          />
        </div>
      )}
      <div>
        <Row span={24}>
        { _remotes.filter(o => !!o.stream ).map( (obj, idx) => (
          <Col key={idx} span={24 / Math.ceil(Math.sqrt(_remotes.length))}>
            <UserView width="100%" {...obj} type={type} />
          </Col>
        ))}
        </Row>
      </div>
      { process.env.NODE_ENV==="development" && (
      <div style={{position: "absolute", right: 40, top: 0, zIndex: 1002}} >
        <Button type="primary" onClick={_ => addRemotes( {peerId: "testId", userName, stream: localStream, thumbnail, avatarBgColor, bgImage } )}>add</Button>
        <Button type="primary" onClick={_ => deleteRemotes( "testId" )}>delete</Button>
      </div>
      )}
    </div>
  )
}

const MicMuteButton = props => {
  const {
    enabled,
    onClick
  } = props

  return (
    <div style={{
      position: "absolute", 
      textAlign: "left", 
      bottom: 10, 
      right: "50%"}}>
      <Button 
        danger
        style={{ 
          fontSize: "2em",
          fontWeight: "bold",
          width: 64, 
          height: 64, 
        }}
        shape="circle" 
        type={ enabled ? "primary" : "dashed" }
        onClick={_ => onClick(!enabled)}
        size="large">
          { enabled ? (
          <AudioOutlined />
          ):(
          <AudioMutedOutlined />
          )}
      </Button>
    </div>
  )
}

const ShareButton = props => {
  const { onClick } = props
  return (
    <div style={{
      position: "absolute", 
      textAlign: "left", 
      top: 100, 
      right: 10}}>
      <Button 
        style={{
          fontSize: "2em",
          fontWeight: "bold",
          width: 64, 
          height: 64, 
        }}
        size="large"
        shape="circle" 
        type="dashed" 
        onClick={onClick}
      >
        <UsergroupAddOutlined />
      </Button>
    </div>
  )
}



const TranscriptsView = () => {
  const transcripts = useSelector( selectTranscripts )
  const [ _copied, setCopied ] = useState(false)
  const reversed = transcripts.map( t => {
    const temp = t.userName.split(" ")
    const displayName = temp.length > 1 ? temp.map( s => s.slice(0,1) ).join("") : temp[0].slice(0,2)
    const time = getFormattedTimestamp( t.timestamp )
    return Object.assign({}, t, {displayName, time})
  }).reduce((a, b) => [b, ...a], [])

  return(
    <div className="TranscriptView" style={{
      position: "absolute",
      top: 250,
      bottom: 180,
      right: 0,
      color: "#fff",
      textAlign: "left",
      width: 240,
      overflowY: "auto",
      background: "rgba(0, 0, 0, 0.75)"
    }}>
      <div style={{textAlign: "right", paddintRight: "3px"}}>
        { _copied && (<span style={{color: "#fff", fontWeight:"bold", fontSize: "0.75em"}}>copied!</span>)}
        <Button type="link" onClick={_ => {
            const listener = function(e){
              const result = JSON.stringify(
                transcripts.map( t => (
                  {
                    timestamp: t.timestamp,
                    formatted: getFormattedTimestamp(t.timestamp),
                    userName: t.userName,
                    transcript: t.transcript
                  }
                )),
                null, 2
              )
              e.clipboardData.setData("text/plain" , result);    
              setCopied(true)
              e.preventDefault();
              document.removeEventListener("copy", listener);
              setTimeout( _ => setCopied(false), 3000)
            }
            document.addEventListener("copy" , listener);
            document.execCommand("copy")
        }}>
          <CopyOutlined/>
        </Button>
      </div>
      { reversed.length > 0 && (
      <List
        itemLayout="horizontal"
        dataSource={reversed}
        renderItem={item => {

          return (
          <List.Item>
            <List.Item.Meta
              avatar={ item.thumbnail ? (
                <Avatar src={item.thumbnail} />
              ):(
                <Avatar src={item.thumbnail}
                  style={{
                    backgroundColor: item.avatarBgColor,
                    verticalAlign: 'middle',
                  }}
                >
                  {item.displayName}
                </Avatar>
              )}
              title={<span style={{color: "#fff"}}>{item.transcript}</span>}
              description={<span style={{color: "#aaa"}}>{item.time}</span>}
            />
          </List.Item>
          )
        }}
      />
      )}
    </div>
  )
}

const ShareAlert = props => {
  const { onClose } = props
  const [ _copied, setCopied ] = useState(false)

  return (
    <div style={{
      position: "absolute", 
      textAlign: "left", 
      top: 100, 
      right: 80}}>
      <Alert 
        type="success"
        message={<div>
          このURLを共有してください
          <Button type="link" onClick={ _ => {
            const listener = function(e){
              e.clipboardData.setData("text/plain" , window.location.href);    
              setCopied(true)
              e.preventDefault();
              document.removeEventListener("copy", listener);
              setTimeout( _ => setCopied(false), 3000)
            }
            document.addEventListener("copy" , listener);
            document.execCommand("copy")
          }}><CopyOutlined />
          </Button>{ _copied && (<span style={{color: "#000", fontWeight:"bold", fontSize: "0.75em"}}>copied!</span>)}
          <br />
          {window.location.href}
        </div>}
        closeText="x"
        onClose={onClose}
      />
    </div>
  )
}


export default function(props) {
  const { localStream, type } = props
  const [micEnabled, setMicEnabled] = useState(true)
  const [_voiceOnly, setVoiceOnly] = useState(false)
  const [_showShareAlert, setShowShareAlert] = useState(false)

  const peerId = useSelector(selectPeerId)
    , userName = useSelector(selectUserName)
    , thumbnail = useSelector(selectThumbnail)
    , avatarBgColor = useSelector( selectAvatarColor )
    , bgImage = useSelector( selectBgImage )

  const transcripts = useSelector( selectTranscripts )
  const dispatch = useDispatch()

  // typeが 'audio' の時は、映像をOFFにする。
  useEffect( _ => {
    const tracks = localStream.getVideoTracks()
    if( type === "audio" ) {
      tracks.forEach( t => t.enabled = false )
    }
  }, [localStream, type])

  // 状態に応じて、マイクを ON/OFFする
  useEffect( _ => {
    const tracks = localStream.getAudioTracks()
    tracks.forEach( t => t.enabled = micEnabled )
  }, [micEnabled, localStream])

  // WebSpeech
  useEffect( _ => {
    if( !peerId ) return

    // we assumed that skywayHandler will be always exists
    // when peerId is not null
    const skywayHandler = getSkywayHandler()

    const isWebSpeechSupported = checkWebSpeechSupported()

    // 音声認識結果が帰ってきた時のコールバック
    // isFinal の時(認識が完了した時)に、`addTranscripts()`が
    // 呼ばれ、<TranscriptsView/>に表示されるようになる
    const onResult = result => {
      const { transcript, isFinal, timestamp } = result
      dispatch(setLastLocalTranscript({
        transcript, isFinal
      }))

      if( isFinal ) {
        const payload = {
          timestamp,
          transcript,
          peerId,
          userName,
          thumbnail,
          avatarBgColor
        }
        dispatch(addTranscripts(payload))
        skywayHandler.send({
          type: 'recognition',
          payload
        })
       
      }
    }

    const onError = err => {
      console.warn(err)
    }

    let handler
    const useSpeechRec = isWebSpeechSupported
    if( useSpeechRec ) {
      handler = WebSpeechHandler.create({onResult, onError})
      handler.start()
    }

    return function cleanup() {
      if(handler) handler.destroy()
    }
  }, [peerId, avatarBgColor, dispatch, thumbnail, userName])

  return(
    <div className="VideoRoom">
      <RemoteView 
        {...props} 
        avatarBgColor={avatarBgColor} 
        userName={userName} 
        type={type} 
        thumbnail={thumbnail} 
        onExceeds={setVoiceOnly} 
        bgImage={bgImage}
      />
      <LocalView 
        voiceOnly={_voiceOnly} 
        avatarBgColor={avatarBgColor} 
        stream={localStream} 
        userName={userName} 
        width={160} 
        type={type} 
        thumbnail={thumbnail} 
        bgImage={bgImage}
      />
      {transcripts.length > 0 && (
        <TranscriptsView />
      )}
      <MicMuteButton enabled={micEnabled} onClick={setMicEnabled} />
      <ShareButton onClick={_ => setShowShareAlert(true)}/>
      { _showShareAlert && (
        <ShareAlert onClose={_ => setShowShareAlert(false)}/>
      )}
    </div>
  )
}