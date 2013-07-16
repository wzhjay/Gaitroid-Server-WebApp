// Namespace for the project
var Gaitroid = {};
_.extend(Gaitroid, Backbone.Events);

var getHeader = function(loopH) {
	var jdxhr = $.get("../../html/header.html", function(data){
		$("#header").append(data);
	})
	.fail(function() {
		loopH = true;
	})
	.done(function() {
		loopH = false;
	});
}

var getFooter = function(loopF) {
	var jdxhr = $.get("../../html/footer.html", function(data){
		$("#footer").append(data);
	})
	.fail(function() {
		loopF = true;
	})
	.done(function() {
		loopF = false;
	});
}

var loopH = false, 
	loopF = false;

do {
	var header = getHeader(loopH);

} while(loopH)

do {
	var footer = getFooter(loopF);

} while(loopF)
