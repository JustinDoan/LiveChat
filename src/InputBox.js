import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { subscribeToTimer, sendMessage } from './api';
import openSocket from 'socket.io-client';
import styled from 'styled-components';

const socket = openSocket('http://98.204.46.243:8000');



class InputBox extends Component {
  render() {
    return (
      <EntryBox>

      </EntryBox>
    )
  }
}

export default InputBox;
