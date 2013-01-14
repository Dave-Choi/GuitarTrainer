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
	Requires GuitarTrainer.SampleBuffer
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

	// Properties for frequencies of special interest
	rootFreq: 82.407,
	highFreq: 1200,
	lowFreq: 80,

	highBin: function(){
		return this.binForFreq(this.highFreq);
	}.property("highFreq"),

	lowBin: function(){
		return this.binForFreq(this.lowFreq);
	}.property("lowFreq"),

	keyFreqs: function(){
		// Musical note frequencies based on rootFreq
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
		// Bin indices containing key frequencies
		var bins = [];
		var freqs = this.get("keyFreqs");
		var i, len = freqs.length;
		for(i=0; i<len; i++){
			bins.push(this.binForFreq(freqs[i]));
		}
		return bins;
	}.property("keyFreqs"),

	isKeyBin: function(binIndex){
		return (this.get("keyBins").indexOf(binIndex) !== -1);
	},


	init: function(){
		this._super();
		this.set("buffer", GuitarTrainer.SampleBuffer.create());
		this.set("fft", new FFT(this.binCount, this.sampleRate));
		this.set("gauss", new WindowFunction(DSP.GAUSS));
	},

	spectrum: function(){
		return this.get("fft").spectrum;
	},

	emptySpectrum: function(){
		// Set all spectrum values to 0;
		var spectrum = this.spectrum();
		for(var i=spectrum.length-1; i>=0; i--){
			spectrum[i] = 0;
		}
	},

	binSpan: function(){
		// Number of Hz that resolve into a given spectrum bin
		return this.get("sampleRate") / this.get("binCount");
	}.property("sampleRate", "binCount"),

	binRange: function(binIndex){
		var span = this.get("binSpan");
		var bottom = binIndex * span;
		return {
			low: bottom,
			high: bottom + span
		};
	},

	isPeak: function(binIndex, threshold){
		/*
			A bin is a peak if its value is greater than its neighboring bins' values.

			threshold is a minimum value to count a bin as a peak
		*/

		var spectrum = this.spectrum();
		var bin = spectrum[binIndex], leftBin, rightBin;

		if(!bin || (bin < threshold)){
			// bin can be 0 and !bin will evaluate to true,
			// but it's not a peak then, anyway.
			return false;
		}

		var count = spectrum.length;

		if(binIndex === 0){
			if(count == 1){
				// This is the only bin, so I guess it's a peak
				return true;
			}
			else{
				// Compare the first bin to the second bin
				bin = spectrum[0];
				rightBin = spectrum[1];
				return (bin > rightBin);
			}
		}
		else if(binIndex === count - 1){
			// Checking the last bin, and there's definitely more than one bin
			bin = spectrum[count-1];
			leftBin = spectrum[count-2];
			return (bin > leftBin);
		}
		else{
			// The target bin is somewhere in the middle, and guaranteed to have neighbors on left and right
			bin = spectrum[binIndex];
			leftBin = spectrum[binIndex - 1];
			rightBin = spectrum[binIndex + 1];
			return ((bin > leftBin) && (bin > rightBin));
		}
	},

	peakIndices: function(){
		// Returns the spectrum indices of peaks
		var indices = [];
		var spectrum = this.spectrum();
		var i, len = spectrum.length;
		var threshold = 0.01;
		for(i=len-1; i>=0; i--){ // Ignore the ends for now
			if(this.isPeak(i, threshold)){
				indices.push(i);
				i--; // If this is a peak, then it's neighbor can't be a peak, and we can save some iterations.
			}
		}
		return indices;
	},

	peaks: function(){
		/*
			Returns the spectrum index and value of peaks identified by the
			peakIndices() method.

			This calls the peakIndices() method, which creates some overhead.
			Room for optimization here.
		*/
		var values = [];
		var indices = this.peakIndices();
		var spectrum = this.get("fft").spectrum;
		for(var i=0; i<indices.length; i++){
			var index = indices[i];
			values.push({
				index: index,
				value: spectrum[index]
			});
		}
		return values;
	},

	peakRoundsTo: function(peakIndex){
		/*
			If the peak isn't a key bin, see if it can be rounded to one.
			Returns the bin index to round to.

			This is necessary when frequency resolution is too high, and
			imprecision in the instrument makes precise hits on every frequency
			target for a string impossible for a given tuning.

			This will allow for sloppy fretting technique, however
			(i.e. some unintentional bends will pass).
		*/
		if(!this.isPeak(peakIndex) || this.isKeyBin(peakIndex)){
			// If this isn't a peak, or is already a key bin, just leave it alone.
			return peakIndex;
		}

		var spectrum = this.spectrum();
		if(peakIndex === 0){
			if( this.isKeyBin(1) ){
				// Round from the first bin to the second.
				return 1;
			}
			return peakIndex;
		}
		else if(peakIndex === spectrum.length - 1){
			if( this.isKeyBin(spectrum.length - 2) ){
			// Round from the last bin to the second to last.
				return spectrum.length - 2;
			}
			return peakIndex;
		}
		else{
			// peakIndex can't be the first or last element at this point,
			// so we're guaranteed to have bins on either side of peakIndex.
			var leftIndex = peakIndex - 1;
			var rightIndex = peakIndex + 1;
			var hasLeftKey = this.isKeyBin(leftIndex);
			var hasRightKey = this.isKeyBin(rightIndex);

			if(hasLeftKey && hasRightKey){
				// Key bins on both sides.  Pick the one with the higher value.
				return (spectrum[leftIndex] > spectrum[rightIndex]) ? leftIndex : rightIndex;
			}
			else if(hasLeftKey){
				return leftIndex;
			}
			else if(hasRightKey){
				return rightIndex;
			}
			else{
				return peakIndex;
			}
		}
	},

	isolatePeaks: function(doRounding){
		// Find the peaks, empty the spectrum, restore the peaks
		var peaks = this.peaks();
		var spectrum = this.spectrum();

		// Check the peaks and round them to key bins if they're close enough
		var i, len = peaks.length;
		var peak;
		for(i=peaks.length-1; i>=0; i--){
			peak = peaks[i];
			peak.index = this.peakRoundsTo(peak.index);
		}

		this.emptySpectrum();

		for(i=peaks.length-1; i>=0; i--){
			peak = peaks[i];
			spectrum[peak.index] = peak.value;
		}
	},

	estimatePeakFrequency: function(peakIndex){
		/*
			Estimates a specific frequency for a peak bin depending on its neighbors

			In general, take the difference between the peak and its low neighbor
			as the scale, and divide the difference between the two neighbors by the scale
			to get a percentage bias toward the high neighbor.


			e.g.
			==========				low (10)
			====================	peak (20)
			===============			high (15)

			scale = peak - low
			diff = high - low
			bias = diff / scale

			Say the peak bin ranges from 10 to 20 Hz, with a 50% bias toward higher frequency,
			estimate the peak frequency to be 15 (bin middle) + 2.5 (50% of half the bin range)
			or 17.5 Hz

			When bin values are very close to each other, this algorithm can give weird results,
			but if the peaks are that poorly pronounced, any estimation isn't really good.
		*/

		if(!this.isPeak(peakIndex)){ // Not a peak, don't bother
			return 0;
		}

		var spectrum = this.spectrum();
		var center = spectrum[peakIndex];
		var left = spectrum[peakIndex-1] || 0;  // Default an undefined bin to 0
		var right = spectrum[peakIndex+1] || 0;

		var range = this.binRange(peakIndex);
		var rangeMagnitude = range.high - range.low;
		var radius = rangeMagnitude / 2;
		var centerFreq = range.low + radius;

		var scale, diff, bias;
		if(left < right){ // Bias toward the right (higher frequencies)
			scale = center - left;
			diff = right - left;
			bias = diff / scale;
			return centerFreq + (radius * bias);
		}
		else{ // Bias toward the left (lower frequencies)
			scale = center - right;
			diff = left - right;
			bias = diff / scale;
			return centerFreq - (radius * bias);
		}
	},

	processingCallback: function(e){
		/*
			This stuff doesn't really need to happen most of the time.
			
			The PitchDetectionNode does a lot of processing that only
			really needs to happen when it's being polled for detection.
			
			There's a lot of room to optimize here, but it might lead to
			unevenness.
		*/
		var inputBuffer = e.inputBuffer.getChannelData(0);
		var parent = this.parentNode;
		parent.buffer.addSamples(inputBuffer);
		var sampleCopy = this.parentNode.buffer.get("samples").slice(0);
		parent.gauss.process(sampleCopy);
		parent.fft.forward(sampleCopy);

		parent.isolatePeaks();
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

	binCoeff: function(){
		// Multiply by this to find out what bin a frequency is in
		// Make it a property so it doesn't need to be recalculated
		return this.get("binCount") / this.get("sampleRate");
	}.property("binCount", "sampleRate"),

	binForFreq: function(freq){
		return Math.floor(freq * this.get("binCoeff"));
	},

	detectFrequency: function(frequency, threshold){
		/*
			Synchonous, super-naive frequency detection, based on what's
			currently in the FFT spectrum.
		*/
		var spectrum = this.fft.spectrum;
		var binIndex = this.binForFreq(frequency);
		console.log(binIndex + " - " + spectrum[binIndex]);
		return spectrum[binIndex] >= threshold;
	},

	frequencyAmplitude: function(frequency){
		var spectrum = this.get("fft").spectrum;
		var binIndex = this.binForFreq(frequency);
		return spectrum[binIndex];
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