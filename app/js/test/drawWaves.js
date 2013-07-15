function recalc() {

 	for(var i=0; i<ilosc; i++) {
 		data[i-1] = data[i];
 		data2[i-1] = data2[i];
 	}
 	data[ilosc-1] = data[ilosc-2] + Math.random()*1 - 0.5;
 	data2[ilosc-1] = data2[ilosc-2] + Math.random()*1 - 0.5;
 	myp.data = data;
 	myp2.data = data2;
 	myp.plot();
 	myp2.plot();
 }

function preData(range, amount) {
	var arr = new Array(amount);
	for(var i=0; i<amount; i++) {
		arr[i] = (Math.random()-0.5)*range;
	}
	return arr;
}

var ilosc = 200;

var myp = new MakeDraw();

myp.id="accel-x-left";
myp.plotColor = '#1ABC9C';
myp.plot.gridClor = 'rgba(0, 0, 0, 0.05)';
myp.fSize = 12;
myp.enumerateP = 0;
myp.enumerateH = 1;
myp.enumerateV = 1;

// ========================================================

var myp2 = new MakeDraw();

myp2.id="accel-x-right";
myp2.plotColor = '#E74C3C';
myp2.plot.gridClor = 'rgba(0, 0, 0, 0.05)';
myp2.fSize = 12;
myp2.enumerateP = 0;
myp2.enumerateH = 1;
myp2.enumerateV = 1;


var data = preData(5, ilosc);
var data2 = preData(10, ilosc);

var t2 = setInterval('recalc()', 50);
var t = setInterval('recalc()', 50);

