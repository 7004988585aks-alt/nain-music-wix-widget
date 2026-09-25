# Nain Music Wix Custom Element Build

The original React/Vite application was inspected and preserved. A dedicated Wix Custom Element entry point was added at `src/custom-element.tsx`, using Light DOM and the existing `<App />`.

## Widget build

Command:

`npm run build:widget`

Expected output:

`dist-widget/nain-music-widget.js`

The Vite widget configuration is set up to:
- use `src/custom-element.tsx` as the entry
- emit `nain-music-widget.js`
- use an IIFE browser bundle
- inline CSS into the JS bundle
- inline static assets where possible
- disable CSS code splitting
- inline dynamic imports
- remove the generated CSS asset after injecting its contents into the bundle

## Environment build status

The build could not be executed to completion in this environment because npm registry DNS/network access was unavailable. `npm install` could not resolve `registry.npmjs.org`, and therefore the local `vite` binary was not available when `npm run build:widget` was attempted.

No fabricated `dist-widget/nain-music-widget.js` is included. The source changes are included so the bundle can be generated once dependencies are installed in a network-enabled environment.

## Wix compatibility changes

- Custom element name: `nain-music-app`
- Light DOM is used intentionally.
- React mounts on `connectedCallback` and unmounts on `disconnectedCallback`.
- Existing browser URL synchronization is disabled only when running as the custom element, preventing the embedded app from rewriting the Wix page URL.
- The normal React/Vite application entry point remains unchanged.
- Existing Firestore, Google Drive, payment, UI, builder, profile, dashboard, chat, order, review, and other application code was not replaced or expanded into a new architecture.
