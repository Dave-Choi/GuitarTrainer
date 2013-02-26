/*
	Conditional graph that basically works as a state machine
	for an exercise.

	Opted not to use Ember.StateManager because it doesn't have
	enough control over what type of transition causes what behavior.

	In this case, transitions need to know what the source and destination states are
	to evaluate whether they should transition at all, and what actions need to be taken.
*/

GuitarTrainer.ExerciseGraph = ConditionalGraph.extend({

});


GuitarTrainer.ExerciseNode = ConditionalGraph.Node.extend({
	section: null
});

GuitarTrainer.ExerciseTransition = ConditionalGraph.Transition.extend({

});