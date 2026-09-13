# WizzBot portfolio

Next.js, React, Three.js, GSAP / ScrollTrigger and Lenis. The supplied orange and blue cloud photographs remain the artwork for the atmosphere.

## Run

`npm install`, then `npm run dev`. Production: `npm run build` followed by `npm start`.

## Motion and rendering

- `SmoothScroll.tsx` owns the single Lenis instance. GSAP ticks Lenis before scene rendering; ScrollTrigger reads the resulting native scroll position. Scroll timelines use `scrub: true` so there is no second smoothing delay. Touch retains native momentum. Reduced motion disables Lenis and pinned reveals.
- `CloudScene.tsx` covers the hero with a screen triangle. Independent aspect-preserving UV crops fit each source image; a 6% crop reserve contains pointer movement and distortion. A ResizeObserver measures the container, including mobile viewport changes. The static image stays behind the canvas during loading and graphics failures.
- `WorldAtmosphere.tsx` owns the single page-level environmental timeline. Its fixed haze, light and moisture layers evolve across the full document while individual chapters provide their detailed scene choreography.
- `ProjectJourney.tsx` pins the project viewport for a continuous entrance, four-stage horizontal journey, and mist-covered exit into Skills. Foreground, midground and background textures have separate motion tracks. `Atmosphere.tsx` uses a small three-layer 2D shader for image-tinted mist with varied density, not volumetric rendering.
- `ProjectScene.tsx` lazily creates four selectable objects sharing geometry. Vertical scroll moves them continuously through camera space and updates the focused HTML project. Tabs, arrow buttons, keyboard selection and swiping seek the same ScrollTrigger timeline, so there is one authoritative project position. Rendering pauses offscreen.
- All graphics resources, observers, GSAP subscriptions and media-query listeners are cleaned up on unmount. Hidden pages skip rendering.

## Contact configuration

The previous code contained an unverified `hello@wizzbot.dev` destination. Set `NEXT_PUBLIC_CONTACT_EMAIL` in `.env.local` to the owner's verified address before building. The form opens a mail-client draft; it is not a server-backed delivery service. Until configured, submission is disabled and the page explains that contact is coming soon. No project destination links were invented.

## Browser QA

`node scripts/qa.cjs` tests the running site with locally installed Chrome through Playwright. Set `QA_URL` to test a different port. Screenshots and a JSON report are written under ignored `qa/`.

The pass covers 1440×900, 2560×1080, 1280×800 and 390×844; repeated forward/backward passage progress; interpolated wheel scrolling; rapid project selection; keyboard navigation; mobile navigation; form editing without sending; reduced motion; and WebGL-disabled fallback. `node scripts/journey-check.cjs` against port 3100 exercises continuous wheel input through the entire page, dragging, canvas selection and graphics-context loss/restoration.

The desktop automation connectors failed to initialize in this session. QA used local headless Chrome, with screenshots inspected directly. These checks do not replace testing on physical phones or constitute a hardware frame-rate benchmark.

Cloud source images: supplied by the owner. The procedural-cloud reference directory is retained for provenance and is not used by the runtime.
