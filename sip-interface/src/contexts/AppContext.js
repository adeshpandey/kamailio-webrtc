import React from 'react';

const AppContext = React.createContext({
    appContext: {
        session: null,
        ua: null
    },
    dispatchAppContextEvents: (type, payload) => {
        console.log(type, payload)
    } 
})
export default AppContext;