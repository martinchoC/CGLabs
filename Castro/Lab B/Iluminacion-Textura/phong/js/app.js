// WebGL context and extensions
var gl = null;
var _gl = null;//This extension is to support VAOs in webgl1. (In webgl2, functions are called directly to gl object.)

//Shader program
var shaderProgram  = null; 

//Uniform locations.
var u_modelMatrix;
var u_modelViewMatrix;
var u_viewMatrix;
var u_projMatrix;
var u_normalMatrix;
var u_lightPosition;
var u_light_color1;
var u_lightPosition_color;
var u_light_color2;
var u_cameraPosition;
var u_ka;
var u_kd;
var u_ks;
var u_coefEsp;
var u_ka_color;
var u_kd_color;
var u_ks_color;
var u_coefEsp_color;
var u_sampler;
var u_m;
var u_m_color;
var u_ymax;
var u_ymin;


//Objects (OBJ)
var ironman;

// Auxiliary objects
var axis;

// Camera
var camera;

// Flags
var isSolid = false;

function loadObjects(pos_location, nor_location, text_location) {
	// Load each object (OBJ) and generate its mesh
	ironman = new Object(ironmanSource);
	ironman.generateModel(pos_location, nor_location, text_location);
}
function setIronManTransformations() {
	let matrix = mat4.create();
	let translation = mat4.create();
	let scaling = mat4.create();

	// Set model matrix
	mat4.fromScaling(scaling, [1.0, 1.0, 1.0]);
	mat4.fromTranslation(translation, [0.0, 0.0, 0.0]);
	mat4.multiply(matrix, scaling, translation);
	ironman.setModelMatrix(matrix);
}

function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image.source);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTextures(){
	myTexture = gl.createTexture();
	myTexture.image = new Image();
	myTexture.image.crossOrigin = "anonymous";
	myTexture.image.source = document.getElementById('sourceTexture');
		handleLoadedTexture(myTexture);
	
}

function onLoad() {
	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl');
	_gl = VAOHelper.getVaoExtension();

	//SHADERS
	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);

	let posLocation = gl.getAttribLocation(shaderProgram, 'position');
	let normLocation = gl.getAttribLocation(shaderProgram, 'normal');
	let textureLocation = gl.getAttribLocation(shaderProgram, 'texture');
	u_modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_modelViewMatrix = gl.getUniformLocation(shaderProgram, 'modelViewMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
	u_normalMatrix = gl.getUniformLocation(shaderProgram, 'normalMatrix');

	u_lightPosition = gl.getUniformLocation(shaderProgram, 'lightPosition');
	u_light_color1 = gl.getUniformLocation(shaderProgram, 'lightColor1');

	u_lightPosition_color = gl.getUniformLocation(shaderProgram, 'lightPosition_color');
	u_light_color2 = gl.getUniformLocation(shaderProgram, 'lightColor2');

	u_cameraPosition = gl.getUniformLocation(shaderProgram, 'cameraPosition');
	u_ka = gl.getUniformLocation(shaderProgram, 'ka');
	u_kd = gl.getUniformLocation(shaderProgram, 'kd');
	u_ks = gl.getUniformLocation(shaderProgram, 'ks');
	u_coefEsp = gl.getUniformLocation(shaderProgram, 'coefEsp');
	u_kd_color = gl.getUniformLocation(shaderProgram, 'kd_color');
	u_ks_color = gl.getUniformLocation(shaderProgram, 'ks_color');
	u_coefEsp_color = gl.getUniformLocation(shaderProgram, 'coefEsp_color');
	u_m = gl.getUniformLocation(shaderProgram, 'm');
	u_m_color = gl.getUniformLocation(shaderProgram, 'm_color');
	u_sampler = gl.getUniformLocation(shaderProgram, 'uSampler');
	u_ymax = gl.getUniformLocation(shaderProgram, 'y_max');
	u_ymin = gl.getUniformLocation(shaderProgram, 'y_min');
	
	//u_modelColor = gl.getUniformLocation(shaderProgram, 'modelColor');

	// Load all the objects
	loadObjects(posLocation, normLocation, textureLocation);
	
	// Set the objects' transformations
	setIronManTransformations();
	// Set some WebGL properties
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.18, 0.18, 0.18, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create auxiliary objects
	axis = new Axis();
	axis.load();

	// Create the camera using canvas dimension
	camera = new SphericalCamera(55, 800/600);
	camera.setRadius(5);

	initTextures();

	onRender();
}

function onRender() {
	let modelMatrix = mat4.create(); 
	let viewMatrix = camera.getViewMatrix();
	let projMatrix = camera.getProjMatrix();

	// Set some WebGL properties
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Draw auxiliary objects
	axis.render(projMatrix, viewMatrix);

	setIronManTransformations();

	// Set shader and uniforms
	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);
	let _modelViewMatrix = mat4.create();
	mat4.multiply(_modelViewMatrix, viewMatrix, modelMatrix);
	gl.uniformMatrix4fv(u_modelViewMatrix, false, _modelViewMatrix);
	let _normalMatrix = mat4.create();
	let _aux = mat4.create();
	mat4.invert(_aux, _modelViewMatrix);
	mat4.transpose(_normalMatrix, _aux);
	gl.uniformMatrix4fv(u_normalMatrix, false, _normalMatrix);

	let _lightPosition = vec4.create();
	vec4.transformMat4(_lightPosition, vec4.fromValues(0.0, -1.0, 2.0, 1.0), viewMatrix);
	gl.uniform4fv(u_lightPosition, _lightPosition);
	gl.uniform3fv(u_light_color1, vec3.fromValues(1.0,0.0,0.0));

	let _lightPosition_color = vec4.create();
	vec4.transformMat4(_lightPosition_color, vec4.fromValues(0.0, -1.0, -2.0, 1.0), viewMatrix);
	gl.uniform4fv(u_lightPosition_color, _lightPosition_color);
	gl.uniform3fv(u_light_color2, vec3.fromValues(1.0,0.0,0.0));
	gl.uniform3fv(u_cameraPosition, camera._toCartesianArray());
	let _ka = vec3.fromValues(0.01, 0.01, 0.01);
	let _kd = vec3.fromValues(0.8, 0.8, 0.8);
	let _ks = vec3.fromValues(0.2, 0.2, 0.2);
	gl.uniform3fv(u_ka, _ka);
	gl.uniform3fv(u_kd, _kd);
	gl.uniform3fv(u_ks, _ks);
	gl.uniform1f(u_coefEsp, 99);
	gl.uniform1f(u_m, 0.5);
	let _kd_color = vec3.fromValues(0.8, 0.8, 0.8);
	let _ks_color = vec3.fromValues(0.2, 0.2, 0.2);
	gl.uniform3fv(u_kd_color, _kd_color);
	gl.uniform3fv(u_ks_color, _ks_color);
	gl.uniform1f(u_coefEsp_color, 99);
	gl.uniform1f(u_m_color, 0.1);
	gl.uniform1i(u_sampler, 0);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, myTexture);

	// Draw objects
	//setIronManTransformations();
	ironman.draw(true, gl, _gl);

	// Clean
	_gl.bindVertexArrayOES(null);
	gl.useProgram(null);
}
