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
  this.originPosition = options.originPosition || {
    x : 0,
    y : 0,
    z : 0
  };
  this.originRotation = options.originRotation || {
    x : 0,
    y : 0,
    z : 0
  };
  this.cameraZoomSpeed = options.cameraZoomSpeed || 0.5;

  // create the global camera
  this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  var viewerHandle=new ROS3D.ViewerHandle({
    tfClient:options.tfClient,
    camera:this.camera,
    frame:options.frame
  });
};
