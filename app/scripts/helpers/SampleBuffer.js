/*
	SampleBuffer is a utility class to do the work of maintaining a fixed
	size buffer, independent of sampling rate, which allows for spectrum analysis
	with better resolution than would be possible without buffered samples.

	My understanding is that FFTs depend on a continuous periodic signal, so this
	buffering method isn't ideal.  It will probably benefit from some sort of
	windowing to help prevent leakage.
*/

GuitarTrainer.SampleBuffer = Ember.Object.extend({
	samples: null,
	bufferSize: 8192,

	filledArray: function(len, value){
		var a = [];
		for(var i=0; i<len; i++){
			a[i] = value;
		}
		return a;
	},

	addSamples: function(samples){
		this.samples.splice(0, samples.length);
		/*
			concat doesn't work normally, because inputBuffer is a float32 array
			i.e. This doesn't work: sampleBuffer = sampleBuffer.concat(samples);
		*/
		this.set("samples", this.samples.concat.apply(this.samples, samples));
	},

	init: function(){
		this._super();
		this.set("samples", this.filledArray(this.bufferSize, 0));
	}
});