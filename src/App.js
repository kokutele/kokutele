//@flow

import React from 'react';
import queryString from 'query-string'

import Header from './components/header'
import Top from './components/top'
import Room from './components/room'

import './App.css';

type queryTypes = {
  r: string;
  entered: string;
  type: string;
}

function App() {
  const {r, entered, type}:queryTypes = queryString.parse( window.location.search )

  return (
    <div className="App">
      <Header />
      { !r ? <Top /> : <Room roomId={r} entered={entered} type={type} />}
    </div>
  );
}

export default App;
