/**
 * @author Carl Saldanha - dgossow@willowgarage.com
 */

/**
 * A ViewerCamera is used as a camera for the Viewer.
 *
 * @constructor
 * @param options - object with following keys:
 *  * cameraPosition (optional) - the starting position of the camera
 *  * originPosition (optional) - the position of the origin with respect to the scene
 *  * originRotation (optional) - the rotation of the origin with respect to the scene
 *  * aspect (optional) - the aspect ratio of the camera
 *  * near (optional) - the nearest point that the camera can perceive
 *  * far (optional) - the furthest point of the perspective camera
 *  * fov (optional) - the field of view of the camera specified in degrees
 *  * interactive (optional) - specifies whether the user can interact with the camera
 */
ROS3D.ViewerCamera = function(options) {
  var that = this;
  options = options || {};
  var near = options.near || 0.01;
  var far = options.far || 1000;
  var fov = options.fov || 40;
  var interactive = options.interactive;
  if (interactive===null){
    interactive=true;
  }

  console.log(interactive);
  var originPosition = options.originPosition || {
    x : 0,
    y : 0,
    z : 0
  };
  var originRotation = options.originRotation || {
    x : 0,
    y : 0,
    z : 0
  };
  var cameraPosition = options.cameraPose || {
    x : 3,
    y : 3,
    z : 3
  };
  var cameraZoomSpeed = options.cameraZoomSpeed || 0.5;
  var aspect = options.aspect;

  // create the global scene
  this.scene = new THREE.Scene();
  //a parent object in case we need to change the origin of the scene
  this.rootObject = new THREE.Object3D();
  this.rootObject.translateX(originPosition.x);
  this.rootObject.translateY(originPosition.y);
  this.rootObject.translateZ(originPosition.z);

  this.rootObject.rotateX(originRotation.x);
  this.rootObject.rotateZ(originRotation.y);
  this.rootObject.rotateY(originRotation.z);

  this.scene.add(this.rootObject);

  // create the global camera
  this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  this.camera.position.x = cameraPosition.x;
  this.camera.position.y = cameraPosition.y;
  this.camera.position.z = cameraPosition.z;
  

  // add controls to the camera
  this.cameraControls = new ROS3D.OrbitControls({
    scene : this.scene,
    camera : this.camera
  });
  this.cameraControls.userZoomSpeed = cameraZoomSpeed;
  // propagates mouse events to three.js objects

  this.selectableObjects = new THREE.Object3D();

  var fallbackObject=null;
  if (interactive){
    fallbackObject=this.cameraControls;
  }
  // this.rootObject.add(this.selectableObjects);
  // var mouseHandler = new ROS3D.MouseHandler({
  //   renderer : this.renderer,
  //   camera : this.camera,
  //   rootObject : this.selectableObjects,
  //   fallbackObject:fallbackObject
  // });

  // highlights the receiver of mouse events
  // this.highlighter = new ROS3D.Highlighter({
  //   mouseHandler : mouseHandler
  // });

  /**
   * Renders the associated scene to the viewer.
   */
  function draw() {
    // update the controls
    that.cameraControls.update();
    
    // draw the frame
    requestAnimationFrame(draw);
  }
  // begin the animation
  draw();
};

/**
 * Add the given THREE Object3D to the global scene in the viewer.
 *
 * @param object - the THREE Object3D to add
 * @param selectable (optional) - if the object should be added to the selectable list
 */
ROS3D.ViewerCamera.prototype.addObject = function(object, selectable) {
  if (selectable) {
    this.selectableObjects.add(object);
  } else {
    this.rootObject.add(object);
  }
};

/**
 * Resize 3D viewer
 *
 * @param width - new width value
 * @param height - new height value
 */
ROS3D.Viewer.prototype.resize = function(width, height) {
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(width, height);
};
