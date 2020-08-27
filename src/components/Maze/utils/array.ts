export const shuffleArray = (array: unknown[]): void => {
  let i, j, valueCopy;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    valueCopy = array[i];
    array[i] = array[j];
    array[j] = valueCopy;
  }
};
