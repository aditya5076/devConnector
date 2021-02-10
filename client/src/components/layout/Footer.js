import React, { Component } from "react";

export default class Footer extends Component {
  render() {
    return (
      <footer className="bg-transparent text-black mt-5 p-2 text-center fixed-bottom">
        Copyright &copy; {new Date().getFullYear()} Dev Connector
      </footer>
    );
  }
}
