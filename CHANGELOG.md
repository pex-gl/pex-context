# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [3.0.0-alpha.5](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2023-02-02)


### Reverts

* Revert "feat: use cmd.instances to check for instancing" ([2662872](https://github.com/pex-gl/pex-context/commit/266287217840a46adf19df79746455c943bd2c54))



# [3.0.0-alpha.4](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2023-02-01)


### Bug Fixes

* only use RGB[A]16F and RGB[A]32F from extensions in renderbuffer ([588bfed](https://github.com/pex-gl/pex-context/commit/588bfedde7e9515e79e005bec9798731d52913a0)), closes [#122](https://github.com/pex-gl/pex-context/issues/122)


### Features

* **main:** add ctx.RenderbufferFloatFormat ([c4cb7c1](https://github.com/pex-gl/pex-context/commit/c4cb7c12db7da7385064259792af723c39dad91e)), closes [#122](https://github.com/pex-gl/pex-context/issues/122)



# [3.0.0-alpha.3](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2022-12-13)


### Bug Fixes

* include textureHalfFloatLinear in webgl2 capabilities ([2d5c6b0](https://github.com/pex-gl/pex-context/commit/2d5c6b05ad1530f7cab0f981708c2e2c3b49f357)), closes [#129](https://github.com/pex-gl/pex-context/issues/129)
* isWebGL2 named import ([347c6c1](https://github.com/pex-gl/pex-context/commit/347c6c1ffa286c921a89b3b64388d08da00bfd5b))


### Features

* add colorBufferFloat and colorBufferHalfFloat capacbilities ([b736415](https://github.com/pex-gl/pex-context/commit/b736415c71eadd07d08cd4bc688455e5721b0a9d))
* add raw gl multisample fbo example ([8d0f221](https://github.com/pex-gl/pex-context/commit/8d0f221ff090249e268e9b9420ebdcad1d443369))
* check renderbuffer float formats ([b41b2bd](https://github.com/pex-gl/pex-context/commit/b41b2bde10789c2ea785c233da3469a382efa13e)), closes [#122](https://github.com/pex-gl/pex-context/issues/122)
* include webgl2 extensions enabled by default in capabilities ([a75dcb6](https://github.com/pex-gl/pex-context/commit/a75dcb6e8e2a3fcb42b7794db484ac5feb059bfc)), closes [#129](https://github.com/pex-gl/pex-context/issues/129)



# [3.0.0-alpha.2](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2022-09-20)


### Features

* use cmd.instances to check for instancing ([f6f2728](https://github.com/pex-gl/pex-context/commit/f6f27284e78d3383b628eca160d806ad2981ae78)), closes [#126](https://github.com/pex-gl/pex-context/issues/126)



# [3.0.0-alpha.1](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2022-09-09)


### Bug Fixes

* import ctx types ([ca7f1b1](https://github.com/pex-gl/pex-context/commit/ca7f1b198fc9f20393565e94c9d83eda6d2f1fa9))



# [3.0.0-alpha.0](https://github.com/pex-gl/pex-context/compare/v2.10.3...v3.0.0-alpha.0) (2022-07-01)


### Bug Fixes

* activate OES_element_index_uint and OES_standard_derivatives in webgl1 ([ab654a1](https://github.com/pex-gl/pex-context/commit/ab654a1d811844b61e1aa2535428fcdecf7e39f1)), closes [#116](https://github.com/pex-gl/pex-context/issues/116)
* add assert as dependency ([10144f0](https://github.com/pex-gl/pex-context/commit/10144f0f36dea81ecb71efeae0241390af0f7b41))
* add missing cmd.count check when cmd.indices is specified ([a106779](https://github.com/pex-gl/pex-context/commit/a1067794adc4c622005a5ddef0c828602697216a))
* assign to height instead of width in texture update ([e67f04c](https://github.com/pex-gl/pex-context/commit/e67f04cf504972b5aaf614f966086398d78ffa3e)), closes [#95](https://github.com/pex-gl/pex-context/issues/95)
* default Depth to DEPTH_COMPONENT16 ([0e89421](https://github.com/pex-gl/pex-context/commit/0e89421c537623b3739d66e6b19aec6602cd940a))
* handle ImageBitmap as texture source in WebGL 1 ([e9b88af](https://github.com/pex-gl/pex-context/commit/e9b88af96bc5aca9be5cce1103aa7a45ae73bdfe)), closes [#120](https://github.com/pex-gl/pex-context/issues/120)
* log capabilities on context creation ([cb78ff6](https://github.com/pex-gl/pex-context/commit/cb78ff6d8f5503b176351171bac9e784d2789410))
* move texture update opts.wrap before texture.wrapS/T check ([0145cb6](https://github.com/pex-gl/pex-context/commit/0145cb6ab2d00b729752a53e12ab41aa13c5563e)), closes [#92](https://github.com/pex-gl/pex-context/issues/92)
* query for safari ([f58f016](https://github.com/pex-gl/pex-context/commit/f58f016872be1c9d7b840a1fad452d5a2f6a42cf))
* remove ansi characters from namespace ([dc94116](https://github.com/pex-gl/pex-context/commit/dc941160a0ba5785cb5221f5e55f2a4e37532cd6)), closes [#119](https://github.com/pex-gl/pex-context/issues/119)
* remove missing export ([c892ee3](https://github.com/pex-gl/pex-context/commit/c892ee3a8cc61a293ab89e2239570b86a086d428))
* TextureFormat RGBA16F type ([9f2867d](https://github.com/pex-gl/pex-context/commit/9f2867dc3c1c316e62a3ed3f83a12da58aef63de))
* use uniformMethod to check for Matrix type ([6c9de42](https://github.com/pex-gl/pex-context/commit/6c9de4230c7abb721f23053b2eea265c698ece38))
* **context:** change ctx.stats to object to make it serializable ([66f2856](https://github.com/pex-gl/pex-context/commit/66f285661c18ae8281050383d58fb2900402fbe7))
* **context:** get rid of shared framebuffer ([68ff43f](https://github.com/pex-gl/pex-context/commit/68ff43fe7d6d375c0c12400601edf9fbbf73b130))
* **examples:** output ([2cb2232](https://github.com/pex-gl/pex-context/commit/2cb223263ac060ba0d2ee70d40159f1146636061))
* **examples:** output name ([78e52c7](https://github.com/pex-gl/pex-context/commit/78e52c764d4b5c1f7e1bc761fbd1e4a47046d808))
* **examples:** output path ([bd7f282](https://github.com/pex-gl/pex-context/commit/bd7f282daac2c0db5a9ba180c602ae68b9b1dd5c))
* **examples:** require.context/dynamic import regex ([de02632](https://github.com/pex-gl/pex-context/commit/de026325f0de0958176305108cbc7068048a3a2e))
* **examples:** update examples ([1d06a41](https://github.com/pex-gl/pex-context/commit/1d06a410fb8cd39b34fd13e9c932e21041bd97f3))
* **examples:** update webpack dev server ([eb8b1f7](https://github.com/pex-gl/pex-context/commit/eb8b1f777a6deac3af3a44b4bf0940508477e298))
* **framebuffer:** don’t overwrite options depth ([a910022](https://github.com/pex-gl/pex-context/commit/a91002216a436e57cc645318655e3082acec1930))
* **index:** remove console.log ([d8f7369](https://github.com/pex-gl/pex-context/commit/d8f73695c2c20e7232c83126353e6ab7417a89ce))
* **program:** add missing attributes type mat2/3 ([6365fb4](https://github.com/pex-gl/pex-context/commit/6365fb4c9a66bbd6bad049cd197b9ff509835e59))


### Code Refactoring

* use ES modules ([ff94ab7](https://github.com/pex-gl/pex-context/commit/ff94ab7fbbc56da0f63e7a8e3e520cc00adda3bf)), closes [#114](https://github.com/pex-gl/pex-context/issues/114) [#66](https://github.com/pex-gl/pex-context/issues/66) [#38](https://github.com/pex-gl/pex-context/issues/38)


### Features

* add all data types ([14a9a6b](https://github.com/pex-gl/pex-context/commit/14a9a6bc46f66a0d5302a4345a95ce966d172bc2))
* add capabilities.maxVertexAttribs ([d79ab13](https://github.com/pex-gl/pex-context/commit/d79ab1367979e202a34b76a365cbeab558ad6f49))
* add support for compressed texture ([3d6f28b](https://github.com/pex-gl/pex-context/commit/3d6f28bf9eac43cb17efe4570daf1c93b8145a2a)), closes [#99](https://github.com/pex-gl/pex-context/issues/99) [#98](https://github.com/pex-gl/pex-context/issues/98) [#97](https://github.com/pex-gl/pex-context/issues/97) [#95](https://github.com/pex-gl/pex-context/issues/95)
* add support for manual mipmaps ([ba5fff1](https://github.com/pex-gl/pex-context/commit/ba5fff1918feffbced1250c3f9f6612f3c8178c3))
* add UniformMethod, UniformSize, AttributeSize enums to support all webgl2 types ([7a7d66d](https://github.com/pex-gl/pex-context/commit/7a7d66d03b89ce58b418073cf357430b210ffaa2))
* add VAO support ([568bd32](https://github.com/pex-gl/pex-context/commit/568bd32f7e217dbd655fe4970f9f7e079f4a76f0))
* allow normalized props for buffer and handle Int8Array ([5d06fac](https://github.com/pex-gl/pex-context/commit/5d06fac943e918f40af871f35502382f5dfe1ca4))
* assume ANGLE_instanced_arrays, OES_standard_derivatives, OES_element_index_uint and OES_vertex_array_object are universally supported ([1867946](https://github.com/pex-gl/pex-context/commit/18679466582eb18927ef448d8af33df12abb9b98)), closes [#116](https://github.com/pex-gl/pex-context/issues/116)
* provide default type for array buffer data ([605461b](https://github.com/pex-gl/pex-context/commit/605461b6003ca3d3193cdc2fe608242607c3b177))
* **context:** add current scissor value to fbo-state logs ([ec9ab43](https://github.com/pex-gl/pex-context/commit/ec9ab436642fc53f0133aa8bce3c320c7ea0f786))
* **examples/project:** add orbiter ([406e3ba](https://github.com/pex-gl/pex-context/commit/406e3baf6782e3a76e4da02e4edc7316719417f9))
* **examples/sub-pass:** add example showcasing framebuffer inheritance ([414210b](https://github.com/pex-gl/pex-context/commit/414210bddb63328fd99a708421838fb6432bee14))
* **pass:** add framebuffer inheritance if attachment not present ([b8d8fa3](https://github.com/pex-gl/pex-context/commit/b8d8fa36e464c0af2b36f5287813e551971d3322))


### BREAKING CHANGES

* switch to type module
