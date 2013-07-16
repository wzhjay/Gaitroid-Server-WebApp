var App = App || {};
var Gaitroid = {};

function loadCSS(css) {
	var link;

	if ($.isArray(css)) {
	    $.each(css, function (idx, lk) {
	        loadCSS(lk);
	    });
	} else {
	    link = document.createElement("link");
	    link.type = "text/css";
	    link.rel = "stylesheet";
	    link.href = css;
	    document.getElementsByTagName("head")[0].appendChild(link);
	}
};

function loadJS(css, callback) {
	var link;

	if ($.isArray(css)) {
	    $.each(css, function (idx, lk) {
	        loadJS(lk);
	    });
	} else {
	    link = document.createElement("script");
	    link.rel = "javascript";
	    link.src = css;
	    document.getElementsByTagName("head")[0].appendChild(link);
	}
};

loadCSS([
	"/css/libs/bootstrap.css",
	"/css/docs.css",
	"/css/libs/toastr.min.css"
]);

loadJS([
	"/js/libs/underscore.js",
	"/js/libs/bootstrap.min.js",
	"/js/libs/backbone.js",
	"/js/test/bootstrap.js",
	"/js/models/patient.js",
	"/js/collections/patients.js",
	"/js/views/patient.js",
	"/js/views/patients.js",
	"/js/test/testBackbone2.js",
	"/js/test/testBackbone.js",
	"/js/libs/toastr.min.js",
	"/js/libs/store.min.js"
]);