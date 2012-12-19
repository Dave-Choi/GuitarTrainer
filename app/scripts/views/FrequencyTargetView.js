GuitarTrainer.FrequencyTargetView = Ember.Object.extend({
	world: null,
	target: null,
	sceneNode: null,
	position: null,
	dimensions: null, // These are container dimensions.  The view doesn't have to be this big.
	color: 0xffffff,

	draw: function(){
		var world = this.get("world");
		var position = this.get("position");
		var dimensions = this.get("dimensions");
		var color = this.get("color");
		var node = GuitarTrainer.ShapeFactory.cube({width: dimensions.x * 0.8, height: dimensions.y * 0.8, depth: dimensions.z * 0.8, color: color});
		node.position = position;
		this.set("sceneNode", node);
		world.add(node);
	}
});