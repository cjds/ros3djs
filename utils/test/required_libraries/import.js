var self = {console:function(){}};
var window = {requestAnimationFrame:function(){}};
var fs = require('fs');
var three = fs.readFileSync('./three.js', 'utf-8');
eval(three)

vertices = new Array();
verticeOne = new THREE.Vector3(0.0,5.0,0.0);
verticeTwo = new THREE.Vector3(5.0,0.0,0.0);

vertices[vertices.length] = verticeOne;
vertices[vertices.length] = verticeTwo;

result = new THREE.Vector3()
console.log(result.x == 0);

var file = './eventemitter2.min.js';
var EventEmitter2;

if(typeof require !== 'undefined') {
  EventEmitter2 = require(file).EventEmitter2;
}
else {
  EventEmitter2 = window.EventEmitter2;
}

var emitter = new EventEmitter2({verbose: true});
console.log(emitter.newListener == false);

console.log(EventEmitter2.prototype);


// var ROSLIB = fs.readFileSync('./roslib.js', 'utf-8');
// eval(ROSLIB)

