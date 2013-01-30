GuitarTrainer.ThreeView = Ember.Object.extend({
	model: null,
	threeNode: null,

	init: function(){
		var threeNode = new THREE.Object3D();
		this.set("threeNode", threeNode);
	},

	add: function(node){
		console.log(node);
		this.threeNode.add(node);
	}
});