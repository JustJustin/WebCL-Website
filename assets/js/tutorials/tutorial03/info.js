var tutorial_data =
{
    name:"Particles",
    steps:
    [
        {
            text:"Welcome to the particles tutorial!",
            editor:1,
            editorText: '/js/tutorials/tutorial03/kernel.cl',
            otherText: {'0':'/js/tutorials/tutorial03/tut3.js', '2' : '/js/tutorials/tutorial03/start.html' },
            complete: function(code, user, output) {
                return false;
            },
            lock: false,
            forceFocus: false,
			allowSkip: true
        }
    ]
};