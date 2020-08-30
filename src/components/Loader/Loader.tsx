import { h, FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { loopWithDelay } from '../../utils/animation';

import style from './Loader.css';

interface Props {
  blinkingDelay?: number;
  loadingDelay?: number;
  nbBars?: number;
  nbBlinks?: number;
}

const Loader: FunctionComponent<Props> = ({
  blinkingDelay = 500,
  loadingDelay = 1000,
  nbBars = 10,
  nbBlinks = 6,
}: Props) => {
  const clearLoopRef = useRef<() => void>(() => null);
  const [nbBarsVisible, setNbBarsVisible] = useState(0);

  const loadBars = () => {
    clearLoopRef.current = loopWithDelay(
      (i) => {
        setNbBarsVisible(i);
      },
      () => {
        blinkBars();
      },
      nbBars,
      loadingDelay
    );
  };

  const blinkBars = () => {
    clearLoopRef.current = loopWithDelay(
      (i) => setNbBarsVisible(i % 2 ? 0 : nbBars),
      loadBars,
      nbBlinks,
      blinkingDelay
    );
  };

  useEffect(() => {
    loadBars();
    return () => {
      if (clearLoopRef.current) clearLoopRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.loadBar}>
      {Array.from({ length: nbBars }).map((_, i) => (
        <div
          className={style.bar}
          key={i}
          style={{ visibility: nbBarsVisible >= i + 1 ? 'visible' : 'hidden' }}
        />
      ))}
    </div>
  );
};

export default Loader;
