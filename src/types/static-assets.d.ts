// Added: 2026-11-11 - Static image modules for CI typecheck. next-env.d.ts is gitignored, so these imports otherwise have no types.

declare module "*.png" {
  const content: import("next/image").StaticImageData;
  export default content;
}

declare module "*.svg" {
  const content: import("next/image").StaticImageData;
  export default content;
}
