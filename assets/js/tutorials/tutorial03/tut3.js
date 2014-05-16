var gl; // A global variable for the WebGL context
var vertexPositionAttribute;
var shaderProgram;
var squareVerticesBuffer;
var squareVerticesColorBuffer;
var squareRotation = 0.0;
var lastSquareUpdateTime = 0.0;


var hPobj;
var hCobj;
var hVobj;

var dPobj;
var dCobj;
var dVobj;


var aPobj;
var aCobj;
var aVobj;

var aSPobj = [];
var hSPobj;

var aSCobj = [];
var hSCobj;

var sphereVertices;

var NUM_PARTICLES = 32*1024;

var V_MIN = -50.0;
var V_MAX =  50.0;

var X_MIN = -100;
var X_MAX =  100;
var Y_MIN = -100;
var Y_MAX =  100;
var Z_MIN = -100;
var Z_MAX =  100;


var horizAspect = 480.0/640.0;




var eyeZ = 800.0;

// For dealing with the trackball motion

//webcl variables
var webcl;
var ctx;
var program;
var cmdQueue;
var kernel;

function run(){
	animateScene();
	drawScene();
}

function start() {
	var canvas = document.getElementById("glcanvas");

	//$("#glcanvas").addClass("webgl_hide");
	
	gl = initWebGL(canvas);      // Initialize the GL context

	// Only continue if WebGL is available and working

	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
		gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
		gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	}
	
	aPobj = new Float32Array(4 * NUM_PARTICLES);
	aVobj = new Float32Array(4 * NUM_PARTICLES);
	aCobj = new Float32Array(4 * NUM_PARTICLES);
	
	initShaders();
	
	init();
	
	genSphere(20, 20, 400);
	
	/** Initialization code. 
	 * If you use your own event management code, change it as required.
	 */
	if (window.addEventListener)
			/** DOMMouseScroll is for mozilla. */
			window.addEventListener('DOMMouseScroll', wheel, false);
	/** IE/Opera. */
	window.onmousewheel = document.onmousewheel = wheel;

	runProgram();
}

function runProgram(){

	//$("#glcanvas").addClass("webgl_output").removeClass("webgl_hide");

	resetParticles();
	cmdQueue.finish();
	

	var counter = 0;
	
	var looper = setInterval(function(){
		counter++
		run();
		if(counter >= 750){
			clearInterval(looper);
			//$("#glcanvas").addClass("webgl_hide").removeClass("webgl_output");
		}
	
	}, 15);
	
	
	
}

function genPoint(i, j, m, n, r){
	aSPobj.push(r * (Math.sin(Math.PI * ((j) / m)) * Math.cos(2 * Math.PI * ((i) / n))));
	aSPobj.push(r * Math.sin(Math.PI * ((j) / m)) * Math.sin(2 * Math.PI * ((i) / n)));
	aSPobj.push(r * Math.cos(Math.PI * ((j) / m)));
	aSPobj.push(1.0);
	
	aSCobj.push(1.0);
	aSCobj.push(0.0);
	aSCobj.push(0.0);
	aSCobj.push(1.0);
}



//Create a sphere from long. (m) and lang. (n) parameters
function genSphere(m, n, r)
{
	for (var i = 0; i < n; ++i){
		for (var j = 1; j <= m; ++j){

			genPoint(i + 1, j, m, n, r);

			genPoint(i, j, m, n, r);

			genPoint(i, j - 1, m, n, r);

			genPoint(i + 1, j - 1, m, n, r);

			genPoint(i + 1, j, m, n, r);

			genPoint(i, j - 1, m, n, r);
		}
	}

	sphereVertices = aSPobj.length;


	hSPobj = gl.createBuffer();
	hSCobj = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, hSPobj);
	gl.bufferData(gl.ARRAY_BUFFER, aSPobj, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, hSCobj);
	gl.bufferData(gl.ARRAY_BUFFER, aSCobj, gl.STATIC_DRAW);
	
}

function initWebGL(canvas) {
	gl = null;

	try {
		// Try to grab the standard context. If it fails, fallback to experimental.
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch(e) {}

	// If we don't have a GL context, give up now
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
		gl = null;
	}

	return gl;
}




function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	// Create the shader program

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgram);

	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	
}


function getShader(gl, id) {
	var shaderScript, theSource, currentChild, shader;

	shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	theSource = "";
	currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		// Unknown shader type
		return null;
	}
	gl.shaderSource(shader, theSource);

	// Compile the shader program
	gl.compileShader(shader);  

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
	  alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
	  return null;  
	}

	return shader;
}


function ranf(a, b) {	
		return a + (b - a) * Math.random();
}

function resetParticles(){

	for(var i = 0; i < NUM_PARTICLES; ++i){
		aPobj[i * 4]     = ranf(X_MIN, X_MAX); // X
		aPobj[i * 4 + 1] = ranf(Y_MIN, Y_MAX); // Y
		aPobj[i * 4 + 2] = ranf(Z_MIN, Z_MAX); // Z
		aPobj[i * 4 + 3] = 1.0; 				   // W
		aVobj[i * 4]     = ranf(V_MIN, V_MAX); // X 
		aVobj[i * 4 + 1] = ranf(V_MIN, V_MAX); // Y
		aVobj[i * 4 + 2] = ranf(V_MIN, V_MAX); // Z
		aVobj[i * 4 + 3] = 0.0;
		aCobj[i * 4]     = ranf(0.0, 1.0);
		aCobj[i * 4 + 1] = ranf(0.0, 1.0);
		aCobj[i * 4 + 2] = ranf(0.0, 1.0);
		aCobj[i * 4 + 3] = 1.0;
	
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, hPobj);
	gl.bufferData(gl.ARRAY_BUFFER, aPobj, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, hVobj);
	gl.bufferData(gl.ARRAY_BUFFER, aVobj, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, hCobj);
	gl.bufferData(gl.ARRAY_BUFFER, aCobj, gl.STATIC_DRAW);

}

function init(){

	// 1. Get WebCl Context

	// First check if the WebCL extension is installed at all
	var webcl = getWebCL();
	if (!webcl) {
		throw {message:"This device does not support webcl"};
	}

	
	// 2. Create WebGL Buffers and load data

	hPobj = gl.createBuffer();			
	hVobj = gl.createBuffer();	
	hCobj = gl.createBuffer();
	
	resetParticles();
	
	// 3. Create WebCL buffers from WebGl buffers
	
	// Setup WebCL context using the default device
	ctx = webcl.createContext ();
	
	var bufSize = 4 *  NUM_PARTICLES * 4;
	
	dPobj = ctx.createBuffer(WebCL.MEM_READ_WRITE, bufSize);
	dCobj = ctx.createBuffer(WebCL.MEM_READ_WRITE, bufSize);
	dVobj = ctx.createBuffer(WebCL.MEM_READ_WRITE, bufSize);
	
	// 4. Do WebCl Kernel Stuff
	
	var kernelSrc = loadKernel("clKernel");
	program = ctx.createProgram(kernelSrc);
	var device = ctx.getInfo(WebCL.CONTEXT_DEVICES)[0];

	try {
		program.build ([device], "");
	} catch(e) {
		alert ("Failed to build WebCL program. Error "
			+ program.getBuildInfo (device, webcl.PROGRAM_BUILD_STATUS)
			+ ":  "
			+ program.getBuildInfo (device, webcl.PROGRAM_BUILD_LOG));
		throw e;
	}
	
	// 5. Setup kernel arguments
	
	// Create kernel and set arguments
	kernel = program.createKernel ("Particle");
	kernel.setArg (0, dPobj);
	kernel.setArg (1, dVobj);
	kernel.setArg (2, dCobj);
	
	cmdQueue = ctx.createCommandQueue (device);
	
	
}

function webcl_cleanup(){

	kernel.release();
	program.release();
	cmdQueue.release();
	dPobj.release();
	dVobj.release();
	dCobj.release();

}


function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	perspectiveMatrix = makePerspective(45, 1366.0/768.0, 0.1, 4000.0);

	mvMatrix = makeLookAt( 0., -100., eyeZ,     0., -100., 0.,     0., 1., 0. );
	

	gl.bindBuffer(gl.ARRAY_BUFFER, hPobj);
	gl.bufferData(gl.ARRAY_BUFFER, aPobj, gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, hCobj);
	gl.bufferData(gl.ARRAY_BUFFER, aCobj, gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexColorAttribute);
	
	setMatrixUniforms();
	
	gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, hSPobj);
	gl.vertexAttribPointer(vertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, hSCobj);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexColorAttribute);
	
	setMatrixUniforms();
	
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices);
	
}

function animateScene(){

	// load data into arrays from WebGL 


	var bufSize = 4 * NUM_PARTICLES * 4; //size in bytes hence times 4 again
	
	cmdQueue.enqueueWriteBuffer(dPobj, false, 0, bufSize, aPobj);
	cmdQueue.enqueueWriteBuffer(dVobj, false, 0, bufSize, aVobj);
	cmdQueue.enqueueWriteBuffer(dCobj, false, 0, bufSize, aCobj);

	var localWS = [32, 1, 1];
	var globalWS = [NUM_PARTICLES, 1, 1];

	cmdQueue.enqueueNDRangeKernel(kernel, globalWS.length, null,
								  globalWS, localWS);
	
	
	cmdQueue.enqueueReadBuffer(dPobj, false, 0, bufSize, aPobj);
	cmdQueue.enqueueReadBuffer(dVobj, false, 0, bufSize, aVobj);
	cmdQueue.enqueueReadBuffer(dCobj, false, 0, bufSize, aCobj);
	cmdQueue.finish ();
	
}

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}

// WebCl Functions

function getWebCL() {
	if (window.webcl === undefined){
		if( window.WebCL === undefined ) {
            return false;
        }
        return new window.WebCL;
	}
    return window.webcl;
}

function loadKernel(id) {
  var kernelElement = document.getElementById(id);
  var kernelSource = kernelElement.text;
  // if (kernelElement.src !== "") {
      // var mHttpReq = new XMLHttpRequest();
      // mHttpReq.open("GET", kernelElement.src, false);
      // mHttpReq.send(null);
      // kernelSource = mHttpReq.responseText;
  // }
  return kernelSource;
}

// Code to look at later'

/** This is high-level function.
 * It must react to delta being more/less than zero.
 */
function handle(delta) {
        eyeZ += delta * -25.0;
}

/** Event handler for mouse wheel event.
 */
function wheel(event){
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
        } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta)
                handle(delta);
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault)
                event.preventDefault();
	event.returnValue = false;
}


//start();
//document.getElementById("runButton").onclick = runProgram;

