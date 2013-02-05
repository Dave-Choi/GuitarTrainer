/*
	Renders the static elements of a tablature view:
		Staff lines
		String labels
		The fretboard cursor
*/

GuitarTrainer.TablatureStaffView = GuitarTrainer.Canvas2DView.extend({
	instrument: null,

	// in pixels
	lineSpacing: 15,
	labelPadding: 20,
	cursorPadding: 60,
	fontSize: 12,

	textLinePosition: function(stringIndex){
		// Returns the Y posiiton for text to be aligned with a string
		var lineSpacing = this.get("lineSpacing");
		var fontSize = this.get("fontSize");

		return (stringIndex + 1) * lineSpacing + fontSize/2;
	},

	drawStringLabels: function(context){
		var notes = this.get("instrument").get("tuning");
		var lineSpacing = this.get("lineSpacing");
		var fontSize = this.get("fontSize");

		context.font = fontSize + "px sans-serif";

		for(var i=0; i<notes.length; i++){
			var note = notes[i];
			var textY = this.textLinePosition(i);
			context.fillText(note.name, 0, textY);
		}
	},

	drawStaff: function(context){
		var fretboardView = GuitarTrainer.Fretboard;
		var colors = fretboardView.get("stringColorsHex");
		var width = context.canvas.width;
		var lineSpacing = this.get("lineSpacing");
		var labelPadding = this.get("labelPadding");

		for(var i=0; i<colors.length; i++){
			var color = colors[i];
			context.fillStyle = color;
			context.fillRect(labelPadding, (i + 1) * lineSpacing, width, 1);
		}
	},

	drawCursor: function(context){
		var lineSpacing = this.get("lineSpacing");
		var labelPadding = this.get("labelPadding");
		var instrument = this.get("instrument");
		var cursorPadding = this.get("cursorPadding");

		context.fillStyle = "black";
		context.fillRect(cursorPadding, 0, 1, (instrument.get("strings").length + 1) * lineSpacing);
	},

	render: function(context){
		this._super();

		this.drawStringLabels(context);
		this.drawStaff(context);
		this.drawCursor(context);
	}


});