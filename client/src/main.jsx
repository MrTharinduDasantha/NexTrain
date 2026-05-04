import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import App from "./App.jsx";
import { store } from "./app/store.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          theme="dark"
          newestOnTop
          pauseOnFocusLoss={false}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
