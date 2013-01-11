describe('GuitarTrainer.PitchDetectionNode', function(){
	var pitchDetectionNode = GuitarTrainer.PitchDetectionNode.create();
	function setSpectrum(spectrum){
		pitchDetectionNode.get("fft").spectrum = spectrum;
	}

	describe(".estimatePeakFrequency", function(){

		describe("when the peak has no neighbors", function(){

			// 1 bin, covering 0-10 Hz
			pitchDetectionNode.set("binCount", 1);
			pitchDetectionNode.set("sampleRate", 10);

			it("should estimate the middle frequency", function(){
				setSpectrum([10]);
				var freq = pitchDetectionNode.estimatePeakFrequency(0);
				expect(freq).to.be.equal(5);
			});
		});

		describe("when the peak has one neighbor", function(){

			// 2 bins, covering 0-10, 10-20 Hz
			pitchDetectionNode.set("binCount", 1);
			pitchDetectionNode.set("sampleRate", 10);

			it("should bias toward the peak's neighbor", function(){
				setSpectrum([10, 5]);
				var freq = pitchDetectionNode.estimatePeakFrequency(0);
				expect(freq).to.be.equal(7.5);

				setSpectrum([5, 10]);
				freq = pitchDetectionNode.estimatePeakFrequency(1);
				expect(freq).to.be.equal(12.5);
			});
		});


		describe("when the peak has neighbors on both sides", function(){

			// 3 bins, covering 0-10, 10-20, 20-30 Hz
			pitchDetectionNode.set("binCount", 3);
			pitchDetectionNode.set("sampleRate", 30);

			it("should return 0 if the bin is not a peak", function(){
				setSpectrum([15, 10, 20]);
				var freq = pitchDetectionNode.estimatePeakFrequency(1);
				expect(freq).to.be.equal(0);
			});

			it("should bias lower if its left neighbor is higher than its right", function(){
				setSpectrum([15, 20, 10]);
				var freq = pitchDetectionNode.estimatePeakFrequency(1);
				expect(freq).to.be.equal(12.5);
			});

			it("should bias lower if its right neighbor is higher than its left", function(){
				setSpectrum([10, 20, 15]);
				var freq = pitchDetectionNode.estimatePeakFrequency(1);
				expect(freq).to.be.equal(17.5);
			});

			it("should not bias if its neighbors are even", function(){
				setSpectrum([10, 20, 10]);
				var freq = pitchDetectionNode.estimatePeakFrequency(1);
				expect(freq).to.be.equal(15);
			});
		});

	});

});
