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

GuitarTrainer.ShiftingWindowBuffer = Ember.Object.extend({
	sampleBuffer: null,
	bufferSize: 8192,

	filledArray: function(len, value){
		var a = [];
		for(var i=0; i<len; i++){
			a[i] = value;
		}
		return a;
	},

	addSamples: function(samples){
		this.sampleBuffer.splice(0, samples.length);
		/*
			concat doesn't work normally, because inputBuffer is a float32 array
			i.e. This doesn't work: sampleBuffer = sampleBuffer.concat(samples);
		*/
		this.set("sampleBuffer", this.sampleBuffer.concat.apply(this.sampleBuffer, samples));
	},

	fft: function(){

	}.property("sampleBuffer"),

	init: function(){
		this._super();
		this.set("sampleBuffer", this.filledArray(this.bufferSize, 0));
	}
});

GuitarTrainer.PitchDetectionNode = Ember.Object.extend({
	source: null,			// AudioNode or MediaStreamAudioSourceNode for live input
	nodes: null,
	buffer: null,

	setupNodes: function(context){
		if(!source){
			return;
		}
		this.set("nodes", []);
		/*
			JavaScriptNodes are deprecated in the Web Audio API spec, but the
			ScriptProcessorNodes aren't implemented yet. (as of 9/9/2012)
		*/
		var processorCreator = context.createScriptProcessor || context.createJavaScriptNode;
		var processorNode = processorCreator(this.get("sampleRate"), 1, 1);
		this.nodes.push(processorNode);
		processorNode.onaudioprocess = function(){

		};
	},

	sourceChanged: function(){
		var context = source.context;
		this.setupNodes(context);
	}
});


	function micSuccess(stream){
		sourceNode = context.createMediaStreamSource(stream);
		console.log("Mic connection");
		//sourceNode.connect(hp);
		//hp.connect(lp);
		//lp.connect(javascriptNode);

		//analyser.connect(javascriptNode);

		sourceNode.connect(javascriptNode);

		//No connection to destination to prevent audio feedback during debugging.
		//sourceNode.connect(context.destination);
	}

	function connectMic(){
		navigator.webkitGetUserMedia({audio: true}, micSuccess, micError);
	}

	function setupAudioNodes() {

		// setup a javascript node
		javascriptNode = context.createJavaScriptNode(2048, 1, 1);
		// connect to destination, else it isn't called
		javascriptNode.connect(context.destination);

		// create a buffer source node
		connectMic();
	}

	// log if an error occurs
	function onError(e) {
		console.log(e);
	}

	function drawSpectrum(array, lowFreq, highFreq){
		//debug(toString(array));
		var i, len = array.length;
		var spikeWidth = ctx.canvas.width/(len);
		var canvasHeight = ctx.canvas.height;
		//console.log(context.sampleRate + " - " + analyser.fftSize);
		// 44100 - 2048
		for (i=0; i<len; i++){
			var x = i * spikeWidth;
			var value = array[i];
			var mag = value * 100000;
			ctx.fillRect(x, canvasHeight, spikeWidth, -mag*mag);
		}
	};

	// create the audio context (chrome only for now)
	var context = new webkitAudioContext();
	var lp = context.createBiquadFilter();
	lp.type = lp.LOWPASS;
	lp.frequency = 8000;
	lp.Q = 0.1;

	var hp = context.createBiquadFilter();
	hp.type = hp.HIGHPASS;
	hp.frequency = 20;
	hp.Q = 0.1;

	var sampleBuffer = filledArray(0, 8192);

	var sourceNode;
	var fft = new FFT(8192, 44100);
	var javascriptNode;

	var maxAmplitudes = [];

	// get the context from the canvas to draw on
	var ctx = $("#canvas").get()[0].getContext("2d");

	// create a gradient for the fill. Note the strange
	// offset, since the gradient is calculated based on
	// the canvas, not the specific element we draw
	var gradient = ctx.createLinearGradient(0,0,0,300);
	gradient.addColorStop(1,'#5588ff');
	gradient.addColorStop(0.75,'#ff0000');
	gradient.addColorStop(0.25,'#ffff00');
	gradient.addColorStop(0,'#ffffff');

	// load the sound
	setupAudioNodes();

		// when the javascript node is called
	// we use information from the fft
	// to draw the volume
	javascriptNode.onaudioprocess = function(e){
		var inputBuffer = e.inputBuffer.getChannelData(0);
		sampleBuffer.splice(0, inputBuffer.length);
		//concat doesn't work normally, because inputBuffer is a float32 array
		//sampleBuffer = sampleBuffer.concat(inputBuffer);
		sampleBuffer = sampleBuffer.concat.apply(sampleBuffer, inputBuffer);

		fft.forward(sampleBuffer);
		var array = fft.spectrum;

		// clear the current state
		ctx.clearRect(0, 0, ctx.canvas.width, 700);

		// set the fill style
		ctx.fillStyle=gradient;

		drawSpectrum(array, 20, 1400);

	}

	$("#snapshotButton").click(function(){
		console.log(fft.spectrum);
	});
