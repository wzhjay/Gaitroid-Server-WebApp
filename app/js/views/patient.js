var App = App || {};

App.PatientView = Backbone.View.extend({
	tagName: 'div',
	className: 'patientContainer',
	template: $('#patientTemplate').html(),

	events: {
		// 'click .delete': 'deletePatient'
	},

	render: function() {
		//tmpl is a function that takes a JSON object and returns html
		var tmpl = _.template( this.template);

		console.log(this.model.toJSON().username);
		//this.el is what we defined in tagName. use $el to get access to jQuery html() function
		$(this.el).html( tmpl( this.model.toJSON()));
		
		return this;
	}
});