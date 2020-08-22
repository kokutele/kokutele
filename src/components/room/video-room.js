import React, { useState, useCallback } from 'react'
import { Avatar, Alert, Button, Col, Row } from 'antd'

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
  const { roomId } = props
  const [_remotes, setRemotes] = useState([])
  console.log( roomId )

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


  return (
    <div style={{ position: "absolute", textAlign: "left", left: 0, top: 0, width: "100%", height: "100%", backgroundColor: "#000"}}>
      { _remotes.length === 0 && (
        <div>
          <Alert description={`このURLを共有しよう： ${window.location.href}`} message="今、あなただけです" showIcon />
        </div>
      )}
      <div>
        <Row span={24}>
        { _remotes.map( (obj, idx) => (
          <Col key={idx} span={24 / Math.ceil(Math.sqrt(_remotes.length))}>
            <UserView width="100%" userName={obj.userName} stream={obj.stream} />
          </Col>
        ))}
        </Row>
      </div>
      <div style={{position: "absolute", right: 0, top: 0, zIndex: 1002}} >
        <Button type="primary" onClick={_ => addRemotes( {peerId: "testId", userName: props.userName, stream: props.localStream } )}>add</Button>
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