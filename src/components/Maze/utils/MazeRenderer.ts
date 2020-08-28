import { Cell, Maze, MazeBuilder } from './MazeBuilder';
import { setupCanvas } from './canvas';

enum Defaults {
  borderWidth = 1,
  mbColumns = 16,
  nbRows = 16,
  cellSize = 5,
  backgroundColor = '#00000',
  strokeColor = '#FFFFFF',
  animationDelay = 100,
  buildDelay = 100,
}
export class MazeRenderer {
  mainCanvas: HTMLCanvasElement;
  mainCanvasCtx: null | CanvasRenderingContext2D;
  mazeCanvas: HTMLCanvasElement;
  mazeCanvasCtx: null | CanvasRenderingContext2D;

  builder: MazeBuilder;

  borderWidth: number;
  nbColumns: number;
  nbRows: number;
  cellSize: number;
  backgroundColor: string;
  strokeColor: string;
  animationDelay: number;
  buildDelay: number;

  animationFrame: null | number = null;
  animationTimeout: null | number = null;

  constructor(
    canvas: HTMLCanvasElement,
    borderWidth: number = Defaults.borderWidth,
    nbColumns: number = Defaults.mbColumns,
    nbRows: number = Defaults.nbRows,
    cellSize: number = Defaults.cellSize,
    backgroundColor: string = Defaults.backgroundColor,
    strokeColor: string = Defaults.strokeColor,
    animationDelay: number = Defaults.animationDelay,
    buildDelay: number = Defaults.buildDelay
  ) {
    this.borderWidth = borderWidth;
    this.nbColumns = nbColumns;
    this.nbRows = nbRows;
    this.cellSize = cellSize;
    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;
    this.animationDelay = animationDelay;
    this.buildDelay = buildDelay;

    this.builder = new MazeBuilder(nbColumns, nbRows);

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

  animateIn = (i = 0): Promise<void> =>
    new Promise((resolve) => {
      this.drawAnimationStep(i);

      if (i >= this.nbColumns - 1) return resolve();

      this.animationTimeout = window.setTimeout(() => {
        this.animateIn(i + 1).then(resolve);
      }, this.animationDelay);
    });

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

  buildMaze = (): Promise<void> =>
    new Promise((resolve) => {
      this.animateIn().then(() => {
        this.builder.buildLabyrinthWithDelay(
          this.buildDelay,
          (cells, isDone) => {
            if (!isDone) {
              this.drawLabyrinth(cells);
            } else {
              resolve();
            }
          }
        );
      });
    });

  render(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

    this.animationFrame = requestAnimationFrame(() => {
      if (this.mainCanvasCtx)
        this.mainCanvasCtx.drawImage(this.mazeCanvas, 0, 0);
    });
  }

  destroy(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    if (this.builder) this.builder.destroy();
  }
}
