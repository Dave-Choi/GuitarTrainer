/*
	To Do:
		Add go to fret method
*/

GuitarTrainer.FretboardView = Ember.Object.extend({
	world: null,
	fretboardLength: 50,
	numFrets: 22,
	fretPositions: function(){
		var k = Math.pow(2, 1/12);
		var divisor = 1;
		var boardLength = this.fretboardLength;
		var numFrets = this.numFrets;
		var positions = [];

		for(var i=0; i<=numFrets; i++){
			var distFromBridge = boardLength/divisor;
			positions.push(boardLength - distFromBridge);
			divisor *= k;
		}
		return positions;
	}.property("fretboardLength", "numFrets"),

	dotPositions: function(){
		var fretPositions = this.get("fretPositions");
		var dotFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
		var i, len = dotFrets.length;
		var positions = [];
		for(i=0; i<len; i++){
			var fretNum = dotFrets[i];
			if(fretNum > this.numFrets){
				return positions;
			}
			var fretPos1 = fretPositions[fretNum-1], fretPos2 = fretPositions[fretNum];
			positions.push((fretPos1 + fretPos2)/2);
		}
		return positions;
	}.property("fretPositions"),

	camera: function(){
		return tQuery(this.world._camera);
	}.property("world"),

	setupWorld: function(){
		this.set("world", tQuery.createWorld().boilerplate());
		this.makeStrings();
		this.makeFrets();
		this.makeDots();
	},

	makeStrings: function(){
		var world = this.get("world");
		var halfPi = Math.PI/2;
		var colors = [0xff00ff, 0x00ff00, 0xff8800, 0x0000ff, 0xffff00, 0xff0000];

		for(var i=0; i<6; i++){
			var newString = tQuery.createCylinder(new THREE.MeshBasicMaterial({color: colors[i], opacity: 1})).addClass("string").addTo(world).rotate(0, 0, halfPi).scale(0.1, 50, 0.1).translate(25, i*0.55, -18);
		}
	},

	makeFrets: function(){
		// Do tracks and frets, because they have the same spacing, and it's dumb to do the math again.
		var world = this.get("world");
		var fretPositions = this.get("fretPositions");
		var len = fretPositions.length;

		for(var i=0; i<len; i++){
			var x = fretPositions[i];
			var fret = tQuery.createCube(new THREE.MeshBasicMaterial({color: 0x888888, opacity: 1})).addClass("fret").addTo(world).scale(0.1, 3.5, 0.1).translate(x, 1.4, -17.8);
			var track = tQuery.createCube(new THREE.MeshBasicMaterial({color: 0xaaaaff})).addClass("track").addTo(world).scale(0.05, 0.05, 100).translate(x, 0, -67.8);
		}
	},

	makeDots: function(){
		var world = this.get("world");
		var dotPositions = this.get("dotPositions");
		var len = dotPositions.length;

		for(var i=0; i<len; i++){
			var x = dotPositions[i];
			console.log(x);
			var dot = tQuery.createSphere(new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 1})).addClass("dot").addTo(world).scale(0.2, 0.2, 0.2).translate(x, 1.4, -17.8);
		}
	},

	tweenPosBy: function(obj, vector, time){
		var currPos = obj.position;
		var target = {
			x: currPos.x + vector.x,
			y: currPos.y + vector.y,
			z: currPos.z + vector.z
		};
		new TWEEN.Tween(obj.position).to(target, time).easing(TWEEN.Easing.Quadratic.InOut).start();
	},

	tweenPosTo: function(obj, target, time){
		new TWEEN.Tween(obj.position).to(target, time).easing(TWEEN.Easing.Quadratic.InOut).start();
	},

	panToFret: function(fret){
		console.log("target: " + fret);
		if(fret > this.numFrets){
			fret = this.numFrets;
		}
		else if(fret < 0){
			fret = 0;
		}
		var targetX = this.get("fretPositions")[fret];
		var camera = this.world._camera;
		var target = {x: targetX, y: camera.position.y, z: camera.position.z};
		//target.x = targetX;
		this.tweenPosTo(this.world._camera, target, 200);
	},

	panRight: function(){
		this.tweenPosBy(this.world._camera, {x: 5, y: 0, z: 0}, 200);
	},

	panLeft: function(){
		this.tweenPosBy(this.world._camera, {x: -5, y: 0, z: 0}, 200);
	},

	zoomIn: function(){
		this.tweenPosBy(this.world._camera, {x: 0, y: 0, z: -5}, 200);
	},

	zoomOut: function(){
		this.tweenPosBy(this.world._camera, {x: 0, y: 0, z: 5}, 200);
	},

	turnLeft: function(){
		this.get("camera").rotate(0, 0.05, 0);
	},

	turnRight: function(){
		this.get("camera").rotate(0, -0.05, 0);
	},

	start: function(){
		var world = this.get("world");
		world.start();
		world.removeCameraControls();
		this.get("camera").rotate(-0.2, 0.25, 0).translate(12, 7, 1);
		world.loop().hook(function(){
			TWEEN.update();
		});
	},

	stop: function(){
		this.get("world").stop();
	}

});

var fretboard = GuitarTrainer.FretboardView.create();
fretboard.setupWorld();
fretboard.start();
$(document).keydown(function(e){
	if(e.keyCode == 65){ // A
		fretboard.panLeft();
	}
	if(e.keyCode == 68){ // D
		fretboard.panRight();
	}
	if(e.keyCode == 83){ // S
		fretboard.zoomOut();
	}
	if(e.keyCode == 87){ // W
		fretboard.zoomIn();
	}
	if(e.keyCode == 81){ // Q
		fretboard.turnLeft();
	}
	if(e.keyCode == 69){ // E
		fretboard.turnRight();
	}
	if(e.keyCode >= 48 && e.keyCode <= 57){ // Num keys
		var keyVal = e.keyCode - 48;
		fretboard.panToFret(keyVal * 4);
	}
});