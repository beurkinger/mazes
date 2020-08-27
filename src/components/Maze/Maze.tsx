import { h, FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { setupCanvas } from './utils/canvas';

import style from './Maze.css';

interface Props {
  backgroundColor?: string;
  borderWidth?: number;
  frontColor?: string;
  cellSize?: number;
  buildDelay?: number;
  introDelay?: number;
  nbColumns?: number;
  nbRows?: number;
}

const Maze: FunctionComponent<Props> = ({
  backgroundColor = '#000',
  borderWidth = 1,
  frontColor = '#FFF',
  cellSize = 5,
  buildDelay = 100,
  introDelay = 100,
  nbColumns = 16,
  nbRows = 16,
}: Props) => {
  console.log(
    backgroundColor,
    borderWidth,
    frontColor,
    cellSize,
    buildDelay,
    introDelay,
    nbColumns,
    nbRows
  );

  const animationFrameRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ height: 0, width: 0 });

  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const draw = () => {};

  // const handleResize = () => {
  //   if (ctxRef.current) {
  //     sizeRef.current = setupCanvas(ctxRef.current);
  //   }
  // };

  useEffect(() => {
    ctxRef.current =
      canvasRef?.current.getContext('2d', { alpha: false }) ?? null;

    if (!ctxRef.current) return;

    sizeRef.current = setupCanvas(ctxRef.current);
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // useEffect(() => {
  //   window?.addEventListener('resize', handleResize);
  //   return () => window?.removeEventListener('resize', handleResize);
  // }, []);

  return (
    <div className={style.maze}>
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor,
          display: isMessageVisible ? 'block' : 'none',
        }}
      />
      {/* {!isMessageVisible && (
        <Message
          background={backgroundColor}
          borderWidth={borderWidth}
          color={frontColor}
          fontSize={cellSize * 2}
          height={canvasSize.height}
          message={this.generateSuccessMessage()}
          width={canvasSize.width}
        />
      )} */}
    </div>
  );
};

export default Maze;
