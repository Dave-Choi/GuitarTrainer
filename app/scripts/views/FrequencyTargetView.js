GuitarTrainer.FrequencyTargetView = Ember.Object.extend({
	world: null,
	target: null,
	sceneNode: null,
	position: null,
	dimensions: null, // These are container dimensions.  The view doesn't have to be this big.

	draw: function(){
		var world = this.get("world");
		var position = this.get("position");
		var dimensions = this.get("dimensions");
		var node = GuitarTrainer.ShapeFactory.cube({width: dimensions.x * 0.8, height: dimensions.y * 0.8, depth: dimensions.z * 0.8});
		node.position = position;
		this.set("sceneNode", node);
		world.add(node);
	}
});