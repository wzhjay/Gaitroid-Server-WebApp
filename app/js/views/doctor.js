var App = App || {};

App.DoctorView = Backbone.View.extend({
	tagName: 'div',
	className: 'doctorContainer',
	template: $('#doctorTemplate').html(),

	events: {

	},

	render: function() {
		//tmpl is a function that takes a JSON object and returns html
		var tmpl = _.template( this.template);

		//this.el is what we defined in tagName. use $el to get access to jQuery html() function
		$(this.el).html( tmpl( this.model.toJSON()));
		
		return this;
	}
});