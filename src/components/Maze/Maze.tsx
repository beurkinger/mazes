import { h, FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { loopWithDelay } from '../../utils/loop';
import { MazeRenderer } from './utils/MazeRenderer';

import style from './Maze.css';
import useTimeout from '../../hooks/useTimeout';

interface Props {
  animationDelay?: number;
  backgroundColor?: string;
  blinkingDelay?: number;
  borderWidth?: number;
  buildingDelay?: number;
  cellWidth?: number;
  introDelay?: number;
  nbColumns?: number;
  nbRows?: number;
  nbBlinks?: number;
  strokeColor?: string;
}

const Maze: FunctionComponent<Props> = ({
  animationDelay = 100,
  backgroundColor = '#FFFFFF',
  blinkingDelay = 600,
  borderWidth = 3,
  buildingDelay = 350,
  cellWidth = 15,
  introDelay = 100,
  nbBlinks = 6,
  nbColumns = 8,
  nbRows = 8,
  strokeColor = '#0000000',
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MazeRenderer | null>(null);
  const clearLoopRef = useRef<() => void>(() => null);

  const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
  // const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const generateSuccessMessage = (): string => {
    const letters = 'АБВГДДЖДЗЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮ';
    const randomLetter = letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
    const randomNumber = Math.floor(Math.random() * 100).toString();
    return `${randomLetter}${randomNumber}`;
  };

  const buildMaze = () => {
    rendererRef.current?.buildMaze((isDone) => {
      // setCoords(coords);
      if (isDone) {
        blink();
      }
    });
  };

  const blink = () => {
    clearLoopRef.current = loopWithDelay(
      (i) => setIsMessageVisible(!(i % 2)),
      buildMaze,
      nbBlinks,
      blinkingDelay
    );
  };

  useEffect(() => {
    rendererRef.current = new MazeRenderer(
      canvasRef.current,
      borderWidth,
      nbColumns,
      nbRows,
      cellWidth,
      backgroundColor,
      strokeColor,
      animationDelay,
      buildingDelay
    );

    const canvasSize = rendererRef.current.getCanvasSize();
    setCanvasSize(canvasSize);

    return () => {
      rendererRef.current?.destroy();
      if (clearLoopRef.current) clearLoopRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useTimeout(buildMaze, introDelay);

  return (
    <div
      className={style.maze}
      style={{
        color: strokeColor,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: !isMessageVisible ? 'block' : 'none',
          height: `${canvasSize.height}px`,
          width: `${canvasSize.width}px`,
        }}
      />
      {isMessageVisible && (
        <div
          className={style.message}
          style={{
            borderWidth,
            fontSize: `${cellWidth * 2}px`,
            height: `${canvasSize.height}px`,
            letterSpacing: `${cellWidth / 5}px`,
            width: `${canvasSize.width}px`,
          }}
        >
          {generateSuccessMessage()}
        </div>
      )}
      {/* <div
        className={style.coords}
        style={{
          fontSize: `${cellWidth * 1.5}px`,
        }}
      >
        {`[ 
          ${(coords.x * 4).toString(16).padStart(2, '0')},  
          ${(coords.y * 4).toString(16).padStart(2, '0')} 
        ]`}
      </div> */}
    </div>
  );
};

export default Maze;
