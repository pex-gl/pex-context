uniform vec4 color;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vColor;

void main() {
	vec3 N = normalize(vNormal);
	vec3 L = normalize(vec3(10, 10, 10));		
	float NdotL = max(0.25, dot(N, L));
	vec4 diffuse;
	if (length(vColor) > 0) {
		diffuse = NdotL * vec4(vColor, 1.0);
	}
	else {
		diffuse = NdotL * vec4(color);
	}
	
	vec4 grassColor = vec4(0.25, 0.7, 0.1, 1.0);
	grassColor = vec4(0.25, 0.1, 0.7, 1.0);
	grassColor *= 0.25;
	
	//grassColor = vec4()
	//grassColor = vec4(0.3);
	vec4 grass = NdotL * grassColor;
	//gl_FragColor.rgb = vNormal * 0.5 + 0.5;
	gl_FragColor.rgba = mix(grass, diffuse, vPosition.y*10.0);
	gl_FragColor.rgba += 0.1;
	//gl_FragColor.rgb *= vec3(0.5 + );
	//gl_FragColor.rgb = vColor;
	gl_FragColor.a = 1.0;
	//gl_FragColor.rgb = vColor;
}