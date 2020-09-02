//@flow
import React, { useState } from 'react'
import {
  Row, Col, Card
} from 'antd'

// images - https://vbackground.com/category/room/
import bg0 from '../../imgs/bgImages/Blue_wall_red_sofa.jpg'
import bg1 from '../../imgs/bgImages/counter_kitchen.jpg'
import bg2 from '../../imgs/bgImages/Old_books_bookcase.jpg'
import bg3 from '../../imgs/bgImages/White_wall_blue_door.jpg'

type PropTypes = {
  onSelect: Function;
};

const images = [
  { name:"blue wall red sofa",   base64: bg0 },
  { name:"counter kitchen",      base64: bg1 },
  { name:"old books bookcase",   base64: bg2 },
  { name:"white wall blue door", base64: bg3 },
]

export default function(props:PropTypes) {
  const {
    onSelect
  } = props

  const [selected:number, changeSelected:Function] = useState(-1)

  return (
    <div className="BackgroundSelector">
      <h3>背景を選択して下さい</h3>
      <Row gutter={8}>
        {images.map( (img, idx) => {
          const border = idx === selected ? "3px solid yellow" : ""
          
          return (
          <Col key={idx} span={12}>
            <Card>
              <img src={img.base64} 
                alt={img.name}
                style={{width: "100%", cursor: "pointer", border }} 
                onClick={_ => {
                  changeSelected(idx)
                  onSelect(img.base64)
                }}
              />
            </Card>
          </Col>
        )})}
      </Row>
    </div>
  )
}
