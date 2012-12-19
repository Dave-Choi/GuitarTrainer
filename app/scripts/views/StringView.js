GuitarTrainer.StringView = Ember.Object.extend({
	world: null,
	string: null,
	color: 0xff0000,
	opacity: 1,
	phongMaterial: function(){
		return new THREE.MeshPhongMaterial({
			color: this.get("color"),
			opacity: this.get("opacity")
		});
	}.property("color"),
	lambertMaterial: function(){
		return new THREE.MeshLambertMaterial({
			color: this.get("color"),
			opacity: this.get("opacity")
		});
	}.property("color"),
	diameter: 0.1,
	segments: null,
	fretPositions: null,
	yPos: 0,
	zPos: 0,

	init: function(){
		this._super();
		this.segments = [];
		this.makeSegments();
	},

	makeSegments: function(){
		var world = this.get("world");
		var string = this.get("string");
		var segments = this.get("segments");
		var numSegments = string.get("numFrets");
		var fretPositions = this.get("fretPositions");
		var radius = this.get("diameter")/2;
		var halfPi = Math.PI/2;
		// fretOffset is the number of skipped frets for any irregular instruments (such as a banjo)
		var fretOffset = fretPositions.length - numSegments - 1; // Subtract one, because there is a 0 fret at the nut.
		var yPos = this.get("yPos"), zPos = this.get("zPos");
		for(var i=0; i<numSegments; i++){
			var fretIndex = fretOffset + i;
			var fretPos1 = fretPositions[fretIndex], fretPos2 = fretPositions[fretIndex + 1];
			var fretLength = fretPos2 - fretPos1;
			var fretCenter = (fretPos1 + fretPos2) / 2;

			var segment = GuitarTrainer.ShapeFactory.cylinder({radiusTop: radius, radiusBottom: radius, height: fretLength, color: this.get("color")});
			segment.position = {x: fretCenter, y: yPos, z: zPos};
			segment.rotation = {x: 0, y: 0, z: halfPi};
			segments.push(segment);
			world.add(segment);
		}
	}
});

GuitarTrainer.HeatmapStringView = GuitarTrainer.StringView.extend({
	ampToOpacity: function(amp){
		return Math.max(0.1, amp * 100);
	},

	update: function(pitchDetectionNode){
		/*
			The string notes include the string's open note, i.e. fret 0, i.e. the nut
			Check the 0 fret first, and use it as a baseline for the whole string.
		*/
		var string = this.get("string");
		var notes = string.get("notes");
		var segments = this.get("segments");
		var len = notes.length;
		var rootFreq = string.get("root").get("frequency");
		var rootAmp = pitchDetectionNode.frequencyAmplitude(rootFreq);
		for(var i=1; i<len; i++){
			var note = notes[i];
			var freq = note.get("frequency");
			var amp = rootAmp + pitchDetectionNode.frequencyAmplitude(freq);
			var segment = segments[i-1];
			segment.material.opacity = this.ampToOpacity(amp);
		}
	}
});