GuitarTrainer.MicrophoneNode = Ember.Object.extend({
	audioContext: null,
	sourceNode: null,

	isConnected: function(){
		return (this.get("sourceNode") !== null);
	}.property("sourceNode"),

	connectSuccess: function(stream){
		console.log("Microphone connected.");

		var context = this.get("audioContext");
		this.set("sourceNode", context.createMediaStreamSource(stream));
	},

	connectFailure: function(){
		console.log("Microphone failed to connect.");
	},

	connect: function(){
		navigator.webkitGetUserMedia(
			{
				audio: true
			},
			function(stream){
				this.connectSuccess(stream);
			}.bind(this), // this would normally be bound to the window
			function(){
				this.connectFailure();
			}.bind(this)
		);
	}
});
