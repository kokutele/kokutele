import React, { useState, useCallback, useEffect } from 'react'
import { Avatar, Alert, Button, Col, Row } from 'antd'

import SkywayHandler from '../../libs/skyway-handler'
import RTCVideo from '../common/rtc-video'

const UserView = props => {
  const { stream, width, userName } = props
  const displayName = userName.split(" ").map( s => s.slice(0,1) ).join("")

  return (
    <div style={{position: "relative"}}>
      <RTCVideo stream={stream} width={width} style={{position: "absolute", zIndex: 1000}}/>
      <div style={{position: "absolute", zIndex: 1001, top: 3, left: 3}}>
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
  return (
    <div style={{width: props.width, position: "absolute", textAlign: "left", bottom: 0, right: 0}}>
      <UserView {...props} />
    </div>
  )
}

const RemoteView = props => {
  const { roomId, userName, localStream } = props
  const [_remotes, setRemotes] = useState([])
  const [ _errMessage, setErrMessage ] = useState('')
  console.log( roomId )

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
    console.log( `num of remotes - ${num}`)
    const videoTracks = localStream.getVideoTracks()

    console.log( videoTracks[0])

    if( num > 3 ) {
      videoTracks.forEach( track => track.enabled = false)
    } else {
      videoTracks.forEach( track => track.enabled = true)
    }

  }, [_remotes, localStream])

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
          <Alert description={`このURLを共有しよう： ${window.location.href}`} message="今、あなただけです" showIcon />
        </div>
      )}
      <div>
        <Row span={24}>
        { _remotes.filter(o => !!o.stream ).map( (obj, idx) => (
          <Col key={idx} span={24 / Math.ceil(Math.sqrt(_remotes.length))}>
            <UserView width="100%" userName={obj.userName} stream={obj.stream} />
          </Col>
        ))}
        </Row>
      </div>
      <div style={{position: "absolute", right: 0, top: 0, zIndex: 1002}} >
        <Button type="primary" onClick={_ => addRemotes( {peerId: "testId", userName, stream: localStream } )}>add</Button>
        <Button type="primary" onClick={_ => deleteRemotes( "testId" )}>delete</Button>
      </div>
    </div>
  )

}

export default function(props) {
  const { localStream, userName } = props

  return(
    <div className="VideoRoom">
      <RemoteView {...props} />
      <LocalView stream={localStream} userName={userName} width={160} />
    </div>
  )
}