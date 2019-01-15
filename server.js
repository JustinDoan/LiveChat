const io = require('socket.io')();

const port = 8000;
io.listen(port);
console.log('Listening on port: ', port);
const messages = [];
let messageID = 0;
// this creates a message object we can store.

function getTimestamp() {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours || 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  const strTime = `${hours}:${minutes} ${ampm}`;
  return strTime;
}

const createMessage = (client, message, name) => ({
  client,
  message,
  messageID,
  name,
  timestamp: getTimestamp(),
});


io.on('connection', (client) => {
  // clients.push(client);
  client.on('sentMessage', (message) => {
    // this message is a packet, it's an object with two properties, a message, and a name
    messageID += 1;
    // add identifying information

    // .log('Message received from user: ', message);
    // we want to send to all of the clients
    // console.log(createMessage(client, message));
    if (message.message !== '') {
      const messageToSend = createMessage(client.id, message, message.userName);
      messages.push(messageToSend);
      io.sockets.emit('message', messageToSend);
    }
  });
  client.on('historyRequest', () => {
    // The client is asking for the history of the chat
    messages.forEach((message) => {
      client.emit('message', message);

    // console.log('emitted message');
    });
  });
});
