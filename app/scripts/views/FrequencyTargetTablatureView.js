/*
	Renders frequency targets to a Tablature Canvas
*/

GuitarTrainer.FrequencyTargetTablatureView = GuitarTrainer.Canvas2DView.extend({
	model: null,
	fillStyle: "black",
	hitFillStyle: "#dddddd",

	getPosition: function(){
		/*
			Render position is based on the target display time, the
			timing controller, and the tablature canvas's line spacing.

			There's probably too much interop here.
		*/
		var tablatureStaff = GuitarTrainer.TablatureStaff;
		var distanceScale = GuitarTrainer.Timer.get("distanceScale2D");

		var target = this.get("model");
		var stringIndex = target.get("stringIndex");
		var fretIndex = target.get("fretIndex");
		var displayTime = target.get("displayTime");
		var scaledTime = GuitarTrainer.Timer.get("scaledTime");

		var pos = {};

		var displayX = (distanceScale * displayTime / 1000);
		var timeOffset = (distanceScale * scaledTime / 1000);
		var cursorOffset = tablatureStaff.get("cursorPadding");

		pos.x = displayX - timeOffset + cursorOffset;
		pos.y = tablatureStaff.textLinePosition(stringIndex);

		return pos;
	},

	render: function(context){
		this._super(context);

		var tablatureStaff = GuitarTrainer.TablatureStaff;
		var fontSize = tablatureStaff.get("fontSize");
		var instrument = tablatureStaff.get("instrument");
		var target = this.get("model");
		var position = this.getPosition();

		if(position.x < tablatureStaff.get("labelPadding")){
			return;
		}

		var twoPi = Math.PI * 2;

		// This draws a circle.  Canvas is so convoluted.
		context.fillStyle = "white";
		context.beginPath();
		context.arc(position.x + fontSize/4, position.y - fontSize/3, fontSize/2, 0, twoPi, true);
		context.closePath();
		context.fill();

		context.fillStyle = this.get("fillStyle");
		context.fillText(target.get("fretIndex"), position.x, position.y);
	},

	targetHit: function(){
		var target = this.get("model");
		if(target.get("hasBeenHit")){
			this.set("fillStyle", this.get("hitFillStyle"));
		}
	}.observes("model.hasBeenHit")
});