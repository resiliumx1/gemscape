

# Fix InlineGem to Match BrilliantGem

## Problem
The `InlineGem` in HeroSection.tsx uses a basic `THREE.ConeGeometry` with simple materials — a crude cone shape. The original `BrilliantGem` component uses a custom 58-facet brilliant-cut geometry, environment cube map, dispersion shader injection, post-processing (rim halo + chromatic aberration), gold wireframe edges, sparkle particles, and ACES filmic tone mapping. They look nothing alike.

## Solution
Replace the `InlineGem` implementation with a scaled-down version of the full `BrilliantGem` rendering pipeline, adapted to fit inline in text at 88px (desktop) / 64px (mobile).

### File: `src/components/HeroSection.tsx`

**Replace the entire `InlineGem` function** with one that replicates `BrilliantGem`'s setup:

1. **Geometry**: Copy the `createBrilliantCut()` function from BrilliantGem (the 16-sided brilliant cut with crown, pavilion, girdle, table, and culet facets)

2. **Material**: Use the same `MeshPhysicalMaterial` with:
   - `color: #1a8a9e`, `roughness: 0.03`, `transmission: 0.92`, `thickness: 3.5`, `ior: 2.42`
   - `clearcoat: 1.0`, `envMapIntensity: 2.5`, `side: DoubleSide`
   - `attenuationColor: #0d5e6e`, `attenuationDistance: 2.0`
   - Dispersion shader injection via `onBeforeCompile`

3. **Environment map**: Build the same gradient sky cube map (white top, deep navy bottom, teal front/back, aquamarine sides) using `CubeCamera` + `WebGLCubeRenderTarget`

4. **Post-processing**: Add `EffectComposer` with `RenderPass` + `ShaderPass` for rim halo and chromatic aberration (same shaders from BrilliantGem)

5. **Lighting**: Same 3-point lighting setup (directional key, point fill, point rim, ambient)

6. **Gold wireframe**: `EdgesGeometry` with `LineBasicMaterial` color `#C9A84C`, opacity 0.55

7. **Sparkle particles**: Same 12-particle shader system

8. **Camera**: Orthographic camera matching BrilliantGem's framing, scaled for the small canvas

9. **Animation**: Same rotation speed (14s full rotation) and Y-axis bobbing, with `ACES filmic` tone mapping

10. **Renderer settings**: `premultipliedAlpha: false`, `powerPreference: "high-performance"`, `toneMappingExposure: 1.2`

11. **Scale**: `gemGroup.scale.set(0.34, 0.34, 0.34)` — same as BrilliantGem

The component keeps the same `size` prop and inline-block span wrapper. No other files change.

### Performance note
Skip the `IntersectionObserver` pause logic since the hero is always visible on load. Skip sparkles if performance is a concern at small size — but include them for visual parity.

