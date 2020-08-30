import { loopWithDelay } from '../../../utils/animation';
import { Cell, Maze, buildLabyrinthByStep } from './MazeBuilder';
import { setupCanvas } from './canvas';

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

    this.mainCanvasCtx = this.mainCanvas.getContext('2d', { alpha: false });
    this.mazeCanvasCtx = this.mazeCanvas.getContext('2d', { alpha: false });

    if (this.mainCanvasCtx && this.mazeCanvasCtx) {
      const { width, height } = setupCanvas(
        this.mainCanvasCtx,
        nbColumns * cellSize + borderWidth,
        nbRows * cellSize + borderWidth
      );
      setupCanvas(this.mazeCanvasCtx, width, height, false, false);
      this.mainCanvasCtx.fillStyle = this.backgroundColor;
      this.mainCanvasCtx.fillRect(0, 0, width, height);
    }
  }

  getCanvasSize(): { width: number; height: number } {
    return { width: this.mazeCanvas.width, height: this.mazeCanvas.height };
  }

  drawCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cell: Cell | null
  ): void {
    const { borderWidth, cellSize } = this;
    if (!ctx) return;

    if (cell === null || cell.walls.north) {
      ctx.fillRect(x, y, cellSize + borderWidth, borderWidth);
    }
    if (cell === null || cell.walls.east) {
      ctx.fillRect(x + cellSize, y, borderWidth, cellSize + borderWidth);
    }
    if (cell === null || cell.walls.south) {
      ctx.fillRect(x + cellSize, y + cellSize, -cellSize, borderWidth);
    }
    if (cell === null || cell.walls.west) {
      ctx.fillRect(x, y + cellSize, borderWidth, -cellSize);
    }
  }

  drawLabyrinth(cells: Maze): void {
    if (!this.mazeCanvasCtx) return;

    this.mazeCanvasCtx.fillStyle = this.backgroundColor;
    this.mazeCanvasCtx.fillRect(
      0,
      0,
      this.mazeCanvas.width - 1,
      this.mazeCanvas.height - 1
    );

    this.mazeCanvasCtx.fillStyle = this.strokeColor;
    for (let y = 0; y < cells.length; y++) {
      for (let x = 0; x < cells[y].length; x++) {
        this.drawCell(
          this.mazeCanvasCtx,
          x * this.cellSize,
          y * this.cellSize,
          cells[y][x]
        );
      }
    }
    this.render();
  }

  drawAnimationStep = (i: number): void => {
    if (!this.mazeCanvasCtx) return;

    this.mazeCanvasCtx.fillStyle = this.strokeColor;
    this.mazeCanvasCtx.fillRect(
      0,
      0,
      this.mazeCanvas.width,
      this.mazeCanvas.height
    );

    this.mazeCanvasCtx.fillStyle = this.backgroundColor;
    this.mazeCanvasCtx.fillRect(
      this.borderWidth,
      this.borderWidth,
      this.mazeCanvas.width - this.borderWidth * 2,
      this.mazeCanvas.height - this.borderWidth * 2
    );

    this.mazeCanvasCtx.fillStyle = this.strokeColor;
    for (let y = 0; y < this.nbRows; y++) {
      for (let x = 0; x < this.nbColumns; x++) {
        if (x <= i)
          this.drawCell(
            this.mazeCanvasCtx,
            x * this.cellSize,
            y * this.cellSize,
            null
          );
      }
    }
    this.render();
  };

  animateIn = (onDone: () => void): void => {
    this.clearAnimateInLoop = loopWithDelay(
      (i) => this.drawAnimationStep(i),
      onDone,
      this.nbColumns - 1,
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
          if (!isDone) this.drawLabyrinth(cells);
          onUpdate(isDone, coords);
          if (!isDone) this.buildingTimeout = window?.setTimeout(next, 100);
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
