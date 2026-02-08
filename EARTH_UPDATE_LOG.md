# Earth & Visual System Update

## Summary of Changes
Per your request, the "Waves" background has been **completely removed** and replaced with a **Global 3D Earth**.

### 1. Global Background
- **Removed**: `EarthWaves.jsx` (The wireframe terrain/waves animation).
- **Added**: `Earth3D.jsx` (A stylized, interactive 3D Globe).
- **Location**: `App.jsx` now renders `<Earth3D />` as the fixed background for the entire application.

### 2. The Earth Component (`Earth3D.jsx`)
- **Dark Mode**: 
    - Rendered as a Deep Blue/scifi sphere (`#1e40af`) with neon green connectivity lines.
    - Includes a Starfield background (`<Stars />`) for that space aesthetics.
- **Light Mode**:
    - Rendered as a Clean/Eco sphere (`#38bdf8`) with white/transparent overlays.
    - Background is a clean Sky-to-White gradient.
    - Stars are hidden to maintain a crisp "daytime" look.

### 3. Landing Page
- The Landing Page now features the Earth Globe rotating in the background behind the "The Land That Thinks With You" text.
- No more waves.

## Files Modified
- `frontend/src/App.jsx` (Swapped background components)
- `frontend/src/components/three/Earth3D.jsx` (Created/Updated)
