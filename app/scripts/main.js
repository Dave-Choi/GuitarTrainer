var GuitarTrainer = Ember.Application.create();

GuitarTrainer.ready = function(){
	/*
		Init one audio context and microphone node for the lifetime of the app.

		Technically, this stuff isn't used until you're actually doing an exercise,
		but better to get it out of the way, because you can't really do anything
		with the app without it, and you don't want to get people excited for no reason
		(e.g. Their mic doesn't work properly).
	*/
	GuitarTrainer.audioContext = new webkitAudioContext();
	GuitarTrainer.microphone = GuitarTrainer.MicrophoneNode.create({
		audioContext: GuitarTrainer.audioContext
	});
	GuitarTrainer.microphone.connect();
};