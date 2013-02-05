GuitarTrainer.FretboardView = Ember.Object.extend({
	world: null,
	threeNode: null,
	instrument: null,
	stringViews: null,
	/*
		stringLength is the distance between the bridge and the nut for the longest string,
		which extends beyond the fretboard.
		Frets are assumed to be aligned for irregular strings (such as on a banjo)
	*/
	stringLength: 50,
	stringSpacing: 0.55, // Vertical space between strings
	dotFrets:  [3, 5, 7, 9, 12, 15, 17, 19, 21, 24],

	// These colors and orientation reflect the Rocksmith string coloring
	stringColors: [0xff0000, 0xffff00, 0x0000ff, 0xff8800, 0x00ff00, 0xff00ff],
	stringColorsHex: function(){
		var stringColors = this.get("stringColors");
		var hexColors = [];
		var len = stringColors.length;
		for(var i=0; i<len; i++){
			var color = stringColors[i];
			var unpaddedHexString = color.toString(16);
			var paddedHexString = ("000000" + unpaddedHexString).slice(-6);
			hexColors.push(paddedHexString);
		}
		return hexColors;
	}.property("stringColors.@each"),

	flipped: true,  // If flipped is true, the red (low E) string is shown on top, mirroring a right handed guitar

	// Can be configured to use different string views,
	stringType: GuitarTrainer.StringView,

	init: function(){
		this._super();
		this.set("stringViews", []);
		this.set("threeNode", new THREE.Object3D());
		this.makeStrings();
		this.makeFrets();
		this.makeDots();
	},

	fretPositions: function(){
		var k = Math.pow(2, 1/12);
		var divisor = 1;
		var stringLength = this.get("stringLength");
		var numFrets = this.get("instrument").get("totalLength");
		var positions = [];

		for(var i=0; i<=numFrets; i++){
			var distFromBridge = stringLength/divisor;
			positions.push(stringLength - distFromBridge);
			divisor *= k;
		}
		return positions;
	}.property("stringLength", "numFrets"),

	stringPositions: function(){
		var stringSpacing = this.get("stringSpacing");
		var flipped = this.get("flipped");
		var positions = [];
		var numStrings = this.get("instrument").get("strings").length;
		for(var i=0; i<numStrings; i++){
			if(flipped){
				positions.push((numStrings - i) * stringSpacing);
			}
			else{
				positions.push((i + 1) * stringSpacing);
			}
		}
		return positions;
	}.property("stringSpacing", "flipped", "instrument.strings.length"),

	dotPositions: function(){
		var fretPositions = this.get("fretPositions");
		var numFrets = fretPositions.length;
		var dotFrets =this.get("dotFrets");
		var i, len = dotFrets.length;
		var positions = [];
		for(i=0; i<len; i++){
			var fretNum = dotFrets[i];
			if(fretNum > numFrets){
				return positions;
			}
			var fretPos1 = fretPositions[fretNum-1], fretPos2 = fretPositions[fretNum];
			positions.push((fretPos1 + fretPos2)/2);
		}
		return positions;
	}.property("fretPositions"),

	fretWidth: function(fretIndex){
		var fretPositions = this.get("fretPositions");
		var numFrets = fretPositions.length;
		if(fretIndex <= 0 || fretIndex > numFrets - 1){
			return 0;
		}
		var leftFretPos = fretPositions[fretIndex - 1], rightFretPos = fretPositions[fretIndex];
		return rightFretPos - leftFretPos;
	},

	fretCenter: function(fretIndex){
		var fretPositions = this.get("fretPositions");
		var numFrets = fretPositions.length;
		if(fretIndex <= 0 || fretIndex > numFrets - 1){
			return 0;
		}
		var leftFretPos = fretPositions[fretIndex - 1], rightFretPos = fretPositions[fretIndex];
		return (leftFretPos + rightFretPos) / 2;
	},

	makeStrings: function(){
		var threeNode = this.get("threeNode");
		var halfPi = Math.PI/2;
		var flipped = this.get("flipped");
		var colors = this.get("stringColors");

		var fretPositions = this.get("fretPositions");
		var stringPositions = this.get("stringPositions");
		var stringViews = [];
		var stringType = this.get("stringType");

		var strings = this.get("instrument").get("strings");
		var numStrings = strings.length;

		for(var i=0; i<numStrings; i++){
			var string = strings[i];
			var newString = stringType.create({
				world: threeNode,
				string: string,
				fretPositions: fretPositions,
				color: colors[i],
				diameter: 0.1,
				yPos: stringPositions[i],
				zPos: -0.2
			});
			stringViews.push(newString);
		}

		this.set("stringViews", stringViews);
	},

	makeFrets: function(){
		var threeNode = this.get("threeNode");
		var fretPositions = this.get("fretPositions");
		var stringSpacing = this.get("stringSpacing");
		var len = fretPositions.length;
		var mergedGeometry = new THREE.Geometry();

		var numStrings = this.get("instrument").get("strings").length;
		var fretHeight = stringSpacing * (numStrings + 1);
		var fretY = fretHeight/2;

		for(var i=0; i<len; i++){
			var x = fretPositions[i];
			var fret = GuitarTrainer.ShapeFactory.cube({width: 0.1, height: fretHeight, depth: 0.1, color: 0x888888});
			fret.position = {x: x, y: fretY, z: 0};
			THREE.GeometryUtils.merge(mergedGeometry, fret);
		}
		var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshPhongMaterial({color: 0x888888}));
		threeNode.add(mesh);
	},

	makeDots: function(){
		var threeNode = this.get("threeNode");
		var dotPositions = this.get("dotPositions");
		var len = dotPositions.length;
		var mergedGeometry = new THREE.Geometry();
		var stringSpacing = this.get("stringSpacing");
		var numStrings = this.get("instrument").get("strings").length;
		var dotY = stringSpacing * (numStrings + 1) / 2; // This is a little higher than normal, because the camera perspective is high

		for(var i=0; i<len; i++){
			var x = dotPositions[i];
			var dot = GuitarTrainer.ShapeFactory.sphere({color: 0xff0000, radius: 0.1});
			dot.position = {x: x, y: dotY, z: -0.1};
			THREE.GeometryUtils.merge(mergedGeometry, dot);
		}
		var mesh = new THREE.Mesh(mergedGeometry, new THREE.MeshPhongMaterial({color: 0xff0000}));
		threeNode.add(mesh);
	},

	posForCoordinates: function(stringIndex, fretIndex){
		/*
			Returns the position in the X-Y plane of the middle of a fret.
			
			The stringIndex is with respect to the instrument,
			and the spacial coordinates are dependent on whether the strings are flipped
		*/
		var y = this.get("stringPositions")[stringIndex];
		return {x: this.fretCenter(fretIndex), y: y, z: 0};
	}
});

GuitarTrainer.HeatmapFretboardView = GuitarTrainer.FretboardView.extend({
	pitchDetectionNode: null,
	stringType: GuitarTrainer.HeatmapStringView,

	init: function(){
		this._super();
		var world = this.get("world");
		world.registerRenderHook("HeatmapFretboardViewUpdate", this, this.update);
	},

	update: function(){
		var strings = this.get("stringViews");
		var pdNode = this.get("pitchDetectionNode");
		var len = strings.length;
		for(var i=0; i<len; i++){
			strings[i].update(pdNode);
		}
	}
});
