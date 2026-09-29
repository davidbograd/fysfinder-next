import konditalReferenceTable from "../../../public/images/vaerktoejer/kondital-tabel-alder-koen.png";

export interface ContentImageSize {
  width: number;
  height: number;
}

/**
 * Intrinsic dimensions for images referenced from tool page markdown.
 *
 * Markdown only hands us a URL, but `next/image` needs the real width and
 * height to reserve space and render a non-landscape image without cropping
 * it. Importing the file resolves that at build time.
 *
 * Do not look the size up by reading `public/` at render time instead: Next's
 * file tracer then pulls the whole 215 MB directory into the route's
 * serverless bundle.
 *
 * Add an entry here when markdown starts referencing a new image;
 * `content-image-dimensions.test.ts` fails until you do.
 */
const CONTENT_IMAGE_SIZES: Record<string, ContentImageSize> = {
  "/images/vaerktoejer/kondital-tabel-alder-koen.png": konditalReferenceTable,
};

export function getContentImageSize(src: string): ContentImageSize | null {
  return CONTENT_IMAGE_SIZES[src] ?? null;
}

export function getRegisteredContentImages(): string[] {
  return Object.keys(CONTENT_IMAGE_SIZES);
}
