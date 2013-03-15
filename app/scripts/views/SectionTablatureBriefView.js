/*
	Provides an abridged tablature view for an exercise section.

	The view draws a staff, and compresses section notes along the
	time axis to fit as much information about the section as possible
	into as little space as possible.

	This is similar to how ASCII tablature generally doesn't have
	time scaling, and is left to the reader to figure out.
*/

GuitarTrainer.SectionTablatureBriefView = Ember.View.extend({
	templateName: "sectionTablatureBrief",

	contentChanged: function(){
		if(!this.get("content.instrument.isLoaded")){
			return;
		}

		var content = this.get("content");
		var canvas = this.$("canvas")[0];
		var context = canvas.getContext("2d");
		var instrument = content.get("instrument");

		var staffView = GuitarTrainer.TablatureStaffView.create({
			instrument: content.get("instrument"),
			shouldDrawCursor: false
		});
		staffView.render(context);

	}.observes("content.instrument.tuningNotes")

});