import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';
import './index.css';
import { ThemeProvider } from './ThemeProvider';
import { DialogProvider } from './components/DialogProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider><DialogProvider><BrowserRouter><App /></BrowserRouter></DialogProvider></ThemeProvider>
    </Provider>
  </React.StrictMode>
);
