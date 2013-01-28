GuitarTrainer.FrequencyTargetView = GuitarTrainer.ThreeView.extend({
	target: null,
	position: null,
	dimensions: null, // These are container dimensions.  The view doesn't have to be this big.
	color: 0xffffff,

	init: function(){
		this._super();
		var target = this.get("target");
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
		var target = this.get("target");
		if(target.get("hasBeenHit")){
			var children = this.get("threeNode").children;
			var i, len = children.length;
			for(i=0; i<len; i++){
				var child = children[i];
				child.material.transparent = true;
				child.material.opacity = 0.1;
			}
		}
	}.observes("target.hasBeenHit")
});