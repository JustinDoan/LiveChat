import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import styled from 'styled-components';
import {
  Row, Col,
} from 'react-bootstrap';
import toMaterialStyle from 'material-color-hash';


class Message extends Component {
  render() {
    const { messages, owner } = this.props;
    const matColor = toMaterialStyle(messages.message.userName);
    return (
      <Row>
        <MessageBox fluid key={messages.messageID} user={messages.message.userName} owner={owner} style={matColor}>
          <div className="container-fluid">
            <Row>
              <Col>
                <Name owner={owner}>
                  {messages.message.userName}
                </Name>
              </Col>
              <Col>
                <Timestamp fluid owner={owner}>
                  {messages.timestamp}
                </Timestamp>
              </Col>
            </Row>
          </div>
          <div className="container-fluid">
            <Row>
              <Col>
                <MessageText fluid owner={owner}>
                  {messages.message.message}
                </MessageText>
              </Col>
            </Row>
          </div>

        </MessageBox>
      </Row>


    );
  }
}


export default Message;


const Timestamp = styled.div`
font-size:9px;
float: right;
bottom: 0;
`;
const Name = styled.div`
font-size: 12px;
float: left;
`;
const MessageBox = styled.div`
    border: 1px solid #fffff;
    -webkit-border-radius: 4px;
            border-radius: 4px;
    -webkit-box-shadow: 4px 4px 5px 0 rgba(0, 0, 0, 0.2);
            box-shadow: 4px 4px 5px 0 rgba(0, 0, 0, 0.2);
    font-size: 1.2rem;
    line-height: 1.3;
    margin: 3px auto 10px;
    padding: 3px;
    position: relative;
    font-size: 16px;
    min-width: 35%;
    max-width: 75%;
    float: ${props => (props.owner ? 'right' : 'left')};
    overflow: hidden;
    overflow-wrap: break-word;


`;
const MessageText = styled.div`
margin-bottom: 10px;
float: left;
overflow-wrap: break-word;
display: inline-block;

`;
