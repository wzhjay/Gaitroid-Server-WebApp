var App = App || {};

App.Doctors = Backbone.Collection.extend({
	model: App.Doctor,
	url: '/api/Doctors'
});