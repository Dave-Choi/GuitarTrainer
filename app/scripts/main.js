

var GuitarTrainer = Ember.Application.create();

GuitarTrainer.ready = function(){
	function micSuccess(stream){
		console.log('mic connected');
		sourceNode = context.createMediaStreamSource(stream);
		pitchDetectionNode.set("source", sourceNode);
	}

	function micFailure(){
		console.log('mic connection failure');
	}

	function connectMic(){
		navigator.webkitGetUserMedia({audio: true}, micSuccess, function(){});
	}

	// create the audio context (chrome only for now)
	var context = new webkitAudioContext();
	var sourceNode;

	var canvas = document.createElement("canvas");
	canvas.id = "canvas";
	canvas.width = 1250;
	canvas.height = 100;
	document.getElementById("mainThing").appendChild(canvas);

	var pitchDetectionNode = GuitarTrainer.VisualPitchDetectionNode.create({canvas: canvas});

	connectMic();


	var world = GuitarTrainer.World.create();
	// pitchDetectionNode is initialized in PitchDetectionNode.js right now.  This is total shit and needs to be reorganized.
	var fretboard = GuitarTrainer.HeatmapFretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode, flipped: true});
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
		tempo: 30
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
		var z = noteCount++ * 15 + 100;
		var tempo = timingController.get("tempo");
		var time = z*1000/tempo; // in ms
		var target = GuitarTrainer.FrequencyTarget.create({
			frequency: note.get("frequency"), // This is messed up from strings being flipped however they're being looked up.
			displayTime: time,
			startTime: time - 125,
			duration: 250
		});
		track.spawnTarget(target, GuitarTrainer.FrequencyTargetView, stringIndex, fretIndex, z);
		targetController.addTarget(target);
	}

	var AMajorScaleCoordinates = [
				[0, 5],			[0, 7],
		[1, 4],	[1, 5],			[1, 7],
		[2, 4],			[2, 6], [2, 7],
		[3, 4],			[3, 6], [3, 7],
				[4, 5],			[4, 7],
		[5, 4],	[5, 5]
	];

	function spawnRandomMajorScaleTarget(){
		var coordinates = AMajorScaleCoordinates[Math.floor(Math.random() * AMajorScaleCoordinates.length)];
		spawnFreqTargetForCoordinates(GuitarTrainer.Guitar, coordinates[0], coordinates[1]);
	}

	function render(){
		requestAnimationFrame(render);
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

	var lastIndex = 0;
	var isScalingUp = true;
	for(var i=0; i<99; i++){ // Scale up and down
		if(lastIndex == AMajorScaleCoordinates.length - 1 && isScalingUp){
			isScalingUp = false;
		}
		else if(lastIndex === 0 && !isScalingUp){
			isScalingUp = true;
		}
		var coordinates = AMajorScaleCoordinates[lastIndex];
		spawnFreqTargetForCoordinates(GuitarTrainer.Guitar, coordinates[0], coordinates[1]);
		if(isScalingUp){
			lastIndex++;
		}
		else{
			lastIndex--;
		}
	}
};