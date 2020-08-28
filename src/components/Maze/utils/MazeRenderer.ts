import { Cell, Maze } from './MazeBuilder';

const DEFAULT_BORDER_WIDTH = 1;
const DEFAULT_NB_COLUMS = 16;
const DEFAULT_NB_ROWS = 16;
const DEFAULT_CELL_SIZE = 5;
const DEFAULT_BACKGROUND_COLOR = '#00000';
const DEFAULT_STROKE_COLOR = '#FFFFFF';
const DEFAULT_ANIMATION_DELAY = 100;

export class MazeRenderer {
  mainCanvas: HTMLCanvasElement;
  mainCanvasCtx: null | CanvasRenderingContext2D;
  mazeCanvas: HTMLCanvasElement;
  mazeCanvasCtx: null | CanvasRenderingContext2D;

  animationFrame: null | number;
  animationTimeout: null | number;

  borderWidth: number;
  nbColumns: number;
  nbRows: number;
  cellSize: number;
  backgroundColor: string;
  strokeColor: string;

  onRender?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    borderWidth: number = DEFAULT_BORDER_WIDTH,
    nbColumns: number = DEFAULT_NB_COLUMS,
    nbRows: number = DEFAULT_NB_ROWS,
    cellSize: number = DEFAULT_CELL_SIZE,
    backgroundColor: string = DEFAULT_BACKGROUND_COLOR,
    strokeColor: string = DEFAULT_STROKE_COLOR,
    onRender?: () => void
  ) {
    this.borderWidth = borderWidth;
    this.nbColumns = nbColumns;
    this.nbRows = nbRows;
    this.cellSize = cellSize;
    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;
    this.animationFrame = null;
    this.animationTimeout = null;
    this.onRender = onRender;

    this.mainCanvas = canvas;
    this.mazeCanvas = document.createElement('canvas');

    this.mainCanvas.width = nbColumns * cellSize + borderWidth;
    this.mainCanvas.height = nbRows * cellSize + borderWidth;
    this.mazeCanvas.width = this.mainCanvas.width;
    this.mazeCanvas.height = this.mainCanvas.height;

    this.mainCanvasCtx = this.mainCanvas.getContext('2d');
    this.mazeCanvasCtx = this.mazeCanvas.getContext('2d');

    if (this.mainCanvasCtx && this.mazeCanvasCtx) {
      this.mainCanvasCtx.imageSmoothingEnabled = false;
      this.mazeCanvasCtx.imageSmoothingEnabled = false;
    }
  }

  getCanvasSize(): { width: number; height: number } {
    return { width: this.mazeCanvas.width, height: this.mazeCanvas.height };
  }

  displayMessage(message = ''): void {
    if (!this.mazeCanvasCtx) return;

    const fontSize = this.cellSize * 2;

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

    this.mazeCanvasCtx.font = `${fontSize}px Arial`;
    this.mazeCanvasCtx.fillStyle = this.strokeColor;
    this.mazeCanvasCtx.textBaseline = 'middle';
    this.mazeCanvasCtx.textAlign = 'center';
    this.mazeCanvasCtx.fillText(
      message,
      this.mazeCanvas.width / 2,
      this.mazeCanvas.height / 2 + fontSize / 12
    );

    this.render();
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

  animateIn = (delay = DEFAULT_ANIMATION_DELAY, i = 0): Promise<void> =>
    new Promise((resolve) => {
      this.drawAnimationStep(i);

      if (i >= this.nbColumns - 1) return resolve();

      this.animationTimeout = window.setTimeout(() => {
        this.animateIn(delay, i + 1).then(resolve);
      }, delay);
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

  render(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

    this.animationFrame = requestAnimationFrame(() => {
      if (this.mainCanvasCtx)
        this.mainCanvasCtx.drawImage(this.mazeCanvas, 0, 0);
    });

    if (this.onRender) this.onRender();
  }

  destroy(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
  }
}
