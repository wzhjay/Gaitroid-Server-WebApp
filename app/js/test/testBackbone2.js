(function() {

	function dancing (msg) { console.log("We started " + msg); }

	Gaitroid.on("dance:tap", dancing);
	Gaitroid.on("dance:break", dancing);

	function doAction (action, duration) {
	  console.log("We are " + action + ' for ' + duration ); 
	}
	// Add event listeners
	Gaitroid.on("dance", doAction);
	Gaitroid.on("jump", doAction);
	Gaitroid.on("skip", doAction);

})();
