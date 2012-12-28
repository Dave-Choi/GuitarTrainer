/*
	TimingController keeps time and manipulates the World's shiftingNode to
	correctly correlate to the time.

	Functionality should be provided to jump to different times, and linearly
	advance and rewind.

	Shifting speed can be controlled via tempo, which will alter how many
	units distance will be traversed per unit time.
	tempo is specified in z per second

	TODO: Time is being used to trigger Target events, which will cause problems
	when authoring exercises, as time is tracked in absolute terms and
	Targets should really be looking at the World.shiftingNode z position
		- Add a property that converts time to Z, use it in timeChanged, and use
		it for Target events (in TargetController)
*/

GuitarTrainer.TimingController = Ember.Object.extend({
	world: null,
	time: 0,
	tempo: 10,
	timeStart: 0,
	isPlaying: false,

	init: function(){
		this._super();

		var world = this.get("world");
		if(world){
			world.registerRenderHook("timingControllerHook", this, this.updateTime); // Is there a better way to pass this callback?
		}
	},

	play: function(){
		var world = this.get("world");
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
			this.set("time", Date.now() - this.get("timeStart"));
		}
	},

	timeChanged: function(){
		var world = this.get("world");
		var time = this.get("time");
		var tempo = this.get("tempo");
		world.shiftToZ(-time * tempo / 1000); // Divide by 1000 because tempo is in z units per second.
	}.observes("time")
});