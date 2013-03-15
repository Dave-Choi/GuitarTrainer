GuitarTrainer.TargetTypes = [
	GuitarTrainer.FrequencyTarget	// 0
];

GuitarTrainer.TargetFactory = Ember.Object.create({
	convertSection: function(section){
		var targets = section.get("targets");
		var sectionInstrument = section.get("instrument");
		var i, len = targets.length;

		var gameTargets = [];

		for(i=0; i<len; i++){
			var target = targets[i];
			var typeIndex = target.type;
			var targetClass = GuitarTrainer.TargetTypes[typeIndex];

			var gameTarget = targetClass.create({
				instrument: sectionInstrument,
				stringIndex: target.stringIndex,
				fretIndex: target.fretIndex,
				displayTime: target.displayTime
			});

			gameTargets.push(gameTarget);
		}

		return gameTargets;
	}
});