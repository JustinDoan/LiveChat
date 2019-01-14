import React, { Component } from 'react';
import styled from 'styled-components';
import './App.css';
import openSocket from 'socket.io-client';
import Favicon from 'react-favicon';
import {
  Grid, Row, Col, FormControl, Button,
} from 'react-bootstrap';

import { sendMessage } from './api';
import Message from './message';


const socket = openSocket('http://10.5.5.99:8000');
const favicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAJOgAACToAYJjBRwAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAACE0lEQVQ4T6VTPYvUUBQ9efmazDg7imFxERYLRVYQVlisLGysxc5KrbSwFH+B/Vr5B/wXIlgIFtNZCCsILtj4seskmUkmmSQv8dwkKxt2G/HCmby89865596bMWoG/iNOCHydl5gGGj8LA0sYsEyFs46BDbvGzphPT3U32+gJvPyUwPZsnBuZCEtgVbX7QlEGEOcV/LrC48tue8D4K/B8OsfO5hAps35LaxRVjY4Pk2TLMOCZQgCiYIUXN0bNWSPw+nOChWNh7FnYW2jkvKSJI2vkNyIubZyxgKKocNWocP+K17jDux8F1mn7S1wi1hWWxOoYMtkrKywKjYhluLaBN99zoULNUo3JUCGg6rygdabWRMnKtIClCEoiJzJCRG2KhOQqvkNwwI4VFasmSdG84tMUyPoYal5mrkZEylT+kB1flki4m3FHnBzQZiDgOhQcvRMJSxEnEcs9T27Tg1u+hTDTcNhiyazpRPogojEJKddSgjhwVI15UuDOBbvtgfw8ub6GNGJTSLbYbY6mqUsmLIIWiS6JTNiMJzrM8HR7ItT+h/RsGuC3pZBxR2zK+GyOTsYnwjGb5ucar277LYHRE5B4+P4Q9tiG5jplCavuo7jGMd+9OMDNjUF7sYuewNv9BLv7S0zGFn7NcjzY9PBoa607PT0aAbG7+zHEh1mB7XUXWwOFe5dG8Jz+H+e0OFHCvwXwByi5UCvJ5VfIAAAAAElFTkSuQmCC';

class App extends Component {
  constructor(props) {
    super(props);
    this.sendMessageToAPI = this.sendMessageToAPI.bind(this);
    socket.emit('historyRequest', '');
  }


  state = {
    userInput: '',
    userName: '',
    messages: [],
    faviconAlertAmount: 0,
  };

  componentWillMount() {

  }

  componentDidMount() {
    socket.on('message', message => this.setState(prevState => ({
      messages: [...prevState.messages, message],
    }), this.updateFavicon()));
  }

  componentDidUpdate() {
    this.scrollToBottomOnUpdate();
  }

  updateInput = (event) => {
    this.setState({
      userInput: event.target.value,
    });
  }

  updateUsernameInput = (event) => {
    this.setState({
      userName: event.target.value,
    });
  }

  scrollToBottomOnUpdate = () => {
    if ((this.messageContainer.scrollHeight - this.messageContainer.scrollTop) < 1500) {
      this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateFavicon() {
    if (!document.hasFocus()) {
      let { faviconAlertAmount } = this.state;
      faviconAlertAmount += 1;
      this.setState({
        faviconAlertAmount,
      });
    } else {
      // we do have focus, we can clear the alerts
      this.setState({
        faviconAlertAmount: 0,
      });
    }
  }

  sendMessageToAPI(e) {
    e.preventDefault();
    const { userInput, userName } = this.state;
    if (userInput !== '') {
      sendMessage(userInput, userName);
    }

    // we then set the state blank after we send
    this.setState({
      userInput: '',
    });
  }

  // TODO Add timestamp on messages, and show when someone is typing (may be difficult)

  render() {
    // console.log(this.state.messages)
    const {
      messages, userName, userInput, faviconAlertAmount,
    } = this.state;
    const messageLayout = messages.map(message => <Message key={message.messageID} messages={message} />);
    return (
      <div className="App">
        <Favicon url={favicon} alertCount={faviconAlertAmount} />
        <Grid fluid>
          <Row>
            <Col xs={3}>

                    Name:
              <FormControl type="text" value={userName} onChange={this.updateUsernameInput} />
              <br />

            </Col>
            <Col xs={9}>
              <Messenger ref={(el) => { this.messageContainer = el; }}>
                {messageLayout}
                <div ref={(el) => { this.messagesEnd = el; }} />
              </Messenger>
            </Col>
          </Row>
          <form>
            <Row>
              <Col xs={3} />
              <Col xs={9}>
                <EntryBox>
                  <MessageInput type="text" value={userInput} onChange={this.updateInput} />
                </EntryBox>
              </Col>
            </Row>
            <Row>
              <Col xs={3} />
              <Col xs={9}>

                <Button type="submit" onClick={this.sendMessageToAPI}>Send Message</Button>


              </Col>
            </Row>
          </form>
        </Grid>
      </div>
    );
  }
}

export default App;
const Messenger = styled.div`
 height: 80vh;
  margin: auto;
  box-shadow: 0px 0px 32px 0px rgba(0,0,0,0.75);
  text-align: center
  overflow: auto;
  margin-top: 10px;
 `;
const EntryBox = styled.div``;
// position: absolute;
// bottom: 5px;
//  margin: auto;
//
//  width: 100%;
// `;
const MessageInput = styled.input`
padding: 0;
height: 30px;
position: block;
left: 0;
outline: none;
border: 1px solid #cdcdcd;
border-color: rgba(0, 0, 0, .15);
background-color: white;
font-size: 16px;
margin-top: 25px;
width: 65%;

`;
const NameInput = styled.input`
float: left;
`;
// display: inline-block;
// padding: 0;
// height: 20px;
// position: block;
// left: 0;
// outline: none;
// border: 1px solid #cdcdcd;
// border-color: rgba(0, 0, 0, .15);
// background-color: white;
// font-size: 16px;
// width: 25%;
// `;
