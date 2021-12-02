import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/main';
import reportWebVitals from './reportWebVitals';

import UniprotContext from './contexts/uniprot';
import UniprotServiceFactory from './tools/uniprot/Uniprot';

ReactDOM.hydrate(
  <React.StrictMode>
    <UniprotContext.Provider value={new UniprotServiceFactory()}>
      <App />
    </UniprotContext.Provider>
  </React.StrictMode>,
  document.getElementById('plugin-uniprot-structure-root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
