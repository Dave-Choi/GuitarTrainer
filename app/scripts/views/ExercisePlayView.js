GuitarTrainer.ExercisePlayView = Ember.View.extend({
	animationRequestID: null,

	didInsertElement: function(){
		this._super();

		var canvas = this.$("#spectrogram")[0];

		var pitchDetectionNode = GuitarTrainer.VisualPitchDetectionNode.create({
			canvas: canvas
		});

		// There's probably a better way to hook the PDNode to the mic, but this works for now.
		pitchDetectionNode.set("source", GuitarTrainer.microphone.get("sourceNode"));
		GuitarTrainer.microphone.addObserver("sourceNode", function(){
			console.log(this);
			pitchDetectionNode.set("source", this.get("sourceNode"));
		});

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

		function evenTempoSection(coordinateList, intervalLength){
			var targets = [];
			var len = coordinateList.length;
			for(var i=0; i<len; i++){
				var coordinates = coordinateList[i];
				var stringIndex = coordinates[0];
				var fretIndex = coordinates[1];
				time = i * intervalLength;
				var target = GuitarTrainer.FrequencyTarget.create({
					instrument: GuitarTrainer.Guitar,
					stringIndex: stringIndex,
					fretIndex: fretIndex,
					displayTime: time
				});
				targets.push(target);
			}
			return targets;
		}

		var scaleUpTargets = evenTempoSection(AMajorScaleCoordinates, 1000);
		var scaleDownTargets = evenTempoSection(AMajorScaleCoordinates.reverse(), 1000);

		var scaleUpSection = GuitarTrainer.Section.create({
			pitchDetectionNode: pitchDetectionNode,
			targets: scaleUpTargets
		});

		var scaleDownSection = GuitarTrainer.Section.create({
			pitchDetectionNode: pitchDetectionNode,
			targets: scaleDownTargets
		});

		var masterSection = GuitarTrainer.Section.create({
			pitchDetectionNode: pitchDetectionNode
		});

		masterSection.addTarget(scaleUpSection);
		masterSection.addTarget(scaleDownSection.offsetCopy(scaleUpSection.get("targets").length * 1000));

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


		// var graph = GuitarTrainer.ExerciseGraph.create();
		// var scaleUpNode = GuitarTrainer.ExerciseNode.create({
		// 	section: scaleUpSection
		// });
		// var scaleDownNode = GuitarTrainer.ExerciseNode.create({
		// 	section: scaleDownSection
		// });

		// scaleUpNode.addNewTransition(scaleDownNode);
		// graph.addNode(scaleUpNode);
		// graph.addNode(scaleDownNode);

		function render(){
			world.render();
			GuitarTrainer.Tablature.render();
			this.set("animationRequestID", requestAnimationFrame(render.bind(this)));
		}
		this.set("animationRequestID", requestAnimationFrame(render.bind(this)));
	},

	willDestroyElement: function(){
		var id = this.get("animationRequestID");
		cancelAnimationFrame(this.get("animationRequestID"));
	}
});