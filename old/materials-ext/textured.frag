varying vec2 vTexCoord;

uniform vec4 color;
uniform sampler2D texture;

void main() {
	gl_FragColor = color * texture2D(texture, vTexCoord);
}