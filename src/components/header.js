import React from 'react'
import logo from '../imgs/logo32.png'

export default function(){
  return (
    <div className="Header">
      <header>
        <div className="container">
          <img src={logo} alt="logo"/>&nbsp;<span className="title"><a href="/">kokutele</a></span>
        </div>
      </header>
    </div>
  )
}