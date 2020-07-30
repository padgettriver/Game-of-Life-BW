import React, { Component } from 'react';
import './App.css';
import Nav from './components/nav'
import Game from './components/game';
import Home from './components/home';
import {Route} from "react-router-dom"; 

class App extends Component {
  render() {
    return (
      <div className="App">
      <Nav/>
        <Route exact path='/' component={Home} />
        <Route path='/Game' component={Game} />
      </div>
    );
  }
}

export default App; 