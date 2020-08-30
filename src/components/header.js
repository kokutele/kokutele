import React from 'react'
import logo from '../imgs/logo32.png'
import { Col, Row, Menu, Dropdown, Button } from 'antd'

import { MenuOutlined } from '@ant-design/icons';

const menu = _ => {
  return (
    <Menu>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="https://medium.com/kokutele/%E3%82%AA%E3%83%BC%E3%83%97%E3%83%B3%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E5%9B%BD%E7%94%A3%E3%83%86%E3%83%AC%E3%82%AB%E3%83%B3%E3%83%84%E3%83%BC%E3%83%AB-kokutele-%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E9%96%8B%E5%A7%8B%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F-8889afb192d0">
          使い方
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="https://medium.com/kokutele/%E7%B5%8C%E7%B7%AF/home">
          このアプリについて
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/groups/307692313780090">
          フィードバック（FBグループ）
        </a>
      </Menu.Item>
    </Menu>
  )
}



export default function(){
  return (
    <div className="Header">
      <header>
        <div className="container">
          <Row>
            <Col span={12}>
              <img src={logo} alt="logo"/>&nbsp;<span className="title"><a href="/">kokutele</a></span>
            </Col>
            <Col span={12}>
              <div style={{textAlign: "right", paddingRight: 3}}>
                <Dropdown overlay={menu}>
                  <Button onClick={e => e.preventDefault()} icon={<MenuOutlined />} ghost>
                  </Button>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </div>
      </header>
    </div>
  )
}