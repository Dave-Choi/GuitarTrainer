/*
	Sections describe a playable section of music.

	This is a dumb specification and will be difficult to reuse Sections without 
	more metadata but thinking about every case is giving me a headache and keeping me
	from making progress, so this is just the simplest thing that will work for now.

	It will be desirable to have a method to easily find Sections as a user composing
	an exercise.  Foreseeable difficulties lay in grouping Sections that are musically
	identical (alternate fingerings, for different instruments, etc.), or have
	different timings.

	A good way of searching existing sections is vital to exercise composition, though.


	The Section's target list is currently represented by an array of objects that can be
	used to configure a GuitarTrainer.Target when combined with the Section's Instrument
	reference.
*/

GuitarTrainer.Section = DS.Model.extend({
	instrument: DS.belongsTo("GuitarTrainer.Instrument"),
	targets: DS.attr("object")
});

// Target types are listed in TargetFactory.js

var AMajorScaleCoordinates = [
					[0, 5],			[0, 7],
			[1, 4],	[1, 5],			[1, 7],
			[2, 4],			[2, 6], [2, 7],
			[3, 4],			[3, 6], [3, 7],
					[4, 5],			[4, 7],
			[5, 4],	[5, 5]
		];

function generateEvenTargetList(type, coordinateList, interval){
	var list = [];
	var i, len = coordinateList.length;
	for(i=0; i<len; i++){
		var coordinate = coordinateList[i];
		list.push({
			type: type,
			stringIndex: coordinate[0],
			fretIndex: coordinate[1],
			displayTime: interval * i
		});
	}
	return list;
}

GuitarTrainer.Section.FIXTURES = [
	{
		//A Major Scale Up, Position 1
		id: 1,
		instrument: 1, // Standard Guitar
		targets: {
			list: generateEvenTargetList(0, AMajorScaleCoordinates, 1000)
		}
	},
	{
		//A Major Scale Down, Position 1
		id: 2,
		instrument: 1, // Standard Guitar
		targets: {
			list: generateEvenTargetList(0, AMajorScaleCoordinates.reverse(), 1000)
		}
	}
];