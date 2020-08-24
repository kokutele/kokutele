import React, { useState, useCallback, useEffect } from 'react'
import { Avatar, Alert, Button, Col, Row } from 'antd'
import { AudioOutlined, AudioMutedOutlined, CopyOutlined, UsergroupAddOutlined } from '@ant-design/icons'

import SkywayHandler from '../../libs/skyway-handler'
import RTCVideo from '../common/rtc-video'

const UserView = props => {
  const { stream, width, userName, showAudioWave, muted } = props
  const displayName = userName.split(" ").map( s => s.slice(0,1) ).join("")

  return (
    <div style={{position: "relative"}}>
      <RTCVideo 
        stream={stream} 
        width={width} 
        style={{position: "absolute", zIndex: 1000}}
        showAudioWave={showAudioWave}
        muted={muted}
      />
      <div style={{position: "absolute", zIndex: 1001, top: 5, left: 5}}>
        <Avatar
          style={{
            backgroundColor: '#f00',
            verticalAlign: 'middle',
          }}
        >{displayName}</Avatar>
      </div>
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
  return (
    <div style={{width: props.width, position: "absolute", textAlign: "left", bottom: 0, right: 0}}>
      <UserView {...props} muted={true} showAudioWave={voiceOnly}/>
    </div>
  )
}

const RemoteView = props => {
  const { roomId, userName, localStream, onExceeds } = props
  const [_remotes, setRemotes] = useState([])
  const [ _errMessage, setErrMessage ] = useState('')
  const [ _voiceOnly, setVoiceOnly ] = useState(false)
  const [ _copied, setCopied ] = useState(false)

  //const _api = useRef( notification.useNotification() )

  /**
   * @params {Object} remoteObj
   * @params {string} remoteObj.peerId
   * @params {string} remoteObj.userName
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


  useEffect( _ => {
    const num = _remotes.length
    const videoTracks = localStream.getVideoTracks()

    if( num > 3 ) {
      setVoiceOnly(true)
      onExceeds(true)
      videoTracks.forEach( track => track.enabled = false)
    } else {
      setVoiceOnly(false)
      onExceeds(false)
      videoTracks.forEach( track => track.enabled = true)
    }

  }, [_remotes, localStream, onExceeds])

  useEffect( _ => {
    const db = new Map()

    SkywayHandler.create()
      .then( async handler => {
        await handler.join( roomId, localStream )

        handler.on('peerJoin', peerId => {
          console.log('someone joined', peerId)
          handler.send({
            userName, peerId
          })
        })

        handler.on('peerLeave', peerId => {
          console.log('someone leaved', peerId)
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
              stream
            })
          } else {
            db.set( stream.peerId, { stream } )
          }
        })

        handler.on('data', ({src, data}) => {
          const o = db.get( src )

          if( o ) {
            db.set( src, Object.assign( {}, o, { userName: data.userName }))
            addRemotes({
              peerId: src,
              userName: data.userName,
              stream: o.stream
            })
          } else {
            db.set( src, { userName: data.userName })
          }
        })

        handler.send({
          userName, peerId: handler.peer.id
        })
      })
      .catch( err => {
        console.error(err)
        setErrMessage( err.message )
      })
  }, [ setErrMessage, roomId, userName, localStream, addRemotes, deleteRemotes ])


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
      { _voiceOnly && (
        <div>
          <Alert message={<div>
            4人を超えると、音声のみになります。
          </div>} showIcon closable />
        </div>
      )}
      <div>
        <Row span={24}>
        { _remotes.filter(o => !!o.stream ).map( (obj, idx) => (
          <Col key={idx} span={24 / Math.ceil(Math.sqrt(_remotes.length))}>
            <UserView showAudioWave={_voiceOnly} width="100%" userName={obj.userName} stream={obj.stream} />
          </Col>
        ))}
        </Row>
      </div>
      { process.env.NODE_ENV==="development" && (
      <div style={{position: "absolute", right: 40, top: 0, zIndex: 1002}} >
        <Button type="primary" onClick={_ => addRemotes( {peerId: "testId", userName, stream: localStream } )}>add</Button>
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
  const { localStream, userName } = props
  const [micEnabled, setMicEnabled] = useState(true)
  const [_voiceOnly, setVoiceOnly] = useState(false)
  const [_showShareAlert, setShowShareAlert] = useState(false)

  useEffect( _ => {
    const tracks = localStream.getAudioTracks()
    tracks.forEach( t => t.enabled = micEnabled )
  }, [micEnabled, localStream])

  return(
    <div className="VideoRoom">
      <RemoteView {...props} onExceeds={setVoiceOnly} />
      <LocalView voiceOnly={_voiceOnly} stream={localStream} userName={userName} width={160} />
      <MicMuteButton enabled={micEnabled} onClick={setMicEnabled} />
      <ShareButton onClick={_ => setShowShareAlert(true)}/>
      { _showShareAlert && (
        <ShareAlert onClose={_ => setShowShareAlert(false)}/>
      )}
    </div>
  )
}