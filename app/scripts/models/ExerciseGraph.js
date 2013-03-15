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

	advance: function(attributes){
		// Go to the next node
		var next = this.nextNode(attributes);
		this.set("currentNode", next);

		// Return the new position.
		return next;
	}
});

GuitarTrainer.ExerciseGraph.FIXTURES = [
	{
		id: 1,
		nodes: [1, 2]
	}
];


GuitarTrainer.ExerciseNode = DS.Model.extend({
	section: DS.belongsTo("GuitarTrainer.Section"),
	transitions: DS.hasMany("GuitarTrainer.ExerciseTransition"),

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

	nextNode: function(attributes){
		/*
			This function goes through each of this node's transitions, in order,
			and returns the target of the first transition to return true on its
			shouldTransition() method, which takes an array of attributes describing
			the status of the exercise being played, which can include things like
			the player's accuracy on a given section, or the number of times a section
			has been played.

			attributes will generally be provided by the ExercisePlayController.
		*/
		var transitions = this.get("transitions");
		var i, len = transitions.length;
		for(i=0; i<len; i++){
			var transition = transitions[i];
			if(transition.shouldTransition(attributes)){
				return transition.get("targetNode");
			}
		}
		return null;
	}
});

GuitarTrainer.ExerciseNode.FIXTURES = [
	{
		id: 1,
		section: 1,
		transitions: [1, 2]
	},
	{
		id: 2,
		section: 2,
		transitions: [3]
	}
];

GuitarTrainer.ExerciseTransition = DS.Model.extend({
	targetNode: DS.belongsTo("GuitarTrainer.ExerciseNode"),

	attributeName: DS.attr("string"),	// The name of the attribute on the controller to compare to the reference value
	comparator: DS.attr("string"),		// The type of comparison operation to use
	referenceValue: DS.attr("string"),	/*
		The reference value to use in the comparison.

		There are problems here, in that it may be desirable for this to be a dynamic
		value, such as if you want the transition to happen if the accuracy of a played
		section is greater than the accuracy of the previous attempt.

		This could possibly be expanded upon by adding reference types, with a type of "static"
		serving as the current model.  And then going to the controller for dynamic attributes.

		For complex behavior like that, nodes will need to register attributes on the controller
		or something.
	*/

	compareFunctions: {
		// Is there a less copy & paste way to do this that doesn't involve eval?
		"<": function(controller){
			return controller.get(this.get("attributeName")) < this.get("referenceValue");
		}.bind(this),

		"<=": function(controller){
			return controller.get(this.get("attributeName")) <= this.get("referenceValue");
		}.bind(this),

		">": function(controller){
			return controller.get(this.get("attributeName")) > this.get("referenceValue");
		}.bind(this),

		">=": function(controller){
			return controller.get(this.get("attributeName")) >= this.get("referenceValue");
		}.bind(this),

		"==": function(controller){
			return controller.get(this.get("attributeName")) == this.get("referenceValue");
		}.bind(this),

		"!=": function(controller){
			return controller.get(this.get("attributeName")) != this.get("referenceValue");
		}.bind(this)
	},

	shouldTransition: function(attributes){
		var compareFunction = compareFunctions[this.get("comparator")];
		var attr = attributes[this.get("attribute")];
		var val = this.get("value");

		return compareFunction(attr, val);
	}
});

GuitarTrainer.ExerciseTransition.FIXTURES = [
	{
		id: 1,
		targetNode: 2,

		attributeName: "sectionAccuracy",
		comparator: ">=",
		referenceValue: "80"
	},
	{
		id: 2,
		targetNode: 1,

		attributeName: "sectionAccuracy",
		comparator: "<",
		referenceValue: "80"
	},
	{
		id: 3,
		targetNode: 2,

		attributeName: "sectionAccuracy",
		comparator: "<",
		referenceValue: "80"
	}
];