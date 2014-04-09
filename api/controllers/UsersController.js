/**
 * UsersController
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
	login: function (req, res) {
		var username = req.param("username");
		var password = req.param("password");
		var bcrypt = require('bcrypt');
		
		Users.findOneByEmail(req.body.email).done(function (err, user) {
			if (err) {
				res.json({ error: 'DB error' }, 500);
			}

			if (user) {
				bcrypt.compare(req.body.password, user.password, function (err, match) {
					if (err) {
						res.json({ error: 'Server error' }, 500);
					}

					if (match) {
						// password match
						req.session.user = user.id;
						res.json(user);
					} else {
						// invalid password
						if (req.session.user) {
							req.session.user = null;
						}
						res.json({ error: 'Invalid password' }, 400);
					}
				});
			} else {
				res.json({ error: 'User not found' }, 404);
			}
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UsersController)
   */
  _config: {}

  
};

/*
// Load hash from your password DB.
bcrypt.compare(password, hash, function(err, res) {
    // res === (true | false)
});
*/