/**
 * @author Carl Saldanha - csaldanha3@gatech.edu
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
  this.message = options.message;
  this.feedbackTopic = options.feedbackTopic;
  this.tfClient = options.tfClient;
  this.name = this.message.name;
  this.header = this.message.header;
  this.dragging = false;
  this.timeoutHandle = null;
  this.tfTransform = new ROSLIB.Transform();
  this.pose = new ROSLIB.Pose();

  this.setPoseFromClientBound = this.setPoseFromClient.bind(this);
  
  // start by setting the pose
  this.setPoseFromServer(this.message.pose);
  this.tfUpdateBound = this.tfUpdate.bind(this);
};
ROS3D.ViewerHandle.prototype.__proto__ = EventEmitter2.prototype;

/**
 * Subscribe to the TF associated with this interactive marker.
 */
ROS3D.ViewerHandle.prototype.subscribeTf = function() {
  // subscribe to tf updates if frame-fixed
  if (this.message.header.stamp.secs === 0.0 && this.message.header.stamp.nsecs === 0.0) {
    this.tfClient.subscribe(this.message.header.frame_id, this.tfUpdateBound);
  }
};

ROS3D.ViewerHandle.prototype.unsubscribeTf = function() {
  this.tfClient.unsubscribe(this.message.header.frame_id, this.tfUpdateBound);
};

/**
 * Emit the new pose that has come from the server.
 */
ROS3D.ViewerHandle.prototype.emitServerPoseUpdate = function() {
  var poseTransformed = new ROSLIB.Pose(this.pose);
  poseTransformed.applyTransform(this.tfTransform);
  this.emit('pose', poseTransformed);
};

/**
 * Update the pose based on the pose given by the server.
 *
 * @param poseMsg - the pose given by the server
 */
ROS3D.ViewerHandle.prototype.setPoseFromServer = function(poseMsg) {
  this.pose = new ROSLIB.Pose(poseMsg);
  this.emitServerPoseUpdate();
};

/**
 * Update the pose based on the TF given by the server.
 *
 * @param transformMsg - the TF given by the server
 */
ROS3D.ViewerHandle.prototype.tfUpdate = function(transformMsg) {
  this.tfTransform = new ROSLIB.Transform(transformMsg);
  this.emitServerPoseUpdate();
};

/**
 * Set the pose from the client based on the given event.
 *
 * @param event - the event to base the change off of
 */
ROS3D.ViewerHandle.prototype.setPoseFromClient = function(event) {
  // apply the transform
  this.pose = new ROSLIB.Pose(event);
  var inv = this.tfTransform.clone();
  inv.rotation.invert();
  inv.translation.multiplyQuaternion(inv.rotation);
  inv.translation.x *= -1;
  inv.translation.y *= -1;
  inv.translation.z *= -1;
  this.pose.applyTransform(inv);

  // send feedback to the server
  this.sendFeedback(ROS3D.INTERACTIVE_MARKER_POSE_UPDATE, undefined, 0, event.controlName);

  // keep sending pose feedback until the mouse goes up
  if (this.dragging) {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    this.timeoutHandle = setTimeout(this.setPoseFromClient.bind(this, event), 250);
  }
};