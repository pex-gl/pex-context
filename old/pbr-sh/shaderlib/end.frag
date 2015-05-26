  //gl_FragColor.rgb = correctGammaOutput(data.color);
  gl_FragColor.rgb = data.color;
  gl_FragColor.a = data.opacity;
}
