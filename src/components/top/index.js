import React, { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Button, Space } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'

import Logo from '../common/logo'

const styleTop = {
  paddingTop: "3em",
  textAlign: "center",
  height: "100%"
}


export default function() {
  const handleCreate = useCallback( _ => {
    const roomId = uuidv4()
    const type="small"

    window.location = `./?r=${roomId}&entered=false&type=${type}`
  }, [])
  return (
    <div className="Top">
      <main>
        <div className="tower">
          <div className="container">
            <div className="top" style={styleTop}>
              <Space direction="vertical">
                <Logo desc="国産で、誰でも使える安心テレカン" />
                <Button icon={<ArrowRightOutlined />} onClick={handleCreate} type="primary" shape="round" size="large">
                  create room
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}