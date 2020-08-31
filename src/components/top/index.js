import React, { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Button, Card, Divider, Typography, Col, Row } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'

import Logo from '../common/logo'

const styleTop = {
  paddingTop: "3em",
  textAlign: "center",
  height: "100%"
}

const { Title } = Typography


export default function() {
  const handleCreate = useCallback( (type = 'audio') => {
    const roomId = uuidv4()

    window.location = `./?r=${roomId}&entered=false&type=${type}`
  }, [])
  return (
    <div className="Top">
      <main>
        <div className="tower">
          <div className="container">
            <div className="top" style={styleTop}>
              <div>
                <Logo desc="国産で、誰でも無料で使える安心テレカン" />
                <Divider/>

                <Row gutter={4}>
                  <Col span={12}>
                    <Card>
                      <div>
                        <Button icon={<ArrowRightOutlined />} onClick={e => handleCreate('small')} type="primary" shape="round" size="large">
                          small room
                        </Button>
                      </div>
                      2,3人用のお部屋
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <div>
                        <Button icon={<ArrowRightOutlined />} onClick={e => handleCreate('audio')} type="primary" shape="round" size="large">
                          audio room
                        </Button>
                      </div>
                      7,8人用のお部屋<br/>音声のみ
                    </Card>
                  </Col>
                </Row>
              </div>
              <Divider />
              <div style={{ textAlign: "left"}}>
                <Title level={2}>Links</Title>
                <ul>
                  <li><a href="https://medium.com/kokutele" target="_blank" rel="noopener noreferrer">ブログ</a></li>
                  <li><a href="https://www.facebook.com/groups/307692313780090" target="_blank" rel="noopener noreferrer">Facebookグループ</a></li>
                  <li><a href="https://github.com/kokutele/kokutele" target="_blank" rel="noopener noreferrer">Github - kokutele -</a></li>
                  <li><a href="/labs" target="_blank" rel="noopener noreferrer">kokutele labs</a></li>
                </ul>
              </div>
              <Divider />
              <div>
                &copy; 2020 Kokutele OSS Community.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}