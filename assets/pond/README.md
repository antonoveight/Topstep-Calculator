# Quiet Pond illustration

`quiet-pond.png` is the approved original illustration and fallback, generated with the built-in `imagegen` tool on 15 October 2026. Original: 1448 × 1086 PNG. It is a local asset; the app makes no image-generation request at runtime.

Final asset prompt: Extract the illustrated left-hand pond from the approved UI mockup into a full-bleed 4:3 illustration. Preserve the straw-hat fisherman seated on the weathered wooden dock, warm afternoon sunlight, muted teal water, organic stone shore, reeds and trees. Remove all UI, text, fishing rod, fishing line and bobber. Keep the fisherman's hands visible and the center-right water open for interactive overlays. Preserve the approved cozy 2.5D art direction.

`assets/angler.js` draws the rod, line, bobber, small fish and ripples on a transparent Canvas over the image. All coordinates use a shared 1000 × 750 space. The hand anchor is `(303, 443)`; the default bobber position is `(650, 412)`. Preserve the image aspect ratio when changing layout so these anchors stay aligned.

The illustration is static. Water highlights, ripples, rod tension, casting and catching are animated overlays. Pause, reduced-motion, viewport visibility and browser-tab visibility control the animation loop.

## Layered scene v2 — 15 October 2026

The production renderer now uses a clean plate and real RGBA sprite layers instead of repainting a small patch over the seated figure. All five new assets were edited from the original with the built-in `image_gen` tool. The original remains intact as a loading/error fallback.

| Asset | Role |
| --- | --- |
| `quiet-pond-clean-v2.png` | Clean background without the fisherman, nearest canopy/reeds or foreground lamp |
| `fisherman-v2.png` | Transparent seated figure |
| `foliage-v2.png` | Transparent canopy and two separate reed clumps |
| `lantern-v2.png` | Transparent swinging lamp |
| `lantern-post-v2.png` | Textured stationary timber support |

Exact generation prompts: `layers-v2-prompts.json` and `lantern-post-v2.prompt.txt`. These are genuine alpha layers; no checkerboard is baked into the image. The renderer crops the actor from `[293,527,197,301]`, lamp from `[399,64,447,1084]` and post from `[393,167,548,934]` at draw time, leaving the source files unchanged. Canopy and reed groups use independent source rectangles in `pond-scene.js`.

`pond-scene.js` caches graded layers, shares one actor/hand transform, sways foliage and lamp with a common breeze, and puts the rod down after a completed round. `pond-water.js` moves broad and fine wave bands independently with local disturbances. Ambient fish vary speed/depth and have subtle shadows and surface wakes. `pond-behavior.js` separates the four setup narratives; none of these ambient changes creates a trading signal or changes a checkbox.

Normal/fullscreen framing stays stable. Studio uses a fixed, slightly closer crop that keeps the fisherman, float and basket visible together. There is no camera shake. Settings: gentle/balanced motion, automatic/light performance. Light rendering caps at 24fps with fewer water bands/fish and reduced device-pixel ratio; pause/reduced-motion and offscreen suspension still apply.

`preview-v2.webm` is a roughly 25-second studio-format demonstration captured from the actual renderer. The lower pane is explicitly a chart placeholder, not a Topstep recording or fabricated trading data.

The updated scene also displaces only the water pixels inside a shoreline mask. Ambient fish follow bounded Bezier paths independently of the checklist; the target fish reacts to the active setup. Rendering is capped near 30 FPS, with up to five ambient fish on desktop and three on small screens. No bitmap was regenerated for these animation updates.

`pond-model.js` interprets entry checkboxes with ordered prerequisites and setup-specific effects. Management checkboxes are independent: BE and TP can be recorded directly, with TP taking precedence and without silently checking earlier risk boxes. Risk checkboxes are stored per setup in the existing checklist JSON, with migration from older flat data.

`pond-catch.js` provides a 3.2-second landing trajectory: a decisive 208 ms hook-set with the rod leading the fish, a short recoil, then controlled reeling to the dock and release into the existing basket. The line stays taut during the strike and the splash lasts 280 ms. The basket anchor is `(134, 493)`. The painted basket front occludes the landed fish; rod, float, hook and mouth use shared coordinates while attached. Restoring a completed TP shows the final basket state without replay. Paused/reduced-motion mode settles immediately.

The scene stays sticky beside entry and management on desktop. On smaller viewports it becomes a compact sticky preview, with an expand control. The app header scrolls away in Checklist view. Scroll padding follows the measured scene-card height to keep checkbox targets clear.

`pond-clock.js` uses `Asia/Ho_Chi_Minh` regardless of device timezone. Auto/manual dayparts change interpolated color grading, morning mist, evening lantern glow and fireflies. Activity labels read `[data-pond-schedule]` from existing project cards and always use real time, including when previewing another daypart. The US window follows the Chicago UTC offset for the project's winter shift. The clock refreshes on minute boundaries only while the scene is visible, and refreshes immediately on return.
