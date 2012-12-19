/*
	World class handles scene creation, and basic camera interface.
*/
GuitarTrainer.World = Ember.Object.extend({
	scene: null,
	renderer: null,
	composer: null,
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

		var camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 10000);
		camera.position = initialPosition;
		camera.rotation = {x: -0.2, y: 0.25, z: 0};
		var light = new THREE.PointLight(0xffffff);
		light.position = initialPosition;

		scene.add(camera);
		scene.add(light);

		var renderPass = new THREE.RenderPass(scene, camera);
		var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
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

		$container.append(renderer.domElement);
		//renderer.setClearColorHex(0x000000, renderer.getClearAlpha());

		renderer.render(scene, camera);
	},

	tweenPosBy: function(obj, vector, time){
		var currPos = obj.position;
		var target = {
			x: currPos.x + vector.x,
			y: currPos.y + vector.y,
			z: currPos.z + vector.z
		};
		new TWEEN.Tween(obj.position).to(target, time).easing(TWEEN.Easing.Quadratic.InOut).start();
	},

	render: function(){
		var renderer = this.get("renderer");
		var composer = this.get("composer");
		var scene = this.get("scene");
		var camera = this.get("camera");
		TWEEN.update();
		renderer.clear();
		composer.render();
	},

	add: function(obj){
		this.get("scene").add(obj);
	},

	tweenPosTo: function(obj, target, time){
		new TWEEN.Tween(obj.position).to(target, time).easing(TWEEN.Easing.Quadratic.InOut).start();
	},

	panTo: function(pos, time){
		var camera = this.get("camera");
		var camLight = this.get("camLight");
		var target = {
			x: pos.x || camera.position.x,
			y: pos.y || camera.position.y,
			z: pos.z || camera.position.z
		};
		this.tweenPosTo(camera, target, time);
		this.tweenPosTo(camLight, target, time);
	},

	panBy: function(vector, time){
		var camera = this.get("camera");
		var camLight = this.get("camLight");
		this.tweenPosBy(camera, vector, time);
		this.tweenPosBy(camLight, vector, time);
	},

	panRight: function(){
		this.panBy({x: 5, y: 0, z: 0}, 200);
	},

	panLeft: function(){
		this.panBy({x: -5, y: 0, z: 0}, 200);
	},

	zoomIn: function(){
		this.panBy({x: 0, y: 0, z: -5}, 200);
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