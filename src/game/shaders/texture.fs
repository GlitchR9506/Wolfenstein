precision mediump float;

// Passed in from the vertex shader.
varying vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

void main() {
    vec4 texColor = texture2D(u_texture, v_texcoord);
    if(texColor.a < 0.1)
        discard;
    gl_FragColor = texColor;
    // gl_FragColor = texture2D(u_texture, v_texcoord);
}