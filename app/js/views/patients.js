var App = App || {};

App.PatientsView = Backbone.View.extend({
	el: $( '#patients' ),

	initialize: function() {
		this.collection = new App.Patients();
		this.collection.fetch({reset : true});
		this.render();

		this.listenTo( this.collection, 'add', this.renderPatient );
		this.listenTo( this.collection, 'reset', this.render );
	},

	events: {
		
	},

	// render patients by rendering each patient in its collection
	render: function() {
		this.collection.each(function( item ) {
			this.renderPatient( item );
		}, this );
	},

	// render a book by creating a PatientView and appending the
	// element it renders to the Patients' element
	renderPatient: function( item ) {
		var patientView = new App.PatientView({
			model: item
		});
		this.$el.append( patientView.render().el );
	}
});

$(function() {
	var PatientsView = new App.PatientsView();	
})
