GuitarTrainer.GameSectionTablatureView = GuitarTrainer.Canvas2DView.extend({
	views: function(){
		var generatedViews = [];
		var section = this.get("model");
		var targets = section.get("targets");
		var len = targets.length;

		for(var i=0; i<len; i++){
			var target = targets[i];
			var targetTablatureView = target.createView("TablatureView", {
				canvas: this.get("canvas")
			});
			generatedViews.push(targetTablatureView);
		}

		return generatedViews;
	}.property("model.targets.@each"),

	init: function(){
		this._super();

	},

	render: function(context){
		this._super();

		var views = this.get("views");
		for(var i=0; i<views.length; i++){
			var view = views[i];
			view.render(context);
		}
	}
});