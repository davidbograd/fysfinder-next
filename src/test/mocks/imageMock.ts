// Static raster image mock for Jest imports. Mirrors the shape Next.js gives a
// static image import; the dimensions are placeholders, since the real ones
// only exist once the Next image loader has run at build time.
const imageMock = {
  src: "/test-image-stub.png",
  width: 1,
  height: 1,
  blurDataURL: "",
};
export default imageMock;
