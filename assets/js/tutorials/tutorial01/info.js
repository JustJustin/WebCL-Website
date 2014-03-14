var tutorial_data = 
{
    name:"Introduction",
    lessons: [
        {
            name:"Vector Operations",
            steps:
            [
                { text: "Hi, for your first step try changing the addition to subtraction.",
                  completion: function( code, user, output ) {
                      var reg = /A\[x\] = B\[x\] + C\[x\];/gi;
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

};