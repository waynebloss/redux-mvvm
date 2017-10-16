import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import MyComponent from '../lib/components/MyComponent';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <MyComponent className="App-intro">
          <span>This is my component.</span>
        </MyComponent>
      </div>
    );
  }
}

export default App;
