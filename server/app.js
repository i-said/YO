var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var waitingSpace = io.of('/waiting');


const PORT = 3001;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.to(socket.id).emit('Say, YO!');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('connecting-request', (msg) => {
    console.log('message: ' + msg);
    // io.emit('MESSAGE', msg);
  });

  socket.on('waiting-talk', (room_id) => {
    console.log('waiting user: ', room_id);
    // waiting user: K5Jh9LoyanfVg6EPAAAC 的なhashが来るのでこいつをkeyにskywayはwaitingできたり...？
    socket.broadcast.emit('request-calling-user', room_id);
  });
});

http.listen(PORT, () => {
  console.log('listening on *:3001');
});
