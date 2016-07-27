/**
 * @author David Gossow - dgossow@willowgarage.com
 * @author Russell Toris - rctoris@wpi.edu
 * @author Jihoon Lee - jihoonlee.in@gmail.com
 */

/**
TODO: change where TFClient comes. Retrofit for working stuff
**/

/**
 * A Viewer can be used to render an interactive 3D scene to a HTML5 canvas.
 *
 * @constructor
 * @param options - object with following keys:
 *
 *  * divID - the ID of the div to place the viewer in
 *  * width - the initial width, in pixels, of the canvas
 *  * height - the initial height, in pixels, of the canvas
 *  * background (optional) - the color to render the background, like '#efefef'
 *  * alpha (optional) - the alpha of the background
 *  * antialias (optional) - if antialiasing should be used
 *  * intensity (optional) - the lighting intensity setting to use
 *  * cameraPosition (optional) - the starting position of the camera
 *  * cameraRotation (optional) - the rotation of the origin with respect to the scene
 *  * interactive (optional) - specifies whether the user can interact with the camera
 */
ROS3D.Viewer = function(options) {
  var that = this;
  options = options || {};
  var divID = options.divID;
  var width = options.width;
  var height = options.height;
  var background = options.background || '#111111';
  var alpha = options.alpha || 1.0;
  var antialias = options.antialias;
  var intensity = options.intensity || 0.66;
  var near = options.near || 0.01;
  var far = options.far || 1000;
  var fov = options.fov || 40;
  var interactive = options.interactive;
  var tfClient = options.tfClient;
  var frame = options.frame;
  if (interactive===null){
    interactive=true;
  }

  var cameraRotation = options.cameraRotation || {
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

  this.cameras = [];

  // create the canvas to render to
  this.renderer = new THREE.WebGLRenderer({
    antialias : antialias,
    alpha : true
  });
  this.renderer.setClearColor(parseInt(background.replace('#', '0x'), 16), alpha);
  this.renderer.sortObjects = false;
  this.renderer.setSize(width, height);
  this.renderer.shadowMapEnabled = false;
  this.renderer.autoClear = false;

  // create the global scene
  this.scene = new THREE.Scene();
  //a parent object in case we need to change the origin of the scene
  this.rootObject = new THREE.Object3D();
  this.rootObject.translateX(cameraPosition.x);
  this.rootObject.translateY(cameraPosition.y);
  this.rootObject.translateZ(cameraPosition.z);

  this.rootObject.rotateX(cameraRotation.x);
  this.rootObject.rotateY(cameraRotation.y);
  this.rootObject.rotateZ(cameraRotation.z);

  this.scene.add(this.rootObject);

  // create the global camera
  this.cameras.push(new ROS3D.ViewerCamera({
    near :near,
    far :far,
    fov: fov,
    interactive :interactive,
    aspect : width / height,
    cameraPosition : cameraPosition,
    cameraRotation : cameraRotation,
    tfClient: tfClient,
    frame: frame
  }));

  this.camera= this.cameras[0].camera;
  this.scene.add(this.camera);

  // add controls to the camera
  if(interactive){
    this.cameraControls = new ROS3D.OrbitControls({
      scene : this.rootObject,
      camera : this.camera
    });
    this.cameraControls.userZoomSpeed = cameraZoomSpeed;
  }

  // lights
  this.scene.add(new THREE.AmbientLight(0x555555));
  this.directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
  this.rootObject.add(this.directionalLight);

  // propagates mouse events to three.js objects
  this.selectableObjects = new THREE.Object3D();
  var fallbackObject=null;
  if (interactive){
    fallbackObject=this.cameraControls;
  }
  this.rootObject.add(this.selectableObjects);
  var mouseHandler = new ROS3D.MouseHandler({
    renderer : this.renderer,
    camera : this.camera,
    rootObject : this.selectableObjects,
    fallbackTarget:fallbackObject
  });

  // highlights the receiver of mouse events
  this.highlighter = new ROS3D.Highlighter({
    mouseHandler : mouseHandler
  });

  /**
   * Renders the associated scene to the viewer.
   */
  function draw() {
    // update the controls
    if (interactive){
      that.cameraControls.update();
    }
    // put light to the top-left of the camera
    that.directionalLight.position = that.camera.localToWorld(new THREE.Vector3(-1, 1, 0));
    that.directionalLight.position.normalize();

    // set the scene
    that.renderer.clear(true, true, true);
    that.renderer.render(that.scene, that.camera);

    // render any mouseovers
    that.highlighter.renderHighlight(that.renderer, that.scene, that.camera);

    // draw the frame
    requestAnimationFrame(draw);
  }

  // add the renderer to the page
  document.getElementById(divID).appendChild(this.renderer.domElement);

  // begin the animation
  draw();
};

/**
 * Add the given THREE Object3D to the global scene in the viewer.
 *
 * @param object - the THREE Object3D to add
 * @param selectable (optional) - if the object should be added to the selectable list
 */
ROS3D.Viewer.prototype.addObject = function(object, selectable) {
  if (selectable) {
    this.selectableObjects.add(object);
  } else {
    this.rootObject.add(object);
  }
};

/**
 * change the camera of the global scene in the viewer
 *
 * @param cameraID The ID of the camera from cameras
 */
ROS3D.Viewer.prototype.changeCamera = function(cameraID) {
  if (cameraID<this.cameras.length && cameraID>=0){
    this.camera = this.cameras[cameraID].camera;
    var position = this.cameras[cameraID].cameraPosition;
    var rotation = this.cameras[cameraID].cameraRotation;
    //move root object rotation to 0,0,0
    this.rootObject.rotateX(-this.rootObject.rotation.x);
    this.rootObject.rotateY(-this.rootObject.rotation.y);
    this.rootObject.rotateZ(-this.rootObject.rotation.z);
    this.rootObject.position.setX(position.x);
    this.rootObject.position.setY(position.y);
    this.rootObject.position.setZ(position.z);
    this.rootObject.rotateX(rotation.x);
    this.rootObject.rotateY(rotation.y);
    this.rootObject.rotateZ(rotation.z);
    }
};

/**
 * Add a camera to the global scene
 *
 * @param cameraID The ID of the camera from cameras TODO
 * @param viewerCamera A ViewerCamera
 */
ROS3D.Viewer.prototype.addCamera = function(viewerCamera){
    this.cameras.push(viewerCamera);
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
