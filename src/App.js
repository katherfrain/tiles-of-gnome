import './App.css';
import React from 'react'
import Dungeon from './components/Dungeon';

function App() {
  return (
    <div className="centred">
      <div id="dungeon-container">
        <Dungeon />
      </div>
      {/* 
      <div id="ui-container">
        <GameUI />
      </div>
       */}
    </div>
  );
}

export default App;
