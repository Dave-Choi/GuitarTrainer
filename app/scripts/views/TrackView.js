GuitarTrainer.TrackView = Ember.Object.extend({
	world: null,
	targets: null,
	fretboardView: null,
	length: 100,
	delay: 5000, // Time (ms) it will take from the moment the note appears until it's time to hit it.
	time: 0, // Used to evaluate when to create targets
	mesh: null,

	init: function(){
		var world = this.get("world");
		var fretboardView = this.get("fretboardView");
		var trackLength = this.get("length");
		var trackOffset = -trackLength/2;
		var mergedGeometry = new THREE.Geometry();

		var fretPositions = fretboardView.get("fretPositions");
		var i, x, y = -0.2525, numFrets = fretPositions.length;
		for(i=0; i<numFrets; i++){
			x = fretPositions[i];
			var track = GuitarTrainer.ShapeFactory.cube({width: 0.07, height: 0.05, depth: trackLength, color: 0xaaaaff});
			track.position = {x: x, y: y, z: trackOffset};
			THREE.GeometryUtils.merge(mergedGeometry, track);
		}

		var dotPositions = fretboardView.get("dotPositions");
		var dotFrets = fretboardView.get("dotFrets");
		var numDots = dotFrets.length;
		for(i=0; i<numDots; i++){
			var fretIndex = dotFrets[i]-1;
			x = fretboardView.fretCenter(fretIndex);
			var width = fretboardView.fretWidth(fretIndex);
			var dotLane = GuitarTrainer.ShapeFactory.cube({width: width, height: 0.05, depth: trackLength, color: 0xaaaaff});
			dotLane.position = {x: x, y: y, z: trackOffset};
			THREE.GeometryUtils.merge(mergedGeometry, dotLane);
		}

		var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshLambertMaterial({color:  0xbbbbff}));
		this.set("mesh", mesh);
		world.add(mesh);
	},

	spawnTarget: function(target, viewType, stringIndex, fretIndex){
		var world = this.get("world");
		var fretboardView = this.get("fretboardView");
		var stringSpacing = fretboardView.get("stringSpacing");
		var position = {x: fretboardView.fretCenter(fretIndex), y: stringSpacing * stringIndex, z: -this.get("length")};
		var dimensions = {x: fretboardView.fretWidth(fretIndex), y: fretboardView.get("stringSpacing"), z: fretboardView.get("stringSpacing")};
		var color = fretboardView.stringColor(stringIndex);
		var targetView = viewType.create({
			world: world,
			target: target,
			position: position,
			dimensions: dimensions,
			color: color
		});
		targetView.draw();
		var node = targetView.get("sceneNode");
		new TWEEN.Tween(node.position).to({x: node.position.x, y: node.position.y, z: 0}, this.get("delay")).start();
	}
});