import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { subscribeToTimer, sendMessage } from './api';
import openSocket from 'socket.io-client';
import styled from 'styled-components';

const socket = openSocket('http://98.204.46.243:8000');



class Message extends Component {
  render() {
    return (
      <MessageBox key={this.props.messageID}>
        <MessageText>
          ${this.props.client}: {this.props.message}
        </MessageText>
      </MessageBox>
    )
  }
}

export default Message;


const MessageBox = styled.div`
background: #efefef;
    border: 1px solid #a7a7a7;
    -webkit-border-radius: 4px;
            border-radius: 4px;
    -webkit-box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
            box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
    font-size: 1.2rem;
    line-height: 1.3;
    margin: 0 auto 10px;
    max-width: 400px;
    padding: 5px;
    position: relative;
`;
const MessageText = styled.div`
margin-bottom: 10px;
`;
