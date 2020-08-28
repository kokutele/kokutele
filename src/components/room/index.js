import React, {useState, useEffect} from 'react'
import { Alert, Steps } from 'antd'
import { VideoCameraOutlined, FormOutlined } from '@ant-design/icons'


import Logo from '../common/logo'
import ConnectVideo from './connect-video'
import Enter from './enter'
import VideoRoom from './video-room'

const styleRoom = {
  position: "relative",
  paddingTop: "3em",
  textAlign: "center",
  height: "calc(100vh - 32px)",
}

const descs = {
  "IDLE": "まず、ビデオカメラに接続しよう",
  "CONNECTED": "名前を入力してテレカンルームに入ろう",
  "ENTERED": "@@@"
}

const EnterStep = props => {
  const { step } = props
  
  return (
    <div style={{textAlign: "center", maxWidth: 512, margin: "0 auto"}}>
      <Steps current={step} progressDot>
        <Steps.Step title={(<div>Step1. <VideoCameraOutlined /></div>)} />
        <Steps.Step title={(<div>Step2. <FormOutlined /></div>)} />
      </Steps>
    </div>
  )
}

export default function Room( props ) {
  const [state, changeState] = useState("IDLE")
  const [mesg, setMessage] = useState('')
  const [_localStream, setLocalStream ] = useState( null )

  useEffect( _ => {
    if( state === "CONNECTED" && !_localStream ) {
      navigator.mediaDevices
        //.getUserMedia({ video: { width: 720, height: 480}, audio: true })
        .getUserMedia({ video: true, audio: true })
        .then( stream => {
          console.log( stream )
          setLocalStream( stream )
        })
        .catch( err => setMessage(err.message) )
    } 
  }, [state, _localStream])

  return (
    <div className="Room">
      <main>
        <div className="tower">
          <div className="container">
            <div style={styleRoom}>
              { state === "IDLE" && (
                <div>
                  <Logo desc={descs[state]} />
                  <EnterStep step={0} />
                  <ConnectVideo onClick={ e=> {changeState("CONNECTED")}}/>
                </div>
              )}
              { state === "CONNECTED" && (
                <div>
                  <Logo desc={descs[state]} />
                  { !!mesg && (
                    <div style={{textAlign: "left"}}>
                      <Alert type="error" showIcon message={mesg} />
                    </div>
                  )}
                  <EnterStep step={1} type={props.type} />
                  <Enter 
                    stream={_localStream} onFinish={e => {
                      changeState('ENTERED')
                    }} 
                    onError={setMessage} 
                    type={props.type}
                  />
                </div>
              )}
              { state === "ENTERED" && (
                <VideoRoom localStream={_localStream} roomId={props.roomId} type={props.type} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}