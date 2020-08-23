import React from 'react'

import {Button} from 'antd'

import { VideoCameraOutlined } from '@ant-design/icons'

export default function(props) {
  const { onClick } = props
  return (
    <div className="EnableCam">
      <Button type="primary" icon={<VideoCameraOutlined />} onClick={onClick} size="large" shape="round">
        connect
      </Button>
    </div>
  )
}