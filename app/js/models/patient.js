var App = App || {};

App.Patient = Backbone.Model.extend({
	defaults: {
		//photo: 'img/default-user.png',
		username: 'Unknown',
		//created_time: "2013-07-10"
	},

	idAttribute: '_id'
});