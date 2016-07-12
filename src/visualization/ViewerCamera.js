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
  var aspect = options.aspect;
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
  var cameraZoomSpeed = options.cameraZoomSpeed || 0.5;

  // create the global camera
  this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // add controls to the camera
  this.cameraControls = new ROS3D.OrbitControls({
    scene : this.scene,
    camera : this.camera
  });
  this.cameraControls.userZoomSpeed = cameraZoomSpeed;
  // propagates mouse events to three.js objects

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
