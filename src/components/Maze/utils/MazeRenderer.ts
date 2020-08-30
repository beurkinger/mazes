import { setupCanvas } from '../../../utils/canvas';
import { loopWithDelay } from '../../../utils/loop';
import {
  drawCell,
  drawLabyrinth,
  buildLabyrinthByStep,
  Maze,
} from './mazeUtils';

enum Defaults {
  borderWidth = 1,
  mbColumns = 16,
  nbRows = 16,
  cellSize = 5,
  backgroundColor = '#FFFFFF',
  strokeColor = '#000000',
  animatingDelay = 100,
  buildingDelay = 100,
}
export class MazeRenderer {
  mainCanvas: HTMLCanvasElement;
  mainCanvasCtx: null | CanvasRenderingContext2D;
  mazeCanvas: HTMLCanvasElement;
  mazeCanvasCtx: null | CanvasRenderingContext2D;

  animatingDelay: number;
  buildingDelay: number;
  backgroundColor: string;
  borderWidth: number;
  cellSize: number;
  nbColumns: number;
  nbRows: number;
  strokeColor: string;

  animationFrame: null | number = null;
  buildingTimeout: null | number = null;

  clearAnimateInLoop: null | (() => void) = null;

  constructor(
    canvas: HTMLCanvasElement,
    borderWidth: number = Defaults.borderWidth,
    nbColumns: number = Defaults.mbColumns,
    nbRows: number = Defaults.nbRows,
    cellSize: number = Defaults.cellSize,
    backgroundColor: string = Defaults.backgroundColor,
    strokeColor: string = Defaults.strokeColor,
    animatingDelay: number = Defaults.animatingDelay,
    buildingDelay: number = Defaults.buildingDelay
  ) {
    this.borderWidth = borderWidth;
    this.nbColumns = nbColumns;
    this.nbRows = nbRows;
    this.cellSize = cellSize;
    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;
    this.animatingDelay = animatingDelay;
    this.buildingDelay = buildingDelay;

    this.mainCanvas = canvas;
    this.mazeCanvas = document.createElement('canvas');

    const width = nbColumns * cellSize + borderWidth;
    const height = nbRows * cellSize + borderWidth;

    this.mainCanvasCtx = setupCanvas(this.mainCanvas, width, height);
    this.mazeCanvasCtx = setupCanvas(this.mazeCanvas, width, height, false);

    if (this.mainCanvasCtx) {
      this.mainCanvasCtx.fillStyle = this.backgroundColor;
      this.mainCanvasCtx.fillRect(0, 0, width, height);
    }
  }

  getCanvasSize(): { width: number; height: number } {
    return { width: this.mazeCanvas.width, height: this.mazeCanvas.height };
  }

  drawLabyrinth = (cells: Maze): void => {
    if (!this.mazeCanvasCtx) return;
    const { width, height } = this.getCanvasSize();
    this.mazeCanvasCtx.fillStyle = this.backgroundColor;
    this.mazeCanvasCtx.fillRect(0, 0, width, height);
    this.mazeCanvasCtx.fillStyle = this.strokeColor;
    drawLabyrinth(this.mazeCanvasCtx, cells, this.borderWidth, this.cellSize);
    this.render();
  };

  drawAnimationStep = (stepIndex: number): void => {
    const {
      backgroundColor,
      borderWidth,
      cellSize,
      mazeCanvasCtx,
      nbRows,
      nbColumns,
      strokeColor,
    } = this;
    if (!mazeCanvasCtx) return;

    const { height, width } = this.getCanvasSize();

    mazeCanvasCtx.fillStyle = strokeColor;
    mazeCanvasCtx.fillRect(0, 0, width, height);

    mazeCanvasCtx.fillStyle = backgroundColor;
    mazeCanvasCtx.fillRect(
      borderWidth,
      borderWidth,
      width - borderWidth * 2,
      height - borderWidth * 2
    );

    mazeCanvasCtx.fillStyle = strokeColor;
    for (let y = 0; y < nbRows; y++) {
      for (let x = 0; x < nbColumns; x++) {
        if (x <= stepIndex)
          drawCell(mazeCanvasCtx, { x, y }, null, borderWidth, cellSize);
      }
    }
    this.render();
  };

  animateIn = (onDone: () => void): void => {
    this.clearAnimateInLoop = loopWithDelay(
      (i) => this.drawAnimationStep(i),
      onDone,
      this.nbColumns + 1,
      this.animatingDelay
    );
  };

  buildMaze = (
    onUpdate: (
      isDone: boolean,
      coords: { x: number; y: number }
    ) => void = () => null
  ): void => {
    this.animateIn(() => {
      buildLabyrinthByStep(
        this.nbRows,
        this.nbColumns,
        (cells, isDone, coords, next) => {
          onUpdate(isDone, coords);
          if (isDone || !this.mazeCanvasCtx) return;
          this.drawLabyrinth(cells);
          this.buildingTimeout = window?.setTimeout(next, 100);
        }
      );
    });
  };

  render(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

    this.animationFrame = requestAnimationFrame(() => {
      if (this.mainCanvasCtx)
        this.mainCanvasCtx.drawImage(this.mazeCanvas, 0, 0);
    });
  }

  destroy(): void {
    if (this.animationFrame) window?.cancelAnimationFrame(this.animationFrame);
    if (this.buildingTimeout) window?.clearTimeout(this.buildingTimeout);
    if (this.clearAnimateInLoop) this.clearAnimateInLoop();
  }
}
