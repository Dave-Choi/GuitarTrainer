/*
	World class handles scene creation, and basic camera interface.
*/
GuitarTrainer.World = Ember.Object.extend({
	scene: null,
	renderer: null,
	composer: null,
	povNode: null, // Node containing the camera and a point light source
	shiftingNode: null,
	/* shiftingNode contains geometry that moves with the view
		This includes the povNode, the instrument and track.

		The camera and perceived statics move to simplify note spawning and placement as
		the z coordinate can just be time parametric.
		
		Moving the view through static targets makes it easy to shift back and forth to specific points in time,
		alter tempo by adjusting scroll speed, etc.
		Targets are guaranteed to be fixed relative to each other without a complex coordinating system
	*/

	camera: null,
	camLight: null,

	init: function(){
		this._super();
		var $container = $("#exercise");
		var height = $container.height(), width = $container.width();
		var scene = new THREE.Scene();

		var renderer = new THREE.WebGLRenderer({
			clearColor: 0x000000,
			clearAlpha: 1,
			antialias: false
		});
		renderer.setSize(width, height);
		renderer.autoClear = false;

		var initialPosition = {x: 12, y: 7, z: 18};
		var shiftingNode = new THREE.Object3D();

		var povNode = new THREE.Object3D();
		shiftingNode.add(povNode);
		povNode.position = initialPosition;

		var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
		camera.rotation = {x: -0.2, y: 0.25, z: 0};
		var light = new THREE.PointLight(0xffffff);

		povNode.add(camera);
		povNode.add(light);
		scene.add(shiftingNode);

		var renderPass = new THREE.RenderPass(scene, camera);
		var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
		effectFXAA.uniforms.resolution.value.set( 1 / window.innerWidth, 1 / window.innerHeight );
		var effectBloom = new THREE.BloomPass(1.3);
		var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
		effectCopy.renderToScreen = true;

		var composer = new THREE.EffectComposer(renderer);
		composer.addPass(renderPass);
		composer.addPass(effectFXAA);
		composer.addPass(effectBloom);
		composer.addPass(effectCopy);

		this.set("renderer", renderer);
		this.set("composer", composer);
		this.set("scene", scene);
		this.set("camera", camera);
		this.set("camLight", light);
		this.set("shiftingNode", shiftingNode);
		this.set("povNode", povNode);

		$container.append(renderer.domElement);
		//renderer.setClearColorHex(0x000000, renderer.getClearAlpha());

		renderer.render(scene, camera);
	},

	tweenPosBy: function(obj, vector, time, easing){
		var currPos = obj.position;
		var target = {
			x: currPos.x + vector.x,
			y: currPos.y + vector.y,
			z: currPos.z + vector.z
		};
		new TWEEN.Tween(obj.position).to(target, time).easing(easing).start();
	},

	render: function(){
		var renderer = this.get("renderer");
		var composer = this.get("composer");
		TWEEN.update();
		renderer.clear();
		composer.render();
	},

	add: function(obj){
		this.get("scene").add(obj);
	},

	tweenPosTo: function(obj, target, time, easing){
		new TWEEN.Tween(obj.position).to(target, time).easing(TWEEN.Easing.Quadratic.InOut).start();
	},

	panTo: function(pos, time){
		var povNode = this.get("povNode");
		var target = {
			x: pos.x || povNode.position.x,
			y: pos.y || povNode.position.y,
			z: pos.z || povNode.position.z
		};
		this.tweenPosTo(povNode, target, time, TWEEN.Easing.Quadratic.InOut);
	},

	panBy: function(vector, time){
		var povNode = this.get("povNode");
		this.tweenPosBy(povNode, vector, time, TWEEN.Easing.Quadratic.InOut);
	},

	shiftBy: function(vector, time){
		var shiftingNode = this.get("shiftingNode");
		this.tweenPosBy(shiftingNode, vector, time, TWEEN.Easing.Linear.None);
	},

	panRight: function(){
		this.panBy({x: 5, y: 0, z: 0}, 200);
	},

	panLeft: function(){
		this.panBy({x: -5, y: 0, z: 0}, 200);
	},

	zoomIn: function(){
		//this.panBy({x: 0, y: 0, z: -5}, 200);
		this.shiftBy({x: 0, y: 0, z: -100}, 5000);
	},

	zoomOut: function(){
		this.panBy({x: 0, y: 0, z: 5}, 200);
	},

	turnLeft: function(){
		this.get("camera").rotate(0, 0.05, 0);
	},

	turnRight: function(){
		this.get("camera").rotate(0, -0.05, 0);
	}
});