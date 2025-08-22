# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.3.1](https://github.com/pex-gl/pex-context/compare/v3.3.0...v3.3.1) (2025-08-22)


### Bug Fixes

* enable support for SRGB for HTML elements ([08c0ad1](https://github.com/pex-gl/pex-context/commit/08c0ad1b646e572519e9ea9e9cefaadc5c0ce130))
* only check maxSamples for WebGL2 ([42836c0](https://github.com/pex-gl/pex-context/commit/42836c0faa971e522486f304fcb12904931ffcb4))
* use nullish coalescing for videoWidth/Height ([7bff9b3](https://github.com/pex-gl/pex-context/commit/7bff9b30b7ddf629eb9b05930a8c3ab189272968))



# [3.3.0](https://github.com/pex-gl/pex-context/compare/v3.2.0...v3.3.0) (2025-08-13)


### Bug Fixes

* unbind all vertex buffers from unused attributes ([df80778](https://github.com/pex-gl/pex-context/commit/df80778c9ae71d176909b6f75567f5e371175901))


### Features

* add renderbuffer support for msaa sampleCount ([d23187d](https://github.com/pex-gl/pex-context/commit/d23187d0c6d6d51e3e75fca42687ea61c922832a))
* add renderbuffer support in pass.color ([d393cdd](https://github.com/pex-gl/pex-context/commit/d393cdd55797c531f807febd0dd878eee330ec76))
* add support for arbitrary partial attachment blitting ([8fda334](https://github.com/pex-gl/pex-context/commit/8fda3340fe5e2f545721f0517d39618a5a0bad95))
* add support for resolving multiple msaa renderbuffers ([e6701a2](https://github.com/pex-gl/pex-context/commit/e6701a2bb4b0410f68f3381efdf6481268ad4c9f))
* keep mipmap flag inside texture ([984f4ef](https://github.com/pex-gl/pex-context/commit/984f4ef8aacf1562d5651a786ed1d85b3df74b49))



# [3.2.0](https://github.com/pex-gl/pex-context/compare/v3.1.2...v3.2.0) (2025-01-31)


### Bug Fixes

* add dispose to vertex array ([d1b6097](https://github.com/pex-gl/pex-context/commit/d1b6097aa18c9a523eaed653d6399ebb7739705f)), closes [#147](https://github.com/pex-gl/pex-context/issues/147)
* apply viewport and scissor after binding fbo but before clear ([7376d9e](https://github.com/pex-gl/pex-context/commit/7376d9e1a41318b18f85dbe8b6da4e9d4fcddb09))
* check color value exist when using clearBufferfv ([e2faebf](https://github.com/pex-gl/pex-context/commit/e2faebf5dac51ccf994ee14946698140e7a95829))


### Features

* add support for clearBuffer via clearColor ([163b0b8](https://github.com/pex-gl/pex-context/commit/163b0b8328548d5df4698b1fb57af479536fb086)), closes [#139](https://github.com/pex-gl/pex-context/issues/139)
* add support for copy buffer to texture ([c81fb88](https://github.com/pex-gl/pex-context/commit/c81fb8856b5110318077b78c7b13dd7b31906854)), closes [#150](https://github.com/pex-gl/pex-context/issues/150)
* add support for texture arrays ([9ffa021](https://github.com/pex-gl/pex-context/commit/9ffa02145cfcbb3333fd4e73b81894e5338e5208)), closes [#137](https://github.com/pex-gl/pex-context/issues/137)
* add support for transform-feedback ([df4bd8a](https://github.com/pex-gl/pex-context/commit/df4bd8a770f38e7fb25731d95a4baf25d70f29df))
* handle options array for texture array ([6e2e386](https://github.com/pex-gl/pex-context/commit/6e2e386f9accf9b8da2434d4a8c150cd85e4213d))
* support passing array of elements to textureCube + remove mandatory width/height when passing an array of elements as data ([b5a53ce](https://github.com/pex-gl/pex-context/commit/b5a53ce482771218fde9d3c0c903645d581b538f))



## [3.1.2](https://github.com/pex-gl/pex-context/compare/v3.1.1...v3.1.2) (2024-09-03)


### Bug Fixes

* do not assume EXT_disjoint_timer_query_webgl2 for webgl2 context ([d70e111](https://github.com/pex-gl/pex-context/commit/d70e11103beefbdc7e71547b2e33e9a66c720191)), closes [#143](https://github.com/pex-gl/pex-context/issues/143)
* make sure WEBGL_color_buffer_float and EXT_color_buffer_half_float are available before setting ctx.RenderbufferFloatFormat ([1af54d0](https://github.com/pex-gl/pex-context/commit/1af54d030191024bf2bd0b7e8034d283fca5683d))



## [3.1.1](https://github.com/pex-gl/pex-context/compare/v3.1.0...v3.1.1) (2024-06-21)


### Bug Fixes

* add missing builtin attributes ([ba3e51f](https://github.com/pex-gl/pex-context/commit/ba3e51ff35e5b33baecaf3f88e92c92805156adf))



# [3.1.0](https://github.com/pex-gl/pex-context/compare/v3.0.0...v3.1.0) (2024-06-21)


### Bug Fixes

* skip built-in attributes in program ([4a37026](https://github.com/pex-gl/pex-context/commit/4a37026b6593655d9168f6099515d2ac510b62db)), closes [#142](https://github.com/pex-gl/pex-context/issues/142)


### Features

* add MIRRORED_REPEAT to ctx.Wrap ([aaec02a](https://github.com/pex-gl/pex-context/commit/aaec02abd65d9e790a65c6496fe227f149935249)), closes [#141](https://github.com/pex-gl/pex-context/issues/141)



# [3.0.0](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.9...v3.0.0) (2024-05-16)



# [3.0.0-alpha.9](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2024-05-07)


### Bug Fixes

* add all supported command props ([9b96c04](https://github.com/pex-gl/pex-context/commit/9b96c04eb51bf0e2b56ce97c2905f64e7833436e))
* break frame loop when context is disposed  ([11cd9a2](https://github.com/pex-gl/pex-context/commit/11cd9a257bbde9eb2a3bd7cc8c0a7a690fc2f73a))
* show error for multidraw and multiDrawInstancedBase missing fallback implementation ([bcb8198](https://github.com/pex-gl/pex-context/commit/bcb819866194e21c979f7322198e55e0f5731510))


### Features

* add base vertex and base instance fallback ([8aece5a](https://github.com/pex-gl/pex-context/commit/8aece5a1a1d0814fb6744a9722f71d3e623bddc7))
* add fallback for unsupported multidraw extension ([4505d45](https://github.com/pex-gl/pex-context/commit/4505d45b5df0a98fb49bd80fc66475f26a27acb4)), closes [#132](https://github.com/pex-gl/pex-context/issues/132)
* add sRGB capability and EXT_sRGB polyfill ([40470b0](https://github.com/pex-gl/pex-context/commit/40470b0d6d274d0c6ed7e5a41e0abe9db8a8123c))



# [3.0.0-alpha.8](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2023-06-01)


### Features

* add capabilities.floatBlend EXT_float_blend ([8a47bd3](https://github.com/pex-gl/pex-context/commit/8a47bd3476eb8d4bcd83a190375f41b94ba56f8b))
* add support for WEBGL_draw_instanced_base_vertex_base_instance and drawArrays for WEBGL_multi_draw_instanced_base_vertex_base_instance ([224ee99](https://github.com/pex-gl/pex-context/commit/224ee99aab1a75c559b359898367627408eb48b3)), closes [#133](https://github.com/pex-gl/pex-context/issues/133)



# [3.0.0-alpha.7](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2023-02-21)


### Features

* add support for multi draw ([3f4e61b](https://github.com/pex-gl/pex-context/commit/3f4e61b5689d6724e76ecf9e7b71bce46230a137))
* add support for multidraw instanced with baseInstances ([775ff9e](https://github.com/pex-gl/pex-context/commit/775ff9ef6dc120a8c4272e767ed1aa9ae3386b62))



# [3.0.0-alpha.6](https://github.com/pex-gl/pex-context/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2023-02-07)


### Features

* stop relying on existing buffer.type in updateBuffer ([c8a6004](https://github.com/pex-gl/pex-context/commit/c8a6004179eeea0bd17f29a11a97f9974e4a18bb)), closes [#131](https://github.com/pex-gl/pex-context/issues/131)



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
