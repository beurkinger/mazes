export const loopWithDelay = (
  onLoop: (loopIndex: number) => void,
  onDone: () => void,
  nbLoops: number,
  loopDuration: number
): (() => void) => {
  let i = 0;
  const interval = window.setInterval(() => {
    onLoop(i);
    if (i + 1 === nbLoops) {
      clearInterval(interval);
      onDone();
    }
    i += 1;
  }, loopDuration);

  return () => {
    if (interval) clearInterval(interval);
  };
};
