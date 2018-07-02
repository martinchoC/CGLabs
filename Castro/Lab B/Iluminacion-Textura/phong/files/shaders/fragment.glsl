// Fragment Shader source, asignado a una variable para usarlo en un tag <script>
var fragmentShaderSource = `

	precision highp float;
	precision highp int;
	
	varying vec3 vNE;
	varying vec3 vLE;
	varying vec3 vLE_color;
	varying vec3 vVE;

	uniform sampler2D uSampler;
	uniform vec3 ka;
	uniform vec3 kd;
	uniform vec3 ks;
	uniform float coefEsp;
	uniform float m;
	uniform vec3 kd_color;
	uniform vec3 ks_color;
	uniform vec3 lightColor1;
	uniform vec3 lightColor2;
	uniform float coefEsp_color;
	uniform float m_color;
	uniform float y_max;
	uniform float y_min;
	
	varying float yActual;
	varying vec3 color;
	varying vec3 normals;
	varying vec2 fragTexture;

	float cookTorrance(vec3 _N, vec3 _V, vec3 _L,vec3 _H){
		float NdotV = dot( _N , _V );
		float NdotL = dot( _N , _L );
		float NdotH = dot( _N , _H );
		float VdotH = dot( _V , _H );

		float F = pow(VdotH, 4.0);
		float D = exp( pow( NdotH, 2.0) - 1.0 / (m * m * pow( NdotH, 2.0 ) ) ) / (m * m * pow( NdotH, 4.0) );
		float Ge = 2.0 * ( NdotH * NdotV / VdotH );
		float Gs = 2.0 * ( NdotH * NdotL / VdotH );
		float G_aux = min( Ge , Gs );
		float G = min( 1.0 , G_aux );
		return F * D * G / 3.14592 * NdotV * NdotL;
	}

	void main() {
		vec3 L = normalize(vLE);
		vec3 L_color = normalize(vLE_color);
		vec3 N = normalize(vNE);
		vec3 V = normalize(vVE);
		vec3 H = normalize(L+V);
		vec3 H_color = normalize(L_color + V);

		float difuso = max(dot(L,N), 0.0);
		float difuso_color = max(dot(L_color,N), 0.0);
		
		vec3 difusoFinal =  ((kd * difuso) + (kd_color * difuso_color))/ 2.0;
		vec3 cookTorranceFinal = ((ks * cookTorrance( N , V , L , H )) + (ks * cookTorrance( N , V , L_color , H_color ))) / 2.0;

		float y_rango = yActual / y_max;
		vec3 miMix = mix (difusoFinal, texture2D(uSampler, fragTexture).xyz, y_rango);

		gl_FragColor = vec4( ka + miMix + cookTorranceFinal, 1.0 );

	}
`