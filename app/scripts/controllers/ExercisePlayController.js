GuitarTrainer.ExercisePlayController = Ember.ObjectController.extend({
	needs: ["exercise"],
	content: function(){
		// This buys me access to the model's properties via just their name in getters.
		return this.get("controllers.exercise");
	}.property("controllers.exercise")
});