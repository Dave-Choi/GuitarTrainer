GuitarTrainer.ShapeFactory = Ember.Object.create({
	// TODO: Refactor this into sexy abstract stuff.  Too tired to think right now.
	sphere: function(args){
		args = args || {};
		var defaults = {
			color: 0xffffff,
			radius: 0.5,
			segments: 15,
			rings: 15
		};
		function getArg(name){
			return args[name] || defaults[name];
		}
		var material = new THREE.MeshPhongMaterial({
			color: getArg("color")
		});
		var geometry = new THREE.SphereGeometry(
			getArg("radius"),
			getArg("segments"),
			getArg("rings")
		);
		return new THREE.Mesh(geometry, material);
	},

	cylinder: function(args){
		args = args || {};
		var defaults = {
			color: 0xffffff,
			radiusTop: 0.5,
			radiusBottom: 0.5,
			height: 1,
			radiusSegments: 15,
			heightSegments: 15,
			openEnded: false
		};
		function getArg(name){
			return args[name] || defaults[name];
		}
		var material = new THREE.MeshPhongMaterial({
			color: getArg("color")
		});
		var geometry = new THREE.CylinderGeometry(
			getArg("radiusTop"),
			getArg("radiusBottom"),
			getArg("height"),
			getArg("radiusSegments"),
			getArg("heightSegments"),
			getArg("openEnded")
		);
		return new THREE.Mesh(geometry, material);
	},

	cube: function(args){
		args = args || {};
		var defaults = {
			color: 0xffffff,
			width: 1,
			height: 1,
			depth: 1,
			widthSegments: 1,
			heightSegments: 1,
			depthSegments: 1
		};
		function getArg(name){
			return args[name] || defaults[name];
		}
		var material = new THREE.MeshPhongMaterial({
			color: getArg("color")
		});
		var geometry = new THREE.CubeGeometry(
			getArg("width"),
			getArg("height"),
			getArg("depth"),
			getArg("widthSegments"),
			getArg("heightSegments"),
			getArg("depthSegments")
		);
		return new THREE.Mesh(geometry, material);
	}
});
