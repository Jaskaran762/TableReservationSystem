import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from "react-redux";
import {persistStore} from "redux-persist";
import {PersistGate} from "redux-persist/integration/react";
import { store } from "./components/store/store";
import 'bootstrap/dist/css/bootstrap.css';
import Kommunicate from "@kommunicate/kommunicate-chatbot-plugin";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

      <Provider store={store}>
          <PersistGate loading={null} persistor={persistStore(store)}>
              <App />
          </PersistGate>
      </Provider>
  </React.StrictMode>
);

Kommunicate.init("1bbe9fd3e6802c8689da01db4317862c8", {
  automaticChatOpenOnNavigation: true,
  popupWidget: true
});


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
