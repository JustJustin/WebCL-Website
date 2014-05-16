var gl; // A global variable for the WebGL context

var hPobj;
var hCobj;
var hVobj;

var dPobj;
var dCobj;
var dVobj;

var aPobj;
var aCobj;
var aVobj;

var shaderProgramSphere;
var shaderProgramParticle;

var spherePositionBuffer;
var sphereIndexBuffer;

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

var eyeZ = 900.0;

// For dealing with the trackball motion

//webcl variables
var webcl;
var ctx;
var program;
var cmdQueue;
var kernel;

//global loop interval handle
var clearThis = false;

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
	
	genSphere(40, 40, 600);
	
	/** Initialization code. 
	 * If you use your own event management code, change it as required.
	 */
	if (window.addEventListener)
			/** DOMMouseScroll is for mozilla. */
			window.addEventListener('DOMMouseScroll', wheel, false);
	/** IE/Opera. */
	window.onmousewheel = document.onmousewheel = wheel;

}

function runProgram(){

	resetParticles();
	cmdQueue.finish();
    
    if( clearThis ) {
        clearInterval( clearThis );
        clearThis = false;
        
        $("#runButton").text("Run Program");
        return;
    }
    $("#runButton").text("Stop Program");
	

	var counter = 0;
	
	var looper = setInterval(function(){
		counter++;
		run();
		if(counter >= 750){
            clearThis = false;
			clearInterval(looper);
            $("#runButton").text("Run Program");
		}
	}, 15);
    clearThis = looper;
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

function genSphere(latitude, longitude, radius)
{

	spherePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
	sphereIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);

	var spherePositionArray = [];
	var sphereColorArray = [];
	var sphereIndexArray = [];
	
	for (var lat=0; lat <= latitude; lat++){
		var theta = lat * Math.PI / latitude;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		
		for( var lon = 0; lon <= longitude; lon++){
			var phi = lon * 2 * Math.PI / longitude;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
			
            spherePositionArray.push(radius * x);
            spherePositionArray.push(radius * y);
            spherePositionArray.push(radius * z);
	
		}
	}
	
	for (var lat=0; lat < latitude; lat++){
		
		for( var lon = 0; lon < longitude; lon++){
		
			var first = (lat * (longitude + 1)) + lon;
            var second = first + longitude + 1;
            sphereIndexArray.push(first);
            sphereIndexArray.push(second);
            sphereIndexArray.push(first + 1);

            sphereIndexArray.push(second);
            sphereIndexArray.push(second + 1);
            sphereIndexArray.push(first + 1);
		}
	}
		
		
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spherePositionArray), gl.STATIC_DRAW);
	spherePositionBuffer.itemSize = 3;
	spherePositionBuffer.numItems = spherePositionArray.length / 3;

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndexArray), gl.STATIC_DRAW);
	sphereIndexBuffer.itemSize = 1;
	sphereIndexBuffer.numItems = sphereIndexArray.length;

}


function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs-sphere");
	var vertexShader = getShader(gl, "shader-vs-sphere");

	// Create the shader program

	shaderProgramSphere = gl.createProgram();
	gl.attachShader(shaderProgramSphere, vertexShader);
	gl.attachShader(shaderProgramSphere, fragmentShader);
	gl.linkProgram(shaderProgramSphere);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgramSphere, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgramSphere);

	shaderProgramSphere.vertexPositionAttribute = gl.getAttribLocation(shaderProgramSphere, "aVertexPosition");

	fragmentShader = getShader(gl, "shader-fs-particle");
	vertexShader = getShader(gl, "shader-vs-particle");

	// Create the shader program

	shaderProgramParticle = gl.createProgram();
	gl.attachShader(shaderProgramParticle, vertexShader);
	gl.attachShader(shaderProgramParticle, fragmentShader);
	gl.linkProgram(shaderProgramParticle);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgramParticle, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	gl.useProgram(shaderProgramParticle);

	shaderProgramParticle.vertexPositionAttribute = gl.getAttribLocation(shaderProgramParticle, "aVertexPosition");
	shaderProgramParticle.vertexColorAttribute = gl.getAttribLocation(shaderProgramParticle, "aVertexColor");
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
	hPobj.itemSize = 4;
	hPobj.numItems = aPobj.length / 4;
	gl.bindBuffer(gl.ARRAY_BUFFER, hVobj);
	gl.bufferData(gl.ARRAY_BUFFER, aVobj, gl.STATIC_DRAW);
	hVobj.itemSize = 4;
	hVobj.numItems = aVobj.length / 4;
	gl.bindBuffer(gl.ARRAY_BUFFER, hCobj);
	gl.bufferData(gl.ARRAY_BUFFER, aCobj, gl.STATIC_DRAW);
	hCobj.itemSize = 4;
	hCobj.numItems = aCobj.length / 4;

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
    if( clearThis ) {
        clearInterval( clearThis );
        clearThis = false;
        $("runButton").text("Run Program");
    }

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
	
	gl.useProgram(shaderProgramParticle);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, hPobj);
	gl.bufferData(gl.ARRAY_BUFFER, aPobj, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaderProgramParticle.vertexPositionAttribute, hPobj.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgramParticle.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, hCobj);
	gl.bufferData(gl.ARRAY_BUFFER, aCobj, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaderProgramParticle.vertexColorAttribute, hCobj.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgramParticle.vertexColorAttribute);
	
	setMatrixUniforms(shaderProgramParticle);
	
	gl.drawArrays(gl.POINTS, 0, hPobj.numItems);
	
	gl.useProgram(shaderProgramSphere);
	
	mvPushMatrix();
	
	mvTranslate([-100., -800., 0.]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
	gl.vertexAttribPointer(shaderProgramSphere.vertexPositionAttribute, spherePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgramSphere.vertexPositionAttribute);
	
	setMatrixUniforms(shaderProgramSphere);
	var cUniform = gl.getUniformLocation(shaderProgramSphere, "vColor");
	gl.uniform4f(cUniform, 1.0, 1.0, 0.0, 1.0);
	
	gl.drawElements(gl.LINE_STRIP, sphereIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	mvPopMatrix();
	
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

function setMatrixUniforms(program) {
  var pUniform = gl.getUniformLocation(program, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(program, "uMVMatrix");
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
        eyeZ += delta * -50.0;
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


start();
document.getElementById("runButton").onclick = runProgram;

