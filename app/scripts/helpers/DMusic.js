DMusic = Ember.Object.create();

DMusic.Note = Ember.Object.extend({
	name: "A", //default
	octave: 4, // Octave as used in scientific pitch notation - defaults to middle
	noteNames: [
		"A", // 0
		"A#/Bb", // 1
		"B", // 2
		"C", // 3
		"C#/Db", // 4
		"D", // 5
		"D#/Eb", // 6
		"E", // 7
		"F", // 8
		"F#/Gb", // 9
		"G", // 10
		"G#/Ab"// 11
	],
	noteIndices: {
		"A": 0,
		"A#/Bb": 1, "A#": 1, "Bb": 1,
		"B": 2,
		"C": 3,
		"C#/Db": 4, "C#": 4, "Db": 4,
		"D": 5,
		"D#/Eb": 6, "D#": 6, "Eb": 6,
		"E": 7,
		"F": 8,
		"F#/Gb": 9, "F#": 9, "Gb": 9,
		"G": 10,
		"G#/Ab": 11, "G#": 11, "Ab": 11
	},

	// Frequency lookup table, for expediency (note, octave)
	frequencyTable: [
		[27.50, 55.0, 110,0, 220.00, 440.0, 880.0, 1760.0, 3520.0, 7040.0, 14080.0, 28160.0], // A
		[29.135, 58.270, 116.54, 233.08, 466.16, 932.33, 1864.7, 3729.3, 7458.6, 14917.2, 29834.5], // A#/Bb
		[30.868, 61.735, 123.47, 246.94, 493.88, 987.77, 1975.5, 3951.1, 7902.1, 15804.3, 31608.5], // B
		[16.352, 32.703, 65.406, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.0, 8372.0, 16744.0], // C
		[17.324, 34.648, 69.296, 138.59, 277.18, 554.37, 1108.7, 2217.5, 4434.9, 8869.8, 17739.7], // C#/Db
		[18.354, 36.708, 73.416, 146.83, 293.66, 587.33, 1174.7, 2349.3, 4698.6, 9397.3, 18794.5], // D
		[19.445, 38.891, 77.782, 155.56, 311.13, 622.25, 1244.5, 2489.0, 4978.0, 9956.1, 19912.1], // D#/Eb
		[20.602, 41.203, 82.407, 164.81, 329.63, 659.26, 1318.5, 2637.0, 5274.0, 10548.1, 21096.2], // E
		[21.827, 43.654, 87.307, 174.61, 349.23, 698.46, 1396.9, 2793.8, 5587.7, 11175.3, 22350.6], // F
		[23.125, 46.249, 92.499, 185.0, 369.99, 739.99, 1480.0, 2960.0, 5919.9, 11839.8, 23679.6], // F#/Gb
		[24.500, 48.999, 97.999, 196.0, 392.0, 783.99, 1568.0, 3136.0, 6271.9, 12543.9, 25087.7], // G
		[25.957, 51.913, 103.83, 207.65, 415.30, 830.61, 1661.2, 3322.4, 6644.9, 31289.8, 26579.5] // G#/Ab
	],

	frequency: function(){
		//This is calculated based on concert pitch (A440), rather than scientific (C256)
		var noteIndex = this.get("noteIndices")[this.get("note")];
		return this.get("frequencyTable")[noteIndex][this.get("octave")];
	}.property("note", "octave"),

	sharpenedNoteName: function(times){
		// Returns the name of the note after sharpening by a semitone per times
		var noteNames = this.get("noteNames");
		var noteIndices = this.get("noteIndices");
		var i = (noteIndices[this.get("name")] + times) % noteNames.length;
		return noteNames[i];
	},

	sharpen: function(times){
		// Modify this note to the sharpened note
		var newNoteName = this.sharpenedNoteName(times);
		this.set("name", newNoteName);
	},

	sharpDifference: function(note2){
		/*
			Returns how many times you'd have to sharpen this note to get to note2
			in semitone steps.
		*/
		var noteIndices = this.get("noteIndices");
		var i1 = noteIndices[this.get("name")], i2 = noteIndices[note2.get("name")];
		var numNotes = this.get("noteNames").length;
		return (i1 <= i2) ? (i2 - i1) : (numNotes - i1 + i2);
	},

	flatDifference: function(note2){
		/*
			Returns how many times you'd have to flatten this note to get to note2
			in semitone steps.
		*/
		var noteIndices = this.get("noteIndices");
		var i1 = noteIndices[this.get("name")], i2 = noteIndices[note2.get("name")];
		var numNotes = this.get("noteNames").length;
		return (i1 < i2) ? (numNotes - i2 + i1) : (i1 - i2);
	},

	shortestDifference: function(note2){
		/*
			Returns the shortest interval between two notes as a signed integer
			representing semitones.

			If the returned value is negative, it means the shortest distance is
			by flattening the note.

			If positive, it means the shortest distance is by sharpening the note.

			If B is checked against A, for example,
			the shortest interval is -2 (flattened two semitones),
			whereas by sharpening, the difference would be 10.

			If the notes are a half octave apart, it returns 6, rather than -6

			The absolute value of the returned value should always be
			less than or equal to half the number of notes (6).
		*/

		var noteIndices = this.get("noteIndices");
		var sharpDist = this.sharpDifference(note2);
		var flatDist = this.flatDifference(note2);
		if(sharpDist <= flatDist){
			return sharpDist;
		}
		return -flatDist;
	}
});


DMusic.NoteSet = Ember.Object.extend({
	name: "Unnamed",
	offsets: null,
	root: null,

	noteNames: function(){
		var offsets = this.get("offsets");
		var root = this.get("root");
		var noteBuff = [];
		var i, len = offsets.length;
		for(i=0; i<len; i++){
			noteBuff.push(root.sharpenedNoteName(offsets[i]));
		}
		return noteBuff;
	}.property("root", "offsets").cacheable(),

	noteIndex: function(note){
		var notes = this.get("noteNames");
		return notes.indexOf(note);
	},

	normalize: function(){
		/*
			If the offsets of the set don't include 0, shift the offsets
			to start at 0, and adjust the root to the first note.
		*/
		var offsets = this.get("offsets");
		if(offsets.indexOf(0) != -1){
			// The set is already normalized
			return;
		}
		var dist = offsets[0];
		var newOffsets = offsets.map(function(orig){
			return (orig + 12-dist)%12;
		});
		console.log("new " + newOffsets);
		this.set("offsets", newOffsets);

		var root = this.get("root");
		root.sharpen(-dist);
	}
});


DMusic.Chord = DMusic.NoteSet.extend({
	//Add things like determine diatonic scales it appears in
	//May need to subclass for diatonic specific stuff
});

DMusic.Scale = DMusic.NoteSet.extend({
	//Add things like determine diatonic chords, mode shifts, etc.
});

DMusic.DiatonicScale = DMusic.Scale.extend({
	diatonicChords: function(order){
		var orderNames = ["", "", "Triads", "7ths", "9ths", "11ths", "13ths"];
		var root = this.get("root");
		var offsets = this.get("offsets");
		var len = offsets.length;
		var i, j;
		for(i=0; i<len; i++){
			// Step through each note in the scale
			var chordNotes = [];
			for(j=0; j<order; j++){
				// Add every other note
				var interval = (i + j*2) % len;
				var noteName = root.sharpenedNoteName(interval);
				console.log("noteName");
			}
		}
	}
});


/*
	The properties of these objects can be used to initialize new NoteSet
	objects to various useful presets.  Will add more as I learn more.
*/

DMusic.single = {
	name: "Single",
	offsets: [0]
};

DMusic.chords = Ember.Object.create({
	"Major Triad": {
		// Major third, perfect fifth
		name: "Major Triad",
		offsets: [0, 4, 7]
	},

	"Minor Triad": {
		// Minor third, perfect fifth
		name: "Minor Triad",
		offsets: [0, 3, 7]
	},

	"Augmented Triad": {
		// Major third, augmented fifth
		name: "Augmented Triad",
		offsets: [0, 4, 8]
	},

	"Diminished Triad": {
		// Minor third, diminished fifth
		name: "Diminished Triad",
		offsets: [0, 3, 6]
	},

	"Major Major Seventh": {
		// Major third, perfect fifth, major seventh
		name: "Major Major Seventh",
		offsets: [0, 4, 7, 11]
	},

	"Dominant Seventh": {
		// Major third, perfect fifth, minor seventh
		name: "Dominant Seventh",
		offsets: [0, 4, 7, 10]
	},

	"Major Minor Seventh": {
		// Minor third, perfect fifth, minor seventh
		name: "Minor Minor Seventh",
		offsets: [0, 3, 7, 10]
	}
});


DMusic.scales = Ember.Object.create({
	/*
		T = Full Tone
		S = Semitone
		TS = T + S (3 semitones)
	 */
	"Major": {
		// T T S T T T S
		name: "Major",
		offsets: [0, 2, 4, 5, 7, 9, 11]
	},

	"Natural Minor": {
		// T S T T S T T
		name: "Natural Minor",
		offsets: [0, 2, 3, 5, 7, 8, 11]
	},

	"Harmonic Minor": {
		// T S T T S TS S
		name: "Harmonic Minor",
		offsets: [0, 2, 3, 5, 6, 8, 11]
	},

	"Melodic Minor": {
		// T S T T T T S
		name: "Melodic Minor",
		offsets: [0, 2, 3, 5, 7, 9, 11]
	},

	"Major Pentatonic": {
		// T T TS T TS
		name: "Major Pentatonic",
		offsets: [0, 2, 4, 7, 9]
	},

	"Minor Pentatonic": {
		// TS T T TS T
		name: "Minor Pentatonic",
		offsets: [0, 3, 5, 7, 10]
	},

	"Blues": {
		// Minor pentatonic + blue note (6)
		offsets: [0, 3, 5, 6, 7, 10]
	}
});