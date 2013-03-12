/*
	Conditional graph that basically works as a state machine
	for an exercise.

	Opted not to use Ember.StateManager because it doesn't have
	enough control over what type of transition causes what behavior.

	In this case, transitions need to know what the source and destination states are
	to evaluate whether they should transition at all, and what actions need to be taken.
*/

GuitarTrainer.ExerciseGraph = DS.Model.extend({
	nodes: DS.hasMany("GuitarTrainer.ExerciseNode"),

	init: function(){
		this._super();
		this.set("nodes", this.get("nodes") || []);
	},

	addNode: function(node){
		var nodes = this.get("nodes");
		nodes.push(node);
		if(nodes.length == 1){
			this.set("currentNode", node);
		}
	},

	nextNode: function(){
		var currentNode = this.get("currentNode");
		return currentNode.nextNode();
	},

	advance: function(){
		// Go to the next node
		var next = this.nextNode();
		this.set("currentNode", next);

		// Return the new position.
		return next;
	}
});


GuitarTrainer.ExerciseNode = DS.Model.extend({
	section: DS.belongsTo("GuitarTrainer.Section"),
	transitions: DS.hasMany("GuitarTrainer.ExerciseTransition"),

	init: function(){
		this.set("transitions", this.get("transitions") || []);
	},

	addNewTransition: function(node, condition){
		if(!condition){
			condition = function(){
				return true;
			};
		}
		var transition = ConditionalGraph.Transition.create({
			sourceNode: this,
			targetNode: node,
			shouldTransition: condition
		});
		this.get("transitions").push(transition);
	},

	addTransition: function(transition){
		this.get("transitions").push(transition);
	},

	nextNode: function(){
		var transitions = this.get("transitions");
		var i, len = transitions.length;
		for(i=0; i<len; i++){
			var transition = transitions[i];
			if(transition.shouldTransition()){
				return transition.get("targetNode");
			}
		}
		return null;
	}
});

GuitarTrainer.ExerciseTransition = DS.Model.extend({
	sourceNode: DS.belongsTo("GuitarTrainer.ExerciseNode"),
	targetNode: DS.belongsTo("GuitarTrainer.ExerciseNode"),

	shouldTransition: function(){
		return true;
	}
});