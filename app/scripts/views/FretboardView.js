/*
	To Do:
		Divide strings into segments for heatmapping

		Setup note track with automatic scrolling.
*/

function randomColor(){
	return Math.floor(Math.random() * 0xffffff);
}


/*
	World class handles scene creation, and basic camera interface.
*/
GuitarTrainer.World = Ember.Object.extend({
	world: null,
	camera: null,
	camLight: null,

	init: function(){
		this._super();
		var world = tQuery.createWorld().boilerplate();
		world.tRenderer().setClearColorHex( 0x000000, world.tRenderer().getClearAlpha());
		//tQuery.createAmbientLight().color(0xffffff).addTo(world);
		var camera = world._camera;
		var light = tQuery.createPointLight().position(0, 0, 0).color(0xffffff);
		light.addTo(world);

		this.set("world", world);

		this.set("camera", camera);
		this.set("tQCamera", tQuery(camera));
		this.set("camLight", light);
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

	add: function(tq){
		tq.addTo(this.get("world"));
	},

	tweenPosTo: function(obj, target, time){
		new TWEEN.Tween(obj.position).to(target, time).easing(TWEEN.Easing.Quadratic.InOut).start();
	},

	panTo: function(pos, time){
		var camera = this.get("camera");
		var camLight = this.get("camLight");
		var target = {
			x: pos.x || camera.position.x,
			y: pos.y || camera.position.y,
			z: pos.z || camera.position.z
		};
		this.tweenPosTo(camera, target, time);
		this.tweenPosTo(camLight, target, time);
	},

	panBy: function(vector, time){
		var camera = this.get("camera");
		var camLight = this.get("camLight");
		this.tweenPosBy(camera, vector, time);
		this.tweenPosBy(camLight, vector, time);
	},

	panRight: function(){
		this.panBy({x: 5, y: 0, z: 0}, 200);
	},

	panLeft: function(){
		this.panBy({x: -5, y: 0, z: 0}, 200);
	},

	zoomIn: function(){
		this.panBy({x: 0, y: 0, z: -5}, 200);
	},

	zoomOut: function(){
		this.panBy({x: 0, y: 0, z: 5}, 200);
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
		this.get("tQCamera").rotate(-0.2, 0.25, 0);
		world.loop().hook(function(){
			TWEEN.update();
		});

		this.panTo({x: 12, y: 7, Z: 1}, 200);
	},

	stop: function(){
		this.get("world").stop();
	}
});

GuitarTrainer.StringView = Ember.Object.extend({
	world: null,
	string: null,
	color: 0xff0000,
	opacity: 1,
	phongMaterial: function(){
		return new THREE.MeshPhongMaterial({
			color: this.get("color"),
			opacity: this.get("opacity")
		});
	}.property("color"),
	lambertMaterial: function(){
		return new THREE.MeshLambertMaterial({
			color: this.get("color"),
			opacity: this.get("opacity")
		});
	}.property("color"),
	diameter: 0.1,
	segments: null,
	fretPositions: null,
	yPos: 0,
	zPos: 0,

	init: function(){
		this._super();
		this.segments = [];
		this.makeSegments();
	},

	makeSegments: function(){
		var world = this.get("world");
		var string = this.get("string");
		var segments = this.get("segments");
		var numSegments = string.get("numFrets");
		var fretPositions = this.get("fretPositions");
		var phongMaterial = this.get("phongMaterial");
		var lambertMaterial = this.get("lambertMaterial");
		var diameter = this.get("diameter");
		var halfPi = Math.PI/2;
		// fretOffset is the number of skipped frets for any irregular instruments (such as a banjo)
		var fretOffset = fretPositions.length - numSegments - 1; // Subtract one, because there is a 0 fret at the nut.
		var yPos = this.get("yPos"), zPos = this.get("zPos");
		for(var i=0; i<numSegments; i++){
			var fretIndex = fretOffset + i;
			var fretPos1 = fretPositions[fretIndex], fretPos2 = fretPositions[fretIndex + 1];
			var fretLength = fretPos2 - fretPos1;
			var fretCenter = (fretPos1 + fretPos2) / 2;
			var segment = tQuery.createCylinder((i%2)?phongMaterial:lambertMaterial).addClass("string").rotate(0, 0, halfPi).scale(diameter, fretLength, diameter).translate(fretCenter, yPos, zPos);
			//segment.get(0).material.color.setRGB(1, 1, 1);
			segments.push(segment);
			world.add(segment);
		}
	}
});

GuitarTrainer.FretboardView = Ember.Object.extend({
	world: null,
	instrument: null,
	/*
		stringLength is the distance between the bridge and the nut for the longest string,
		which extends beyond the fretboard.
		Frets are assumed to be aligned for irregular strings (such as on a banjo)
	*/
	stringLength: 50,

	fretPositions: function(){
		var k = Math.pow(2, 1/12);
		var divisor = 1;
		var stringLength = this.get("stringLength");
		var numFrets = this.get("instrument").get("totalLength");
		var positions = [];

		for(var i=0; i<=numFrets; i++){
			var distFromBridge = stringLength/divisor;
			positions.push(stringLength - distFromBridge);
			divisor *= k;
		}
		return positions;
	}.property("stringLength", "numFrets"),

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

	makeStrings: function(){
		var world = this.get("world");
		var halfPi = Math.PI/2;
		var colors = [0xff00ff, 0x00ff00, 0xff8800, 0x0000ff, 0xffff00, 0xff0000];
		var fretPositions = this.get("fretPositions");

		for(var i=0; i<6; i++){
			//var newString = tQuery.createCylinder(new THREE.MeshBasicMaterial({color: colors[i], opacity: 1})).addClass("string").rotate(0, 0, halfPi).scale(0.1, 50, 0.1).translate(25, i*0.55, -18);
			//world.add(newString);
			var string = this.get("instrument").get("strings")[i];
			var newString = GuitarTrainer.StringView.create({
				world: world,
				string: string,
				fretPositions: fretPositions,
				color: colors[i],
				yPos: i * 0.55,
				zPos: -18
			});
		}
	},

	makeFrets: function(){
		// Do tracks and frets, because they have the same spacing, and it's dumb to do the math again.
		var world = this.get("world");
		var fretPositions = this.get("fretPositions");
		var len = fretPositions.length;

		for(var i=0; i<len; i++){
			var x = fretPositions[i];

			var fret = tQuery.createCube(new THREE.MeshLambertMaterial({color: 0x888888, opacity: 1})).addClass("fret").scale(0.1, 3.5, 0.1).translate(x, 1.4, -17.8);
			world.add(fret);

			var track = tQuery.createCube(new THREE.MeshPhongMaterial({color: 0xaaaaff})).addClass("track").scale(0.05, 0.05, 100).translate(x, 0, -67.8);
			world.add(track);
		}
	},

	makeDots: function(){
		var world = this.get("world");
		var dotPositions = this.get("dotPositions");
		var len = dotPositions.length;

		for(var i=0; i<len; i++){
			var x = dotPositions[i];
			var dot = tQuery.createSphere(new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 1})).addClass("dot").scale(0.2, 0.2, 0.2).translate(x, 1.4, -17.8);
			world.add(dot);
		}
	},

	drawInstrument: function(){
		this.makeStrings();
		this.makeFrets();
		this.makeDots();
	},

	panToFret: function(fret){
		var world = this.get("world");
		if(fret > this.numFrets){
			fret = this.numFrets;
		}
		else if(fret < 0){
			fret = 0;
		}
		var targetX = this.get("fretPositions")[fret];
		world.panTo({x: targetX}, 200);
	}
});


var world = GuitarTrainer.World.create();
world.start();
var fretboard = GuitarTrainer.FretboardView.create({world: world, instrument: GuitarTrainer.Guitar});

fretboard.drawInstrument();

$(document).keydown(function(e){
	if(e.keyCode == 65){ // A
		world.panLeft();
	}
	if(e.keyCode == 68){ // D
		world.panRight();
	}
	if(e.keyCode == 83){ // S
		world.zoomOut();
	}
	if(e.keyCode == 87){ // W
		world.zoomIn();
	}
	if(e.keyCode == 81){ // Q
		world.turnLeft();
	}
	if(e.keyCode == 69){ // E
		world.turnRight();
	}
	if(e.keyCode >= 48 && e.keyCode <= 57){ // Num keys
		var keyVal = e.keyCode - 48;
		fretboard.panToFret(keyVal * 4);
	}
});