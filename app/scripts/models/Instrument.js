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

GuitarTrainer.Instrument = DS.Model.extend({
	name: DS.attr("string"),
	tuning: DS.attr("object"),
	exercises: DS.hasMany("GuitarTrainer.Exercise"),

	strings: function(){
		/*
			Array of GuitarTrainer.String objects.
			Any disparity between string fret counts imply they are shifted down toward the bridge
			e.g. The banjo's 5th string is 5 frets shorter than the rest.
		*/
		var stringsData = this.get("tuning.strings");
		if(!stringsData){
			// Why is this happening?
			console.log("strings data not present");
			return [];
		}
		var strings = [];
		var numStrings = stringsData.length;
		for(var i=0; i<numStrings; i++){
			var stringData = stringsData[i];

			var note = DMusic.Note.create({
				name: stringData.root.name,
				octave: stringData.root.octave
			});

			var string = GuitarTrainer.String.create({
				root: note,
				numFrets: stringData.numFrets
			});
			strings.push(string);
		}
		return strings;
	}.property("tuning.strings.@each"),

	tuningNotes: function(){
		//	Array of root notes for the strings
		return this.get("strings").getEach("root");
	}.property("strings.@each.root"),

	stringLengths: function(){
		return this.get("strings").getEach("numFrets");
	}.property("strings.@each.numFrets"),

	totalLength: function(){
		return Math.max.apply(null, this.get("stringLengths"));
	}.property("strings.@each.numFrets"),

	noteAtCoordinates: function(stringIndex, fretIndex){
		var strings = this.get("strings");
		if(stringIndex >= strings.length){
			console.log("stringIndex out of range");
			return null;
		}
		var string = strings[stringIndex];
		if(fretIndex >= string.get("numFrets")){
			console.log("fretIndex out of range");
			return null;
		}
		return string.get("notes")[fretIndex];
	}
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
				}
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
