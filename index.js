const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


let games = [];



io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });


  socket.on('create_game', (msg) => {
    let race = new Race(msg.raceName, msg.numberOfCorners);
    race.joinRace(msg.playerName, socket);
  });



  socket.on('join_game', (msg) => {
    let race = games.find(g => g.name === msg.raceName);
    if(race) {
      race.joinRace(msg.playerName, socket);
    }
  });








});

http.listen(port, function(){
  console.log('listening on *:' + port);
});