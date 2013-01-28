// Requires DMusic.js

GuitarTrainer.String = Ember.Object.extend({
	root: DMusic.Note.create(),
	numFrets: 22,
	notes: null,

	init: function(){
		this._super();

		var root = this.get("root");
		var notes = [root];
		var i, len = this.get("numFrets");
		var lastNote = root;
		for(i=0; i<len; i++){
			var newNote = lastNote.sharpenedNote(1);
			notes.push(newNote);
			lastNote = newNote;
		}
		this.set("notes", notes);
	},

	print: function(){
		var notes = this.get("notes");
		var len = notes.length;

		var buff = "";
		for(var i=0; i<len; i++){
			var note = notes[i];
			buff += note.get("name") + note.get("octave") + " (" + note.get("frequency") + ")\n";
		}
		console.log(buff);
	}
});

/*
	Instrument is a generalized fretted instrument class that can be subclassed
	with different defaults for different instruments or tunings.
*/

GuitarTrainer.Instrument = Ember.Object.extend({
	strings: [],	/*
						Array of GuitarTrainer.String objects.
						Any disparity between string fret counts imply they are shifted down toward the bridge
						e.g. The banjo's 5th string is 5 frets shorter than the rest.
					*/

	tuning: [],	//	Array of root notes for the strings
	stringLengths: [],
	totalLength: function(){
		return Math.max.apply(null, this.get("stringLengths"));
	}.property("stringLengths"),

	init: function(){
		this._super();
		var strings = [];
		var tuning = this.get("tuning");
		var stringLengths = this.get("stringLengths");
		var i, len = tuning.length;
		for(i=0; i<len; i++){
			var stringLen = stringLengths[i];
			var string = GuitarTrainer.String.create({root: tuning[i], numFrets: stringLen});
			strings.push(string);
		}
		this.set("strings", strings);
	},

	print: function(){
		var strings = this.get("strings");
		var len = strings.length;
		for(var i=0; i<len; i++){
			var string = strings[i];
			string.print();
		}
	},

	noteAtCoordinates: function(stringIndex, fretIndex){
		return this.get("strings")[stringIndex].get("notes")[fretIndex];
	}
});

GuitarTrainer.Guitar = GuitarTrainer.Instrument.create({
	tuning: [
		DMusic.Note.create({name: "E", octave: 2}),
		DMusic.Note.create({name: "A", octave: 2}),
		DMusic.Note.create({name: "D", octave: 3}),
		DMusic.Note.create({name: "G", octave: 3}),
		DMusic.Note.create({name: "B", octave: 3}),
		DMusic.Note.create({name: "E", octave: 4})
	],
	stringLengths: [24, 24, 24, 24, 24, 24]
});

var guitar = GuitarTrainer.Guitar;
