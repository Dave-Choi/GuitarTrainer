

var GuitarTrainer = Ember.Application.create();

GuitarTrainer.ready = function(){
	var world = GuitarTrainer.World.create();
	// pitchDetectionNode is initialized in PitchDetectionNode.js right now.  This is total shit and needs to be reorganized.
	//var fretboard = GuitarTrainer.HeatmapFretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode});
	var fretboard = GuitarTrainer.FretboardView.create({world: world, instrument: GuitarTrainer.Guitar, pitchDetectionNode: pitchDetectionNode});
	fretboard.drawInstrument();
	var fretPositions = fretboard.get("fretPositions");
	var stringSpacing = fretboard.get("stringSpacing");
	var track = GuitarTrainer.TrackView.create({world: world, instrument: GuitarTrainer.Guitar, fretboardView: fretboard});

	var frequencyTarget = GuitarTrainer.FrequencyTarget.create({
		frequency: 440
	});

	function spawnRandomTarget(){
		track.spawnTarget(frequencyTarget, GuitarTrainer.FrequencyTargetView, Math.floor(Math.random()*5), Math.floor(Math.random()*22));
	}

	function render(){
		requestAnimationFrame(render);
		//fretboard.update();
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
			world.zoomOut();
		}
		if(e.keyCode == 87){ // W
			world.zoomIn();
		}
		if(e.keyCode == 81){ // Q
			spawnRandomTarget();
		}
		if(e.keyCode == 69){ // E
			world.turnRight();
		}
		if(e.keyCode >= 48 && e.keyCode <= 57){ // Num keys
			var keyVal = e.keyCode - 48;
			fretboard.panToFret(keyVal * 4);
		}
	});
};