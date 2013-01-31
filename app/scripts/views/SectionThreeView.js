GuitarTrainer.SectionThreeView = GuitarTrainer.ThreeView.extend({
	init: function(){
		this._super();
		var section = this.get("model");
		var targets = section.get("targets");
		var len = targets.length;

		for(var i=0; i<len; i++){
			var target = targets[i];
			var targetThreeView = target.createView("ThreeView");
			this.add(targetThreeView.get("threeNode"));
		}
	}
});