import React from 'react'
import { Typography } from 'antd'

import logo from '../../imgs/logo64.png'

const { Paragraph } = Typography

export default function(props) {
  const { desc } = props
  return (
    <div className="Logo">
      <h1 style={{ fontSize: "4em", fontWeight: "bold" }}>
        <img src={logo} alt="logo" />&nbsp;kokutele
      </h1>
      <Paragraph>
        {desc}
      </Paragraph>
    </div>
  )
}