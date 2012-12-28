/*
	The TargetController handles triggering methods on Target objects,
	such as calling their listen() methods, at appropriate times,
	depending on track location.

	Targets are queried on every render call, which means, polling should
	be optimized to keep from bogging down performance.
*/

GuitarTrainer.TargetController = Ember.Object.extend({
	timingController: null,
	pitchDetectionNode: null,
	targets: null,

	init: function(){
		this._super();
		this.set("targets", []);

		var timingController = this.get("timingController");
		if(timingController){
			//timingController.addObserver("time", this.dispatch);
		}
	},

	addTarget: function(target){
		this.get("targets").push(target);
	},

	dispatch: function(){
		//console.log(this.get("timingController").get("time"));
		var timingController = this.get("timingController");
		var pitchDetectionNode = this.get("pitchDetectionNode");
		var targets = this.get("targets");
		var i, len = targets.length;
		time = timingController.get("time");
		for(i=0; i<len; i++){
			var target = targets[i];
			if(target.get("hasBeenHit")){
				continue;
			}
			if(target.shouldListenAtTime(time)){
				var result = target.listen(pitchDetectionNode);
			}
		}
	}.observes("timingController.time")
});