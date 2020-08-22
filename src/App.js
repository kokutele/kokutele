import React from 'react';
import queryString from 'query-string'

import Header from './components/header'
import Top from './components/top'
import Room from './components/room'

import './App.css';

function App() {
  const {r, entered, type} = queryString.parse( window.location.search )

  return (
    <div className="App">
      <Header />
      { !r ? <Top /> : <Room roomId={r} entered={entered} type={type} />}
    </div>
  );
}

export default App;
