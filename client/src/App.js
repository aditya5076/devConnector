import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import Login from "./components/layout/auth/Login";
import Register from "./components/layout/auth/Register";
import store from "./store";

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route path="/" component={Landing} exact />
            <Route path="/register" component={Register} exact />
            <Route path="/login" component={Login} exact />

            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}
