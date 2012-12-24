GuitarTrainer.FrequencyTargetView = Ember.Object.extend({
	world: null,
	target: null,
	sceneNode: null,
	position: null,
	dimensions: null, // These are container dimensions.  The view doesn't have to be this big.
	color: 0xffffff,

	draw: function(){
		var world = this.get("world");
		var target = this.get("target");
		var position = this.get("position");
		var dimensions = this.get("dimensions");
		var color = this.get("color");
		var node = GuitarTrainer.ShapeFactory.cube({width: dimensions.x * 0.8, height: dimensions.y * 0.8, depth: dimensions.z * 0.8, color: color});
		node.position = position;
		this.set("sceneNode", node);
		world.add(node);
	},

	startTween: function(duration){
		var node = this.get("sceneNode");
		var target = this.get("target");
		new TWEEN.Tween(node.position).to({x: node.position.x, y: node.position.y, z: 0}, duration).onUpdate(function(){
			console.log(this);
		}).start();
	}
});