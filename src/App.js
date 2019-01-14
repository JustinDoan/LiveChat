import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { sendMessage } from './api';
import openSocket from 'socket.io-client';
import Message from './message'
import styled from 'styled-components';


const socket = openSocket('http://98.204.46.243:8000');



class App extends Component {

  constructor(props) {
    super(props);

    sendMessage((message, err) => this.setState(prevState => ({
      messages: [...prevState.messages, message]
    })));

    this.handleChange = this.handleChange.bind(this);
    this.sendMessageToAPI = this.sendMessageToAPI.bind(this);
  };

  handleChange(event) {
    this.setState({userInput: event.target.value});
  }
  handleUserChange(event) {
    this.setState({userName: event.target.value});
  }

  sendMessageToAPI(e) {
    e.preventDefault();
    if(this.state.userInput != ""){
      sendMessage(this.state.userInput, this.state.userName);
    }

    //we then set the state blank after we send
    this.state.userInput = '';
  }


  state = {
    timestamp: 'No Timestamp Yet.',
    userInput: '',
    userName: '',
    messages: []
  };

componentDidMount() {
  socket.on('message', message => this.setState({messages: [...this.state.messages, message]}))
}

  render() {
    //console.log(this.state.messages)
    const messageLayout = this.state.messages.map (({client, message, messageID}) => {
      return <Message message={message} client={client} messageID={messageID}/>
    })



    return (
      <div className="App">
      <Messenger>
        {messageLayout}
      </Messenger>
      <EntryBox>
      <form>
        Name:
        <NameInput type="text" value={this.state.userName} onChange={this.handleUserChange} />
        <br/>
        <MessageInput type="text" value={this.state.userInput} onChange={this.handleChange} />
        <br/>
        <button onClick={this.sendMessageToAPI}>Send Message</button>
      </form>
      </EntryBox>


      </div>
    );
  }
}

export default App;
const Messenger = styled.div`
  position: relative
  height: 90vh;
 width: 70%
 margin: auto;
 box-shadow: 0px 0px 32px 0px rgba(0,0,0,0.75);
 text-align: center;
 overflow: auto;
`;
const EntryBox = styled.div`
position: absolute;
 bottom: 5px;
 margin: auto;

 width: 100%;
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
width: 35%;
`;
const NameInput = styled.input`
padding: 0;
height: 20px;
position: block;
left: 0;
outline: none;
border: 1px solid #cdcdcd;
border-color: rgba(0, 0, 0, .15);
background-color: white;
font-size: 16px;
width: 25%;
`;
