/*
	Handles rendering objects to an HTML5 canvas

	Allows canvas views to register, and redraws them as requested.
*/

GuitarTrainer.CanvasRenderer = Ember.Object.extend({
	canvas: null,
	context: function(){
		var canvas = this.get("canvas");
		return canvas.getContext("2d");
	}.property("canvas"),

	views: null,

	init: function(){
		this._super();
		this.set("views", this.get("views") || []);
	},

	addView: function(view){
		this.get("views").push(view);
	},

	clear: function(){
		var context = this.get("context");
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	},

	render: function(){
		this.clear();
		
		var context = this.get("context");
		var views = this.get("views");
		var len = views.length;
		for(var i=0; i<len; i++){
			var view = views[i];
			view.render(context);
		}
	}
});