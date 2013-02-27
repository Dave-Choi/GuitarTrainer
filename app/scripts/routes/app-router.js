GuitarTrainer.Router.map(function(){
	this.resource("exercises", { path: "/" }, function(){
		this.resource("exercise", { path: "/:exercise_id"}, function(){
			this.route("create");
			this.route("edit");
			this.route("play");
			this.route("listen");
		});
	});
});

GuitarTrainer.ExercisesIndexController = Ember.ArrayController.extend();

GuitarTrainer.ExercisesIndexRoute = Ember.Route.extend({
	model: function(){
		return GuitarTrainer.Exercise.find();
	}
});

GuitarTrainer.ExercisePlayRoute = Ember.Route.extend({
	setupController: function(controller){
		// This buys me access to the model's properties via their name only in the template.
		controller.set("content", this.modelFor("exercise"));
	}
});