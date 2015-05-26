varying vec2 vTexCoord;

uniform sampler2D texture;

void main() {
	gl_FragColor = texture2D(texture, vTexCoord);
	//gl_FragColor += vec4(1.0, 0.25, 0.0, 1.0);
}