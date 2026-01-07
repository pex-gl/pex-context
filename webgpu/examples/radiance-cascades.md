# Radiance Cascades

2D global illumination using the radiance cascades technique.

## Technique

Based on [tmpvar.com/poc/radiance-cascades](https://tmpvar.com/poc/radiance-cascades/) and the algorithm developed by Alexander Sannikov for Path of Exile 2.

### How it works

1. **World Texture** - Paint emissive light sources and occluders
2. **Cascade Probes** - Grid of probes, each casting rays in all directions
3. **Multi-level Sampling** - Higher cascade levels use larger probe spacing and ray intervals
4. **Accumulation** - Ray results merge from coarse to fine levels
5. **Fluence Output** - Final indirect lighting applied to screen

### Key Parameters

- **Probe Radius** - Spacing between probe centers
- **Ray Count** - Rays per probe (powers of 2)
- **Branching Factor** - Ray count multiplier per cascade level
- **Interval Radius** - Ray length per level

## Usage

Paint with mouse to add emissive light sources. Light spreads via global illumination.

- **Brush Radius** - Size of paint brush
- **Radiance** - Light intensity
- **Color** - Light color
- **Erase** - Remove light sources
- **Clear** - Reset scene

## Implementation

Uses vanilla WebGPU compute shaders:

- `WorldPaint` - Segment-based brush painting
- `ProbeAtlasRaymarch` - Fixed-step raymarching per probe
- `BuildFluenceTexture` - Probe data to screen pixels
- Fullscreen blit to canvas
