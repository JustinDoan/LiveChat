import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import styled from 'styled-components';

class Message extends Component {
  render() {
    const { messages } = this.props;
    return (

      <MessageBox key={messages.messageID}>

        <MessageText>
          {messages.message.userName}
:
          {' '}
          {messages.message.message}
        </MessageText>

      </MessageBox>

    );
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
    padding: 5px;
    position: relative;
    font-size: 16px;
    width: 50%;
`;
const MessageText = styled.div`
margin-bottom: 10px;
`;
