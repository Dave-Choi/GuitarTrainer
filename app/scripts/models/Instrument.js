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

GuitarTrainer.InstrumentPlayController = Ember.ObjectController.extend({
	strings: function(){
		/*
			Array of GuitarTrainer.String objects.
			Any disparity between string fret counts imply they are shifted down toward the bridge
			e.g. The banjo's 5th string is 5 frets shorter than the rest.
		*/
		var stringsData = this.get("content.tuning.strings");
		var strings = [];
		var numStrings = stringsData.length;
		for(var i=0; i<numStrings; i++){
			var stringData = stringsData[i];

			var note = DMusic.Note.create({
				root: stringData.root.name,
				octave: stringData.root.octave
			});

			var string = GuitarTrainer.String.create({
				root: note,
				numFrets: stringData.numFrets
			});
			strings.push(string);
		}
		console.log(strings);
		return strings;
	}.property("content.tuning.strings.@each"),

	contentChanged: function(){
		console.log(this.get("content"));
	}.observes("content"),

	// tuning: [],	//	Array of root notes for the strings
	stringLengths: function(){
		return this.get("strings").getEach("numFrets");
	}.property("strings.@each.numFrets"),

	totalLength: function(){
		return Math.max.apply(null, this.get("stringLengths"));
	}.property("strings.@each.numFrets"),

	// init: function(){
	// 	console.log("InstrumentPlayController init");
	// 	console.log(this.get("content.tuning.notes"));
	// 	this._super();
	// 	var strings = [];
	// 	var tuning = this.get("tuning");
	// 	var stringLengths = this.get("stringLengths");
	// 	var i, len = tuning.length;
	// 	for(i=0; i<len; i++){
	// 		var stringLen = stringLengths[i];
	// 		var string = GuitarTrainer.String.create({root: tuning[i], numFrets: stringLen});
	// 		strings.push(string);
	// 	}
	// 	this.set("strings", strings);
	// },

	init: function(){
		console.log("instrument play controller init");
	},

	noteAtCoordinates: function(stringIndex, fretIndex){
		return this.get("strings")[stringIndex].get("notes")[fretIndex];
	}
});

GuitarTrainer.Instrument = DS.Model.extend({
	name: DS.attr("string"),
	tuning: DS.attr("object"),
	exercises: DS.hasMany("GuitarTrainer.Exercise")
});

GuitarTrainer.Instrument.FIXTURES = [
	{
		id: 1,
		name: "Standard Guitar",
		tuning: {
			strings: [ /*
				This array was originally the value of tuning, but because of the DS.attr("object")
				specification on the mdoel, it was breaking in some templates to try to use the
				#each helper to iterate over these objects.

				It worked okay when using the instrument route, but when trying to embed, via partials
				template helpers, it would complain about an object when it expected an array.
				*/
				{
					root: {
						name: "E",
						octave: 2
					},
					numFrets: 24
				},
				{
					root: {
						name: "A",
						octave: 2
					},
					numFrets: 24
				},
				{
					root: {
						name: "D",
						octave: 3
					},
					numFrets: 24
				},
				{
					root: {
						name: "G",
						octave: 3
					},
					numFrets: 24
				},
				{
					root: {
						name: "B",
						octave: 3
					},
					numFrets: 24
				},
				{
					root: {
						name: "E",
						octave: 4
					},
					numFrets: 24
				},
			]
		}
	}
];


// GuitarTrainer.Guitar = GuitarTrainer.Instrument.create({
// 	tuning: [
// 		DMusic.Note.create({name: "E", octave: 2}),
// 		DMusic.Note.create({name: "A", octave: 2}),
// 		DMusic.Note.create({name: "D", octave: 3}),
// 		DMusic.Note.create({name: "G", octave: 3}),
// 		DMusic.Note.create({name: "B", octave: 3}),
// 		DMusic.Note.create({name: "E", octave: 4})
// 	],
// 	stringLengths: [24, 24, 24, 24, 24, 24]
// });

// var guitar = GuitarTrainer.Guitar;
