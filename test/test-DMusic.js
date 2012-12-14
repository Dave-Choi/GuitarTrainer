describe('DMusic.Note', function(){
	var A, B, C, D, E, F, G;
	function setupNotes(){
		A = DMusic.Note.create({name: "A", octave: 4});
		B = DMusic.Note.create({name: "B", octave: 4});
		C = DMusic.Note.create({name: "C", octave: 4});
		D = DMusic.Note.create({name: "D", octave: 4});
		E = DMusic.Note.create({name: "E", octave: 4});
		F = DMusic.Note.create({name: "F", octave: 4});
		G = DMusic.Note.create({name: "G", octave: 4});
	}

	beforeEach(setupNotes);

	describe('.frequency', function(){
		it("should derive from name and octave", function(){
			var note = DMusic.Note.create({name: "A", octave: 4});
			expect(note.get("frequency")).to.be.equal(220);
			note.set("octave", 5);
			expect(note.get("frequency")).to.be.equal(440);
		});

		it("should calculate for octaves higher than 10", function(){
			var note = DMusic.Note.create({name: "A", octave: 11});
			expect(note.get("frequency")).to.be.equal(56320);
		});
	});

	describe(".sharpenedNoteName(times)", function(){
		it("should traverse the note circle", function(){
			expect(A.sharpenedNoteName(1)).to.be.equal("A#/Bb");
		});

		it("should handle octave cycles", function(){
			expect(A.sharpenedNoteName(13)).to.be.equal("A#/Bb");
		});

		describe("when times is negative", function(){
			it("should flatten instead of sharpen", function(){
				expect(B.sharpenedNoteName(-2)).to.be.equal("A");
				expect(B.sharpenedNoteName(-4)).to.be.equal("G");
				expect(B.sharpenedNoteName(-16)).to.be.equal("G");
			});
		});
	});

	describe(".flattenedNoteName(times)", function(){
		it("should correctly traverse the note circle", function(){
			expect(B.flattenedNoteName(2)).to.be.equal("A");
		});

		it("should handle octave cycles", function(){
			expect(A.flattenedNoteName(13)).to.be.equal("G#/Ab");
		});

		describe("when times is negative", function(){
			it("should sharpen instead of flatten", function(){
				expect(A.flattenedNoteName(-2)).to.be.equal("B");
				expect(G.flattenedNoteName(-4)).to.be.equal("B");
				expect(G.flattenedNoteName(-16)).to.be.equal("B");
			});
		});
	});

	describe(".sharpenedOctave(times)", function(){
		it("should return the octave of a note that's been sharpened by the specified number of semitones", function(){
			expect(C.sharpenedOctave(11)).to.be.equal(C.get("octave"));
			expect(A.sharpenedOctave(12)).to.be.equal(A.get("octave") + 1);
			expect(B.sharpenedOctave(1)).to.be.equal(B.get("octave") + 1);
		});
	});

	describe(".flattenedOctave(times)", function(){
		it("should return the octave of a note that's been flattened by the specified number of semitones", function(){
			expect(B.flattenedOctave(10)).to.be.equal(B.get("octave"));
			expect(C.flattenedOctave(1)).to.be.equal(C.get("octave") - 1);
			expect(G.flattenedOctave(11)).to.be.equal(G.get("octave") - 1);
		});
	});

	describe(".sharpen(times)", function(){
		var note;
		beforeEach(function(){
			note = DMusic.Note.create(A);
		});

		it("should modify the note to be sharper by the specified number of semitones", function(){
			note.sharpen(2);
			expect(note.get("name")).to.be.equal("B");
		});

		it("should modify the octave when sharpened into a higher octave", function(){
			note.sharpen(12);
			expect(note.get("name")).to.be.equal("A");
			expect(note.get("octave")).to.be.equal(5);
		});

		describe("when times is negative", function(){
			it("should flatten instead of sharpen", function(){
				note = DMusic.Note.create(B);
				note.sharpen(-2);
				expect(note.get("name")).to.be.equal("A");
			});
		});
	});

	describe(".flatten(times)", function(){
		var note;
		beforeEach(function(){
			note = DMusic.Note.create(B);
		});

		it("should modify the note to be flatter by the specified number of semitones", function(){
			note.flatten(2);
			expect(note.get("name")).to.be.equal("A");
		});

		it("should modify the octave when flattened into a lower octave", function(){
			note.flatten(12);
			expect(note.get("name")).to.be.equal("B");
			expect(note.get("octave")).to.be.equal(3);
		});

		describe("when times is negative", function(){
			it("should sharpen instead of flatten", function(){
				note.flatten(-3);
				expect(note.get("name")).to.be.equal("D");
			});
		});
	});

	describe("sharpenedNote(times)", function(){
		var note;
		beforeEach(function(){
			note = A.sharpenedNote(2);
		});

		it("should create a new sharpened note", function(){
			expect(note.get("name")).to.be.equal("B");
			expect(note.get("octave")).to.be.equal(4);
		});

		it("should leave the original note unaltered", function(){
			expect(A.get("name")).to.be.equal("A");
			expect(A.get("octave")).to.be.equal(4);
		});
	});

	describe("flattenedNote(times)", function(){
		var note;
		beforeEach(function(){
			note = B.flattenedNote(2);
		});

		it("should create a new flattened note", function(){
			expect(note.get("name")).to.be.equal("A");
			expect(note.get("octave")).to.be.equal(4);
		});

		it("should leave the original note unaltered", function(){
			expect(B.get("name")).to.be.equal("B");
			expect(B.get("octave")).to.be.equal(4);
		});
	});

	describe(".sharpDifference()", function(){
		it("should count the semitones between notes", function(){
			
		});
	});

	describe(".sharpenedNote(times)", function(){
		it("should produce new instances sharpened appropriately", function(){
			expect(A.sharpenedNote(2).get("name")).to.be.equal(B.get("name"));
		});
	});

});
