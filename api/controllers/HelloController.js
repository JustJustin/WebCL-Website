/**
 * HelloController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    index: function(req, res) {
		var fs = require("fs");
	
        var fspath = fs.realpathSync( "./" );
		
		var response = "<html><head><title>Hello World!</title></head><body><h1>Hello</h1><div>"+fspath+"</body></html>";
        
		
		//res.send( response );
		return res.view({ fspath: fspath });
    },
  
    /* Override routes */
    routes: {
    'get /hello': {
        controller: 'hello',
        action: 'index'
        }
    },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HelloController)
   */
  _config: {}

  
};
