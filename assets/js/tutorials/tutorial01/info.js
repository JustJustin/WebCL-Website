var tutorial_data = 
{
    name:"Vector Operations",
    steps:
    [   
        {
            text:"Write [code]print('hello');[/code]",
            editor:0,
            editorText:'/js/tutorials/tutorial01/start.js',
            otherText:  {'1':'/js/tutorials/tutorial01/start.c' },
            complete: function(code, user, output) {
                var reg = /print\(['"]hello['"]\);/gi;
                if( reg.exec( code ) ) {
                    return true;
                }
            },
            lock: false,
            force_focus: false,
        }, {
            text:"Write [code]int ac;[/code]",
            editor:1,
            editorText: false,
            complete: function(code, user, output) {
                var reg = /int ac;/gi;
                if( reg.exec( code ) ) {
                    return true;
                }
                return false;
            },
            lock: false,
            release: true,
            force_focus: true,
            allow_skip: true
        }, {
            text: "Skip me!",
            editor: 0,
            editorText: "Blank",
            complete: false,
            lock: true,
            force_focus: true
        }
    ]
};