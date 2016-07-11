/**
 * @author Carl Saldanha - csaldanha3@gatech.edu
 */

/*
@TODO
change the name of method emitServerPosUpdate
remove extra variables
update set camera pose from client
*/

/**
 * Handle with signals for the camera
 *
 * Emits the following events:
 *
 *  * 'pose' - emitted when a new pose comes from the server
 *
 * @constructor
 * @param options - object with following keys:
 *
  *  * tfClient - a handle to the TF client to use
 */
ROS3D.ViewerHandle = function(options) {
  options = options || {};
  this.tfClient = options.tfClient;
  this.camera = options.camera;
  this.frame = options.frame;
  this.tfTransform = new ROSLIB.Transform();
  //this.camera.zoom = 1.25;

  // start by setting the pose
  this.tfUpdateBound = this.tfUpdate.bind(this);

  this.subscribeTf();
};

/**
 * Subscribe to the TF associated with this interactive marker.
 */
ROS3D.ViewerHandle.prototype.subscribeTf = function() {
  // subscribe to tf updates if frame-fixed
  this.tfClient.subscribe(this.frame, this.tfUpdateBound);
};

ROS3D.ViewerHandle.prototype.unsubscribeTf = function() {
  this.tfClient.unsubscribe(this.frame, this.tfUpdateBound);
};

/**
 * Emit the new pose that has come from the server.
 */
ROS3D.ViewerHandle.prototype.emitServerPoseUpdate = function() {
  var inv = this.tfTransform.clone();
  inv.rotation.invert();
  inv.translation.multiplyQuaternion(inv.rotation);
  inv.translation.x *= -1;
  inv.translation.y *= -1;
  inv.translation.z *= -1;
  this.camera.quaternion.set(inv.rotation.x,inv.rotation.y,inv.rotation.z,inv.rotation.w);
  this.camera.position.set(inv.translation.x,inv.translation.y,inv.translation.z);
  this.camera.updateMatrix();
  this.camera.updateMatrixWorld();
  var out = this.camera.localToWorld(new THREE.Vector3(1,0,0));
  this.camera.lookAt(out);

};

/**
 * Update the pose based on the TF given by the server.
 *
 * @param transformMsg - the TF given by the server
 */
ROS3D.ViewerHandle.prototype.tfUpdate = function(transform) {
  this.tfTransform = transform;
  this.emitServerPoseUpdate();
};
