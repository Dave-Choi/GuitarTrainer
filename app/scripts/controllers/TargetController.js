/*
	The TargetController handles triggering methods on Target objects,
	such as calling their listen() methods, at appropriate times,
	depending on track location.

	Targets are queried on every render call, which means, polling should
	be optimized to keep from bogging down performance.


	TODO: Some optimizations have been added to reduce iteration over targets, but they
	only work when time is progressing linearly.

	If time is set explicitly (rewinding, jump to section, etc.),
	isSorted and firstIndex will need to be reset.
*/

GuitarTrainer.TargetController = Ember.Object.extend({
	timingController: null,
	pitchDetectionNode: null,
	targets: null,

	isSorted: false, // Used to ensure targets are sorted by start time
	firstIndex: 0, // Used as a cursort to skip targets that no longer need to listen (i.e. already hit/missed)

	init: function(){
		this._super();
		this.set("targets", []);
	},

	addTarget: function(target){
		this.get("targets").push(target);
		this.set("isSorted", false);
		this.set("firstIndex", 0);
	},

	sortTargetsByStartTime: function(){
		var targets = this.get("targets");
		targets.sort(function(a, b){
			return a.get("startTime") - b.get("startTime");
		});
		this.set("isSorted", true);
		console.log(targets);
	},

	dispatch: function(){
		/*
			This function is called during the game loop to check each target
			to see if it should be calling its listen() method.
		*/

		if(!this.get("isSorted")){ // Ensure targets are sorted to save iterations
			this.sortTargetsByStartTime();
		}

		var timingController = this.get("timingController");
		var pitchDetectionNode = this.get("pitchDetectionNode");
		var targets = this.get("targets");
		var scaledTime = timingController.get("scaledTime");
		var i, len = targets.length;
		var firstIndex = this.get("firstIndex");

		for(i=firstIndex; i<len; i++){
			var target = targets[i];
			if(scaledTime < target.get("startTime")){
				/*
					Targets are sorted by startTime, so if scaledTime is less than this target's startTime,
					every remaining target hasn't started yet, so we can skip them.
				*/
				return;
			}
			if(target.get("hasBeenHit") || target.get("stopTime") < scaledTime){
				// This target is no longer relevant
				this.set("firstIndex", i+1);
				continue;
			}
			if(target.shouldListenAtTime(scaledTime)){
				var result = target.listen(pitchDetectionNode);
			}
		}
	}.observes("timingController.scaledTime")
});