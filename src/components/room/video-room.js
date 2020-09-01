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
  selectLastLocalTranscript
} from './room-slice'
import { Alert, Button, Col, Row } from 'antd'
import { AudioOutlined, AudioMutedOutlined, CopyOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { WebSpeechHandler, checkWebSpeechSupported } from '../../libs/web-speech-handler'

import SkywayHandler from '../../libs/skyway-handler'
import RTCVideo from '../common/rtc-video'
import Avatar from 'antd/lib/avatar/avatar'

import { getFormattedTimestamp } from '../../libs/util'

const UserView = props => {
  const { stream, width, type, thumbnail, userName, muted, avatarBgColor } = props

  // todo - change type according to type
  return (
    <div style={{position: "relative"}}>
      <RTCVideo 
        stream={stream} 
        width={width} 
        style={{position: "absolute", zIndex: 1000}}
        muted={muted}
        userName={userName}
        type={type}
        thumbnail={thumbnail}
        avatarBgColor={avatarBgColor}
      />
    </div>
  )
}

// const DisplayType = props => {
//   return (
//     <div style={{position: "absolute", top: 0, left: 0}}>
//       room type: {props.type}
//     </div>
//   )
// }

const LocalView = props => {
  const {voiceOnly} = props
  const {transcript, isFinal} = useSelector( selectLastLocalTranscript )
  return (
    <div style={{width: props.width, position: "absolute", textAlign: "left", bottom: 0, right: 0}}>
      <div style={{color: isFinal ? "#fff": "#aaa"}}>
        {transcript}
      </div>
      <UserView {...props} muted={true} showAudioWave={voiceOnly}/>
    </div>
  )
}

const RemoteView = props => {
  const { roomId, userName, localStream, type, avatarBgColor, thumbnail } = props
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
      return [...prev, remoteObj]
    })
  }, [setRemotes])

  const deleteRemotes = useCallback( peerId => {
    setRemotes( prev => {
      return prev.filter( o => o.peerId !== peerId )
    })
  }, [setRemotes])


//  useEffect( _ => {
//    const num = _remotes.length
//    const videoTracks = localStream.getVideoTracks()
//
//    if( num > 3 ) {
//      setVoiceOnly(true)
//      onExceeds(true)
//      videoTracks.forEach( track => track.enabled = false)
//    } else {
//      setVoiceOnly(false)
//      onExceeds(false)
//      videoTracks.forEach( track => track.enabled = true)
//    }
//
//  }, [_remotes, localStream, onExceeds])
//
  useEffect( _ => {
    const db = new Map()

    SkywayHandler.create()
      .then( async handler => {
        dispatch( setPeerId( handler.peer.id ))
        await handler.join( roomId, localStream )

        handler.on('peerJoin', peerId => {
          handler.send({
            userName, peerId, thumbnail, avatarBgColor
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
              stream
            })
          } else {
            db.set( stream.peerId, { stream } )
          }
        })

        handler.on('data', ({src, data}) => {
          const o = db.get( src )

          if( o ) {
            db.set( src, Object.assign( {}, o, { userName: data.userName, thumbnail: data.thumbnail }))
            addRemotes({
              peerId: src,
              ...data,
              stream: o.stream
            })
          } else {
            db.set( src, { ...data })
          }
        })

        handler.send({
          userName, peerId: handler.peer.id, thumbnail, avatarBgColor
        })
      })
      .catch( err => {
        console.error(err)
        setErrMessage( err.message )
      })
  }, [ setErrMessage, roomId, userName, localStream, addRemotes, deleteRemotes, thumbnail, avatarBgColor, dispatch ])


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
        <Button type="primary" onClick={_ => addRemotes( {peerId: "testId", userName, stream: localStream, thumbnail, avatarBgColor } )}>add</Button>
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

  return(
    <div className="TranscriptView" style={{
      position: "absolute",
      top: 150,
      bottom: 400,
      color: "#fff",
      textAlign: "left"
    }}>
      <div>
        transcript view
        <ul>
          { transcripts.map( t => {
            const temp = t.userName.split(" ")
            const displayName = temp.length > 1 ? temp.map( s => s.slice(0,1) ).join("") : temp[0].slice(0,2)
            const time = getFormattedTimestamp( t.timestamp )
            return (
            <li>
              { t.thumbnail ? (
                <img height={48} src={t.thumbnail} alt="thumbnail"/>
              ): (
                <Avatar
                  size={32}
                  style={{
                    backgroundColor: t.avatarBgColor,
                    verticalAlign: 'middle',
                  }}
                >{displayName}</Avatar>
              )}
              <span>{time}</span>
              <br />
              {t.transcript}
            </li>
          )})}
        </ul>
      </div>
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

    console.log( peerId )
    const isWebSpeechSupported = checkWebSpeechSupported()
    const onResult = result => {
      const { transcript, isFinal, timestamp } = result
      dispatch(setLastLocalTranscript({
        transcript, isFinal
      }))

      console.log( isFinal )
      if( isFinal ) {
        dispatch(addTranscripts({
          timestamp,
          transcript,
          peerId,
          userName,
          thumbnail,
          avatarBgColor
        }))
      }
      
    }
    const onError = err => {
      console.warn(err)
    }

    if( isWebSpeechSupported ) {
      const handler = WebSpeechHandler.create({onResult, onError})
      handler.start()
    }

    return function cleanup() {
      // todo - clear WebSpeech handler
    }
  }, [peerId, avatarBgColor, dispatch, thumbnail, userName])

  return(
    <div className="VideoRoom">
      <RemoteView {...props} avatarBgColor={avatarBgColor} userName={userName} type={type} thumbnail={thumbnail} onExceeds={setVoiceOnly} />
      <LocalView voiceOnly={_voiceOnly} avatarBgColor={avatarBgColor} stream={localStream} userName={userName} width={160} type={type} thumbnail={thumbnail} />
      <TranscriptsView />
      <MicMuteButton enabled={micEnabled} onClick={setMicEnabled} />
      <ShareButton onClick={_ => setShowShareAlert(true)}/>
      { _showShareAlert && (
        <ShareAlert onClose={_ => setShowShareAlert(false)}/>
      )}
    </div>
  )
}