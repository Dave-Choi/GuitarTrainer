/*
	To Do:
		Divide strings into segments for heatmapping

		Setup note track with automatic scrolling.
*/

function randomColor(){
	return Math.floor(Math.random() * 0xffffff);
}


GuitarTrainer.ShapeFactory = Ember.Object.create({
	// TODO: Refactor this into sexy abstract stuff.  Too tired to think right now.
	sphere: function(args){
		args = args || {};
		var defaults = {
			color: 0xffffff,
			radius: 0.5,
			segments: 15,
			rings: 15
		};
		function getArg(name){
			return args[name] || defaults[name];
		}
		var material = new THREE.MeshPhongMaterial({
			color: getArg("color")
		});
		var geometry = new THREE.SphereGeometry(
			getArg("radius"),
			getArg("segments"),
			getArg("rings")
		);
		return new THREE.Mesh(geometry, material);
	},

	cylinder: function(args){
		args = args || {};
		var defaults = {
			color: 0xffffff,
			radiusTop: 0.5,
			radiusBottom: 0.5,
			height: 1,
			radiusSegments: 15,
			heightSegments: 15,
			openEnded: false
		};
		function getArg(name){
			return args[name] || defaults[name];
		}
		var material = new THREE.MeshPhongMaterial({
			color: getArg("color")
		});
		var geometry = new THREE.CylinderGeometry(
			getArg("radiusTop"),
			getArg("radiusBottom"),
			getArg("height"),
			getArg("radiusSegments"),
			getArg("heightSegments"),
			getArg("openEnded")
		);
		return new THREE.Mesh(geometry, material);
	},

	cube: function(args){
		args = args || {};
		var defaults = {
			color: 0xffffff,
			width: 1,
			height: 1,
			depth: 1,
			widthSegments: 1,
			heightSegments: 1,
			depthSegments: 1
		};
		function getArg(name){
			return args[name] || defaults[name];
		}
		var material = new THREE.MeshPhongMaterial({
			color: getArg("color")
		});
		var geometry = new THREE.CubeGeometry(
			getArg("width"),
			getArg("height"),
			getArg("depth"),
			getArg("widthSegments"),
			getArg("heightSegments"),
			getArg("depthSegments")
		);
		return new THREE.Mesh(geometry, material);
	}
});

/*
	World class handles scene creation, and basic camera interface.
*/
GuitarTrainer.World = Ember.Object.extend({
	scene: null,
	renderer: null,
	composer: null,
	camera: null,
	camLight: null,

	init: function(){
		this._super();
		var $container = $("#exercise");
		var height = $container.height(), width = $container.width();
		var scene = new THREE.Scene();

		var renderer = new THREE.WebGLRenderer({
			clearColor: 0x000000,
			clearAlpha: 1,
			antialias: false
		});
		renderer.setSize(width, height);
		renderer.autoClear = false;

		var initialPosition = {x: 12, y: 7, z: 18};

		var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
		camera.position = initialPosition;
		camera.rotation = {x: -0.2, y: 0.25, z: 0};
		var light = new THREE.PointLight(0xffffff);
		light.position = initialPosition;

		scene.add(camera);
		scene.add(light);

		var renderPass = new THREE.RenderPass(scene, camera);
		var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
		var effectBloom = new THREE.BloomPass(1.3);
		var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
		effectCopy.renderToScreen = true;

		var composer = new THREE.EffectComposer(renderer);
		composer.addPass(renderPass);
		composer.addPass(effectFXAA);
		composer.addPass(effectBloom);
		composer.addPass(effectCopy);

		this.set("renderer", renderer);
		this.set("composer", composer);
		this.set("scene", scene);
		this.set("camera", camera);
		this.set("camLight", light);

		$container.append(renderer.domElement);
		//renderer.setClearColorHex(0x000000, renderer.getClearAlpha());

		renderer.render(scene, camera);
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

	render: function(){
		var renderer = this.get("renderer");
		var composer = this.get("composer");
		var scene = this.get("scene");
		var camera = this.get("camera");
		TWEEN.update();
		renderer.clear();
		composer.render();
	},

	add: function(obj){
		this.get("scene").add(obj);
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
		var radius = this.get("diameter")/2;
		var halfPi = Math.PI/2;
		// fretOffset is the number of skipped frets for any irregular instruments (such as a banjo)
		var fretOffset = fretPositions.length - numSegments - 1; // Subtract one, because there is a 0 fret at the nut.
		var yPos = this.get("yPos"), zPos = this.get("zPos");
		for(var i=0; i<numSegments; i++){
			var fretIndex = fretOffset + i;
			var fretPos1 = fretPositions[fretIndex], fretPos2 = fretPositions[fretIndex + 1];
			var fretLength = fretPos2 - fretPos1;
			var fretCenter = (fretPos1 + fretPos2) / 2;
			var segment = GuitarTrainer.ShapeFactory.cylinder({radiusTop: radius, radiusBottom: radius, height: fretLength, color: this.get("color")});
			segment.position = {x: fretCenter, y: yPos, z: zPos};
			segment.rotation = {x: 0, y: 0, z: halfPi};
			segments.push(segment);
			world.add(segment);
		}
	}
});

GuitarTrainer.HeatmapStringView = GuitarTrainer.StringView.extend({
	ampToOpacity: function(amp){
		return Math.max(0.1, amp * 100);
	},

	update: function(pitchDetectionNode){
		/*
			The string notes include the string's open note, i.e. fret 0, i.e. the nut
			Check the 0 fret first, and use it as a baseline for the whole string.
		*/
		var string = this.get("string");
		var notes = string.get("notes");
		var segments = this.get("segments");
		var len = notes.length;
		var rootFreq = string.get("root").get("frequency");
		var rootAmp = pitchDetectionNode.frequencyAmplitude(rootFreq);
		for(var i=1; i<len; i++){
			var note = notes[i];
			var freq = note.get("frequency");
			var amp = rootAmp + pitchDetectionNode.frequencyAmplitude(freq);
			var segment = segments[i-1];
			segment.material.opacity = this.ampToOpacity(amp);
		}
	}
});

GuitarTrainer.TrackView = Ember.Object.extend({
	world: null,
	instrument: null,
	fretPositions: null,
	stringSpacing: 0.55,
	length: 100,

	init: function(){
		var world = this.get("world");
		var fretPositions = this.get("fretPositions");
		var trackLength = this.get("length");
		var len = fretPositions.length;
		for(var i=0; i<len; i++){
			var x = fretPositions[i];
			var track = GuitarTrainer.ShapeFactory.cube({width: 0.05, height: 0.05, depth: trackLength, color: 0xaaaaff});
			track.position = {x: x, y: 0, z: -trackLength/2};
			world.add(track);
		}
	}
});

GuitarTrainer.FretboardView = Ember.Object.extend({
	world: null,
	instrument: null,
	stringViews: null,
	/*
		stringLength is the distance between the bridge and the nut for the longest string,
		which extends beyond the fretboard.
		Frets are assumed to be aligned for irregular strings (such as on a banjo)
	*/
	stringLength: 50,
	stringSpacing: 0.55, // Vertical space between strings

	// These colors and orientation reflect the Rocksmith string coloring
	stringColors: [0xff0000, 0xffff00, 0x0000ff, 0xff8800, 0x00ff00, 0xff00ff],
	flipped: true,  // If flipped is true, the red (low E) string is shown on top, mirroring a right handed guitar

	// Can be configured to use different string views,
	stringType: GuitarTrainer.StringView,

	init: function(){
		this._super();
		this.set("stringViews", []);
	},

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
		var flipped = this.get("flipped");
		var colors = this.get("stringColors");

		var fretPositions = this.get("fretPositions");
		var stringViews = [];
		var stringSpacing = this.get("stringSpacing");
		var stringType = this.get("stringType");

		var strings = this.get("instrument").get("strings");
		var numStrings = strings.length;

		for(var i=0; i<numStrings; i++){
			var string = strings[i];
			var newString = stringType.create({
				world: world,
				string: string,
				fretPositions: fretPositions,
				color: colors[i],
				yPos: (flipped)?
					(numStrings-i-1) * stringSpacing
					: i * stringSpacing,
				zPos: -0.5
			});
			stringViews.push(newString);
		}

		this.set("stringViews", stringViews);
	},

	makeFrets: function(){
		// Do tracks and frets, because they have the same spacing, and it's dumb to do the math again.
		var world = this.get("world");
		var fretPositions = this.get("fretPositions");
		var len = fretPositions.length;

		for(var i=0; i<len; i++){
			var x = fretPositions[i];

			var fret = GuitarTrainer.ShapeFactory.cube({width: 0.1, height: 3.5, depth: 0.1, color: 0x888888});
			fret.position = {x: x, y: 1.4, z: 0};
			world.add(fret);
		}
	},

	makeDots: function(){
		var world = this.get("world");
		var dotPositions = this.get("dotPositions");
		var len = dotPositions.length;

		for(var i=0; i<len; i++){
			var x = dotPositions[i];
			var dot = GuitarTrainer.ShapeFactory.sphere({color: 0xff0000, radius: 0.1});
			dot.position = {x: x, y: 1.4, z: -0.5};
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

GuitarTrainer.HeatmapFretboardView = GuitarTrainer.FretboardView.extend({
	pitchDetectionNode: null,
	stringType: GuitarTrainer.HeatmapStringView,

	update: function(){
		var strings = this.get("stringViews");
		var pdNode = this.get("pitchDetectionNode");
		var len = strings.length;
		for(var i=0; i<len; i++){
			strings[i].update(pdNode);
		}
	}
});


var world = GuitarTrainer.World.create();
// pitchDetectionNode is initialized in PitchDetectionNode.js right now.  This is total shit and needs to be reorganized.
var fretboard = GuitarTrainer.HeatmapFretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode});
fretboard.drawInstrument();
var fretPositions = fretboard.get("fretPositions");
var stringSpacing = fretboard.get("stringSpacing");
var track = GuitarTrainer.TrackView.create({world: world, instrument: GuitarTrainer.Guitar, fretPositions: fretPositions, stringSpacing: stringSpacing});

function render(){
	requestAnimationFrame(render);
	fretboard.update();
	world.render();
}
requestAnimationFrame(render);

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