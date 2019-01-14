import openSocket from 'socket.io-client';
const socket = openSocket('http://98.204.46.243:8000');

function sendMessage(message) {
  socket.emit('sentMessage', message);
}
socket.on('message', message => {
    console.log(message);
  })


export { sendMessage }
