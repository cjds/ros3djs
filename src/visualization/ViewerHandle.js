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
  this.camera.zoom = 1.25;
  // this.camera.projectionMatrix.elements = [1.1129, 0,0,0,0,2.009,0,0,0,0,-1.001, -1, 0,0,-0.0400266,0];
  // this.camera.up = new THREE.Vector3(0,0,1);

  // this.camera.updateProjectionMatrix();

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
  console.log('Transfrom is transforming');
  console.log(this.camera.projectionMatrix);
  transform.transform.translation.z-=0.90
// transform.transform.translation.x+=0.02
// transform.transform.translation.y-=0.12
  var inv = this.tfTransform.clone();
  inv.rotation.invert();
  inv.translation.multiplyQuaternion(inv.rotation);
  inv.translation.x *= -1;
  inv.translation.y *= -1;
  inv.translation.z *= -1;
  this.camera.quaternion.set(inv.rotation.x,inv.rotation.y,inv.rotation.z,inv.rotation.w);
  this.camera.position.set(inv.translation.x,inv.translation.y,inv.translation.z);
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
