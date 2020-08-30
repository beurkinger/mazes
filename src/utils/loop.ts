export const loopWithDelay = (
  onLoop: (loopIndex: number) => void,
  onDone: () => void,
  nbLoops: number,
  loopDuration: number
): (() => void) => {
  let i = 0;
  onLoop(i);
  const interval = window?.setInterval(() => {
    i += 1;
    if (i === nbLoops) {
      clearInterval(interval);
      onDone();
      return;
    }
    onLoop(i);
  }, loopDuration);

  return () => {
    if (interval) window?.clearInterval(interval);
  };
};
