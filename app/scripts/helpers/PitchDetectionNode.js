/*
	The PitchDetectionNode is really a series of AudioNodes used to analyze
	an audio source and detect whether or not a frequency is sounding.

	Setting the audio source should generally be done before applying any effects for
	the best analysis.

	Some signal manipulation is done for the purpose of analysis, but it provides no
	audio outputs.

	The purpose is distinct from that of a tuner, in that the source signal
	may contain several distinct pitches sounding simultaneously, which may
	be independently polled for.

	This is useful for scenarios where there's an expected set of frequencies
	and you wish to determine whether the signal contains the expected set, as
	in a rhythm game.

	Requires dsp.js
*/

GuitarTrainer.PitchDetectionNode = Ember.Object.extend({
	source: null,		// AudioNode (or MediaStreamAudioSourceNode for live input)
	nodes: null,		// Array of nodes to process the input
	buffer: null,		// Sample buffer
	fft: null,			// dsp.js FFT object for frequency domain analysis
	gauss: null,		// Gaussian window

	// Sensible defaults for real time analysis
	sampleRate: 44100,	// standard audio CD sampling rate
	binCount: 8192,		// affects buffer sizes, and frequency resolution
	updateDelay: 2048,	// lower values mean more frequent updates, but too low can cause performance issues


	init: function(){
		this._super();
		this.set("buffer", GuitarTrainer.SampleBuffer.create());
		this.set("fft", new FFT(this.binCount, this.sampleRate));
		this.set("gauss", new WindowFunction(DSP.GAUSS));
	},

	processingCallback: function(e){
		var inputBuffer = e.inputBuffer.getChannelData(0);
		var parent = this.parentNode;
		parent.buffer.addSamples(inputBuffer);
		var sampleCopy = this.parentNode.buffer.get("samples").slice(0);
		parent.gauss.process(sampleCopy);
		parent.fft.forward(sampleCopy);
		//drawSpectrum(parent.fft.spectrum, 20, 1400);
	},

	setupNodes: function(context){
		if(!this.source){
			return;
		}

		this.set("nodes", []);
		var pitchDetectionNode = GuitarTrainer.PitchDetectionNode.create();
		var processorNode = context.createScriptProcessor(this.updateDelay, 1, 1);
		processorNode.parentNode = this;

		processorNode.onaudioprocess = this.processingCallback;
		this.nodes.push(processorNode);
		processorNode.connect(context.destination);
		//this.set("nodes", [processorNode]);
	},

	sourceChanged: function(){
		console.log("source changed");
		var context = this.source.context;
		this.setupNodes(context);
		var firstNode = this.nodes[0];
		this.source.connect(firstNode);
	}.observes("source"),

	binForFreq: function(freq){
		return Math.floor(freq * this.binCount / this.sampleRate);
	},

	detectFrequency: function(frequency, threshold){
		/*
			Synchonous, super-naive frequency detection, based on what's
			currently in the FFT spectrum.
		*/
		var spectrum = this.fft.spectrum;
		var binIndex = Math.floor(frequency * this.binCount / this.sampleRate);
		console.log(binIndex + " - " + spectrum[binIndex]);
		return spectrum[binIndex] >= threshold;
	}
});


/*
	VisualPitchDetectionNode adds a 2D rendering of a bar spectrum graph
	to the PitchDetectionNode class, mainly just useful for debugging.

	This could have been done with a decorator, but overriding the processingCallback method,
	using the this._super() call to update the fft spectrum and rendering from there seemed
	like the simplest way to hook in the functionality.
*/
GuitarTrainer.VisualPitchDetectionNode = GuitarTrainer.PitchDetectionNode.extend({
	//	Frequency bounds for rendering
	highFreq: 1200,
	lowFreq: 80,

	// Properties for highlighting frequencies of interest
	rootFreq: 82.407,
	keyFreqs: function(){
		var freqs = [];
		// Set as many as will fit in the frequency bounds
		var root = this.get("rootFreq");
		var base = Math.pow(2, 1/12);
		var highBound = this.get("highFreq");
		while(root <= highBound){
			freqs.push(root);
			root *= base;
		}
		return freqs;
	}.property("rootFreq"),

	keyBins: function(){
		var bins = [];
		var freqs = this.get("keyFreqs");
		var i, len = freqs.length;
		for(i=0; i<len; i++){
			bins.push(this.binForFreq(freqs[i]));
		}
		return bins;
	}.property("keyFreqs"),

	highBin: function(){
		return this.binForFreq(this.highFreq);
	}.property("highFreq"),
	lowBin: function(){
		return this.binForFreq(this.lowFreq);
	}.property("lowFreq"),

	canvas: null,
	ctx: function(){
		return this.canvas.getContext("2d");
	}.property("canvas"),

	drawSpectrum: function(array){
		var ctx = this.get("ctx");
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = "black";

		var i = this.get("lowBin"), len = this.get("highBin");
		var spikeWidth = ctx.canvas.width/(len-i);
		var canvasHeight = ctx.canvas.height;

		//console.log(len - i + " bins, " + spikeWidth + " wide spikes");

		var keyBins = this.get("keyBins");
		var gradient = this.get("gradient");
		/*
			The detection threshold is currently set to 0.01, so scale
			the spike height so that a value of 0.01 hits the top of the canvas

			canvasHeight / threshold = spikeHeight / value
			spikeHeight = canvasHeight * value / threshold
		*/
		var heightCoeff = canvasHeight / 0.01;
		for (; i<len; i++){
			var x = i * spikeWidth;
			var value = array[i];
			//var mag = value * 10000;
			var spikeHeight = value * heightCoeff;
			if(keyBins.indexOf(i) != -1){
				ctx.fillStyle = "red";
			}
			ctx.fillRect(x, canvasHeight, spikeWidth, -spikeHeight);
			ctx.fillStyle = "black";
		}
	},

	processingCallback: function(e){
		this._super(e);
		this.parentNode.drawSpectrum(this.parentNode.fft.spectrum);
	}
});


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
	canvas.height = 700;
	document.getElementById("mainThing").appendChild(canvas);

	var pitchDetectionNode = GuitarTrainer.VisualPitchDetectionNode.create({"canvas": canvas});

	connectMic();

	$("#checkOpenA").click(function(){
		console.log(pitchDetectionNode.detectFrequency(110, 0.01));
	});