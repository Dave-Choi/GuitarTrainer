/*
	Target is an abstract interface to represent targets the player may hit.

	Chords should be composed of multiple targets, as this is more useful in terms of feedback
	for the user, because they can see what notes they've missed.
*/
GuitarTrainer.Target = Ember.Object.extend({
	displayTime: 0,	// The time when the target will cross the fretboard
	startTime: 0,	// The time to begin listening for a hit
	duration: 1,	// The length of time the player has after startTime to hit the target (in ms)
	hasBeenHit: false,

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
	}
});

GuitarTrainer.FrequencyTarget = GuitarTrainer.Target.extend({
	frequency: 0,
	threshold: 0.01, /*
		I don't actually know what units these are in, but this is the minimum
		value in the FFT bucket that will register as a hit.
	*/
	hasFlattened: false, /*
		Before checking for the target frequency, check that the bin hasn't been
		spiking the whole time, otherwise notes can be hit and sustained very early,
		instead of being plucked on time.
	*/
	flattenedThreshold: 0.001,

	listen: function(pitchDetectionNode){
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