DMusic = Ember.Object.create();

DMusic.Note = Ember.Object.extend({
	name: "A", //default
	octave: 4, // Octave as used in scientific pitch notation - defaults to middle
	noteNames: [
		"C", // 0
		"C#/Db", // 1
		"D", // 2
		"D#/Eb", // 3
		"E", // 4
		"F", // 5
		"F#/Gb", // 6
		"G", // 7
		"G#/Ab",// 8
		"A", // 9
		"A#/Bb", // 10
		"B" // 11
	],
	noteIndices: {
		"C": 0,
		"C#/Db": 1, "C#": 1, "Db": 1,
		"D": 2,
		"D#/Eb": 3, "D#": 3, "Eb": 3,
		"E": 4,
		"F": 5,
		"F#/Gb": 6, "F#": 6, "Gb": 6,
		"G": 7,
		"G#/Ab": 8, "G#": 8, "Ab": 8,
		"A": 9,
		"A#/Bb": 10, "A#": 10, "Bb": 10,
		"B": 11
	},

	noteIndex: function(){
		return this.get("noteIndices")[this.get("name")];
	}.property("name"),

	/*
		Frequency lookup table, for expediency using frequencyTable[note, octave]
		Goes from octave 0 to 10.
		This is calculated based on concert pitch (A440), rather than scientific (C256)

		Note: Octave transitions happen between B and C, because of pianos or something.
	*/
	frequencyTable: [
		[16.352, 32.703, 65.406, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.0, 8372.0,  16744.0], // C
		[17.324, 34.648, 69.296, 138.59, 277.18, 554.37, 1108.7, 2217.5, 4434.9, 8869.8,  17739.7], // C#/Db
		[18.354, 36.708, 73.416, 146.83, 293.66, 587.33, 1174.7, 2349.3, 4698.6, 9397.3,  18794.5], // D
		[19.445, 38.891, 77.782, 155.56, 311.13, 622.25, 1244.5, 2489.0, 4978.0, 9956.1,  19912.1], // D#/Eb
		[20.602, 41.203, 82.407, 164.81, 329.63, 659.26, 1318.5, 2637.0, 5274.0, 10548.1, 21096.2], // E
		[21.827, 43.654, 87.307, 174.61, 349.23, 698.46, 1396.9, 2793.8, 5587.7, 11175.3, 22350.6], // F
		[23.125, 46.249, 92.499, 185.0,  369.99, 739.99, 1480.0, 2960.0, 5919.9, 11839.8, 23679.6], // F#/Gb
		[24.500, 48.999, 97.999, 196.0,  392.0,  783.99, 1568.0, 3136.0, 6271.9, 12543.9, 25087.7], // G
		[25.957, 51.913, 103.83, 207.65, 415.30, 830.61, 1661.2, 3322.4, 6644.9, 31289.8, 26579.5], // G#/Ab
		[27.50,  55.0,   110,0,  220.00, 440.0,  880.0,  1760.0, 3520.0, 7040.0, 14080.0, 28160.0], // A
		[29.135, 58.270, 116.54, 233.08, 466.16, 932.33, 1864.7, 3729.3, 7458.6, 14917.2, 29834.5], // A#/Bb
		[30.868, 61.735, 123.47, 246.94, 493.88, 987.77, 1975.5, 3951.1, 7902.1, 15804.3, 31608.5] // B
	],

	frequency: function(){
		var noteIndex = this.get("noteIndices")[this.get("name")];
		var octave = this.get("octave");

		var frequencyTable = this.get("frequencyTable");
		if(octave >= 0 && octave < 11){
			return frequencyTable[noteIndex][this.get("octave")];
		}
		var base = frequencyTable[noteIndex][0];
		// If people need special case table expansion, they can add it to their application.
		// It's possible the whole table is overkill.  Multiplying a root by powers of 2 is very fast.
		return base * Math.pow(2, octave);
	}.property("name", "octave"),

	sharpenedNoteName: function(times){
		// Returns the name of the note after sharpening by a semitone per times
		var noteNames = this.get("noteNames");
		var noteIndices = this.get("noteIndices");

		var i = (noteIndices[this.get("name")] + times) % noteNames.length;
		// JavaScript's % operator always returns a result with the same sign as the dividend, so i can be negative.
		if(i < 0){
			i = noteNames.length + i;
		}
		return noteNames[i];
	},

	flattenedNoteName: function(times){
		return this.sharpenedNoteName(-times);
	},

	sharpenedOctave: function(times){
		var octave = this.get("octave");
		var noteIndex = this.get("noteIndex");
		if(times >= 0){ // Actually sharpening
			if((times + noteIndex) >= 12){
				return octave + Math.floor((times + noteIndex)/12) ;
			}
		}
		else{ // times is negative, so we're actually flattening
			if(-times > noteIndex){ // flattening into a lower octave
				return octave - Math.ceil(-times/12);
			}
		}
		return octave;
	},

	flattenedOctave: function(times){
		return this.sharpenedOctave(-times);
	},

	// sharpen() and flatten() modify the existing note.
	sharpen: function(times){
		var newNoteName = this.sharpenedNoteName(times);
		var newOctave = this.sharpenedOctave(times);

		// Set everything after doing the calculations, because octave calcs are dependent on the current note.
		this.set("name", newNoteName);
		this.set("octave", newOctave);

		return this;
	},

	flatten: function(times){
		return this.sharpen(-times);
	},

	sharpenedNote: function(times){
		var newNote = DMusic.Note.create(this);
		newNote.sharpen(times);
		return newNote;
	},

	flattenedNote: function(times){
		var newNote = DMusic.Note.create(this);
		newNote.flatten(times);
		return newNote;
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
	}.property("root", "offsets"),

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