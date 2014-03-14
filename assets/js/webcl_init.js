function detectCL() {
    // First check if the WebCL extension is installed at all
    
    if (window.webcl === undefined) {
        alert("Unfortunately your system does not support WebCL. " +
            "Make sure that you have both the OpenCL driver " +
            "and the WebCL browser extension installed.");
        return false;
    }
    
    // Get a list of available CL platforms, and another list of the
    // available devices on each platform. If there are no platforms,
    // or no available devices on any platform, then we can conclude
    // that WebCL is not available.
    
    try {
        var platforms = webcl.getPlatforms();
        var devices = [];
        for (var i in platforms) {
            var plat = platforms[i];
            devices[i] = plat.getDevices();
        }
    } catch (e) {
        alert("Unfortunately platform or device inquiry failed.");
        return false;
    }

    return true;
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