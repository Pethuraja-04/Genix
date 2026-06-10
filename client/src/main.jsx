import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";
import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <Provider store={store}>
    <ToastProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ToastProvider>
  </Provider>
);