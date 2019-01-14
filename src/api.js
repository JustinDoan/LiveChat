import openSocket from 'socket.io-client';

const socket = openSocket('http://10.5.5.99:8000');

function sendMessage(message, userName) {
  const packet = { message, userName };
  socket.emit('sentMessage', packet);
}
function askForChatHistory() {
  socket.emit('historyRequest', '');
}
// socket.on('message', (message) => {
//  console.log(message);
// });


export { sendMessage, askForChatHistory };
