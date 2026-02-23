import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
  <>
    <App />
    
    {/* 🔔 Toast Notification Container */}
    <ToastContainer
      position="top-right"
      autoClose={4000}
      newestOnTop
      pauseOnHover
      closeOnClick
    />
    </>
    // </React.StrictMode> 
);

serviceWorkerRegistration.register();
