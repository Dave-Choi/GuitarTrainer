GuitarTrainer.Router.map(function(){
	this.resource("exercises", function(){
		this.resource("exercise", { path: "/:exercise_id" }, function(){
			this.route("create");
			this.route("edit");
			this.route("play");
			this.route("listen");

			this.resource("sections", function(){
				this.resource("section", { path: "/:section_id" }, function(){
					
				});
			});
		});
	});
	this.resource("instruments", function(){
		this.resource("instrument", { path: "/:instrument_id" }, function(){
			this.route("create");
			this.route("edit");
		});
	});
});

GuitarTrainer.IndexRoute = Ember.Route.extend({
	redirect: function(){
		this.transitionTo("exercises");
	}
});

GuitarTrainer.ExercisesIndexController = Ember.ArrayController.extend();

GuitarTrainer.ExercisesIndexRoute = Ember.Route.extend({
	model: function(){
		return GuitarTrainer.Exercise.find();
	}
});

GuitarTrainer.ExercisePlayRoute = Ember.Route.extend({
	setupController: function(controller){
		var exerciseModel = this.modelFor("exercise");
		// This buys me access to the model's properties via their name only in the template.
		controller.set("content", exerciseModel);
	}
});

GuitarTrainer.SectionsIndexController = Ember.ArrayController.extend();

GuitarTrainer.SectionsIndexRoute = Ember.Route.extend({
	model: function(){
		return GuitarTrainer.Section.find();
	}
});

GuitarTrainer.InstrumentsIndexRoute = Ember.Route.extend({
	model: function(){
		return GuitarTrainer.Instrument.find();
	}
});