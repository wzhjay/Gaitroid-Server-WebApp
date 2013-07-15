// Namespace for the project
var Gaitroid = {};
_.extend(Gaitroid, Backbone.Events);

$.get("../../html/header.html", function(data){$("#header").append(data);})
$.get("../../html/footer.html", function(data){$("#footer").append(data);})