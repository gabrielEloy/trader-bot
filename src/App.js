import React, { useState, useReducer, useEffect } from 'react';
import RobotContext from './context/robotContext'
import Routes from './routes';

import PlayReducer, { playInitialValue } from './reducers/playReducer'
import UserReducer, { userInitialValue } from './reducers/userReducer'

import './global.css';

const electron = window.require('electron');
const { ipcRenderer } = electron;



const App = () => {
  const [playReducer, playDispatcher] = useReducer(PlayReducer, playInitialValue);
  const [userReducer, userDispatcher] = useReducer(UserReducer, userInitialValue);
  const [signals, setSignals] = useState([])

  useEffect(() => {
    ipcRenderer.on('MESSAGE_FROM_BACKGROUND_VIA_MAIN', (event, args) => {
      console.log(args);
    });

    ipcRenderer.send('START_BACKGROUND_VIA_MAIN', {
      number: 25,
    });
  }, [])

  const context = {
    play: {
      playReducer,
      playDispatcher
    },
    user: {
      userReducer,
      userDispatcher
    },
    signal: {
      signals,
      setSignals
    }
  }
  return (
    <RobotContext.Provider value={context} r>
      <Routes />
    </RobotContext.Provider>
  )
}

export default App;