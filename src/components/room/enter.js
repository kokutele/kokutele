import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Avatar, Input, Button, Radio, Switch, Modal } from 'antd' 
import { ImportOutlined, CameraOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons'
import RTCVideo from '../common/rtc-video'
import ThumbnailEditor from '../common/thumbnail-editor'
import { setUserName, setThumbnail, selectUserName, avatarColors, setAvatarColorName, selectAvatarColor, selectAvatarColorName } from './room-slice'

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
  const [visible, setVisible] = useState(false)
  const [thumbnail, _setThumbnail] = useState('')
  const [userName, _setUserName] = useState( useSelector(selectUserName))
  const [_useBustUp, setUseBustUp] = useState(true)

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
      <RTCVideo type={type} thumbnail={thumbnail} avatarBgColor={avatarBgColor} stream={stream} muted={true} width="100%" userName={userName} />
      { (type==="audio" && visible) && (
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
            />
          </div>
        </div>
      )}
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