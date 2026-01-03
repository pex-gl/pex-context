import createContext from "../index.js";
import { mat4 } from "https://esm.sh/gl-matrix@3.4.3";
import { cube } from "https://esm.sh/primitive-geometry@2.11.0";

const W = 640;
const H = 480;

const basicVert = /*wgsl*/`
    struct Uniforms {
      projectionMatrix: mat4x4f,
      viewMatrix: mat4x4f,
    };
    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

    struct VertexInput {
      @location(0) position: vec3f,
      @location(1) normal: vec3f,
    };

    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) color: vec4f,
    };

    @vertex fn vs_main(input: VertexInput) -> VertexOutput {
      var output: VertexOutput;
      output.position = uniforms.projectionMatrix * uniforms.viewMatrix * vec4f(input.position, 1.0);
      output.color = vec4f(input.normal * 0.5 + 0.5, 1.0);
      return output;
    }
  `;

const basicFrag = /*wgsl*/`
    @fragment fn fs_main(@location(0) color: vec4f) -> @location(0) vec4f {
      return color;
    }
  `;

async function main() {
    const ctx = await createContext({
        canvas: document.getElementById("canvas"),
        width: W,
        height: H,
        debug: true,
    });

    const geom = cube();

    const screenPass = ctx.pass({
        clearColor: [0.2, 0.2, 0.2, 1],
        clearDepth: 1,
    });

    const uniformBuffer = ctx.uniformBuffer({ size: 4 * 16 * 2 });

    const drawCmd = {
        pipeline: ctx.pipeline({
            vert: basicVert,
            frag: basicFrag,
            depthTest: true,
            vertexLayout: {
                aPosition: { location: 0, type: "vec3" },
                aNormal: { location: 1, type: "vec3" },
            },
        }),
        attributes: {
            aPosition: ctx.vertexBuffer(geom.positions),
            aNormal: ctx.vertexBuffer(geom.normals),
        },
        indices: ctx.indexBuffer(geom.cells),
        uniforms: { uMatrices: uniformBuffer },
    };

    const projectionMatrix = mat4.perspective(
        mat4.create(),
        Math.PI / 4,
        W / H,
        0.1,
        100,
    );
    const viewMatrix = mat4.lookAt(
        mat4.create(),
        [2, 2, 5],
        [0, 0, 0],
        [0, 1, 0],
    );

    const uniformData = new Float32Array(32);
    uniformData.set(projectionMatrix, 0);
    uniformData.set(viewMatrix, 16);
    ctx.update(uniformBuffer, { data: uniformData });

    ctx.frame(() => {
        ctx.submit({ pass: screenPass }, () => {
            ctx.submit(drawCmd);
        });
        ctx.debug(false);
    });
}

main().catch((err) => {
    console.error(err);
    document.body.innerHTML = `<h1 style="color:red">${err.message}</h1>`;
});
