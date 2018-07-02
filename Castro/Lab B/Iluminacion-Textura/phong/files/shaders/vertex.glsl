// Vertex Shader source, asignado a una variable para usarlo en un tag <script>
var vertexShaderSource = `
	precision highp float;
	precision highp int;

	uniform mat4 modelMatrix;
	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 normalMatrix;
	
	attribute vec3 position;
	attribute vec3 normal;
	attribute vec2 texture;

	uniform vec4 lightPosition; // asumo que viene en coordenadas del ojo	
	uniform vec4 lightPosition_color;
	uniform vec3 cameraPosition;

	varying vec3 vNE;
	varying vec3 vLE;
	varying vec3 vLE_color;
	varying vec3 vVE;

	varying vec3 normals;
	varying vec2 fragTexture;
	varying float yActual;

	void main() {
		gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

		normals = normal;

		fragTexture = texture;

		yActual = position.y;
		
		vec3 vE = (modelViewMatrix * vec4( position, 1.0 )).xyz;

		vLE = lightPosition.xyz - vE;
		vLE_color = lightPosition_color.xyz - vE;
		
		vNE = normalize(normalMatrix * vec4(normal, 0.0)).xyz;

		vVE = normalize(-vE);
	}
`