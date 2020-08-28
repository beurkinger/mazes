import { shuffleArray } from './array';

type Cell = {
  id: number;
  walls: {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
  };
  visited: boolean;
};

type Maze = Cell[][];

enum Direction {
  north = 'north',
  east = 'east',
  south = 'south',
  west = 'west',
}

const x_increment = {
  [Direction.north]: 0,
  [Direction.east]: 1,
  [Direction.south]: 0,
  [Direction.west]: -1,
};
const y_increment = {
  [Direction.north]: -1,
  [Direction.east]: 0,
  [Direction.south]: 1,
  [Direction.west]: 0,
};

// HELPER FUNCTIONS

/* Return an array of maze cells without any path between them */
const createCells = (nbColumns: number, nbRows: number): Maze => {
  const cells = [];
  for (let y = 0; y < nbRows; y++) {
    const line = [];
    for (let x = 0; x < nbColumns; x++) {
      line.push({
        id: y * nbColumns + x,
        walls: { north: true, east: true, south: true, west: true },
        visited: false,
      });
    }
    cells.push(line);
  }
  return cells;
};

/* Return random coordinates inside a maze */
const getRandomCellCoords = (nbColumns: number, nbRows: number) => [
  Math.floor(Math.random() * nbColumns),
  Math.floor(Math.random() * nbRows),
];

/* Return the maze cell identified by the provided coordinates */
const getCell = (cells: Maze, x: number, y: number): Cell | null =>
  cells[y] && cells[y][x] ? cells[y][x] : null;

/* Returns the coordinates of an adjacent cell, using a current position and a direction */
const getTargetCellCoords = (x: number, y: number, direction: Direction) => [
  x + x_increment[direction],
  y + y_increment[direction],
];

/* Remove the wall between two cells */
const removeWall = (
  currentCell: Cell,
  targetCell: Cell,
  direction: Direction
): void => {
  if (direction === Direction.north) {
    currentCell.walls.north = false;
    targetCell.walls.south = false;
  } else if (direction === Direction.east) {
    currentCell.walls.east = false;
    targetCell.walls.west = false;
  } else if (direction === Direction.south) {
    currentCell.walls.south = false;
    targetCell.walls.north = false;
  } else if (direction === Direction.west) {
    currentCell.walls.west = false;
    targetCell.walls.east = false;
  }
};

export class MazeBuilder {
  nbColumns: number;
  nbRows: number;
  cells: Maze;
  diggingTimeout: number | null;

  constructor(nbColumns: number, nbRows: number) {
    this.nbColumns = nbColumns;
    this.nbRows = nbRows;
    this.cells = [];
    this.diggingTimeout = null;
  }

  /* Recursively dig a labyrinth inside an array of cells */
  private dig(cells: Maze, x: number, y: number): Maze {
    const currentCell = getCell(cells, x, y);
    if (!currentCell) return cells;

    currentCell.visited = true;

    const directions = [
      Direction.north,
      Direction.east,
      Direction.south,
      Direction.west,
    ];
    shuffleArray(directions);

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const [targetX, targetY] = getTargetCellCoords(x, y, direction);
      const targetCell = getCell(cells, targetX, targetY);

      if (targetCell && !targetCell.visited) {
        removeWall(currentCell, targetCell, direction);
        this.dig(cells, targetX, targetY);
      }
    }
    return cells;
  }

  /*
   * Asynchronously and recursively dig a labyrinth inside an array of cells,
   * with a delay between each wall removing
   */
  private digWithDelay(
    cells: Maze,
    x: number,
    y: number,
    delay: number,
    onWallRemove?: (cells: Maze) => void,
    onCellDone?: (cells: Maze) => void
  ): void {
    const self = this;
    this.diggingTimeout = window?.setTimeout(() => {
      const currentCell = getCell(cells, x, y);
      if (!currentCell) {
        if (onCellDone) onCellDone(cells);
        return;
      }

      currentCell.visited = true;

      const directions = [
        Direction.north,
        Direction.east,
        Direction.south,
        Direction.west,
      ];
      shuffleArray(directions);

      (function loop(i) {
        if (i < directions.length) {
          const direction = directions[i];
          const [targetX, targetY] = getTargetCellCoords(x, y, direction);
          const targetCell = getCell(cells, targetX, targetY);

          if (targetCell && !targetCell.visited) {
            removeWall(currentCell, targetCell, direction);
            if (onWallRemove) onWallRemove(cells);
            self.digWithDelay(
              cells,
              targetX,
              targetY,
              delay,
              onWallRemove,
              () => loop(i + 1)
            );
          } else {
            loop(i + 1);
          }
        } else {
          if (onCellDone) onCellDone(cells);
        }
      })(0);
    }, delay);
  }

  // Build a new labyrinth
  buildLabyrinth(): Maze {
    this.cells = createCells(this.nbRows, this.nbColumns);
    const [x, y] = getRandomCellCoords(this.nbRows, this.nbColumns);
    return this.dig(this.cells, x, y);
  }

  // Build a new labyrinth asynchronously, with a delay between each wall removing
  buildLabyrinthWithDelay(
    delay = 100,
    sendProgress?: (cells: Maze, isDone: boolean) => void
  ): void {
    if (this.diggingTimeout) clearTimeout(this.diggingTimeout);
    this.cells = createCells(this.nbRows, this.nbColumns);
    const [x, y] = getRandomCellCoords(this.nbRows, this.nbColumns);
    this.digWithDelay(
      this.cells,
      x,
      y,
      delay,
      (cells) => {
        if (sendProgress) sendProgress(cells, false);
      },
      (cells) => {
        if (sendProgress) sendProgress(cells, true);
      }
    );
  }

  getCells(): Maze {
    return this.cells;
  }

  destroy(): void {
    if (this.diggingTimeout) clearTimeout(this.diggingTimeout);
    this.cells = [];
  }
}
