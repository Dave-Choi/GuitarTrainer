GuitarTrainer.ThreeView = Ember.Object.extend({
	model: null,
	threeNode: null,

	init: function(){
		var threeNode = new THREE.Object3D();
		this.set("threeNode", threeNode);
	},

	add: function(node){
		this.threeNode.add(node);
	}
});