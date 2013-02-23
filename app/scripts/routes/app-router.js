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

GuitarTrainer.ExerciseIndexController = Ember.Controller.extend({
	needs: "exercise"
});

GuitarTrainer.ExercisePlayController = Ember.Controller.extend({
	needs: "exercise"
});