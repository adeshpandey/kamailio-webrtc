import 'antd/dist/antd.min.css';
import './App.css';

import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';
import AppContext from './contexts/AppContext';

function App() {

  const [appContext, setAppContext] = useState({ session: null, ua: null, incomingSession: null })

  function dispatchAppContextEvents(actionType, payload) {
    console.log("Action Type", actionType, payload)

    switch (actionType) {
      case 'SET_UA':
        setAppContext({ ...appContext, ua: payload })
        return;
      case 'SET_SESSION':
        setAppContext({ ...appContext, session: payload })
        return;
        case 'SET_INCOMING_SESSION':
          setAppContext({ ...appContext, incoming_session: payload })
          return;
        case 'SET_SESSIONS':
          setAppContext({ ...appContext, ...payload })
          return;
    }

  }

  return (
    <AppContext.Provider value={{ appContext, dispatchAppContextEvents }}>
      <Router>
        <Routes />
      </Router>
    </AppContext.Provider>);
}

export default App;
