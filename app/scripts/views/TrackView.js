/*
	View for the track behind the fretboard.

	TODO: This view has some dependent properties on the FretboardView, and should
	have some sort of bindings set up.
*/

GuitarTrainer.TrackView = GuitarTrainer.ThreeView.extend({
	fretboardView: null,
	length: 100,
	mesh: null,

	init: function(){
		var threeNode = new THREE.Object3D();
		this.set("threeNode", threeNode);

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

		var dotFrets = fretboardView.get("dotFrets");
		var numDots = dotFrets.length;
		for(i=0; i<numDots; i++){
			var fretIndex = dotFrets[i];
			x = fretboardView.fretCenter(fretIndex);
			var width = fretboardView.fretWidth(fretIndex);
			var dotLane = GuitarTrainer.ShapeFactory.cube({width: width, height: 0.05, depth: trackLength, color: 0xaaaaff});
			dotLane.position = {x: x, y: y, z: trackOffset};
			THREE.GeometryUtils.merge(mergedGeometry, dotLane);
		}

		var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshLambertMaterial({color:  0xbbbbff}));
		this.set("mesh", mesh);
		threeNode.add(mesh);
	}
});