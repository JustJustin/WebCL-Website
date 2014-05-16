var tutorial_data =
{
    name:"Image Manipulation",
    steps:
    [
        {
            text:"Here is a quick overview of image manipulation. First is desaturation.",
            editor:1,
            editorText: '/js/tutorials/tutorial02/desaturate.c',
            otherText: {'0':'/js/tutorials/tutorial02/desaturate.js', '2' : '/js/tutorials/tutorial02/start.html' },
            complete: function(code, user, output) {
                return false;
            },
            lock: false,
            forceFocus: false,
			allowSkip: true
        }, {
            text:"Now take a look at emboss.",
            editor:1,
            editorText: '/js/tutorials/tutorial02/emboss.c',
			otherText: {'0':'/js/tutorials/tutorial02/emboss.js'},
            complete: function(code, user, output) {
                return false;
            },
            lock: false,
            release: false,
            forceFocus: false,
            allowSkip: true
        },
		{
            text:"Finally, let's look at edge detection.",
            editor:1,
            editorText: '/js/tutorials/tutorial02/edge.c',
			otherText: {'0':'/js/tutorials/tutorial02/edge.js'},
            complete: function(code, user, output) {
                return false;
            },
            lock: false,
            release: false,
            forceFocus: false,
            allowSkip: false
        },
    ]
};