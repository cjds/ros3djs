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
  this.dragging = false;
  this.timeoutHandle = null;
  this.tfTransform = new ROSLIB.Transform();
  this.camera = options.camera;
  
  // start by setting the pose
  this.tfUpdateBound = this.tfUpdate.bind(this);
};

ROS3D.ViewerHandle.prototype.__proto__ = EventEmitter2.prototype;

/**
 * Subscribe to the TF associated with this interactive marker.
 */
ROS3D.ViewerHandle.prototype.subscribeTf = function() {
  // subscribe to tf updates if frame-fixed
  this.tfClient.subscribe(this.message.header.frame_id, this.tfUpdateBound);
};

ROS3D.ViewerHandle.prototype.unsubscribeTf = function() {
  this.tfClient.unsubscribe(this.message.header.frame_id, this.tfUpdateBound);
};

/**
 * Emit the new pose that has come from the server.
 */
ROS3D.ViewerHandle.prototype.emitServerPoseUpdate = function() {
  var transform = this.tfTransform;
  this.camera.position.set(transform.translation.x,transform.translation.y,transform.translation.z);
  this.camera.quaternion.set(transform.rotation.x,transform.rotation.y,transform.rotation.z,transform.rotation.w);
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
