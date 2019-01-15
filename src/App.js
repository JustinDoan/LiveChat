import React, { Component } from 'react';
import styled from 'styled-components';
import './App.css';
import openSocket from 'socket.io-client';
import Favicon from 'react-favicon';
import { instanceOf } from 'prop-types';
import {
  Grid, Row, Col, FormControl, Button,
} from 'react-bootstrap';
import { CookiesProvider, withCookies, Cookies } from 'react-cookie';
import Modal from 'react-modal';
import { Scrollbars } from 'react-custom-scrollbars';

import { sendMessage } from './api';
import Message from './message';


const socket = openSocket('http://10.5.5.99:8000');
// const socket = openSocket('http://localhost:8000');
const favicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAJOgAACToAYJjBRwAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAACE0lEQVQ4T6VTPYvUUBQ9efmazDg7imFxERYLRVYQVlisLGysxc5KrbSwFH+B/Vr5B/wXIlgIFtNZCCsILtj4seskmUkmmSQv8dwkKxt2G/HCmby89865596bMWoG/iNOCHydl5gGGj8LA0sYsEyFs46BDbvGzphPT3U32+gJvPyUwPZsnBuZCEtgVbX7QlEGEOcV/LrC48tue8D4K/B8OsfO5hAps35LaxRVjY4Pk2TLMOCZQgCiYIUXN0bNWSPw+nOChWNh7FnYW2jkvKSJI2vkNyIubZyxgKKocNWocP+K17jDux8F1mn7S1wi1hWWxOoYMtkrKywKjYhluLaBN99zoULNUo3JUCGg6rygdabWRMnKtIClCEoiJzJCRG2KhOQqvkNwwI4VFasmSdG84tMUyPoYal5mrkZEylT+kB1flki4m3FHnBzQZiDgOhQcvRMJSxEnEcs9T27Tg1u+hTDTcNhiyazpRPogojEJKddSgjhwVI15UuDOBbvtgfw8ub6GNGJTSLbYbY6mqUsmLIIWiS6JTNiMJzrM8HR7ItT+h/RsGuC3pZBxR2zK+GyOTsYnwjGb5ucar277LYHRE5B4+P4Q9tiG5jplCavuo7jGMd+9OMDNjUF7sYuewNv9BLv7S0zGFn7NcjzY9PBoa607PT0aAbG7+zHEh1mB7XUXWwOFe5dG8Jz+H+e0OFHCvwXwByi5UCvJ5VfIAAAAAElFTkSuQmCC';

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };


  constructor(props) {
    super(props);
    this.sendMessageToAPI = this.sendMessageToAPI.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.scrollToBottomOnUpdate = this.scrollToBottomOnUpdate.bind(this);
    socket.emit('historyRequest', '');
  }

  state = {
    userInput: '',
    userName: '',
    messages: [],
    faviconAlertAmount: 0,
    modalIsOpen: false,
    scrollMessageAmount: 0,
  };

  componentWillMount() {

  }

  componentDidMount() {
    const { cookies } = this.props;

    // need to make this async if possible
    socket.on('message', message => this.setState(prevState => ({
      messages: [...prevState.messages, message],
    }), this.updateFavicon()));
    const userNameFromCookie = cookies.get('username');
    this.setState({
      userName: userNameFromCookie,
    });
    if (typeof userNameFromCookie === 'undefined') {
      this.setState({
        modalIsOpen: true,
      });
    }
  }

  componentDidUpdate() {
    const { messages, scrollMessageAmount } = this.state;
    if (messages.length > scrollMessageAmount) {
      this.setState({
        scrollMessageAmount: (scrollMessageAmount + 1),
      });
      this.scrollToBottomOnUpdate();
    }
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
    // this.this.scrollBar.scrollIntoView({ behavior: 'smooth' });
    if (this.scrollBar.getScrollHeight() - this.scrollBar.getScrollTop() < 1500) {
      // We have new messages that haven't been viewed and we're close to the bottom
      this.scrollBar.scrollToBottom();
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


  closeModal() {
    // Once the user closes the window, we take whatever our username is,
    // and store it in our cookie.
    const { userName } = this.state;
    const { cookies } = this.props;
    cookies.set('username', userName, { path: '/' });
    this.setState({
      modalIsOpen: false,
      needUserName: false,
    });
  }

  // TODO Add timestamp on messages, and show when someone is typing (may be difficult)


  render() {
    const {
      messages, userName, userInput, faviconAlertAmount, modalIsOpen,
    } = this.state;
    const messageLayout = messages.map(message => <Message key={message.messageID} messages={message} owner={userName === message.name} scroll={this.scrollToBottomOnUpdate} />);
    return (
      <CookiesProvider>
        <div className="App">
          <Favicon url={favicon} alertCount={faviconAlertAmount} />
          <Grid fluid>
            <Row>
              <Col xs={2} />
              <Col xs={8}>
                <Messenger ref={(el) => { this.messageContainer = el; }}>

                  <Scrollbars autoHide ref={(el) => { this.scrollBar = el; }}>
                    <Grid fluid>
                      {messageLayout}
                    </Grid>
                  </Scrollbars>

                </Messenger>


              </Col>
              <Col xs={2} />
            </Row>

            <Row>
              <Col xs={2} />
              <Col xs={8}>
                <form>
                  <EntryBox>
                    <MessageInput type="text" value={userInput} onChange={this.updateInput} />
                    <SubmitButton type="submit" onClick={this.sendMessageToAPI}><Arrow>→</Arrow></SubmitButton>
                  </EntryBox>

                </form>
              </Col>
              <Col xs={2} />
            </Row>
            <Row>
              <Col xs={2} />
              <Col xs={8} />
              <Col xs={2} />
            </Row>

          </Grid>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this.closeModal}
            contentLabel="Enter Username"

          >
            <ModalText>
              <div>
                {' '}
Please Enter a Username
                <br />
                <input typed="text" value={userName} onChange={this.updateUsernameInput} />
                <br />
                <Button type="submit" onClick={this.closeModal}>Submit Name</Button>
              </div>

            </ModalText>

          </Modal>
        </div>
      </CookiesProvider>

    );
  }
}

export default withCookies(App);

const ModalText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Arrow = styled.div`
margin-top: -13px;
`;

const SubmitButton = styled.button`
font-weight: bold;
background-color: rgb(70, 154, 232);
font-size: 32px;
width: 15%;
color: white;
border: none;
text-align: center;

`;
const Messenger = styled.div`
display: block;
justify-content: center;
height: 80vh;
  margin: auto;
  box-shadow: 0px 0px 32px 0px rgba(0,0,0,0.75);
  text-align: center
  overflow: hidden;
  margin-top: 10px;
  border-radius: 10px;
  padding 3px;
  background-color: #e9e5e5;
 `;
const EntryBox = styled.div`
height: 50px
border-radius: 10px;
padding 10px;
background-color: #e9e5e5;
box-shadow: 0px 0px 32px 0px rgba(0,0,0,0.75);
margin-top: 40px;
display: flex;
   flex-direction: row;
`;
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
float: left;

width: 85%;

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
