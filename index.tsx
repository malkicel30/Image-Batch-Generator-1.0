// FIX: Add a triple-slash directive to include the DOM library types.
/// <reference lib="dom" />

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Prefix with `window` to resolve missing DOM typings for `document`.
const rootElement = window.document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);