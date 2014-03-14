
var tutorial_data = 
{
    tutorial1: {
        name:"Introduction",
        lessons: [
            {
                name:"Hello World",
                steps:
                [
                    { text: "Hi, for your first step try typing [code]echo \"Hello World\"[/code]",
                      completion: function( code, user, output ) {
                          var reg = /echo ["']Hello World["']/gi;
                          if( reg.exec(code) )
                          {
                              return true;
                          }
                          return false;
                      }
                    }
                ]
            }
        ]
    }
};