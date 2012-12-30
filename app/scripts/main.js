

var GuitarTrainer = Ember.Application.create();

GuitarTrainer.ready = function(){
	var world = GuitarTrainer.World.create();
	// pitchDetectionNode is initialized in PitchDetectionNode.js right now.  This is total shit and needs to be reorganized.
	var fretboard = GuitarTrainer.HeatmapFretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode});
	//var fretboard = GuitarTrainer.FretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode});
	world.get("shiftingNode").add(fretboard.get("threeNode"));
	var noteCount = 0;
	var fretPositions = fretboard.get("fretPositions");
	var stringSpacing = fretboard.get("stringSpacing");
	var track = GuitarTrainer.TrackView.create({world: world, instrument: GuitarTrainer.Guitar, fretboardView: fretboard});
	world.get("shiftingNode").add(track.get("threeNode"));
	var frequencyTarget = GuitarTrainer.FrequencyTarget.create({
		frequency: 440
	});
	var timingController = GuitarTrainer.TimingController.create({
		world: world,
		tempo: 10
	});
	var targetController = GuitarTrainer.TargetController.create({
		timingController: timingController,
		pitchDetectionNode: pitchDetectionNode
	});

	function spawnRandomTarget(){
		track.spawnTarget(frequencyTarget, GuitarTrainer.FrequencyTargetView, Math.floor(Math.random()*6), Math.floor(Math.random()*24));
	}

	function spawnFreqTargetForCoordinates(instrument, stringIndex, fretIndex){
		var note = instrument.get("strings")[stringIndex].get("notes")[fretIndex];
		var z = noteCount++ * 15;
		var tempo = timingController.get("tempo");
		var time = z*1000/tempo; // in ms
		var target = GuitarTrainer.FrequencyTarget.create({
			frequency: note.get("frequency"), // This is messed up from strings being flipped however they're being looked up.
			displayTime: time,
			startTime: time - 500,
			duration: 1000
		});
		track.spawnTarget(target, GuitarTrainer.FrequencyTargetView, stringIndex, fretIndex, z);
		targetController.addTarget(target);
	}

	var AMajorScaleCoordinates = [
		[5, 5], [5, 7],
		[4, 4], [4, 5], [4, 7],
		[3, 4], [3, 6], [3, 7],
		[2, 4], [2, 6], [2, 7],
		[1, 5], [1, 7],
		[0, 4], [0, 5]
	];

	function spawnRandomMajorScaleTarget(){
		var coordinates = AMajorScaleCoordinates[Math.floor(Math.random() * AMajorScaleCoordinates.length)];
		spawnFreqTargetForCoordinates(GuitarTrainer.Guitar, coordinates[0], coordinates[1]);
	}

	function render(){
		requestAnimationFrame(render);
		//fretboard.update(); // Necessary for heatmap -- Should probably hook into world rendering
		world.render();
	}
	requestAnimationFrame(render);

	$(document).keydown(function(e){
		if(e.keyCode == 65){ // A
			world.panLeft();
		}
		if(e.keyCode == 68){ // D
			world.panRight();
		}
		if(e.keyCode == 83){ // S
			timingController.stop();
		}
		if(e.keyCode == 87){ // W
			timingController.play();
		}
		if(e.keyCode == 81){ // Q
			spawnRandomTarget();
		}
		if(e.keyCode == 69){ // E
			spawnRandomMajorScaleTarget();
		}
	});

	for(var i=0; i<50; i++){
		spawnRandomMajorScaleTarget();
	}
};