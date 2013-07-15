var App = App || {};

App.Patients = Backbone.Collection.extend({
	model: App.Patient,
	url: '/api/Patients'
});

// App.Patients = new App.Patients();