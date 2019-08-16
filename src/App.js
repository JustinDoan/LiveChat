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
import { Spring, config, Trail } from 'react-spring';

import { sendMessage } from './api';
import Message from './message';


//const socket = openSocket('http://10.5.5.99:8000');
const socket = openSocket('http://localhost:8000');
const favicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAJOgAACToAYJjBRwAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAACE0lEQVQ4T6VTPYvUUBQ9efmazDg7imFxERYLRVYQVlisLGysxc5KrbSwFH+B/Vr5B/wXIlgIFtNZCCsILtj4seskmUkmmSQv8dwkKxt2G/HCmby89865596bMWoG/iNOCHydl5gGGj8LA0sYsEyFs46BDbvGzphPT3U32+gJvPyUwPZsnBuZCEtgVbX7QlEGEOcV/LrC48tue8D4K/B8OsfO5hAps35LaxRVjY4Pk2TLMOCZQgCiYIUXN0bNWSPw+nOChWNh7FnYW2jkvKSJI2vkNyIubZyxgKKocNWocP+K17jDux8F1mn7S1wi1hWWxOoYMtkrKywKjYhluLaBN99zoULNUo3JUCGg6rygdabWRMnKtIClCEoiJzJCRG2KhOQqvkNwwI4VFasmSdG84tMUyPoYal5mrkZEylT+kB1flki4m3FHnBzQZiDgOhQcvRMJSxEnEcs9T27Tg1u+hTDTcNhiyazpRPogojEJKddSgjhwVI15UuDOBbvtgfw8ub6GNGJTSLbYbY6mqUsmLIIWiS6JTNiMJzrM8HR7ItT+h/RsGuC3pZBxR2zK+GyOTsYnwjGb5ucar277LYHRE5B4+P4Q9tiG5jplCavuo7jGMd+9OMDNjUF7sYuewNv9BLv7S0zGFn7NcjzY9PBoa607PT0aAbG7+zHEh1mB7XUXWwOFe5dG8Jz+H+e0OFHCvwXwByi5UCvJ5VfIAAAAAElFTkSuQmCC';
const whiteText = {
  color: 'white',
};

function addUserTyping(prevState, packet) {
  const usersTyping = prevState.usersTyping;
  const updatedUser = {};
  let removed = false;
  if (usersTyping.length === 0 && packet.isTyping) {
    usersTyping.push(packet.userName);
    return usersTyping;
  }

  usersTyping.forEach((user, i) => {
    if (user === packet.userName && packet.isTyping === false) {
      // we want to remove that user from the array
      usersTyping.splice(i, 1);
      removed = true;
    }
  });

  if (!removed) {
    usersTyping.push(packet.userName);
  }

  return usersTyping;
}


class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };


  constructor(props) {
    super(props);
    this.sendMessageToAPI = this.sendMessageToAPI.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.scrollToBottomOnUpdate = this.scrollToBottomOnUpdate.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateTyping = this.updateTyping.bind(this);
    socket.emit('historyRequest', '');
    document.body.style.backgroundColor = '#292627';
  }

  state = {
    userInput: '',
    userName: '',
    messages: [],
    faviconAlertAmount: 0,
    modalIsOpen: false,
    // This will be for counting messages that we haven't viewed yet
    scrollMessageAmount: 0,
    messageComponents: [],
    isTyping: false,
    typingTimer: null,
    previousTyping: false,
    usersTyping: [],
    isTypingComponent: '',
  };

  componentWillMount() {

  }

  componentDidMount() {
    const { cookies } = this.props;

    // Why is this not working like I think it would
    socket.on('message', message => this.setState(prevState => ({
      messages: [...prevState.messages, message],
    }), this.updateFavicon(), this.createMessageComponent(message)));

    // History Packet will be an object that contains all of the messages.
    socket.on('historyPacket', (messages) => {
      messages.forEach(message => this.setState(prevState => ({
        messages: [...prevState.messages, message],
      }), this.updateFavicon()));
      this.createMessageComponents(messages);
    });

    socket.on('previousMessages', (messages) => {
      messages.reverse().forEach(message => this.setState(prevState => ({
        messages: [message, ...prevState.messages],
      }), this.updateFavicon()));
      this.createPreviousMessageComponents(messages.reverse());
    });

    socket.on('userTypingUpdate', (packet) => {
      // Once we get a packet telling us of a user's change, we update it into our object.
      this.setState(prevState => ({
        usersTyping: addUserTyping(prevState, packet),
      }));
      this.createIsTypingComponent();
    });


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

    // We send our typing update when it changes from the previous state to a new one.
    const { isTyping, previousTyping } = this.state;
    // console.log('isTyping is ', isTyping, 'previousTyping is', previousTyping);
    if (isTyping !== previousTyping) {
      // console.log('Sending Update and Setting previousTyping');
      this.sendTypingUpdate();
    }
  }


  updateInput = (event) => {
    let { typingTimer } = this.state;

    this.setState({
      userInput: event.target.value,
      isTyping: true,
    });
    // console.log(this.state.isTyping);

    if (typingTimer !== null) {
      // console.log('Clearing Timer');
      clearTimeout(typingTimer);
    }
    // console.log('Setting Timer');
    // socket.emit('isTyping', true);
    typingTimer = setTimeout(
      this.updateTyping,
      1000);
    this.setState({
      typingTimer,
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


  sendTypingUpdate() {
    const { isTyping, userName } = this.state;
    socket.emit('isTyping', { isTyping, userName });
    // Since we've changed from our previous state, we update it to the new one, until the next check.
    this.setState({
      previousTyping: isTyping,
    });
  }

  updateTyping() {
    this.setState({
      isTyping: false,
    });
  }

  createMessageComponent(message) {
    const { userName } = this.state;
    const messageLayout = (
      <Spring
        from={{ transform: 'translate3d(300px, 0px, 0px)', opacity: 0 }}
        to={{ transform: 'translate3d(0px, 0px, 0px)', opacity: 1 }}
        config={{ friction: 15 }}
        key={message.messageID}
      >
        {props => <div style={props}><Message key={message.messageID} messages={message} owner={userName === message.name} /></div>}
      </Spring>
    );
    this.setState(prevState => ({
      messageComponents: [...prevState.messageComponents, messageLayout],
    }));
  }

  createMessageComponents(messages) {
    const { userName } = this.state;
    const componentsToAdd = [];
    messages.forEach((message) => {
      const messageLayout = <Message key={message.messageID} messages={message} owner={userName === message.name} />;
      componentsToAdd.push(messageLayout);
    });

    this.setState(prevState => ({
      messageComponents: [...prevState.messageComponents, ...componentsToAdd],
    }));
    this.scrollBar.scrollToBottom();
  }

  createPreviousMessageComponents(messages) {
    const { userName } = this.state;
    const componentsToAdd = [];
    messages.forEach((message) => {
      const messageLayout = <Message key={message.messageID} messages={message} owner={userName === message.name} />;
      componentsToAdd.push(messageLayout);
    });

    this.setState(prevState => ({
      messageComponents: [...componentsToAdd, ...prevState.messageComponents],
    }));
    // this.scrollBar.scrollToBottom();
  }

  createIsTypingComponent() {
    const { usersTyping } = this.state;
    let usersTypingString = '';
    if (usersTyping.length === 1) {
      usersTypingString = `${usersTyping[0]} is currently typing...`;
    } else if (usersTyping.length === 2) {
      usersTypingString = `${usersTyping[0]} and ${usersTyping.length - 1} other is currently typing...`;
    } else if (usersTyping.length > 2) {
      usersTypingString = `${usersTyping[0]} and ${usersTyping.length - 1} others are currently typing...`;
    }
    this.setState({
      isTypingComponent: usersTypingString,
    });
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
    });
  }

  handleScroll() {
    const { messages } = this.state;
    if (this.scrollBar.getScrollTop() === 0) {
      socket.emit('messagesRequest', messages[0].messageID);
    }
  }

  // TODO Add timestamp on messages, and show when someone is typing (may be difficult)


  render() {
    const {
      userName, userInput, faviconAlertAmount, modalIsOpen, messageComponents, isTypingComponent,
    } = this.state;
    return (
      <CookiesProvider>
        <div className="App">

          <Favicon url={favicon} alertCount={faviconAlertAmount} />
          <Grid fluid>
            <Row>
              <Col xs={0} md={1} lg={2} />
              <Col xs={12} md={10} lg={8}>
                <Spring from={{ opacity: 0, marginTop: -1000 }} to={{ opacity: 1, marginTop: 0 }} config={config.slow}>
                  {styles => (
                    <Messenger style={styles} ref={(el) => { this.messageContainer = el; }}>

                      <Scrollbars
                        renderTrackHorizontal={props => <div {...props} className="track-horizontal" style={{ display: 'none' }} />}
                        renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" style={{ display: 'none' }} />}
                        onScroll={this.handleScroll}
                        autoHide
                        ref={(el) => { this.scrollBar = el; }}
                      >
                        <Grid fluid>
                          {messageComponents}
                        </Grid>
                      </Scrollbars>

                    </Messenger>
                  )}
                </Spring>


              </Col>
              <Col xs={0} md={1} lg={2} />
            </Row>

            <Row>
              <Col xs={0} md={1} lg={2} />
              <Col xs={12} md={10} lg={8}>
                <Spring from={{ opacity: 0, marginTop: -1000 }} to={{ opacity: 1, marginTop: 0 }} config={config.slow}>
                  {styles => (
                    <div style={styles}>
                      {' '}
                      <span style={whiteText}>
                        {isTypingComponent}
                      </span>

                      <br />
                      <form>
                        <EntryBox>
                          <MessageInput type="text" value={userInput} onChange={this.updateInput} />
                          <SubmitButton type="submit" onClick={this.sendMessageToAPI}><Arrow>→</Arrow></SubmitButton>
                        </EntryBox>

                      </form>
                    </div>
                  )}
                </Spring>

              </Col>
              <Col xs={0} md={1} lg={2} />
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
