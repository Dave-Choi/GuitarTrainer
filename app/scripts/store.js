// Requires Ember-Data
GuitarTrainer.Store = DS.Store.extend({
  revision: 11,
  adapter: "DS.FixtureAdapter" // Simulates remote calls.  Looks for a FIXTURES property on the model and loads data from there.
});
