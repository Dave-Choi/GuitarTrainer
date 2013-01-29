/*
	Adds view factory convenience methods to models, primarily motivated by wanting to
	simplify creating composite views from composite models.


	Usage:

		Add the mixin:
			GuitarTrainer.Model.reopen(GuitarTrainer.Renderable("Model"));

		Use it to create views:
			var model = GuitarTrainer.Model.create();
			var modelView = model.createView(
				"WhateverTypeView",
				{
					extraOption: extraValue,
					...
				}
			);

		This will look for a GuitarTrainer.ModelWhateverTypeView class, and instantiate it
		with a "model" property that points to the original model object.
*/

GuitarTrainer.Renderable = function(renderKey){
	return Ember.Mixin.create({
		renderKey: renderKey,

		viewExists: function(context){
			var key = this.get("renderKey");
			return (typeof GuitarTrainer[key + context] !== "undefined");
		},

		createView: function(context, args){
			var key = this.get("renderKey");

			var viewArgs = args || {};
			viewArgs.model = this;

			var viewClass = GuitarTrainer[key + context];

			if(viewClass){
				return viewClass.create(viewArgs);
			}
			return null;
		}
	});
};