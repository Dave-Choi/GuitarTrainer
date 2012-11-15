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
	canvas: null,
	ctx: function(){
		return this.canvas.getContext("2d");
	}.property("canvas"),

	gradient: function(){
		var ctx = this.get("ctx");
		var gradient = ctx.createLinearGradient(0,0,0,300);
		gradient.addColorStop(1,'#6699ff');
		gradient.addColorStop(0.75,'#ff0000');
		gradient.addColorStop(0.25,'#ffff00');
		gradient.addColorStop(0,'#ffffff');
		return gradient;
	}.property("ctx"),

	drawSpectrum: function(array){
		var ctx = this.get("ctx");
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = this.get("gradient");
		var i, len = array.length;
		var spikeWidth = ctx.canvas.width/(len);
		var canvasHeight = ctx.canvas.height;
		for (i=0; i<len; i++){
			var x = i * spikeWidth;
			var value = array[i];
			var mag = value * 100000;
			ctx.fillRect(x, canvasHeight, spikeWidth, -mag*mag);
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