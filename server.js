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

// For testing large amounts of messages
// for (let i = 0; i < 2000; i++) {
//   messages.push(createMessage('Server', {
//     message: i,
//     userName: 'Server',
//   }, 'Server'));
//   messageID += 1;
// }

io.on('connection', (client) => {
  //console.log(client.handshake)
  var room = client.handshake['headers'].referer.split("/").pop();

  client.join(room)
  console.log('user joined room #'+room);



  // clients.push(client);
  client.on('sentMessage', (message) => {
    console.log('received', message)
    console.log(messages)
    // this message is a packet, it's an object with two properties, a message, and a name
    messageID += 1;
    // add identifying information

    // .log('Message received from user: ', message);
    // we want to send to all of the clients
    // console.log(createMessage(client, message));


    // Objects that contain both room and messages, each specific to each other.

    // Need to check for an object where room matches, then append to that objects messages.

    // the same goes for the fetching of messages.

    if (message.message !== '') {
      const messageToSend = createMessage(client.id, message, message.userName);

      if(messages[room] === undefined){
        messages.push(room)
      }
      messages[room].push(messageToSend);
      io.to(room).emit('message', messageToSend);
    }
  });
  client.on('historyRequest', () => {
    // The client is asking for the history of the chat
    // messages.forEach((message) => {
    //   client.emit('message', message);
    //
    // // console.log('emitted message');
    // });


    client.emit('historyPacket', messages[room].slice(-40));
    // client.emit('historyPacket', messages);
  });

  client.on('messagesRequest', (earliestMessageID) => {
    // A client has requested more messages, we give them 40 at a time

    if (earliestMessageID === 1) {
      // We return an empty Array
      client.emit('previousMessages', []);
    } else {
      client.emit('previousMessages', messages[room].slice((earliestMessageID - 40), (earliestMessageID)));
    }
  });

  client.on('isTyping', (packet) => {
    // Will eventually have to handle users closing the window before the update that they're not typing comes in.
    // console.log(packet.userName, ' is typing? ', packet.isTyping);

    // Ideally I'm making user obejcts and storing all of this locally at which point i can send on updates and broadcast.
    // This will also fix the issue where users that disconnect before the update is sent will fail.
    // console.log(packet);
    client.broadcast.emit('userTypingUpdate', packet);
  });
});
