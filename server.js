/**
 * Module dependencies.
 */

var express = require('express')
  , sio = require('socket.io');

/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */
 
app.use(express.bodyParser());
app.use(app.router);

app.configure(function () {
  app.use(express.static(__dirname + '/public'));

});


/**
 * App listen.
 */

app.listen(process.env.port||3000, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});


/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(app)
  , websockets = {},
  	counter = 0;
  	
var GAMEWIDTH = 1000;
var GAMEHEIGHT = 500;
var GAMEDEPTH = 2000;

var paddleWidth = 200;
var paddleHeight = 200;

var ballRad = 30;

var ballXVel = 0;
var ballYVel = 0;
var ballZVel = 0;

var change1X = 0;
var change1Y = 0;
var change2X = 0;
var change2Y = 0;
var changeTimeout;


var paddle1 = null, paddle2 = null;

ball = {};
ball.position = {
	x:0,
	y:GAMEHEIGHT/2,
	z:0,
};
  	
io.sockets.on('connection', function (socket) {
  socket.on('User Move', function (msg) {
  	if(socket == paddle1 || socket == paddle2){
    	socket.broadcast.emit('User Move', {id: socket.userid, x: msg.x, y: msg.y});
    
    	var moverx  = msg.x;
		var movery = msg.y;
		
		if(socket == paddle1){
			change1X = moverx - socket.position.x;
    		change1Y = movery - socket.position.y;
		}
		
		if(socket == paddle2){
			change2X = moverx - socket.position.x;
    		change2Y = movery - socket.position.y;
		}
	
		socket.position = {
			x:moverx,
			y:movery
		};
		
	}
  });
	
	var pn;

	if(paddle1 == null){
		paddle1 = socket;
		pn = 1;
		resetBall();	
	}else if(paddle2 == null){
		paddle2 = socket;
		pn = 2;
		resetBall();
	}
	if(socket == paddle1 || socket == paddle2){
		socket.position = {x:0, y:0};
// 	if(socket == paddle1)
// 		socket.position.z = GAMEDEPTH/2;
// 	if(socket == paddle2)
// 		socket.position.z = -GAMEDEPTH/2;
		

	socket.emit('ID', {id: counter, player: pn});
    socket.userid = counter;
    
    for(var sock in websockets){
		var bar = websockets[sock];
		socket.emit('User Move', {id: bar.userid, x: bar.x, y: bar.y});
	}
	
	
    socket.broadcast.emit('New Ponger', counter);
    
    websockets[counter] = socket;
    counter++;
    

	socket.on('disconnect', function () {
		if (socket.userid === undefined) return;
		
		if(socket == paddle1)
			paddle1 = null;
		if(socket == paddle2)
			paddle2 = null;
		if(paddle1 == null || paddle2 == null){
			score1 = 0;
			score2 = 0;
			lastpoint = 0;
			
			if(paddle1)
				paddle1.emit('Score', score1 + '-' + score2);
			if(paddle2)
				paddle2.emit('Score', score1 + '-' + score2);
				
		}
			
		
		delete websockets[socket.userid];
		socket.broadcast.emit('Closed', socket.userid);
	});
  
  }
});
var update = true;
var oldtime;
setInterval(function(){
		var delta = 0;
		if(oldtime){
			var temp = Date.now();
			delta = (temp - oldtime)/1000;
			oldtime = temp;
		}else{
			oldtime = Date.now();
		}
		
	
		if(paddle1 != null && paddle2 != null){
			
			ballPhysics(delta);
		
			paddle1.emit('Ball', ball);
		
			var otherball = {};
			otherball.position = {
				x:-ball.position.x,
				y:ball.position.y,
				z:-ball.position.z,
			};
		
			paddle2.emit('Ball', otherball);
		}
	
}, 30);

var score1 = 0;
var score2 = 0;
var lastpoint = 0;

function ballPhysics(delta)
{

		if (ball.position.x - ballRad <= -GAMEWIDTH/2)
		{	
			ballXVel = -ballXVel;
			spinx = -spinx;
			
		}else if (ball.position.x + ballRad >= GAMEWIDTH/2)
		{	
			ballXVel = -ballXVel;
			spinx = -spinx;
		}
		
		if (ball.position.y - ballRad <= 0)
		{	
			ballYVel = -ballYVel;
			spiny = -spiny;
			
		}else if (ball.position.y + ballRad >= GAMEHEIGHT)
		{	
			ballYVel = -ballYVel;
			spiny = -spiny;
		}
		
		if (ballZVel < 0 && ball.position.z - ballRad <= -GAMEDEPTH/2 && ball.position.z + ballRad >= -GAMEDEPTH/2 && ballHitsPaddle2())
		{	
			ballZVel = -ballZVel;
			ballZVel += 50;
			
			// if(change2Y){
// 				ballYVel += change1Y*10;
// 			}
// 				
// 			if(change2X){
// 				ballXVel += change1X*10;
// 			}

			ballYVel /=3;
			ballXVel /=3;

			applyBallSpin(1);
			
		}else if (ballZVel > 0 && ball.position.z + ballRad >= GAMEDEPTH/2 && ball.position.z - ballRad <= GAMEDEPTH/2 && ballHitsPaddle1())
		{	
 			ballZVel = -ballZVel;
 			ballZVel -= 50;
 			
//  			if(change1Y){
// 				ballYVel += change1Y*10;
// 			}
// 				
// 			if(change1X){
// 				ballXVel += change1X*10;
// 			}

			ballYVel /=3;
			ballXVel /=3;

			applyBallSpin(-1);
 			
		}else if (ball.position.z + ballRad >= GAMEDEPTH)
		{	
			lastpoint = 2;
			resetBall();
			score2++;
			
			if(paddle1)
				paddle1.emit('Score', score1 + '-' + score2);
			if(paddle2)
				paddle2.emit('Score', score1 + '-' + score2);
		}else if (ball.position.z - ballRad <= -GAMEDEPTH)
		{	
			lastpoint = 1;
			resetBall();
			score1++;
			
			if(paddle1)
				paddle1.emit('Score', score1 + '-' + score2);
			if(paddle2)
				paddle2.emit('Score', score1 + '-' + score2);
		}
		
		var movx = ball.position.x + (ballXVel * delta);
		
		movx += spinx;
		
		movx = movx > (GAMEWIDTH/2 - ballRad) ? (GAMEWIDTH/2 - ballRad)  : movx;
    	movx = movx < -(GAMEWIDTH/2 - ballRad)  ? -(GAMEWIDTH/2 - ballRad)  : movx;
    	
    	movx -= ball.position.x;
    	
    	var movy = ball.position.y + (ballYVel * delta);
    	
    	movy += spiny;
		
		movy = movy > (GAMEHEIGHT -  ballRad)? (GAMEHEIGHT -  ballRad) : movy;
    	movy = movy < ballRad ? ballRad : movy;
    	
    	movy -= ball.position.y;
    	
    	var movz = ball.position.z + (ballZVel * delta);
    	
    	movz -= ball.position.z;
		
		
		ball.position.x += movx;
		ball.position.y += movy;
		ball.position.z += movz;
		
		
		
		
	
}


var spinx = 0;
var spiny = 0;


function applyBallSpin(mult){
	
	if(mult == 1){//Paddle 2 
		spinx = change2X;
		spiny = change2Y;
	}else{//Paddle 1
		spinx = change1X;
		spiny = change1Y;
	}
	
	spinx *= mult;
	
}

function ballHitsPaddle1(){
    
    var paddleleft = paddle1.position.x - paddleWidth/2;
    var paddleright = paddle1.position.x + paddleWidth/2;
    var paddletop = paddle1.position.y + paddleHeight/2;
    var paddlebottom = paddle1.position.y - paddleHeight/2;
    
    var ballleft = ball.position.x - ballRad;
    var ballright = ball.position.x + ballRad;
    var balltop = ball.position.y + ballRad;
    var ballbottom = ball.position.y - ballRad;
    
    if(paddleleft > ballright || paddleright < ballleft || paddletop < ballbottom || paddlebottom > balltop)
    	return false;
    return true;
    
}

function ballHitsPaddle2(){
    
    var paddleleft = -(paddle2.position.x + paddleWidth/2);
    var paddleright = -(paddle2.position.x - paddleWidth/2);
    var paddletop = paddle2.position.y + paddleHeight/2;
    var paddlebottom = paddle2.position.y - paddleHeight/2;
    
    var ballleft = ball.position.x - ballRad;
    var ballright = ball.position.x + ballRad;
    var balltop = ball.position.y + ballRad;
    var ballbottom = ball.position.y - ballRad;
    
    if(paddleleft > ballright || paddleright < ballleft || paddletop < ballbottom || paddlebottom > balltop)
    	return false;
    return true;
    
}


function resetBall(){
	ball.position.x = 0;
	ball.position.y = GAMEHEIGHT/2;
	ball.position.z = 0;
	
	ballXVel = Math.floor(Math.random() * 200);
	ballYVel = Math.floor(Math.random() * 200);
	ballZVel = Math.floor(Math.random() * 500) + 750;
	
	ballXVel *= Math.random() < 0.5 ? -1 : 1;
	ballYVel *= Math.random() < 0.5 ? -1 : 1;
	
	if(lastpoint){
		if(lastpoint == 1){
			ballZVel = -ballZVel;
		}
	}else{
		ballZVel *= Math.random() < 0.5 ? -1 : 1;
	}
	
	spinx = 0;
	spiny = 0;

}


