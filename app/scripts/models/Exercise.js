/*
	Exercise maintains a graph of ExerciseNodes, and meta information about the
	exercise.
*/

GuitarTrainer.Exercise = DS.Model.extend({
	title: DS.attr("string"),
	description: DS.attr("string"),
	instrument: DS.belongsTo("GuitarTrainer.Instrument"),
	graph: DS.belongsTo("GuitarTrainer.ExerciseGraph")
});

GuitarTrainer.Exercise.FIXTURES = [
	{
		id: 1,
		title: "A major scale",
		description: "15 note major scale, played up and down 3 times.",
		instrument: 1,
		graph: 1
	}
];