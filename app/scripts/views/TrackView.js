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
		var fretPositions = this.get("fretboardView").get("fretPositions");
		var trackLength = this.get("length");
		var trackOffset = -trackLength/2;
		var len = fretPositions.length;
		var mergedGeometry = new THREE.Geometry();
		for(var i=0; i<len; i++){
			var x = fretPositions[i];
			var track = GuitarTrainer.ShapeFactory.cube({width: 0.05, height: 0.05, depth: trackLength, color: 0xaaaaff});
			track.position = {x: x, y: 0, z: trackOffset};
			THREE.GeometryUtils.merge(mergedGeometry, track);
		}
		var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshPhongMaterial({color:  0xaaaaff}));
		this.set("mesh", mesh);
		world.add(mesh);
	},

	spawnTarget: function(target, viewType, stringIndex, fretIndex){
		var world = this.get("world");
		var fretboardView = this.get("fretboardView");
		var stringSpacing = fretboardView.get("stringSpacing");
		var position = {x: fretboardView.fretCenter(fretIndex), y: stringSpacing * stringIndex, z: -this.get("length")};
		var dimensions = {x: fretboardView.fretWidth(fretIndex), y: fretboardView.get("stringSpacing"), z: fretboardView.get("stringSpacing")};
		var targetView = viewType.create({
			world: world,
			target: target,
			position: position,
			dimensions: dimensions
		});
		targetView.draw();
		var node = targetView.get("sceneNode");
		new TWEEN.Tween(node.position).to({x: node.position.x, y: node.position.y, z: 0}, this.get("delay")).start();
	}
});