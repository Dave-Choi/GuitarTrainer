GuitarTrainer.TargetFactory = Ember.Object.extend({
	world: null,
	timingController: null,
	fretboardView: null,

	spawnTarget: function(target, viewType, stringIndex, fretIndex){
		var world = this.get("world");
		var timingController = this.get("timingController");
		var fretboardView = this.get("fretboardView");
		var stringSpacing = fretboardView.get("stringSpacing");
		var position = fretboardView.posForCoordinates(stringIndex, fretIndex);

//		position.z = -target.get("displayTime") / 10;
		position.z = -target.get("displayTime") / 1000 * timingController.get("distanceScale");

		var dimensions = {
			x: fretboardView.fretWidth(fretIndex),
			y: stringSpacing,
			z: stringSpacing
		};
		var color = fretboardView.get("stringColors")[stringIndex];
		var targetView = viewType.create({
			world: world,
			target: target,
			position: position,
			dimensions: dimensions,
			color: color
		});
		world.add(targetView.get("threeNode"));
	}
});