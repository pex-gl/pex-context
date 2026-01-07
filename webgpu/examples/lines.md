# WebGPU Instanced Lines Example

Based on [wwwtyro.net Part II](https://wwwtyro.net/2021/10/01/instanced-lines-part-2.html).

## Status: ✅ Complete

Renders with non-overlapping geometry:
- **Blue segments** - intermediate (miter-adjusted) + terminal
- **Green round joins** - fan at interior vertices  
- **Pink round caps** - semicircle at endpoints

## Draw Calls

1. **Intermediate segments** (N-3) - 4 points (pA, pB, pC, pD)
2. **Terminal segments** (2) - 3 points (pA, pB, pC)
3. **Round joins** (N-2) - 3 points each
4. **Round caps** (2) - 2 points each

## Screenshot

![Complete Lines](/Users/vorg/.gemini/antigravity/brain/8f7ea7e1-3d01-4409-a545-0fb79bba05b0/lines_verification_terminal_segments_1767737738630.png)

## Test URL

https://localhost:3000/webgpu/examples/lines.html
