/**
 * Users
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
 
// Create a bcrypt instance
var bcrypt = require('bcrypt');
 
module.exports = {
	attributes: {
		userid: {
			type: 'INTEGER'
		},
		username: {
			type: 'STRING',
			required: true
		},
		password: {
			type: 'STRING',
			required: true,
			minLength: 8
		},
		email: {
			type: 'STRING',
			email: true
		}
	}

	// Override the adapter
	//adapter: 'memory',

	// Lifecycle Callbacks
	// Before creating an instance hash the password
	beforeCreate: function(values, next) {
		bcrypt.hash(values.password, 10, function(err, hash) {
			if (err) {
				return next(err);
			}
			values.password = hash;
			next();
		});
	}
};