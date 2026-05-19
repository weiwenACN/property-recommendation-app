/**
 * branding.ts — centralised Star Homes brand constants
 *
 * Swap in real SVG/image assets by replacing the paths in `assets`.
 * Everything else in the app should reference these constants rather than
 * repeating raw strings so a future rebrand is a one-file change.
 */

export const BRAND = {
  name: 'Star Homes',
  tagline: 'Find your perfect home in London',
  /** Semver string, kept in sync with package.json manually or via CI. */
  version: '1.0.0',

  colors: {
    /** Deep navy — primary backgrounds, text */
    primary: '#0F0C2E',
    /** Purple — brand accent, active states */
    accent: '#3C3489',
    /** Mid purple — focus rings, decorative */
    accentMid: '#7F77DD',
    /** Lavender — soft fill for selected states */
    accentLight: '#EEEDFE',
    /** Warm salmon — hearts, stars, notification dots */
    salmon: '#E5917A',
    /** Teal — positive / success tags */
    teal: '#1D9E75',
  },

  /**
   * Asset paths served from /public.
   *
   * logo-wordmark.svg  — horizontal lockup: icon + "Star Homes" text
   * logo-mark.svg      — standalone icon mark (used in favicons, small spaces)
   * app-icon.png       — 512×512 raster for PWA / store icon
   *
   * All three are currently placeholder SVGs.  Replace the files in /public
   * when production-quality assets are available; no code changes needed.
   */
  assets: {
    logoWordmark: '/logo-wordmark.svg',
    logoMark: '/logo-mark.svg',
    appIcon: '/app-icon.png',
  },
} as const;

export type BrandColors = typeof BRAND.colors;
