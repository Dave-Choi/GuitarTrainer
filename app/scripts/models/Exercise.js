/*
	Exercise maintains a graph of ExerciseNodes, and provides functionality
	to traverse it.
*/

GuitarTrainer.Exercise = DS.Model.extend({
	title: DS.attr("string"),
	description: DS.attr("string")
});

GuitarTrainer.Exercise.FIXTURES = [
	{
		id: 1,
		title: "A major scale",
		description: "15 note major scale, played up and down 3 times."
	}
];