const io = require('socket.io')();

const port = 8000;
io.listen(port);
console.log('Listening on port: ', port);
let messages = []
let clients = []
let messageID = 0;
//this creates a message object we can store.
const createMessage = (client, message) => {
  return {
    client,
    message,
    messageID: messageID + 1
  }
}


io.on('connection', (client) => {
  clients.push(client);
  client.on('subscribeToTimer', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      client.emit('timer', new Date());
    }, interval)
  });
  client.on('sentMessage', (message) => {
    console.log('Message received from user: ', message)
    //we want to send to all of the clients
    //console.log(createMessage(client, message));
    if (message != ''){
      io.sockets.emit('message', createMessage(client.id,message))
    }

  })
})
