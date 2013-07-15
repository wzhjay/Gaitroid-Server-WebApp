(function() {

	// Trigger the custom events
	Gaitroid.trigger("dance:tap", "tap dancing. Yeah!");
	Gaitroid.trigger("dance:break", "break dancing. Yeah!");

	// Passing multiple arguments to multiple events
	Gaitroid.trigger("dance jump skip", 'on fire', "15 minutes");
})();