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

	var pitchDetectionNode = GuitarTrainer.VisualPitchDetectionNode.create({
		canvas: canvas
	});

	connectMic();

	var world = GuitarTrainer.World.create();

	GuitarTrainer.Fretboard = GuitarTrainer.HeatmapFretboardView.create({
		world: world,
		instrument: GuitarTrainer.Guitar,
		pitchDetectionNode: pitchDetectionNode,
		flipped: true
	});

	//var fretboard = GuitarTrainer.FretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode});

	world.get("shiftingNode").add(GuitarTrainer.Fretboard.get("threeNode"));
	var noteCount = 0;
	var track = GuitarTrainer.TrackView.create({
		world: world,
		instrument: GuitarTrainer.Guitar,
		fretboardView: GuitarTrainer.Fretboard
	});
	world.get("shiftingNode").add(track.get("threeNode"));

	GuitarTrainer.Timer = GuitarTrainer.TimingController.create({
		world: world,
		timeScale: 1.5,
		distanceScale: 30
	});

	var targetController = GuitarTrainer.TargetController.create({
		timingController: GuitarTrainer.Timer,
		pitchDetectionNode: pitchDetectionNode
	});


	function spawnFreqTargetForCoordinates(instrument, stringIndex, fretIndex){
		var note = instrument.noteAtCoordinates(stringIndex, fretIndex);
		var time = noteCount++ * 1000; // in ms
		var target = GuitarTrainer.FrequencyTarget.create({
			frequency: note.get("frequency"),
			displayTime: time,
			leadTime: 125,
			duration: 250
		});
		targetFactory.spawnTarget(target, GuitarTrainer.FrequencyTargetView, stringIndex, fretIndex);
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

	var AM7ArpeggioCoordinates = [
				[0, 5],
		[1, 4],					[1, 7],
						[2, 6], [2, 7],
						[3, 6],
				[4, 5],
		[5, 4],	[5, 5]
	];

	function spawnRandomMajorScaleTarget(){
		var coordinates = AMajorScaleCoordinates[Math.floor(Math.random() * AMajorScaleCoordinates.length)];
		spawnFreqTargetForCoordinates(GuitarTrainer.Guitar, coordinates[0], coordinates[1]);
	}

	$(document).keydown(function(e){
		if(e.keyCode == 65){ // A
			world.panLeft();
		}
		if(e.keyCode == 68){ // D
			world.panRight();
		}
		if(e.keyCode == 83){ // S
			GuitarTrainer.Timer.stop();
		}
		if(e.keyCode == 87){ // W
			GuitarTrainer.Timer.play();
		}
		if(e.keyCode == 81){ // Q
			GuitarTrainer.Timer.goToTime(0);
		}
		if(e.keyCode == 69){ // E

		}
	});

	var targets = [];
	var lastIndex = 0;
	var isScalingUp = true;
	for(var i=0; i<30; i++){ // Scale up and down
		if(lastIndex == AMajorScaleCoordinates.length - 1 && isScalingUp){
			isScalingUp = false;
		}
		else if(lastIndex === 0 && !isScalingUp){
			isScalingUp = true;
		}
		var coordinates = AMajorScaleCoordinates[lastIndex];
		var stringIndex = coordinates[0];
		var fretIndex = coordinates[1];
		var time = i * 1000;

		var target = GuitarTrainer.FrequencyTarget.create({
			instrument: GuitarTrainer.Guitar,
			stringIndex: stringIndex,
			fretIndex: fretIndex,

			displayTime: time
		});
		targets.push(target);
		
		if(isScalingUp){
			lastIndex++;
		}
		else{
			lastIndex--;
		}
	}

	var scaleUpDownSection = GuitarTrainer.Section.create({
		pitchDetectionNode: pitchDetectionNode,
		targets: targets
	});

	var masterSection = GuitarTrainer.Section.create({
		pitchDetectionNode: pitchDetectionNode
	});

	var sectionCopy1 = scaleUpDownSection.offsetCopy(2000);
	var sectionCopy2 = scaleUpDownSection.offsetCopy(5000);
	masterSection.addTarget(sectionCopy1);
	masterSection.addTarget(sectionCopy2);

	var sectionView = masterSection.createView("ThreeView");
	world.add(sectionView.get("threeNode"));

	var tablatureViewCanvas = document.createElement("canvas");
	tablatureViewCanvas.id = "tablatureViewCanvas";
	tablatureViewCanvas.width = 1250;
	tablatureViewCanvas.height = 100;
	document.getElementById("tablatureView").appendChild(tablatureViewCanvas);

	GuitarTrainer.Tablature = GuitarTrainer.CanvasRenderer.create({
		canvas: tablatureViewCanvas
	});

	GuitarTrainer.TablatureStaff = GuitarTrainer.TablatureStaffView.create({
		canvas: tablatureViewCanvas,
		instrument: GuitarTrainer.Guitar
	});
	GuitarTrainer.Tablature.addView(GuitarTrainer.TablatureStaff);


	var sectionTabView = masterSection.createView("TablatureView", {
		canvas: tablatureViewCanvas
	});
	GuitarTrainer.Tablature.addView(sectionTabView);

	function render(){
		world.render();
		GuitarTrainer.Tablature.render();
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
};