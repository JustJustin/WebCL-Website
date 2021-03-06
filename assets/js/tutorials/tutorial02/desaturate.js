function getWebCL() {
	if (window.webcl === undefined) {
		if (window.WebCL === undefined) {
			return false;
		}
		return new window.WebCL();
	}
	return window.webcl;
}

function loadKernel(id) {
	var kernelElement = document.getElementById(id);
	var kernelSource = kernelElement.text;
	if (kernelElement.src !== "") {
		var mHttpReq = new XMLHttpRequest();
		mHttpReq.open("GET", kernelElement.src, false);
		mHttpReq.send(null);
		kernelSource = mHttpReq.responseText;
	}
	return kernelSource;
}

function setupCanvas (canvasId, srcImg) {
	try {
		var canvasImg = document.getElementById(canvasId);
		var canvasImgCtx = canvasImg.getContext("2d");
		canvasImg.width = srcImg.width;
		canvasImg.height = srcImg.height;
		canvasImgCtx.drawImage (srcImg, 0, 0, srcImg.width, srcImg.height);
	} catch(e) {
		document.getElementById("output").innerHTML +=
		"<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message + "</pre>";
		throw e;
	}
}

function runProgram () {
	// All output is written to element by id "output"
	var i;
	var output = document.getElementById("outputText");
	output.innerHTML = "";

	try {
		// First check if the WebCL extension is installed at all
		var webcl = getWebCL();
		if (!webcl) {
			alert("Unfortunately your system does not support WebCL. " +
				"Make sure that you have both the OpenCL driver " +
				"and the WebCL browser extension installed.");
			return false;
		}

		// Get pixel data from canvas
		var canvasImg = document.getElementById("canvasImg");
		var canvasImgCtx = canvasImg.getContext("2d");
		var width = canvasImg.width;
		var height = canvasImg.height;
		var pixels = canvasImgCtx.getImageData(0, 0, width, height);

		// Dimm the existing canvas to highlight any errors we might get.
		// This does not affect the already retrieved pixel data.
		canvasImgCtx.fillStyle = "rgba(0,0,0,0.7)";
		canvasImgCtx.fillRect(0, 0, width, height);

		// Setup WebCL context using the default device
		var ctx = webcl.createContext();

		// Setup buffers
		var imgSize = width * height;
		output.innerHTML += "<br>Image size: " + imgSize + " pixels ("
			+ width + " x " + height + ")";
		var bufSize = imgSize * 4; // size in bytes
		output.innerHTML += "<br>Buffer size: " + bufSize + " bytes";

		var bufIn = ctx.createBuffer (WebCL.MEM_READ_ONLY, bufSize);
		var bufOut = ctx.createBuffer (WebCL.MEM_WRITE_ONLY, bufSize);

		// Create and build program
		var kernelSrc = loadKernel("clKernel");
		var program = ctx.createProgram(kernelSrc);
		var device = ctx.getInfo(WebCL.CONTEXT_DEVICES)[0];
		try {
			program.build ([device], "");
		} catch(e) {
			alert ("Failed to build WebCL program. Error "
				+ program.getBuildInfo (device, WebCL.PROGRAM_BUILD_STATUS)
				+ ":  "
				+ program.getBuildInfo (device, WebCL.PROGRAM_BUILD_LOG)
			);
			throw e;
		}

		// Create kernel and set arguments
		var kernel = program.createKernel ("clDesaturate");
		kernel.setArg (0, bufIn);
		kernel.setArg (1, bufOut);
		kernel.setArg (2, new Uint32Array([width]));
		kernel.setArg (3, new Uint32Array([height]));

		// Create command queue using the first available device
		var cmdQueue = ctx.createCommandQueue (device);

		// Write the buffer to OpenCL device memory
		cmdQueue.enqueueWriteBuffer (bufIn, false, 0, bufSize, pixels.data);

		// Init ND-range
		var localWS = [16,4];
		var globalWS = [Math.ceil (width / localWS[0]) * localWS[0],
		Math.ceil (height / localWS[1]) * localWS[1]];

		output.innerHTML += "<br>work group dimensions: 2";
		for (i = 0; i < 2; ++i) {
			output.innerHTML += "<br>global work item size[" +
				i + "]: " + globalWS[i];
		}
		for (i = 0; i < 2; ++i) {
			output.innerHTML += "<br>local work item size[" +
				i + "]: " + localWS[i];
		}

		// Execute (enqueue) kernel
		cmdQueue.enqueueNDRangeKernel(kernel, 2, null,
			globalWS, localWS);

		// Read the result buffer from OpenCL device
		cmdQueue.enqueueReadBuffer (bufOut, false, 0, bufSize, pixels.data);
		cmdQueue.finish (); //Finish all the operations

		canvasImgCtx.putImageData (pixels, 0, 0);

		output.innerHTML += "<br>Done.";

		// Release all WebCL resources
		webcl.releaseAll();
	} catch(e) {
		console.log(e);
		console.trace();
		document.getElementById("output").innerHTML +=
			"<h3>Error in runProgram():</h3><pre style=\"color:red;\">" +
			e.message + "</pre>";
		throw e;
	}

	return output.innerHTML;
}

// Only set up the canvas when the image is loaded.
var img = new Image();
img.onload = function () {
	setupCanvas("canvasImg", this);
};
img.src = "js/tutorials/tutorial02/img.png";

document.getElementById("runButton").onclick = runProgram;