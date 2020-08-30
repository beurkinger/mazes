export const setupCanvas = (
  canvas: HTMLCanvasElement,
  size: { width: number; height: number },
  withPixelRatio = true,
  alpha = false,
  imageSmoothingEnabled = false
): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d', { alpha });
  if (ctx) {
    const pixelRatio = (withPixelRatio && window?.devicePixelRatio) || 1;
    ctx.canvas.width = size.width * pixelRatio;
    ctx.canvas.height = size.height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingEnabled = imageSmoothingEnabled;
  }
  return ctx;
};
