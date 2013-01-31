/*
	Represents a playable exercise section.

	Section inherits from GuitarTrainer.Target, and may be treated as such, with respect
	to when to listen, etc.

	Consists of an array of Targets, and basic methods to aggregate over them efficiently.

	Section handles triggering methods on Target objects,
	such as calling their listen() methods, at appropriate times,
	depending on track location.
*/

GuitarTrainer.Section = GuitarTrainer.Target.extend({
	pitchDetectionNode: null,
	targets: null,

	isSorted: false, // Used to ensure targets are sorted by start time
	firstIndex: 0, // Used as a cursort to skip targets that no longer need to listen (i.e. already hit/missed)

	startTime: function(){
		/*
			Returns the time (ms) when this Section needs to start listening, which
			will be when its first target needs to start listening.

			Targets are kept sorted by startTime for some performance optimizations,
			so sorting them and taking the startTime of the first element is safe.
		*/
		if(!this.get("isSorted")){
			this.sortTargetsByStartTime();
		}
		var targets = this.get("targets");

		if(targets.length){
			return targets[0].get("startTime");
		}
		return 0;
	}.property("targets.@each.startTime"),

	stopTime: function(){
		/*
			Returns the time when it's safe for this Section to stop listening,
			which will be when its child targets are all done listening.

			A target's duration could hypothetically go on forever, so all we can
			really do is linear scan for the highest one.
		*/
		var targts = this.get("targets");
		var latestStopTime = 0;
		for(var i=len-1; i>=0; i--){
			var targetStopTime = targets[i].get("stopTime");
			if(targetStopTime > latestStopTime){
				latestStopTime = targetStopTime;
			}
		}
		return latestStopTime;
	}.property("targets.@each.stopTIme"),

	init: function(){
		this._super();
		this.set("targets", this.get("targets") || []);
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
	},

	offsetCopy: function(offsetInMilliseconds){
		/*
			Returns a copy of this Section, but with all of its targets time shifted.
			This is useful for repeated sections in songs.

			Recommended use is to create master sections in isolation, with the first target
			at displayTime = 0, and then copy them into place as needed,
			so that hasBeenHit flags aren't copied from targets that have already been hit.

			Copies are created rather than just shifted because they will generally need
			to be graded separately.
		*/
		var targets = this.get("targets");
		var offsetTargets = targets.map(function(oldTarget){
			return oldTarget.offsetCopy(offsetInMilliseconds);
		});
		var newSection = GuitarTrainer.Section.create({
			targets: offsetTargets
		});
		return newSection;
	},

	accuracy: function(){
		/*
			Returns the percentage of hit targets from its target list
		*/
		var targets = this.get("targets");
		var i, len = targets.length;
		var hitCount = 0;

		for(i=len-1; i>=0; i--){
			var target = targets[i];
			if(target.get("hasBeenHit")){
				hitCount++;
			}
		}

		return hitCount / len;
	},

	listen: function(){
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

		if(!timingController.get("isPlaying")){
			// scaledTime is being changed while not playing, so just reset firstIndex, and let it recalculate.
			this.set("firstIndex", 0);
		}
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

GuitarTrainer.Section.reopen(GuitarTrainer.Renderable("Section"));
