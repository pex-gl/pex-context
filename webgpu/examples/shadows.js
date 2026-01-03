import createContext from "../index.js";
import { mat4 } from "https://esm.sh/gl-matrix@3.4.3";
import { cube } from "https://esm.sh/primitive-geometry@2.11.0";
import bunnyData from "https://esm.sh/bunny@1.0.1";

const SHADOW_MAP_SIZE = 1024;

// Process bunny geometry
function processBunny(data) {
    const positions = new Float32Array(data.positions.length * 3);
    for (let i = 0; i < data.positions.length; i++) {
        positions[i * 3] = data.positions[i][0];
        positions[i * 3 + 1] = data.positions[i][1];
        positions[i * 3 + 2] = data.positions[i][2];
    }

    const normals = new Float32Array(data.positions.length * 3);
    for (let i = 0; i < data.cells.length; i++) {
        const [i0, i1, i2] = data.cells[i];
        const p0 = data.positions[i0];
        const p1 = data.positions[i1];
        const p2 = data.positions[i2];
        const v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        const v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
        const n = [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0],
        ];
        for (const idx of [i0, i1, i2]) {
            normals[idx * 3] += n[0];
            normals[idx * 3 + 1] += n[1];
            normals[idx * 3 + 2] += n[2];
        }
    }

    let minY = Infinity,
        maxY = -Infinity;
    for (let i = 1; i < positions.length; i += 3) {
        minY = Math.min(minY, positions[i]);
        maxY = Math.max(maxY, positions[i]);
    }
    const scale = 1.5 / (maxY - minY);
    const centerY = (minY + maxY) / 2;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] *= scale;
        positions[i + 1] = (positions[i + 1] - centerY) * scale + 0.5;
        positions[i + 2] *= scale;

        const len =
            Math.sqrt(
                normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2,
            ) || 1;
        normals[i] /= len;
        normals[i + 1] /= len;
        normals[i + 2] /= len;
    }

    return { positions, normals, cells: data.cells.flat() };
}

// Shaders
const depthVert = /*wgsl*/`
    struct U { mvp: mat4x4f };
    @group(0) @binding(0) var<uniform> u: U;

    @vertex fn vs_main(@location(0) p: vec3f) -> @builtin(position) vec4f {
      return u.mvp * vec4f(p, 1.0);
    }
  `;

const depthFrag = /*wgsl*/`
    @fragment fn fs_main() -> @location(0) vec4f {
      return vec4f(1.0);
    }
  `;

const shadowVert = /*wgsl*/`
    struct U {
      projectionMatrix: mat4x4f,
      viewMatrix: mat4x4f,
      modelMatrix: mat4x4f,
      lightProjMatrix: mat4x4f,
      lightViewMatrix: mat4x4f,
      lightPos: vec4f,
      color: vec4f,
    };
    @group(0) @binding(0) var<uniform> u: U;

    struct Out {
      @builtin(position) position: vec4f,
      @location(0) normal: vec3f,
      @location(1) worldPos: vec3f,
      @location(2) lightSpacePos: vec4f,
    };

    @vertex fn vs_main(@location(0) pos: vec3f, @location(1) normal: vec3f) -> Out {
      var o: Out;
      let wp = u.modelMatrix * vec4f(pos, 1.0);
      o.position = u.projectionMatrix * u.viewMatrix * wp;
      o.normal = (u.modelMatrix * vec4f(normal, 0.0)).xyz;
      o.worldPos = wp.xyz;
      o.lightSpacePos = u.lightProjMatrix * u.lightViewMatrix * wp;
      return o;
    }
  `;

const shadowFrag = /*wgsl*/`
    struct U {
      projectionMatrix: mat4x4f,
      viewMatrix: mat4x4f,
      modelMatrix: mat4x4f,
      lightProjMatrix: mat4x4f,
      lightViewMatrix: mat4x4f,
      lightPos: vec4f,
      color: vec4f,
    };
    @group(0) @binding(0) var<uniform> u: U;
    @group(0) @binding(1) var shadowMap: texture_depth_2d;
    @group(0) @binding(2) var shadowSampler: sampler_comparison;

    @fragment fn fs_main(
      @location(0) normal: vec3f,
      @location(1) worldPos: vec3f,
      @location(2) lightSpacePos: vec4f
    ) -> @location(0) vec4f {
      let N = normalize(normal);
      let L = normalize(u.lightPos.xyz - worldPos);
      let NdotL = max(dot(N, L), 0.0);

      let ndc = lightSpacePos.xyz / lightSpacePos.w;
      let uv = ndc.xy * 0.5 + 0.5;
      let sc = clamp(vec2f(uv.x, 1.0 - uv.y), vec2f(0.0), vec2f(1.0));
      let depth = clamp(ndc.z - 0.005, 0.0, 1.0);
      let shadow = textureSampleCompare(shadowMap, shadowSampler, sc, depth);

      return vec4f(u.color.xyz * (0.2 + 0.8 * NdotL * shadow), 1.0);
    }
  `;

async function main() {
    const ctx = await createContext({
        canvas: document.getElementById("canvas"),
        debug: true,
    });

    const bunnyGeom = processBunny(bunnyData);
    const floorGeom = cube({ sx: 6, sy: 0.1, sz: 6 });

    // Textures
    const depthMap = ctx.texture2D({
        width: SHADOW_MAP_SIZE,
        height: SHADOW_MAP_SIZE,
        pixelFormat: "depth32float",
    });
    const colorMap = ctx.texture2D({
        width: SHADOW_MAP_SIZE,
        height: SHADOW_MAP_SIZE,
        pixelFormat: "rgba8unorm",
        renderTarget: true,
    });
    const shadowSampler = ctx.sampler({ compare: "less" });

    // Passes
    const depthPass = ctx.pass({
        color: [colorMap],
        depth: depthMap,
        clearColor: [0, 0, 0, 1],
        clearDepth: 1,
    });
    const mainPass = ctx.pass({
        clearColor: [0.2, 0.2, 0.2, 1],
        clearDepth: 1,
    });

    // Pipelines
    const depthPipeline = ctx.pipeline({
        vert: depthVert,
        frag: depthFrag,
        depthTest: true,
        depthFormat: "depth32float",
        colorFormat: "rgba8unorm",
        vertexLayout: { aPosition: { location: 0, type: "vec3" } },
    });
    const shadowPipeline = ctx.pipeline({
        vert: shadowVert,
        frag: shadowFrag,
        depthTest: true,
        cullFace: false, // Show both sides of floor
        vertexLayout: {
            aPosition: { location: 0, type: "vec3" },
            aNormal: { location: 1, type: "vec3" },
        },
    });

    // Buffers
    const floorPos = ctx.vertexBuffer(floorGeom.positions);
    const floorNorm = ctx.vertexBuffer(floorGeom.normals);
    const floorIdx = ctx.indexBuffer(floorGeom.cells);
    const bunnyPos = ctx.vertexBuffer(bunnyGeom.positions);
    const bunnyNorm = ctx.vertexBuffer(bunnyGeom.normals);
    const bunnyIdx = ctx.indexBuffer(bunnyGeom.cells);

    // Uniform buffers
    const depthUBSize = 64;
    const mainUBSize = 352; // 5 mat4 (320) + 2 vec4 (32)
    const floorDepthUB = ctx.uniformBuffer({ size: depthUBSize });
    const bunnyDepthUB = ctx.uniformBuffer({ size: depthUBSize });
    const floorMainUB = ctx.uniformBuffer({ size: mainUBSize });
    const bunnyMainUB = ctx.uniformBuffer({ size: mainUBSize });

    // Camera setup
    const lightPos = [7, 4, 7];
    const lightView = mat4.lookAt(
        mat4.create(),
        lightPos,
        [0, 0, 0],
        [0, 1, 0],
    );
    const lightProj = mat4.perspective(
        mat4.create(),
        Math.PI / 4,
        1,
        1,
        50,
    );
    const camView = mat4.lookAt(
        mat4.create(),
        [3, 3, 3],
        [0, 0, 0],
        [0, 1, 0],
    );
    const camProj = mat4.create();
    const floorModel = mat4.translate(
        mat4.create(),
        mat4.create(),
        [0, -1, 0],
    );
    const bunnyModel = mat4.create();

    ctx.frame(() => {
        mat4.perspective(
            camProj,
            Math.PI / 4,
            ctx.width / ctx.height,
            0.1,
            100,
        );
        mat4.rotateY(bunnyModel, bunnyModel, 0.01);

        // Update depth uniforms
        const floorDepthMVP = mat4.multiply(
            mat4.create(),
            mat4.multiply(mat4.create(), lightProj, lightView),
            floorModel,
        );
        const bunnyDepthMVP = mat4.multiply(
            mat4.create(),
            mat4.multiply(mat4.create(), lightProj, lightView),
            bunnyModel,
        );
        ctx.update(floorDepthUB, { data: floorDepthMVP });
        ctx.update(bunnyDepthUB, { data: bunnyDepthMVP });

        // Update main uniforms
        function writeMainUB(ub, model, color) {
            const d = new Float32Array(88);
            d.set(camProj, 0);
            d.set(camView, 16);
            d.set(model, 32);
            d.set(lightProj, 48);
            d.set(lightView, 64);
            d.set([lightPos[0], lightPos[1], lightPos[2], 1.0], 80);
            d.set(color, 84);
            ctx.update(ub, { data: d });
        }
        writeMainUB(floorMainUB, floorModel, [1, 1, 1, 1]);
        writeMainUB(bunnyMainUB, bunnyModel, [1, 1, 1, 1]);

        // Depth pass
        ctx.submit({ pass: depthPass }, () => {
            ctx.submit({
                pipeline: depthPipeline,
                attributes: { aPosition: floorPos },
                indices: floorIdx,
                uniforms: { uMVP: floorDepthUB },
            });
            ctx.submit({
                pipeline: depthPipeline,
                attributes: { aPosition: bunnyPos },
                indices: bunnyIdx,
                uniforms: { uMVP: bunnyDepthUB },
            });
        });

        // Main pass
        ctx.submit({ pass: mainPass }, () => {
            ctx.submit({
                pipeline: shadowPipeline,
                attributes: { aPosition: floorPos, aNormal: floorNorm },
                indices: floorIdx,
                uniforms: {
                    uData: floorMainUB,
                    uShadowMap: depthMap,
                    uShadowSampler: shadowSampler,
                },
            });
            ctx.submit({
                pipeline: shadowPipeline,
                attributes: { aPosition: bunnyPos, aNormal: bunnyNorm },
                indices: bunnyIdx,
                uniforms: {
                    uData: bunnyMainUB,
                    uShadowMap: depthMap,
                    uShadowSampler: shadowSampler,
                },
            });
        });

        ctx.debug(false);
    });
}

main().catch((err) => {
    console.error(err);
    document.body.innerHTML = `<h1 style="color:red">${err.message}</h1>`;
});
