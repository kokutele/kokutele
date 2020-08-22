import React from 'react'

import {Button} from 'antd'

import { VideoCameraAddOutlined } from '@ant-design/icons'

export default function(props) {
  const { onClick } = props
  return (
    <div className="EnableCam">
      <Button type="primary" icon={<VideoCameraAddOutlined />} onClick={onClick} size="large" shape="round">
        connect videoCam
      </Button>
    </div>
  )
}