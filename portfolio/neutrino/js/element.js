// THIS IS THE CODE FOR THE ATOMIC MODEL AND MANEUVERABILITY OPTIONS

// MAIN SCRIPT CONTROLLING THE ATOMIC ELEMENT USING LEAP MOTION CONTROL

var camera, scene, renderer, projector, light;
var objects = [], objectsControls = [], cameraControls;
var coords1, coords2, coords3;
var lastControlsIndex = -1, controlsIndex = -1, index = -1;

function init() {

  // WEBGL SUPPORT? LOOK INTO TO THIS
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    return false;
  };

  // RENDERER - SETTING THE SCENE USING WEBGL
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize($(window).width(), $(window).height());
  renderer.setClearColor(0x000000, 1);
  $("#container").append(renderer.domElement);

  // CAMERA POSITIONING
  camera = new THREE.PerspectiveCamera(25, $(window).width()/$(window).height(), 0.1, 10000);
  camera.position.x = 500;
  camera.position.y = 500;
  camera.position.z = 500;
  var origin = new THREE.Vector3(0, 0, 0);
  camera.lookAt(origin);

  // LEAP MOTION CAMERA CONTROLS / INTEGRATED WITH THE LEAP CONTROL SENSOR
  cameraControls = new THREE.LeapCameraControls(camera);

  cameraControls.rotateEnabled  = true;
  cameraControls.rotateSpeed    = 3;
  cameraControls.rotateHands    = 1;
  cameraControls.rotateFingers  = [2, 3];
  
  cameraControls.zoomEnabled    = true;
  cameraControls.zoomSpeed      = 6;
  cameraControls.zoomHands      = 1;
  cameraControls.zoomFingers    = [4, 5];
  cameraControls.zoomMin        = 50;
  cameraControls.zoomMax        = 2000;
  
  cameraControls.panEnabled     = true;
  cameraControls.panSpeed       = 2;
  cameraControls.panHands       = 2;
  cameraControls.panFingers     = [6, 12];
  // LEFT HANDED CONTROL
  cameraControls.panRightHanded = true; 

  // WORLD SETUP
  scene = new THREE.Scene(); 

  // PROJECTOR
  projector = new THREE.Projector();       

  // CAMERA TARGET COORDINATION SYSTEM
  coords1 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 0, 0xcccccc);
  coords2 = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 0, 0xcccccc);
  coords3 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 0, 0xcccccc);
  scene.add(coords1);
  scene.add(coords2);
  scene.add(coords3);

  // WORLD COORDINATE SYSTEM (THIN DASHED DIMENSIONAL)
  var lineGeometry = new THREE.Geometry();
  var vertArray = lineGeometry.vertices;
  vertArray.push(new THREE.Vector3(1000, 0, 0), origin, new THREE.Vector3(0, 1000, 0), origin, new THREE.Vector3(0, 0, 1000));

  // WORLD AXIS SYSTEM
  // lineGeometry.computeLineDistances();
  // var lineMaterial = new THREE.LineDashedMaterial({color: 0xcccccc, dashSize: 0, gapSize: 0});
  // var coords = new THREE.Line(lineGeometry, lineMaterial);
  // scene.add(coords);

  // ELEMENTS
  for (var i = 0; i < 4; i ++) {
    var geometry = new THREE.SphereGeometry(Math.random()*60, Math.random()*60, Math.random()*60);
    var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
      color: 0x29a0e3, 
      wireframe: true,
      wireframeLinewidth: 1.5}));
    object.position.x = Math.random()* 0 - 0;
    object.position.y = Math.random()* 0 - 0;
    object.position.z = Math.random()* 0 - 0;

    object.rotation.x = Math.random()*2*Math.PI;
    object.rotation.y = Math.random()*2*Math.PI;
    object.rotation.z = Math.random()*2*Math.PI;

    object.receiveShadow = true;

    // LEAP OBJECTIVE CONTROLS
    var objectControls = new THREE.LeapObjectControls(camera, object);

    objectControls.rotateEnabled  = true;
    objectControls.rotateSpeed    = 3;
    objectControls.rotateHands    = 1;
    objectControls.rotateFingers  = [2, 3];
    
    objectControls.scaleEnabled   = true;
    objectControls.scaleSpeed     = 3;
    objectControls.scaleHands     = 1;
    objectControls.scaleFingers   = [4, 5];
    
    objectControls.panEnabled     = true;
    objectControls.panSpeed       = 3;
    objectControls.panHands       = 2;
    objectControls.panFingers     = [6, 12];

    // FOR LEFT HANDED PEOPLE
    objectControls.panRightHanded = false; 

    scene.add(object);
    objects.push(object);
    objectsControls.push(objectControls);
  };

  // LIGHT SOURCE
  light = new THREE.PointLight(0xefefef);
  light.position = camera.position;
  scene.add(light);

  // RESIZING EVENT
  window.addEventListener('resize', onWindowResize, false);

  // RENDER (If no leap motion controller is detected, then this call is needed in order to see the plot.)
  render();
};

function changeControlsIndex() {
  if (lastControlsIndex == controlsIndex) {
    if (index != controlsIndex && controlsIndex > -2) {
      // NEW OBJECT OR CAMERA TO CONTROL
      if (controlsIndex > -2) {
        if (index > -1) objects[index].material.color.setHex(0xefefef);
        index = controlsIndex;
        if (index > -1) objects[index].material.color.setHex(0xff0000);
      }
    };
  }; 
  lastControlsIndex = controlsIndex;
};

function transform(tipPosition, w, h) {
  var width = 150;
  var height = 150;
  var minHeight = 100;

  var ftx = tipPosition[0];
  var fty = tipPosition[1];
  ftx = (ftx > width ? width - 1 : (ftx < -width ? -width + 1 : ftx));
  fty = (fty > 2*height ? 2*height - 1 : (fty < minHeight ? minHeight + 1 : fty));
  var x = THREE.Math.mapLinear(ftx, -width, width, 0, w);
  var y = THREE.Math.mapLinear(fty, 2*height, minHeight, 0, h);
  return [x, y];
};

function showCursor(frame) {
  var hl = frame.hands.length;
  var fl = frame.pointables.length;

  if (hl == 1 && fl == 1) {
    var f = frame.pointables[0];
    var cont = $(renderer.domElement);
    var offset = cont.offset();
    var coords = transform(f.tipPosition, cont.width(), cont.height());
    $("#cursor").css('left', offset.left + coords[0] - (($("#cursor").width() - 1)/2 + 1));
    $("#cursor").css('top', offset.top + coords[1] - (($("#cursor").height() - 1)/2 + 1));
  } else {
    $("#cursor").css('left', -1000);
    $("#cursor").css('top', -1000);
  };
};

function focusObject(frame) {

  var hl = frame.hands.length;
  var fl = frame.pointables.length;

  if (hl == 1 && fl == 1) {
    var f = frame.pointables[0];
    var cont = $(renderer.domElement);
    var coords = transform(f.tipPosition, cont.width(), cont.height());
    var vpx = (coords[0]/cont.width())*2 - 1;
    var vpy = -(coords[1]/cont.height())*2 + 1;
    var vector = new THREE.Vector3(vpx, vpy, 0.5);
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) { 
      var i = 0;
      while(!intersects[i].object.visible) i++;
      var intersected = intersects[i];
      return objects.indexOf(intersected.object);
    } else {
      return -1;
    };
  };

  return -2;
};

function render() {
  renderer.render(scene, camera);
};

function onWindowResize() {
  camera.aspect = $(window).width()/$(window).height();
  camera.updateProjectionMatrix();
  renderer.setSize($(window).width(), $(window).height());
  render();
};

$(function(){
  init();

    // LEAP LOOP
    Leap.loop(function(frame) {
    // SHOW CURSOR
    showCursor(frame);

    // SET CORRECT CAMERA CONTROL
    controlsIndex = focusObject(frame);
    if (index == -1) {
      cameraControls.update(frame);
    } else {
      objectsControls[index].update(frame);
    };

    // CUSTOM MODIFICATIONS (Here: The coordinate system always on target and light movement.)
    coords1.position = cameraControls.target;
    coords2.position = cameraControls.target;
    coords3.position = cameraControls.target;
    light.position   = camera.position;

    render();
  });

  // DETECT CAMERA CONTROLS
  setInterval(changeControlsIndex, 250);
});
