/*
	TimingController keeps time and manipulates the World's shiftingNode to
	correctly correlate to the time.

	Functionality should be provided to jump to different times, and linearly
	advance and rewind.

	Shifting speed can be controlled via timeScale, which will alter how quickly
	time passes.

	TODO: timeScale also affects targets' listening windows,
	i.e. if the timeScale is 2, you have half as much time to hit the target.
	This should probably be changed to use real time, possibly with:
		lead time - how long before the displayTime it should start listening, in real time
		duration - scaled-time duration of the target (e.g. sustain)
		trail time - how long after the duration to keep listening, in real time
*/

GuitarTrainer.TimingController = Ember.Object.extend({
	world: null,
	time: 0,
	timeScale: 1, // How quickly time should pass, where 1 is real time, and 2 is twice real time

	distanceScale: 15, // How much distance corresponds to one second of real time

	timeStart: 0,
	isPlaying: false,

	scaledTime: function(){
		return this.get("time") * this.get("timeScale");
	}.property("time", "timeScale"),

	zPosition: function(){
		// zPosition is the position for the World's shiftingNode
		var scaledTime = this.get("scaledTime");
		var distanceScale = this.get("distanceScale");
		return -scaledTime/1000 * distanceScale; // Divide by 1000 because tempo is in z units per second.
	}.property("scaledTime", "distanceScale"),

	init: function(){
		this._super();

		var world = this.get("world");
		if(world){
			world.registerRenderHook("timingControllerHook", this, this.updateTime); // Is there a better way to pass this callback?
		}
	},

	goToTime: function(targetTime){
		// Pause playback when time is set explicitly.  play() may be called again.
		this.stop();
		this.set("time", targetTime);
	},

	play: function(){
		if(this.get("isPlaying")){
			return;
		}
		this.set("timeStart", Date.now());
		this.set("isPlaying", true);
		console.log("play");
	},

	stop: function(){
		this.set("isPlaying", false);
		console.log("stop");
	},

	updateTime: function(){
		if(this.get("isPlaying")){
			var now = Date.now();
			this.set("time", this.get("time") + (now - this.get("timeStart")));
			this.set("timeStart", now);
		}
	},

	timeChanged: function(){
		var world = this.get("world");
		world.shiftToZ(this.get("zPosition"));
	}.observes("time")
});