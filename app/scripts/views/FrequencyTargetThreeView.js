GuitarTrainer.FrequencyTargetThreeView = GuitarTrainer.ThreeView.extend({
	model: null,

	position: function(){
		var fretboardView = GuitarTrainer.Fretboard;
		var target = this.get("model");
		var stringIndex = target.get("stringIndex");
		var fretIndex = target.get("fretIndex");

		var pos = fretboardView.posForCoordinates(stringIndex, fretIndex);
		pos.z = - target.get("displayTime") / 1000 * GuitarTrainer.Timer.get("distanceScale");
		return pos;
	}.property(),

	dimensions: function(){
		var fretboardView = GuitarTrainer.Fretboard;
		var target = this.get("model");
		var fretIndex = target.get("fretIndex");

		var stringSpacing = fretboardView.get("stringSpacing");
		var fretWidth = fretboardView.fretWidth(fretIndex);

		return {
			x: fretWidth,
			y: stringSpacing,
			z: stringSpacing
		};
	}.property(),

	color: function(){
		var fretboardView = GuitarTrainer.Fretboard;
		var stringIndex = this.get("model").get("stringIndex");

		return fretboardView.get("stringColors")[stringIndex];
	}.property(),

	init: function(){
		this._super();
		var target = this.get("model");

		var position = this.get("position");
		var dimensions = this.get("dimensions");
		var color = this.get("color");

		var node = new THREE.Object3D();
		node.position = position;
		var box = GuitarTrainer.ShapeFactory.cube({
			width: dimensions.x * 0.8,
			height: dimensions.y * 0.8,
			depth: dimensions.z * 0.8,
			color: color
		});
		var stem = GuitarTrainer.ShapeFactory.cylinder({
			radiusTop: 0.1,
			radiusBottom: 0.1,
			height: position.y,
			color: color
		});
		stem.position.y = -position.y / 2;
		node.add(box);
		node.add(stem);
		this.set("threeNode", node);
	},

	targetHit: function(){
		var target = this.get("model");
		if(target.get("hasBeenHit")){
			var children = this.get("threeNode").children;
			var i, len = children.length;
			for(i=0; i<len; i++){
				var child = children[i];
				child.material.transparent = true;
				child.material.opacity = 0.1;
			}
		}
	}.observes("model.hasBeenHit")
});