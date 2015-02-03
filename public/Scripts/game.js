
/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v59dev)
*/

// MAIN

// standard global variables
var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var cube;

var GAMEWIDTH = 1000;
var GAMEHEIGHT = 500;
var GAMEDEPTH = 2000;

var paddleWidth = 200;
var paddleHeight = 200;

var ballRad = 30;

var ballXVel = 0;
var ballYVel = 0;
var ballZVel = 0;

var changeX = 0;
var changey = 0;
var changeTimeout;

var ball;
var tracer;
var paddle2;

function setup(){

	init();
	animate();
}

// FUNCTIONS 		
function init() 
{

	
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,700);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
 	
	score1 = 0;
	score2 = 0;
	
	// CONTROLS
	// MUST REMOVE THIS LINE!!!
	// controls = ...

	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,GAMEHEIGHT/2,0);
	scene.add(light);
	// FLOOR
	var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x1B32C0, side: THREE.BackSide, transparent: true, opacity: 0.5 } );
	var floorGeometry = new THREE.PlaneGeometry(GAMEWIDTH, GAMEDEPTH);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.material.side = THREE.DoubleSide;
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	
	var topMaterial = new THREE.MeshBasicMaterial( { color: 0x1B32C0, side: THREE.BackSide, transparent: true, opacity: 0.5 } );
	var topGeometry = new THREE.PlaneGeometry(GAMEWIDTH, GAMEDEPTH);
	var top = new THREE.Mesh(topGeometry, topMaterial);
	top.material.side = THREE.DoubleSide;
	top.position.y = GAMEHEIGHT;
	top.rotation.x = Math.PI / 2;
	scene.add(top);
	
	var leftyMaterial = new THREE.MeshBasicMaterial( { color: 0x1B32C0, side: THREE.BackSide, transparent: true, opacity: 0.5 } );
	var leftyGeometry = new THREE.PlaneGeometry(GAMEDEPTH, GAMEHEIGHT);
	var lefty = new THREE.Mesh(leftyGeometry, leftyMaterial);
	lefty.material.side = THREE.DoubleSide;
 	lefty.position.x = -GAMEWIDTH/2;
 	lefty.position.y = GAMEHEIGHT/2;
	lefty.rotation.y = Math.PI / 2;
	scene.add(lefty);
	
	var rightyMaterial = new THREE.MeshBasicMaterial( { color: 0x1B32C0, side: THREE.BackSide, transparent: true, opacity: 0.5 } );
	var rightyGeometry = new THREE.PlaneGeometry(GAMEDEPTH, GAMEHEIGHT);
	var righty = new THREE.Mesh(rightyGeometry, rightyMaterial);
	righty.material.side = THREE.DoubleSide;
 	righty.position.x = GAMEWIDTH/2;
 	righty.position.y = GAMEHEIGHT/2;
	righty.rotation.y = Math.PI / 2;
	scene.add(righty);
	
	// SKYBOX/FOG

	//scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	
	var cylBleu = new THREE.MeshNormalMaterial({color: 0x0000FF, transparent: true, opacity: 0 });
	var geometry = new THREE.PlaneGeometry( GAMEWIDTH+100, GAMEHEIGHT+100);
	var mesh = new THREE.Mesh( geometry, cylBleu );
	mesh.position.z = GAMEDEPTH/2;
	mesh.position.y = GAMEHEIGHT/2;
	scene.add( mesh );
	
	var linedepth = GAMEDEPTH/2;
	
	while(linedepth >= -GAMEDEPTH/2){
	
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( -GAMEWIDTH/2, 0, linedepth ) );
		geometry.vertices.push( new THREE.Vector3( GAMEWIDTH/2, 0, linedepth) );
		geometry.vertices.push( new THREE.Vector3( GAMEWIDTH/2, GAMEHEIGHT, linedepth) );
		geometry.vertices.push( new THREE.Vector3( -GAMEWIDTH/2, GAMEHEIGHT, linedepth ) );
		geometry.vertices.push( new THREE.Vector3( -GAMEWIDTH/2, 0, linedepth ) );

		// material
		var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 5 } );

		// line
		var line = new THREE.Line( geometry, material );
		line.material.side = THREE.DoubleSide;
		scene.add( line );
		
		linedepth -= 200;
	
	}
	
	updateScore();
	
	
	////////////
	// CUSTOM //
	////////////
	
	// create an array with six textures for a cool cube
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 }));
	materialArray.push(new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 }));
	MovingCubeMat = new THREE.MeshFaceMaterial(materialArray);
	var MovingCubeGeom = new THREE.CubeGeometry( paddleWidth, paddleHeight, 5, 1, 1, 1, materialArray );
	MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
	MovingCube.position.set(0, GAMEHEIGHT/2, GAMEDEPTH/2);
	scene.add( MovingCube );
	
	// create an array with six textures for a cool cube
	var materialArray2 = [];
	materialArray2.push(new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 }));
	materialArray2.push(new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 }));
	materialArray2.push(new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 }));
	materialArray2.push(new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 }));
	materialArray2.push(new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 }));
	materialArray2.push(new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 }));
	MovingCubeMat2 = new THREE.MeshFaceMaterial(materialArray2);
	var MovingCubeGeom2 = new THREE.CubeGeometry( paddleWidth, paddleHeight, 5, 1, 1, 1, materialArray2 );
	paddle2 = new THREE.Mesh( MovingCubeGeom2, MovingCubeMat2 );
	paddle2.position.set(0, GAMEHEIGHT/2, -GAMEDEPTH/2);
	scene.add( paddle2 );
	
	
	var ballgeometry = new THREE.SphereGeometry( ballRad, ballRad, ballRad );
	var ballmaterial = new THREE.MeshBasicMaterial( {color: 0x00FF00} );
	ball = new THREE.Mesh( ballgeometry, ballmaterial );
	ball.position.y = GAMEHEIGHT/2;
	scene.add( ball );
	
	var geo = new THREE.Geometry();
	geo.vertices.push( new THREE.Vector3( -GAMEWIDTH/2, 0, 0 ) );
	geo.vertices.push( new THREE.Vector3( GAMEWIDTH/2, 0, 0) );
	geo.vertices.push( new THREE.Vector3( GAMEWIDTH/2, GAMEHEIGHT, 0) );
	geo.vertices.push( new THREE.Vector3( -GAMEWIDTH/2, GAMEHEIGHT, 0 ) );
	geo.vertices.push( new THREE.Vector3( -GAMEWIDTH/2, 0, 0 ) );

	// material
	var yel = new THREE.LineBasicMaterial( { color: 0x00FF00, linewidth: 10 } );

	// line
	tracer = new THREE.Line( geo, yel );
	tracer.material.side = THREE.DoubleSide;
	scene.add( tracer );
	
	ballXVel = Math.floor(Math.random() * 800) + 200;
	ballYVel = Math.floor(Math.random() * 800) + 200;
	ballZVel = Math.floor(Math.random() * 500) + 500;
	
	ballXVel *= Math.random() < 0.5 ? -1 : 1;
	ballYVel *= Math.random() < 0.5 ? -1 : 1;
	ballZVel *= Math.random() < 0.5 ? -1 : 1;
	
	
	
	var domEvents = new THREEx.DomEvents(camera, renderer.domElement);
	
	domEvents.addEventListener(mesh, 'mousemove', function(event){
    		
    		var movx =  event.intersect.point.x;
    		var movy =  event.intersect.point.y;
    		
    		movy = movy > (GAMEHEIGHT -  paddleHeight/2)? (GAMEHEIGHT -  paddleHeight/2) : movy;
    		movy = movy < paddleHeight/2 ? paddleHeight/2 : movy;
    		
    		movx = movx > (GAMEWIDTH/2 - paddleWidth/2) ? (GAMEWIDTH/2 - paddleWidth/2)  : movx;
    		movx = movx < -(GAMEWIDTH/2 - paddleWidth/2)  ? -(GAMEWIDTH/2 - paddleWidth/2)  : movx;
    		
    		changeX = movx - MovingCube.position.x;
    		changeY = movy - MovingCube.position.y;
    		
    		if(changeTimeout)
    			clearTimeout(changeTimeout);
    		
    		changeTimeout = setTimeout(function(){
    			changeX = 0;
    			changeY = 0;
    		}, 250);
    		
    		
    		MovingCube.position.x = movx;
    		MovingCube.position.y = movy;
    		
    		if(wsconnected){
				socket.emit('User Move', {x: MovingCube.position.x, y: MovingCube.position.y});
			}
	}, false);
	
	domEvents.addEventListener(mesh, 'mousedown', function(event){
		if(isMobile.any()){
			THREEx.FullScreen.request();
		}
	}, false);
	
	
	
	socketSetup();	
	
}

var MovingCube;
var hasntupdated = false;
var MovingCubeMat, MovingCubeMat2;

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 1000 * delta; // 500 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
	
	// local transformations

	// move forwards/backwards/left/right
// 	if ( keyboard.pressed("W") || keyboard.pressed("up") ){
// 			if(MovingCube.position.y < (GAMEHEIGHT -  paddleHeight/2))
// 				MovingCube.translateY(  moveDistance );
// 			else
// 				MovingCube.position.y = (GAMEHEIGHT -  paddleHeight/2);
// 		}
// 	if ( keyboard.pressed("S") || keyboard.pressed("down")){
// 			if(MovingCube.position.y > paddleHeight/2)
// 				MovingCube.translateY(  -moveDistance );
// 			else
// 				MovingCube.position.y = paddleHeight/2;
// 		}
// 	if ( keyboard.pressed("A") || keyboard.pressed("left")){
// 			if(MovingCube.position.x > -(GAMEWIDTH/2 - paddleWidth/2))
// 				MovingCube.translateX( -moveDistance );
// 			else
// 				MovingCube.position.x = -(GAMEWIDTH/2 - paddleWidth/2);
// 		}
// 	if ( keyboard.pressed("D") || keyboard.pressed("right")){
// 			if(MovingCube.position.x < (GAMEWIDTH/2 - paddleWidth/2))
// 				MovingCube.translateX(  moveDistance );
// 			else
// 				MovingCube.position.x = (GAMEWIDTH/2 - paddleWidth/2);	
// 		}

	// rotate left/right/up/down
	var rotation_matrix = new THREE.Matrix4().identity();
	// if ( keyboard.pressed("A") )
// 		MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
// 	if ( keyboard.pressed("D") )
// 		MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
// 	if ( keyboard.pressed("R") )
// 		MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
// 	if ( keyboard.pressed("F") )
// 		MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);

	
// 	var relativeCameraOffset = new THREE.Vector3(MovingCube.position.x/6,100,800);
// 
// 	var cameraOffset = relativeCameraOffset.applyMatrix4( MovingCube.matrixWorld );
// 
// 	camera.position.x = cameraOffset.x;
// 	camera.position.y = cameraOffset.y;
// 	camera.position.z = cameraOffset.z;
// 	camera.lookAt( new THREE.Vector3( MovingCube.position.x/2, GAMEHEIGHT/2, GAMEDEPTH/2));
	

	if(!hasntupdated){
		hasntupdated = true;
	
		var relativeCameraOffset = new THREE.Vector3(0,100,800);

		var cameraOffset = relativeCameraOffset.applyMatrix4( MovingCube.matrixWorld );

		camera.position.x = cameraOffset.x;
		camera.position.y = cameraOffset.y;
		camera.position.z = cameraOffset.z;
		camera.lookAt( MovingCube.position );
	
	}
	
	//ballPhysics(delta);
	
	//camera.updateMatrix();
	//camera.updateProjectionMatrix();
}

function render() 
{
	renderer.render( scene, camera );
}


var textMesh;
function updateScore(){

	if(textMesh)
		scene.remove(textMesh);

	var material = new THREE.MeshPhongMaterial({
		color: 0xdddddd,
		transparent: true,
		opacity: 0.5 
	});
	
	var text =  score1 + ' - ' + score2;
	
	if(playernum == 2){
		text =  score2 + ' - ' + score1;
	}
	
	var textGeom = new THREE.TextGeometry(text,
	{
		bevelEnabled: true,
		height: 10,
		size: GAMEHEIGHT/2,
	});
	textMesh = new THREE.Mesh( textGeom, material );
	
	textGeom.computeBoundingBox();
	textGeom.computeVertexNormals();
	var centerOffset = -0.5 * ( textGeom.boundingBox.max.x - textGeom.boundingBox.min.x );
	textMesh.position.x = centerOffset;
	scene.add( textMesh );
	
}


function ballPhysics(delta)
{

		if (ball.position.x - ballRad <= -GAMEWIDTH/2)
		{	
			ballXVel = -ballXVel;
			
		}else if (ball.position.x + ballRad >= GAMEWIDTH/2)
		{	
			ballXVel = -ballXVel;
		}
		
		if (ball.position.y - ballRad <= 0)
		{	
			ballYVel = -ballYVel;
			
		}else if (ball.position.y + ballRad >= GAMEHEIGHT)
		{	
			ballYVel = -ballYVel;
		}
		
		if (ball.position.z - ballRad <= -GAMEDEPTH/2)
		{	
			ballZVel = -ballZVel;
			ballZVel += 50;
			
		}else if (ballZVel > 0 && ball.position.z + ballRad >= GAMEDEPTH/2 && ball.position.z <= GAMEDEPTH/2 && ballHitsPaddle())
		{	
 			ballZVel = -ballZVel;
 			ballZVel -= 50;
 			
 			if(changeY){
				ballYVel += changeY*10;
			}
				
			if(changeX){
				ballXVel += changeX*10;
			}
 			
		}else if (ball.position.z + ballRad >= GAMEDEPTH)
		{	
			resetBall();
		}
		
		var movx = ball.position.x + (ballXVel * delta);
		
		movx = movx > (GAMEWIDTH/2 - ballRad) ? (GAMEWIDTH/2 - ballRad)  : movx;
    	movx = movx < -(GAMEWIDTH/2 - ballRad)  ? -(GAMEWIDTH/2 - ballRad)  : movx;
    	
    	movx -= ball.position.x;
    	
    	var movy = ball.position.y + (ballYVel * delta);
		
		movy = movy > (GAMEHEIGHT -  ballRad)? (GAMEHEIGHT -  ballRad) : movy;
    	movy = movy < ballRad ? ballRad : movy;
    	
    	movy -= ball.position.y;
    	
    	var movz = ball.position.z + (ballZVel * delta);
		
// 		movz = movz > (GAMEDEPTH/2 - ballRad) ? (GAMEDEPTH/2 - ballRad)  : movz;
    	movz = movz < -(GAMEDEPTH/2 - ballRad)  ? -(GAMEDEPTH/2 - ballRad)  : movz;
    	
    	movz -= ball.position.z;
		
		
		ball.translateX(movx);
		ball.translateY(movy);
		ball.translateZ(movz);
		
		tracer.translateZ(movz);
	
}

function resetBall(){
	ball.position.set(0, GAMEHEIGHT/2, 0);
	tracer.position.z = 0;
	
	ballXVel = Math.floor(Math.random() * 800) + 200;
	ballYVel = Math.floor(Math.random() * 800) + 200;
	ballZVel = Math.floor(Math.random() * 500) + 500;
	
	ballXVel *= Math.random() < 0.5 ? -1 : 1;
	ballYVel *= Math.random() < 0.5 ? -1 : 1;
	ballZVel *= Math.random() < 0.5 ? -1 : 1;
}

function ballHitsPaddle(){
    
    var paddleleft = MovingCube.position.x - paddleWidth/2;
    var paddleright = MovingCube.position.x + paddleWidth/2;
    var paddletop = MovingCube.position.y + paddleHeight/2;
    var paddlebottom = MovingCube.position.y - paddleHeight/2;
    
    var ballleft = ball.position.x - ballRad;
    var ballright = ball.position.x + ballRad;
    var balltop = ball.position.y + ballRad;
    var ballbottom = ball.position.y - ballRad;
    
    if(paddleleft > ballright || paddleright < ballleft || paddletop < ballbottom || paddlebottom > balltop)
    	return false;
    return true;
    
}

var wsconnected = false;
var socket;
var playernum = 1;

function socketSetup(){
	// socket.io specific code
	
    socket = io.connect();  
	
	
      socket.on('connect', function () {
        wsconnected = true;
      });

      socket.on('User Move', function(msg) {
       			var moverid = msg.id;
       			
				var moverx  = msg.x;
				var movery = msg.y;
				
				paddle2.position.y = movery;
				paddle2.position.x = -moverx;
      });
      
      
      socket.on('ID', function (msg) {
       	console.log("ID: " + msg.id + " " +msg.player);
       	playernum = msg.player;
       	if(playernum == 1){
       		MovingCube.material = MovingCubeMat;
       		paddle2.material = MovingCubeMat2;
       	}else{
       		MovingCube.material = MovingCubeMat2;
       		paddle2.material = MovingCubeMat;
       	}
       	
      });
      
      
      socket.on('Closed', function (msg) {
       
       
      });
      
      socket.on('reconnect', function () {
      	alert("reconnect...");
      });

      socket.on('reconnecting', function () {
      	alert("reconnecting...");
      });

      socket.on('error', function (e) {
      	alert("ERROR" + e);
      });
      
      socket.on('Ball', function (msg) {

			ball.position.x = msg.position.x;
			ball.position.y = msg.position.y;
			ball.position.z = msg.position.z;
			
			tracer.position.z = msg.position.z;

       	
      });
      
      socket.on('Score', function (msg) {
			
			var ss = msg.split('-');
			score1 = ss[0];
			score2 = ss[1];
			//document.getElementById("scores").innerHTML = score1 + "-" + score2;
			
			updateScore();

       	
      });
}

window.onbeforeunload = function() {
	if(socket){
    	socket.onclose = function () {}; // disable onclose handler first
    	socket.close();
    }
};

var score1, score2;

var isMobile = {
    		Android: function() {
        		return navigator.userAgent.match(/Android/i);
    		},
    		BlackBerry: function() {
   			     return navigator.userAgent.match(/BlackBerry/i);
    		},
    		iOS: function() {
        		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    		},
    		Opera: function() {
        		return navigator.userAgent.match(/Opera Mini/i);
    		},
    		Windows: function() {
      		  return navigator.userAgent.match(/IEMobile/i);
    		},
    		Kindle: function() {
        		return navigator.userAgent.match(/Silk/i);
    		},
    		any: function() {
    		    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  		 	 }
			};

