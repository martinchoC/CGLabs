// WebGL context and extensions
var gl = null;
var _gl = null;//This extension is to support VAOs in webgl1. (In webgl2, functions are called directly to gl object.)

//Shader program
var shaderProgram  = null; 

//Uniform locations.
var u_modelMatrix;
var u_viewMatrix;
var u_projMatrix;
var u_modelColor;

//Uniform values.
var modelColor = Utils.hexToRgbFloat("#FFFFFF");

//Objects (OBJ)
var mesa;
var drone;


// Auxiliary objects
var axis;

// Camera
var camera;

// Flags
var isSolid = false;

function loadObjects(pos_location) {
	// Load each object (OBJ) and generate its mesh
	mesa = new Object(mesaSource, pos_location);
	mesa.generateModel();

	drone = new Object(dronSource, pos_location);
	drone.generateModel();
}

function setObjectsTransformations() {
	let matrix = mat4.create();
	let translation = mat4.create();
	let scaling = mat4.create();

	// Set mesa model matrix
	matrix = mat4.create();
	translation = mat4.create();
	scaling = mat4.create();
	mat4.fromScaling(scaling, [0.008, 0.008, 0.008]);
	mat4.fromTranslation(translation, [0.00, 0.00, 0.0]);
	mat4.multiply(matrix, translation, scaling);
	mesa.setModelMatrix(matrix);

	// Set dron model matrix
	matrix = mat4.create();
	translation = mat4.create();
	scaling = mat4.create();
	mat4.fromScaling(scaling, [0.004/1.5, 0.004/1.5, 0.004/1.5]);
	mat4.fromTranslation(translation, [0.0, 0.6, 0.0]);
	mat4.multiply(matrix, translation, scaling);
	drone.setModelMatrix(matrix);

	
}

function mul(matrix, matA, matB, matC){
	mat4.multiply(matrix, matB, matC);
	mat4.multiply(matrix, matrix, matA);
	return matrix;
}

function setObjectsTransformations2() {
	let matrix = mat4.create();
	let translation = mat4.create();
	let scaling = mat4.create();

	// matrices de rotacion
	let rotation = mat4.create();
	let rotationX = mat4.create();
	let rotationY = mat4.create();
	let rotationZ = mat4.create();
	var angleX = 90;
	var angleY = 0;
	var angleZ = 0;

	// Set dron model matrix
	matrix = mat4.create();
	translation = mat4.create();
	scaling = mat4.create();
	mat4.fromScaling(scaling, [0.004, 0.004, 0.004]); 
 	mat4.fromTranslation(translation, [0.5, 0.6, 0.3]);
	mat4.multiply(matrix, translation, scaling);
	drone.setModelMatrix(matrix);

	// obtencion de matrices de rotacion con respcto al eje X
	mat4.fromXRotation(rotationX, angleX * Math.PI / 180);
	// obtencion de matrices de rotacion con respcto al eje Y
	mat4.fromYRotation(rotationY, angleY * Math.PI / 180);
	// obtencion de matrices de rotacion con respcto al eje Z
	mat4.fromZRotation(rotationZ, angleZ * Math.PI / 180);

	// obtencion de la matriz de rotacion total con respcto a cada eje
	mul(rotation, rotationZ, rotationY, rotationX);
	
	mat4.fromScaling(scaling, [0.004, 0.004, 0.004]);
	mat4.fromTranslation(translation, [0.5, 0.8, 0.3]);
	
	// TODAS LAS COMBINACIONES POSIBLES DE LA MULTIPLICACION DE LAS MATRICES ROTATION - TRANSLATION - SCALING

	mul(matrix, rotation, translation, scaling);
}

function onLoad() {
	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl');
	_gl = VAOHelper.getVaoExtension();

	//SHADERS
	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);

	let posLocation = gl.getAttribLocation(shaderProgram, 'vertexPos');
	u_modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projMatrix');
	u_modelColor = gl.getUniformLocation(shaderProgram, 'modelColor');

	// Load all the objects
	loadObjects(posLocation);
	
	// Set the objects' transformations
	setObjectsTransformations();

	// Set some WebGL properties
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.18, 0.18, 0.18, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create auxiliary objects
	axis = new Axis();
	axis.load();
	
	// Create the camera using canvas dimension
	camera = new SphericalCamera(55, 800/600);
	camera.setPhi(1);
	camera.setTheta(1);
}

function onRender() {
	let modelMatrix = mat4.create(); 
	let viewMatrix = camera.getViewMatrix();
	let projMatrix = camera.getProjMatrix();

	// Set some WebGL properties
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Draw auxiliary objects
	axis.render(projMatrix, viewMatrix);

	// Set shader and uniforms
	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);
	let _modelColor;

	// Draw objects	let _modelColor = vec3.fromValues(modelColor.r, modelColor.g, modelColor.b);	
	setObjectsTransformations();
	_modelColor = vec3.fromValues(1,0,0);
	gl.uniform3fv(u_modelColor, _modelColor);
	mesa.draw(isSolid, gl, _gl);
	_modelColor = vec3.fromValues(0,1,0);
	gl.uniform3fv(u_modelColor, _modelColor);
	drone.draw(isSolid, gl, _gl);
	setObjectsTransformations2();
	_modelColor = vec3.fromValues(0,0,1);
	gl.uniform3fv(u_modelColor, _modelColor);
	drone.draw(!isSolid, gl, _gl);

	// Clean
	_gl.bindVertexArrayOES(null);
	gl.useProgram(null);
}
