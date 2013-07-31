var App = App || {};

App.DoctorsView = Backbone.View.extend({
	el: $( '#doctors' ),

	initialize: function() {
		this.collection = new App.Doctors();
		this.collection.fetch({reset : true});
		this.render();

		this.listenTo( this.collection, 'add', this.renderDoctor );
		this.listenTo( this.collection, 'reset', this.render );
	},

	events: {
		
	},

	// render doctors by rendering each doctor in its collection
	render: function() {
		this.collection.each(function( item ) {
			this.renderDoctor( item );
		}, this );
	},

	// render a doctor by creating a DoctorView and appending the
	// element it renders to the Doctors' element
	renderDoctor: function( item ) {
		var doctorView = new App.DoctorView({
			model: item
		});
		this.$el.append( doctorView.render().el );
	}
});

$(function() {
	var DoctorsView = new App.DoctorsView();	
})
