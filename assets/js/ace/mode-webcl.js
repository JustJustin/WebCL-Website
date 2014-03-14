define('ace/mode/webcl', function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
// defines the parent modes
var HtmlMode = require("./html").Mode;
var JavaScriptMode = require("./javascript").Mode;
var C_CPPMode = require("./c_cpp").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;

// defines the language specific highlighters and folding rules
var WebCLHighlightRules = require("./webcl_highlight_rules").WebCLHighlightRules;
// Implement!?
//var WebCLFoldMode = require("./folding/webclfold").WebCLFoldMode;

var Mode = function() {
    // set everything up
    this.HighlightRules = WebCLHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    //this.$tokenizer = new Tokenizer(new WebCLHighlightRules().getRules());
    
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "c-": C_CPPMode
    });
    
//    this.foldingRules = new WebCLFoldMode();
};
oop.inherits(Mode, HtmlMode);

(function() {
    this.$id = "ace/mode/webcl";
    // configure comment start/end characters
    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    
    // special logic for indent/outdent.
    // By default ace keeps indentation of previous line
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
    // Worker to be implemented later
    /* 
    // create worker for live syntax checking
    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "ace/mode/mynew_worker", "NewWorker");
        worker.attachToDocument(session.getDocument());
        worker.on("errors", function(e) {
            session.setAnnotations(e.data);
        });
        return worker;
    };
    */
}).call(Mode.prototype);

exports.Mode = Mode;
});

define('ace/mode/webcl_highlight_rules', function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
var c_cppHighlightRules = require("./c_cppHighlightRules").c_cppHighlightRules;

var WebCLHighlightRules = function() {
    HtmlHighlightRules.call(this);

    var keywordMapper = this.createKeywordMapper({
        "support.function":
            "createContext|createBuffer|createCommandQueue|createImage|"        +
            "createProgram|createSampler|createUserEvent|createSubBuffer|"      +
            "createKernel|createKernelsInProgram|"                              +
            "getPlatforms|getSupportedExtensions|getDevices|getInfo|"           +
            "getSupportedImageFormats|getBuildInfo|getWorkGroupInfo|"           +
            "getArgInfo|getProfilingInfo|"                                      +
            "setArg|setCallback|setStatus|"                                     +
            "release|releaseAll|"                                               +
            "enableExtension|waitForEvents|"                                    +
            "enqueueCopyBuffer|enqueueCopyBufferRect|enqueueCopyImage|"         +
            "enqueueCopyImageToBuffer|enqueueCopyBufferToImage|"                +
            "enqueueReadBuffer|enqueueReadBufferRect|enqueueReadImage|"         +
            "enqueueWriteBuffer|enqueueWriteBufferRect|enqueueWriteImage|"      +
            "enqueueNDRangeKernel|enqueueMarker|enqueueBarrier|"                +
            "enqueueWaitForEvents|finish|flush"
        ,
        "support.type":
            "CLboolean|CLint|CLlong|CLuint|CLulong|CLenum",
        "support.constant.numeric":
            // Error codes
            "SUCCESS|DEVICE_NOT_FOUND|DEVICE_NOT_AVAILABLE|"                    +
            "COMPILER_NOT_AVAILABLE|MEM_OBJECT_ALLOCATION_FAILURE|"             +
            "OUT_OF_RESOURCES|OUT_OF_HOST_MEMORY|PROFILING_INFO_NOT_AVAILABLE|" +
            "MEM_COPY_OVERLAP|IMAGE_FORMAT_MISMATCH|IMAGE_FORMAT_NOT_SUPPORTED|"+
            "BUILD_PROGRAM_FAILURE|MAP_FAILURE|MISALIGNED_SUB_BUFFER_OFFSET|"   +
            "EXEC_STATUS_ERROR_FOR_EVENTS_IN_WAIT_LIST|INVALID_VALUE|"          +
            "INVALID_DEVICE_TYPE|INVALID_PLATFORM|INVALID_DEVICE|"              +
            "INVALID_CONTEXTINVALID_QUEUE_PROPERTIES|INVALID_COMMAND_QUEUE|"    +
            "INVALID_HOST_PTR|INVALID_MEM_OBJECT|"                              +
            "INVALID_IMAGE_FORMAT_DESCRIPTOR|INVALID_IMAGE_SIZE|"               +
            "INVALID_SAMPLER|INVALID_BINARY|INVALID_BUILD_OPTIONS|"             +
            "INVALID_PROGRAM|INVALID_PROGRAM_EXECUTABLE|INVALID_KERNEL_NAME|"   +
            "INVALID_KERNEL_DEFINITION|INVALID_KERNEL|INVALID_ARG_INDEX|"       +
            "INVALID_ARG_VALUE|INVALID_ARG_SIZE|INVALID_KERNEL_ARGS|"           +
            "INVALID_WORK_DIMENSION|INVALID_WORK_GROUP_SIZE|"                   +
            "INVALID_WORK_ITEM_SIZE|INVALID_GLOBAL_OFFSET|"                     +
            "INVALID_EVENT_WAIT_LIST|INVALID_EVENT|INVALID_OPERATION|"          +
            "INVALID_BUFFER_SIZE|INVALID_GLOBAL_WORK_SIZE|INVALID_PROPERTY|"    +
            // cl_platform_info
            "PLATFORM_PROFILE|PLATFORM_VERSION|PLATFORM_NAME|PLATFORM_VENDOR|"  +
            "PLATFORM_EXTENSIONS|"                                              +
            // cl_device_type
            "DEVICE_TYPE_DEFAULT|DEVICE_TYPE_CPU|DEVICE_TYPE_GPU|"              +
            "DEVICE_TYPE_ACCELERATOR|DEVICE_TYPE_ALL|"                          +
            // cl_device_info
            "DEVICE_TYPE|DEVICE_VENDOR_ID|DEVICE_MAX_COMPUTE_UNITS|"            +
            "DEVICE_MAX_WORK_ITEM_DIMENSIONS|DEVICE_MAX_WORK_GROUP_SIZE|"       +
            "DEVICE_MAX_WORK_ITEM_SIZES|DEVICE_PREFERRED_VECTOR_WIDTH_CHAR|"    +
            "DEVICE_PREFERRED_VECTOR_WIDTH_SHORT|"                              +
            "DEVICE_PREFERRED_VECTOR_WIDTH_INT|"                                +
            "DEVICE_PREFERRED_VECTOR_WIDTH_LONG|"                               +
            "DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT|"                              +
            "DEVICE_MAX_CLOCK_FREQUENCY|DEVICE_ADDRESS_BITS|"                   +
            "DEVICE_MAX_READ_IMAGE_ARGS|DEVICE_MAX_WRITE_IMAGE_ARGS|"           +
            "DEVICE_MAX_MEM_ALLOC_SIZE|DEVICE_IMAGE2D_MAX_WIDTH|"               +
            "DEVICE_IMAGE2D_MAX_HEIGHT|DEVICE_IMAGE3D_MAX_WIDTH|"               +
            "DEVICE_IMAGE3D_MAX_HEIGHT|DEVICE_IMAGE3D_MAX_DEPTH|"               +
            "DEVICE_IMAGE_SUPPORT|DEVICE_MAX_PARAMETER_SIZE|"                   +
            "DEVICE_MAX_SAMPLERS|DEVICE_MEM_BASE_ADDR_ALIGN|"                   +
            "DEVICE_SINGLE_FP_CONFIG|DEVICE_GLOBAL_MEM_CACHE_TYPE|"             +
            "DEVICE_GLOBAL_MEM_CACHELINE_SIZE|DEVICE_GLOBAL_MEM_CACHE_SIZE|"    +
            "DEVICE_GLOBAL_MEM_SIZE|DEVICE_MAX_CONSTANT_BUFFER_SIZE|"           +
            "DEVICE_MAX_CONSTANT_ARGS|DEVICE_LOCAL_MEM_TYPE|"                   +
            "DEVICE_LOCAL_MEM_SIZE|DEVICE_ERROR_CORRECTION_SUPPORT|"            +
            "DEVICE_PROFILING_TIMER_RESOLUTION|DEVICE_ENDIAN_LITTLE|"           +
            "DEVICE_AVAILABLE|DEVICE_COMPILER_AVAILABLE|"                       +
            "DEVICE_EXECUTION_CAPABILITIES|DEVICE_QUEUE_PROPERTIES|DEVICE_NAME|"+
            "DEVICE_VENDOR|DRIVER_VERSION|DEVICE_PROFILE|DEVICE_VERSION|"       +
            "DEVICE_EXTENSIONS|DEVICE_PLATFORM|DEVICE_HOST_UNIFIED_MEMORY|"     +
            "DEVICE_NATIVE_VECTOR_WIDTH_CHAR|DEVICE_NATIVE_VECTOR_WIDTH_SHORT|" +
            "DEVICE_NATIVE_VECTOR_WIDTH_INT|DEVICE_NATIVE_VECTOR_WIDTH_LONG|"   +
            "DEVICE_NATIVE_VECTOR_WIDTH_FLOAT|DEVICE_OPENCL_C_VERSION|"         +
            // cl_device_fp_config - bitfield
            "FP_DENORM|FP_INF_NAN|FP_ROUND_TO_NEAREST|FP_ROUND_TO_ZERO|"        +
            "FP_ROUND_TO_INF|FP_FMA|FP_SOFT_FLOAT|"                             +
            // cl_device_mem_cache_type
            "NONE|READ_ONLY_CACHE|READ_WRITE_CACHE|"                            +
            // cl_device_local_mem_type
            "LOCAL|GLOBAL|"                                                     +
            // cl_device_exec_capabilities - bitfield
            "EXEC_KERNEL|"                                                      +
            // cl_command_queue_properties - bitfield
            "QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE|QUEUE_PROFILING_ENABLE|"       +
            // cl_context_info
            "CONTEXT_DEVICES|CONTEXT_NUM_DEVICES|"                              +
            // cl_context_properties
            "CONTEXT_PLATFORM|"                                                 +
            // cl_command_queue_info
            "QUEUE_CONTEXT|QUEUE_DEVICE|QUEUE_PROPERTIES|"                      +
            // cl_mem_flags - bitfield
            "MEM_READ_WRITE|MEM_WRITE_ONLY|MEM_READ_ONLY|"                      +
            // cl_channel_order
            "R|A|RG|RA|RGB|RGBA|BGRA|ARGB|INTENSITY|LUMINANCE|Rx|RGx|RGBx|"     +
            // cl_channel_type
            "SNORM_INT8|SNORM_INT16|UNORM_INT8|UNORM_INT16|UNORM_SHORT_565|"    +
            "UNORM_SHORT_555|UNORM_INT_101010|SIGNED_INT8|SIGNED_INT16|"        +
            "SIGNED_INT32|UNSIGNED_INT8|UNSIGNED_INT16|UNSIGNED_INT32|"         +
            "HALF_FLOAT|FLOAT|"                                                 +
            // cl_mem_object_type
            "MEM_OBJECT_BUFFER|MEM_OBJECT_IMAGE2D|MEM_OBJECT_IMAGE3D|"          +
            // cl_mem_info
            "MEM_TYPE|MEM_FLAGS|MEM_SIZE|MEM_CONTEXT|MEM_ASSOCIATED_MEMOBJECT|" +
            "MEM_OFFSET|"                                                       +
            // cl_image_info
            "IMAGE_FORMAT|IMAGE_ELEMENT_SIZE|IMAGE_ROW_PITCH|IMAGE_WIDTH|"      +
            "IMAGE_HEIGHT|"                                                     +
            // cl_addressing_mode
            "ADDRESS_CLAMP_TO_EDGE|ADDRESS_CLAMP|ADDRESS_REPEAT|"               +
            "ADDRESS_MIRRORED_REPEAT|"                                          +
            // cl_filter_mode
            "FILTER_NEAREST|FILTER_LINEAR|"                                     +
            // cl_sampler_info
            "SAMPLER_CONTEXT|SAMPLER_NORMALIZED_COORDS|SAMPLER_ADDRESSING_MODE|"+
            "SAMPLER_FILTER_MODE|"                                              +
            // cl_program_info
            "PROGRAM_CONTEXT|PROGRAM_NUM_DEVICES|PROGRAM_DEVICES|"              +
            "PROGRAM_SOURCE|"                                                   +
            // cl_program_build_info
            "PROGRAM_BUILD_STATUS|PROGRAM_BUILD_OPTIONS|PROGRAM_BUILD_LOG|"     +
            // cl_build_status
            "BUILD_SUCCESS|BUILD_NONE|BUILD_ERROR|BUILD_IN_PROGRESS|"           +
            // cl_kernel_info
            "KERNEL_FUNCTION_NAME|KERNEL_NUM_ARGS|KERNEL_CONTEXT|"              +
            "KERNEL_PROGRAM|"                                                   +
            // cl_kernel_work_group_info
            "KERNEL_WORK_GROUP_SIZE|KERNEL_COMPILE_WORK_GROUP_SIZE|"            +
            "KERNEL_LOCAL_MEM_SIZE|KERNEL_PREFERRED_WORK_GROUP_SIZE_MULTIPLE|"  +
            "KERNEL_PRIVATE_MEM_SIZE|"                                          +
            // cl_event_info
            "EVENT_COMMAND_QUEUE|EVENT_COMMAND_TYPE|"                           +
            "EVENT_COMMAND_EXECUTION_STATUS|EVENT_CONTEXT|"                     +
            // cl_command_type
            "COMMAND_NDRANGE_KERNEL|COMMAND_TASK|COMMAND_READ_BUFFER|"          +
            "COMMAND_WRITE_BUFFER|COMMAND_COPY_BUFFER|COMMAND_READ_IMAGE|"      +
            "COMMAND_WRITE_IMAGE|COMMAND_COPY_IMAGE|"                           +
            "COMMAND_COPY_IMAGE_TO_BUFFER|COMMAND_COPY_BUFFER_TO_IMAGE|"        +
            "COMMAND_MARKER|COMMAND_READ_BUFFER_RECT|COMMAND_WRITE_BUFFER_RECT|"+
            "COMMAND_COPY_BUFFER_RECT|COMMAND_USER|"                            +
            // command execution status
            "COMPLETE|RUNNING|SUBMITTED|QUEUED|"                                +
            // cl_profiling_info
            "PROFILING_COMMAND_QUEUED|PROFILING_COMMAND_SUBMIT|"                +
            "PROFILING_COMMAND_START|PROFILING_COMMAND_END",
        "support.constant.boolean":
            "TRUE|FALSE" // cl_bool: Technically numeric but...
    }, "identifier");
    
    // Taken from Javascript Mode
    // TODO: Unicode escape sequences
    var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*\\b";

    
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used
   this.$rules = {
        "start" : [
            {
                token: keywordMapper, // String, Array, or Function: the CSS token to apply
                regex: identifierRe, // String or RegExp: the regexp to match
                next:  "start"   // [Optional] String: next state to enter
            }
        ]
    };
    
    this.normalizeRules();
};

oop.inherits(WebCLHighlightRules, HtmlHighlightRules);

exports.WebCLHighlightRules = WebCLHighlightRules;

});