/*
	Target is an abstract interface to represent targets the player may hit.

	Chords should be composed of multiple targets, as this is more useful in terms of feedback
	for the user, because they can see what notes they've missed.
*/
GuitarTrainer.Target = Ember.Object.extend({
	displayTime: 0,	// The time when the target will cross the fretboard
	leadTime: 125,	// How long before displayTime to begin listening
	duration: 250,	// The length of time the player has after startTime to hit the target (in ms)
	hasBeenHit: false,

	init: function(){
		this.set("timingController", this.get("timingController") || GuitarTrainer.Timer);
	},

	startTime: function(){
		return this.get("displayTime") - this.get("leadTime");
	}.property("displayTime", "leadTime"),

	stopTime: function(){
		return this.get("startTime") + this.get("duration");
	}.property("startTime, duration"),

	shouldListenAtTime: function(time){
		return (time >= this.get("startTime") && time <= this.get("stopTime"));
	},

	listen: function(){
		/*
			Called on update, to evaluate if the target's been hit.  Can update whatever internal
			state it needs to to accomplish this (e.g. maintain a series of frequency flags for a
			bend or slide)
		*/
	},

	offsetCopy: function(offsetInMilliseconds){
		var copy = this.constructor.create(this); // There might be a better way to do this.
		copy.set("displayTime", copy.get("displayTime") + offsetInMilliseconds);
		return copy;
	}
});

GuitarTrainer.FrequencyTarget = GuitarTrainer.Target.extend({
	instrument: null,
	stringIndex: 0,
	fretIndex: 0,

	frequency: function(){
		var instrument = this.get("instrument");
		var stringIndex = this.get("stringIndex");
		var fretIndex = this.get("fretIndex");

		var note = instrument.noteAtCoordinates(stringIndex, fretIndex);
		return note.get("frequency");
	}.property("instrument", "stringIndex", "fretIndex"),

	threshold: 0.01, /*
		I don't actually know what units these are in, but this is the minimum
		value in the FFT bin that will register as a hit.
	*/
	hasFlattened: false, /*
		Before checking for the target frequency, check that the bin hasn't been
		spiking the whole time, otherwise notes can be hit and sustained very early,
		instead of being plucked on time.
	*/
	flattenedThreshold: 0.001,

	listen: function(pitchDetectionNode){
		/*
			2 stage listen:

				1.	Check that the note isn't sounding to start (i.e. sustaining from an early hit)
					by checking that it's below flattenedThreshold.
				2.	Check that the note is sounding above threshold.
		*/
		this._super();
		var frequency = this.get("frequency");
		var threshold = this.get("threshold");
		var hasFlattened = this.get("hasFlattened");
		var amp = pitchDetectionNode.frequencyAmplitude(frequency);

		if(!hasFlattened && amp < this.get("flattenedThreshold")){
			this.set("hasFlattened", true);
			return false;
		}

		var result = ( hasFlattened && (amp >= threshold) );

		if(result){
			this.set("hasBeenHit", true);
			console.log("hit " + frequency + " with " + amp);
		}

		return result;
	}
});

GuitarTrainer.FrequencyTarget.reopen(GuitarTrainer.Renderable("FrequencyTarget"));