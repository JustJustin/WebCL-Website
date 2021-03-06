function getWebCL() {
	if (window.webcl === undefined) {
		if( window.WebCL === undefined ) {
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

function runProgram () {
	// All output is written to element by id "output"
	var output = window.document.getElementById("outputText");
	output.innerHTML = "";

	var i;

	try {
		// First check if the WebCL extension is installed at all
		var webcl = getWebCL();
		if (!webcl) {
			throw {message:"This device does not support webcl"};
		}

		// Generate input vectors
		var vectorLength = 5;
		var UIvector1 = new Uint32Array(vectorLength);
		var UIvector2 = new Uint32Array(vectorLength);
		for (i = 0; i < vectorLength;  i = i+1) {
			UIvector1[i] = Math.floor(Math.random() * 100); //Random number 0..99
			UIvector2[i] = Math.floor(Math.random() * 100); //Random number 0..99
		}

		output.innerHTML += "<br>Vector length = " + vectorLength;

		/* Hosting OpenCL computation starts with reserving the required
		resources. WebCL context is created using the default device of the
		first available platform. In addition, we will need three buffers;
		two read_only buffers for the inputs and one write only buffer for
		the output.innerHTML. The size for the buffers is given as bytes. */

		// Setup WebCL context using the default device
		var ctx = webcl.createContext ();

		// Reserve buffers
		var bufSize = vectorLength * 4; // size in bytes
		output.innerHTML += "<br>Buffer size: " + bufSize + " bytes";
		var bufIn1 = ctx.createBuffer (webcl.MEM_READ_ONLY, bufSize);
		var bufIn2 = ctx.createBuffer (webcl.MEM_READ_ONLY, bufSize);
		var bufOut = ctx.createBuffer (webcl.MEM_WRITE_ONLY, bufSize);

		/* Next we will create a program object. The kernel code is loaded with
		the loadKernel function and built for the defined device. Possible
		failure with compilation is printed out as an alert box. Then, the
		kernel code "ckVectorAdd" is selected for the kernel object. Let us
		remark that there could be several kernel descriptions in kernel source
		code. At this point, we can also initialize the kernel arguments. */

		// Create and build program for the first device
		var kernelSrc = loadKernel("clKernel");
		var program = ctx.createProgram(kernelSrc);
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

		// Create kernel and set arguments
		var kernel = program.createKernel ("ckVectorAdd");
		kernel.setArg (0, bufIn1);
		kernel.setArg (1, bufIn2);
		kernel.setArg (2, bufOut);
		kernel.setArg (3, new Uint32Array([vectorLength]));

		/* Next thing to do is to create Command queue. After that, local and
		global work sizes are defined. Let us note that the global work size
		must be multiple of local work size. The actual execution is enqueued
		with enqueueNDRangeKernel. After the execution, the results can be read
		from the OpenCL device with enqueueReadBuffer. Finally, the commmand
		queue is flushed with cmdQueue.finish. */

		// Create command queue using the first available device
		var cmdQueue = ctx.createCommandQueue (device);

		// Write the buffer to OpenCL device memory
		cmdQueue.enqueueWriteBuffer(bufIn1, false, 0, bufSize, UIvector1);
		cmdQueue.enqueueWriteBuffer(bufIn2, false, 0, bufSize, UIvector2);

		// Init ND-range
		var localWS = [8];
		var globalWS = [Math.ceil (vectorLength / localWS) * localWS];

		output.innerHTML += "<br>Global work item size: " + globalWS;
		output.innerHTML += "<br>Local work item size: " + localWS;

		// Execute (enqueue) kernel
		cmdQueue.enqueueNDRangeKernel(kernel, globalWS.length, null,
		globalWS, localWS);

		// Read the result buffer from OpenCL device
		var outBuffer = new Uint32Array(vectorLength);
		cmdQueue.enqueueReadBuffer (bufOut, false, 0, bufSize, outBuffer);
		cmdQueue.finish (); //Finish all the operations

		//Print input vectors and result vector
		output.innerHTML += "<br>Vector1 = ";
		for (i = 0; i < vectorLength; i = i + 1) {
			output.innerHTML += UIvector1[i] + ", ";
		}
		output.innerHTML += "<br>Vector2 = ";
		for (i = 0; i < vectorLength; i = i + 1) {
			output.innerHTML += UIvector2[i] + ", ";
		}
		output.innerHTML += "<br>Result = ";
		for (i = 0; i < vectorLength; i = i + 1) {
			output.innerHTML += outBuffer[i] + ", ";
		}

		// Release all WebCL resources
		webcl.releaseAll();
	} catch(e) {
		document.getElementById("output").innerHTML
			+= "<h3>ERROR:</h3><pre style=\"color:red;\">" + e.message
			+ "</pre>";
		throw e;
	}

	return output.innerHTML;
}

runProgram ();