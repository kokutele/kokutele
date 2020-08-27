import React, { useState } from 'react'
import { Form, Input, Button, Modal } from 'antd' 
import { ImportOutlined, CameraOutlined } from '@ant-design/icons'
import RTCVideo from '../common/rtc-video'
import ThumbnailEditor from '../common/thumbnail-editor'

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
  const [thumbnail, setThumbnail] = useState('')
  const [userName, setUserName] = useState('')

  return (
    <div className="Enter" style={{ textAlign: "center", maxWidth: 512, margin: "8px auto" }}>
      <RTCVideo type={type} thumbnail={thumbnail} stream={stream} muted={true} width="100%" userName={userName} />
      { (type==="audio" && visible) && (
      <div>
        <Modal
          visible={visible}
          onOk={_ => setVisible(false)}
          onCancel={_ => setVisible(false)}
        >
          <ThumbnailEditor stream={stream} wiedth="100%" setThumbnail={setThumbnail}/>
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
            >generate thumbnail</Button>
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
          onFinish={onFinish}
          onFinishFailed={onError}
        >
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
            <Input placeholder="名前を入力して下さい" onChange={e => setUserName( e.target.value) }/>
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