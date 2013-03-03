// Requires Ember-Data

GuitarTrainer.StoreAdapter = DS.FixtureAdapter;

GuitarTrainer.StoreAdapter.registerTransform("object", {
	deserialize: function(serialized){
		return Ember.isNone(serialized) ? {} : serialized;
	},
	serialize: function(deserialized){
		return Ember.isNone(deserialized) ? {} : deserialized;
	}
});

GuitarTrainer.Store = DS.Store.extend({
  revision: 11,
  adapter: "GuitarTrainer.StoreAdapter" // Simulates remote calls.  Looks for a FIXTURES property on the model and loads data from there.
});
