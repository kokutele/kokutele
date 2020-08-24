import React from 'react'
import { Form, Input, Button } from 'antd'
import { ImportOutlined } from '@ant-design/icons'
import RTCVideo from '../common/rtc-video'

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
    offset: 8,
    span: 16,
  },
};

export default function(props) {
  const { stream, onFinish, onError } = props
  return (
    <div className="Enter" style={{ textAlign: "center", maxWidth: 512, margin: "8px auto" }}>
      <RTCVideo stream={stream} muted={true} width="100%" />
      <div className="space" />
      <div style={{textAlign: "left"}}>
        <Form
          {...layout}
          name="enter-room"
          initialValues={{
            username: ''
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
            <Input placeholder="名前を入力して下さい" />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" shape="round" icon={<ImportOutlined />} size="large" htmlType="submit">
              Enter
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}