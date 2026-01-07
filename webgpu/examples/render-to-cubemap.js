import createContext from "../index.js";
import { mat4 } from "https://esm.sh/pex-math@4";
import { cube, sphere } from "https://esm.sh/primitive-geometry@2.11.0";

const CUBEMAP_SIZE = 512;

// Colored box instances around the center
const cubeInstances = [
    { position: [3, 0, 0], color: [1.0, 0.0, 0.0, 1.0] },   // +X red
    { position: [-3, 0, 0], color: [1.0, 0.5, 0.0, 1.0] },  // -X orange
    { position: [0, 3, 0], color: [0.0, 0.8, 0.0, 1.0] },   // +Y green
    { position: [0, -3, 0], color: [0.0, 0.8, 0.8, 1.0] },  // -Y cyan
    { position: [0, 0, 3], color: [0.0, 0.0, 1.0, 1.0] },   // +Z blue
    { position: [0, 0, -3], color: [0.5, 0.0, 1.0, 1.0] },  // -Z purple
];

// Cubemap face directions (matches WebGPU cube texture layer order)
const cubeFaces = [
    { target: [1, 0, 0], up: [0, -1, 0] },   // +X
    { target: [-1, 0, 0], up: [0, -1, 0] },  // -X
    { target: [0, 1, 0], up: [0, 0, 1] },    // +Y
    { target: [0, -1, 0], up: [0, 0, -1] },  // -Y
    { target: [0, 0, 1], up: [0, -1, 0] },   // +Z
    { target: [0, 0, -1], up: [0, -1, 0] },  // -Z
];

// Diffuse shader for boxes
const diffuseVert = /*wgsl*/`
    struct Uniforms {
        projectionMatrix: mat4x4f,
        viewMatrix: mat4x4f,
        modelMatrix: mat4x4f,
        color: vec4f,
    };
    @group(0) @binding(0) var<uniform> u: Uniforms;

    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) normal: vec3f,
    };

    @vertex fn vs_main(
        @location(0) pos: vec3f,
        @location(1) normal: vec3f
    ) -> VertexOutput {
        var out: VertexOutput;
        let worldPos = u.modelMatrix * vec4f(pos, 1.0);
        out.position = u.projectionMatrix * u.viewMatrix * worldPos;
        out.normal = (u.modelMatrix * vec4f(normal, 0.0)).xyz;
        return out;
    }
`;

const diffuseFrag = /*wgsl*/`
    struct Uniforms {
        projectionMatrix: mat4x4f,
        viewMatrix: mat4x4f,
        modelMatrix: mat4x4f,
        color: vec4f,
    };
    @group(0) @binding(0) var<uniform> u: Uniforms;

    @fragment fn fs_main(@location(0) normal: vec3f) -> @location(0) vec4f {
        let N = normalize(normal);
        let L = normalize(vec3f(1.0, 2.0, 3.0));
        let diffuse = max(dot(N, L), 0.0) * 0.6 + 0.4;
        return vec4f(u.color.rgb * diffuse, 1.0);
    }
`;

// Reflection shader for sphere
const reflectionVert = /*wgsl*/`
    struct Uniforms {
        projectionMatrix: mat4x4f,
        viewMatrix: mat4x4f,
        modelMatrix: mat4x4f,
        cameraPosition: vec4f,
    };
    @group(0) @binding(0) var<uniform> u: Uniforms;

    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) worldPos: vec3f,
        @location(1) normal: vec3f,
    };

    @vertex fn vs_main(
        @location(0) pos: vec3f,
        @location(1) normal: vec3f
    ) -> VertexOutput {
        var out: VertexOutput;
        let worldPos = u.modelMatrix * vec4f(pos, 1.0);
        out.position = u.projectionMatrix * u.viewMatrix * worldPos;
        out.worldPos = worldPos.xyz;
        out.normal = (u.modelMatrix * vec4f(normal, 0.0)).xyz;
        return out;
    }
`;

const reflectionFrag = /*wgsl*/`
    struct Uniforms {
        projectionMatrix: mat4x4f,
        viewMatrix: mat4x4f,
        modelMatrix: mat4x4f,
        cameraPosition: vec4f,
    };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    @group(0) @binding(1) var envMap: texture_cube<f32>;
    @group(0) @binding(2) var envSampler: sampler;

    @fragment fn fs_main(
        @location(0) worldPos: vec3f,
        @location(1) normal: vec3f
    ) -> @location(0) vec4f {
        let N = normalize(normal);
        let I = normalize(worldPos - u.cameraPosition.xyz);
        let R = reflect(I, N);
        return textureSample(envMap, envSampler, R);
    }
`;

async function main() {
    const ctx = await createContext({
        canvas: document.getElementById("canvas"),
        debug: true,
    });

    // Geometry
    const boxGeom = cube();
    const sphereGeom = sphere({ radius: 1, segments: 32 });

    // Cubemap for reflections
    const reflectionMap = ctx.textureCube({
        width: CUBEMAP_SIZE,
        height: CUBEMAP_SIZE,
        pixelFormat: "rgba8unorm",
    });

    // Depth texture for cubemap rendering
    const cubeDepthMap = ctx.texture2D({
        width: CUBEMAP_SIZE,
        height: CUBEMAP_SIZE,
        pixelFormat: "depth24plus",
    });

    // Sampler for cubemap
    const cubeSampler = ctx.sampler({});

    // Pipelines
    const diffusePipeline = ctx.pipeline({
        vert: diffuseVert,
        frag: diffuseFrag,
        depthTest: true,
        vertexLayout: {
            aPosition: { location: 0, type: "vec3" },
            aNormal: { location: 1, type: "vec3" },
        },
    });

    const diffusePipelineCubemap = ctx.pipeline({
        vert: diffuseVert,
        frag: diffuseFrag,
        depthTest: true,
        colorFormat: "rgba8unorm",
        depthFormat: "depth24plus",
        vertexLayout: {
            aPosition: { location: 0, type: "vec3" },
            aNormal: { location: 1, type: "vec3" },
        },
    });

    const reflectionPipeline = ctx.pipeline({
        vert: reflectionVert,
        frag: reflectionFrag,
        depthTest: true,
        vertexLayout: {
            aPosition: { location: 0, type: "vec3" },
            aNormal: { location: 1, type: "vec3" },
        },
    });

    // Buffers
    const boxPos = ctx.vertexBuffer(boxGeom.positions);
    const boxNorm = ctx.vertexBuffer(boxGeom.normals);
    const boxIdx = ctx.indexBuffer(boxGeom.cells);

    const spherePos = ctx.vertexBuffer(sphereGeom.positions);
    const sphereNorm = ctx.vertexBuffer(sphereGeom.normals);
    const sphereIdx = ctx.indexBuffer(sphereGeom.cells);

    // Uniform buffers (MVP + color = 3 mat4 + 1 vec4 = 208 bytes, round to 256)
    const diffuseUBSize = 256;
    const boxUBs = cubeInstances.map(() => ctx.uniformBuffer({ size: diffuseUBSize }));

    const sphereUBSize = 256;
    const sphereUB = ctx.uniformBuffer({ size: sphereUBSize });

    // Screen pass
    const screenPass = ctx.pass({
        clearColor: [0.2, 0.2, 0.2, 1],
        clearDepth: 1,
    });

    // Create cubemap face passes
    const cubePasses = reflectionMap.faceViews.map((faceView, i) =>
        ctx.pass({
            color: [{ texture: { gpuTextureView: faceView } }],
            depth: cubeDepthMap,
            clearColor: [0.1, 0.1, 0.1, 1],
            clearDepth: 1,
        }),
    );

    // Camera matrices
    const cameraPos = [5, 5, 5];
    const camProj = mat4.create();
    const camView = mat4.lookAt(mat4.create(), cameraPos, [0, 0, 0], [0, 1, 0]);
    const sphereModel = mat4.create();

    // Cubemap camera matrices (90 degree FOV, aspect 1:1)
    const cubeProj = mat4.perspective(mat4.create(), Math.PI / 2, 1, 0.1, 100);
    const cubeViews = cubeFaces.map((face) =>
        mat4.lookAt(mat4.create(), [0, 0, 0], face.target, face.up),
    );

    function updateDiffuseUB(ub, proj, view, model, color) {
        const d = new Float32Array(64);
        d.set(proj, 0);
        d.set(view, 16);
        d.set(model, 32);
        d.set(color, 48);
        ctx.update(ub, { data: d });
    }

    function drawBoxes(proj, view, pipeline) {
        cubeInstances.forEach(({ position, color }, i) => {
            const model = mat4.translate(mat4.create(), position);
            updateDiffuseUB(boxUBs[i], proj, view, model, color);
            ctx.submit({
                pipeline,
                attributes: { aPosition: boxPos, aNormal: boxNorm },
                indices: boxIdx,
                uniforms: { uData: boxUBs[i] },
            });
        });
    }

    ctx.frame(() => {
        // Update camera projection for current canvas size
        mat4.perspective(camProj, Math.PI / 4, ctx.width / ctx.height, 0.1, 100);

        // Rotate sphere slowly
        mat4.rotate(sphereModel, 0.005, [0, 1, 0]);

        // Render cubemap faces
        for (let i = 0; i < 6; i++) {
            ctx.submit({ pass: cubePasses[i] }, () => {
                drawBoxes(cubeProj, cubeViews[i], diffusePipelineCubemap);
            });
        }

        // Render main scene
        ctx.submit({ pass: screenPass }, () => {
            // Draw boxes
            drawBoxes(camProj, camView, diffusePipeline);

            // Draw reflective sphere
            const sd = new Float32Array(64);
            sd.set(camProj, 0);
            sd.set(camView, 16);
            sd.set(sphereModel, 32);
            sd.set([cameraPos[0], cameraPos[1], cameraPos[2], 1], 48);
            ctx.update(sphereUB, { data: sd });

            ctx.submit({
                pipeline: reflectionPipeline,
                attributes: { aPosition: spherePos, aNormal: sphereNorm },
                indices: sphereIdx,
                uniforms: {
                    uData: sphereUB,
                    uEnvMap: reflectionMap,
                    uEnvSampler: cubeSampler,
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
