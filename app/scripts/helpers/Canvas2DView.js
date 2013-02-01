/*
	Mixin for things that have to render to a 2 dimensional canvas
*/

GuitarTrainer.Canvas2DView = Ember.Mixin.create({
	canvas: null,
	potato: "delicious potato",

	ctx: function(){
		console.log("asdf");
		return this.canvas.getContext("2d");
	}.property("canvas"),

	clear: function(){
		var ctx = this.get("ctx");
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}
});