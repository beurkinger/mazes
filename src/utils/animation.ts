export const loopWithDelay = (
  onLoop: (loopIndex: number) => void,
  onDone: () => void,
  nbLoops: number,
  loopDuration: number
): (() => void) => {
  let i = 0;
  const interval = window?.setInterval(() => {
    if (i === nbLoops) {
      clearInterval(interval);
      onDone();
      return;
    }
    onLoop(i);
    i += 1;
  }, loopDuration);

  return () => {
    if (interval) window?.clearInterval(interval);
  };
};
