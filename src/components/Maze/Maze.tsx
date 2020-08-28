import { h, FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { MazeRenderer } from './utils/MazeRenderer';

import style from './Maze.css';

interface Props {
  animationDelay?: number;
  backgroundColor?: string;
  borderWidth?: number;
  buildDelay?: number;
  cellSize?: number;
  introDelay?: number;
  nbColumns?: number;
  nbRows?: number;
  strokeColor?: string;
}

const Maze: FunctionComponent<Props> = ({
  animationDelay = 100,
  backgroundColor = '#FFFFFF',
  borderWidth = 3,
  buildDelay = 100,
  cellSize = 15,
  introDelay = 100,
  nbColumns = 8,
  nbRows = 8,
  strokeColor = '#0000000',
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MazeRenderer | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  function blinkMessage(nbBlink = 0, i = 1): Promise<void> {
    return new Promise((resolve) => {
      setIsMessageVisible((isMessageVisible) => !isMessageVisible);

      if (i >= nbBlink) return resolve();

      timeoutRef.current = window.setTimeout(() => {
        blinkMessage(nbBlink, i + 1).then(resolve);
      }, 500);
    });
  }

  const generateSuccessMessage = (): string => {
    const letters = 'KQVWXYZЖБИФДЯЛ';
    const randomLetter = letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
    const randomNumber = Math.floor(Math.random() * 100).toString();
    return `${randomLetter}${randomNumber}`;
  };

  function buildMaze() {
    rendererRef.current?.buildMaze((_, isDone, coords) => {
      console.log(coords);
      if (isDone) {
        blinkMessage(6).then(buildMaze);
      }
    });
  }

  useEffect(() => {
    rendererRef.current = new MazeRenderer(
      canvasRef.current,
      borderWidth,
      nbColumns,
      nbRows,
      cellSize,
      backgroundColor,
      strokeColor,
      animationDelay,
      buildDelay
    );

    const canvasSize = rendererRef.current.getCanvasSize();
    setCanvasSize(canvasSize);
    setTimeout(() => {
      buildMaze();
    }, introDelay);

    return () => {
      rendererRef.current?.destroy();
    };
  }, []);

  return (
    <div className={style.maze}>
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
            color: strokeColor,
            fontSize: `${cellSize * 2}px`,
            height: `${canvasSize.height}px`,
            letterSpacing: `${cellSize / 5}px`,
            width: `${canvasSize.width}px`,
          }}
        >
          {generateSuccessMessage()}
        </div>
      )}
    </div>
  );
};

export default Maze;
