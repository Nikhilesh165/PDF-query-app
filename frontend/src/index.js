import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
console.log("React App is Mounting...");
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
