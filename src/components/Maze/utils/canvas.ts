export const setupCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  imageSmoothingEnabled = false,
  withPixelRatio = true
): { height: number; width: number } => {
  const pixelRatio: number = (withPixelRatio && window?.devicePixelRatio) || 1;
  ctx.canvas.width = width * pixelRatio;
  ctx.canvas.height = height * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingEnabled = imageSmoothingEnabled;

  return { height, width };
};
