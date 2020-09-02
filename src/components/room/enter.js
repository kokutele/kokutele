import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Avatar, Input, Button, Radio, Switch, Modal } from 'antd' 
import { ImportOutlined, CameraOutlined, PictureOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons'

import RTCVideo from '../common/rtc-video'
import ThumbnailEditor from '../common/thumbnail-editor'
import BackgroundSelector from '../common/background-selector'
import { 
  setUserName, 
  setThumbnail, 
  selectUserName, 
  avatarColors, 
  setAvatarColorName, 
  selectAvatarColor, 
  selectAvatarColorName,
  selectIsMobile,
  selectBgImage,
  setBgImage,
} from './room-slice'


const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

export default function(props) {
  const { stream, type, onFinish, onError } = props
  const [visible, setVisible] = useState(false)  // for thumbnail editor
  const [visibleBgSelector, setVisibleBgSelector] = useState(false)  // for thumbnail editor
  const [thumbnail, _setThumbnail] = useState('')
  const [userName, _setUserName] = useState( useSelector(selectUserName))
  const [_useBustUp, setUseBustUp] = useState(true)
  const [disableSwitch, setDisableSwitch] = useState( false )
  const bgImage = useSelector( selectBgImage )

  const isMobile = useSelector( selectIsMobile )

  useEffect( () => {
    setDisableSwitch(isMobile)
    setUseBustUp(!isMobile)
  }, [isMobile])

  const dispatch = useDispatch()
  const avatarBgColor = useSelector( selectAvatarColor )
  const avatarColorName = useSelector( selectAvatarColorName )

  const handleFinish = useCallback( e => {
    dispatch(setUserName(e.username))
    dispatch(setThumbnail(thumbnail))
    dispatch(setAvatarColorName(avatarColorName))
    onFinish()
  }, [onFinish, thumbnail, dispatch, avatarColorName])

  return (
    <div className="Enter" style={{ textAlign: "center", maxWidth: 512, margin: "8px auto" }}>
      <RTCVideo 
        type={type} 
        thumbnail={thumbnail} 
        avatarBgColor={avatarBgColor} 
        stream={stream} 
        muted={true} 
        width="100%" 
        userName={userName} 
        bgImage={bgImage}
      />
      { (type==="audio") && (
      <div>
        <Modal
          visible={visible}
          onOk={_ => setVisible(false)}
          onCancel={_ => setVisible(false)}
        >
          <ThumbnailEditor 
            stream={stream} 
            wiedth="100%" 
            setThumbnail={_setThumbnail}
            useBustUp={_useBustUp}
          />
        </Modal>
      </div>
      )}
      <div>
        <Modal
          visible={visibleBgSelector}
          onOk={_ => setVisibleBgSelector(false)}
          onCancel={_ => setVisibleBgSelector(false)}
        >
          <BackgroundSelector onSelect={ base64 => dispatch(setBgImage(base64))} />
        </Modal>
      </div>
      { (type==="audio") && (
        <div>
          <div className="space" />
          <div style={{textAlign: "center"}}>
            <Button 
              onClick={ _ => setVisible(true)}
              type="default"
              shape="round"
              icon={<CameraOutlined />}
              danger
            >set thumbnail</Button>
            &nbsp;
            <Switch 
              checkedChildren={<UserOutlined/>}
              unCheckedChildren={<SmileOutlined/>}
              checked={_useBustUp}
              onChange={setUseBustUp}
              disabled={disableSwitch}
            />
          </div>
        </div>
      )}
      <div className="space" />
      <div style={{textAlign: "center"}}>
        <Button 
          onClick={ _ => setVisibleBgSelector(true)}
          type="default"
          shape="round"
          icon={<PictureOutlined />}
          danger
        >set virtual Background</Button>
      </div>
      <div className="space" />
      <div style={{textAlign: "left"}}>
        <Form
          {...layout}
          name="enter-room"
          initialValues={{
            username: userName
          }}
          onFinish={ handleFinish}
          onFinishFailed={onError}
        >
          <Form.Item
            label="Color"
            name="avatarColorName"
            rules={[{
              required: false, // since true makes error...
              message: 'アバターの色を選択して下さい'
            }]}>
            <div style={{textAlign: "center"}}>
            <Radio.Group onChange={ e => (dispatch(setAvatarColorName(e.target.value))) } value={avatarColorName}>
              { Object.entries(avatarColors).map( ([name, code], idx) => (
              <Radio key={idx} value={name}>
                <Avatar 
                  style={{
                    backgroundColor: code,
                  }}
                />
              </Radio>
              ))}
            </Radio.Group>
            </div>
          </Form.Item>
          
          <Form.Item
            label="Username"
            name="username"
            rules={[
            {
              required: true,
              message: '名前を入力して下さい',
            },
          ]}
          >
            <Input placeholder="名前を入力して下さい" onChange={e => _setUserName( e.target.value) }/>
          </Form.Item>
          <Form.Item {...tailLayout} style={{textAlign: 'center'}}>
            <Button type="primary" shape="round" icon={<ImportOutlined />} size="large" htmlType="submit">
              Enter
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}