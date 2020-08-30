import { shuffleArray } from './array';

export type Vector = { x: number; y: number };

export type Cell = {
  id: number;
  walls: {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
  };
  visited: boolean;
};

export type Maze = Cell[][];

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
const createCells = (nbRows: number, nbColumns: number): Maze => {
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
const getRandomCellCoords = (nbRows: number, nbColumns: number): Vector => ({
  x: Math.floor(Math.random() * nbColumns),
  y: Math.floor(Math.random() * nbRows),
});

/* Return the maze cell identified by the provided coordinates */
const getCell = (cells: Maze, coords: Vector): Cell | null =>
  cells[coords.y] && cells[coords.y][coords.x]
    ? cells[coords.y][coords.x]
    : null;

/* Returns the coordinates of an adjacent cell, using a current position and a direction */
const getTargetCellCoords = (coords: Vector, direction: Direction): Vector => ({
  x: coords.x + x_increment[direction],
  y: coords.y + y_increment[direction],
});

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
  private dig(cells: Maze, coords: Vector): Maze {
    const currentCell = getCell(cells, coords) as Cell;

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
      const targetCoords = getTargetCellCoords(coords, direction);
      const targetCell = getCell(cells, targetCoords);

      if (targetCell && !targetCell.visited) {
        removeWall(currentCell, targetCell, direction);
        this.dig(cells, targetCoords);
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
    coords: Vector,
    delay: number,
    onWallRemove?: (cells: Maze, coords: Vector) => void,
    onCellDone?: (cells: Maze, coords: Vector) => void
  ): void {
    this.diggingTimeout = window?.setTimeout(() => {
      const currentCell = getCell(cells, coords) as Cell;

      currentCell.visited = true;

      const directions = [
        Direction.north,
        Direction.east,
        Direction.south,
        Direction.west,
      ];
      shuffleArray(directions);

      const self = this;
      (function loop(i) {
        if (i < directions.length) {
          const direction = directions[i];
          const targetCoords = getTargetCellCoords(coords, direction);
          const targetCell = getCell(cells, targetCoords);

          if (targetCell && !targetCell.visited) {
            removeWall(currentCell, targetCell, direction);
            if (onWallRemove) onWallRemove(cells, coords);
            self.digWithDelay(cells, targetCoords, delay, onWallRemove, () =>
              loop(i + 1)
            );
          } else {
            loop(i + 1);
          }
        } else {
          if (onCellDone) onCellDone(cells, coords);
        }
      })(0);
    }, delay);
  }

  // Build a new labyrinth
  buildLabyrinth(): Maze {
    this.cells = createCells(this.nbRows, this.nbColumns);
    const coords = getRandomCellCoords(this.nbRows, this.nbColumns);
    return this.dig(this.cells, coords);
  }

  // Build a new labyrinth asynchronously, with a delay between each wall removing
  buildLabyrinthWithDelay(
    delay = 100,
    sendProgress?: (
      cells: Maze,
      isDone: boolean,
      currentCoords: { x: number; y: number }
    ) => void
  ): void {
    if (this.diggingTimeout) clearTimeout(this.diggingTimeout);
    this.cells = createCells(this.nbRows, this.nbColumns);
    const coords = getRandomCellCoords(this.nbRows, this.nbColumns);
    this.digWithDelay(
      this.cells,
      coords,
      delay,
      (cells, coords) => {
        if (sendProgress) sendProgress(cells, false, coords);
      },
      (cells, coords) => {
        if (sendProgress) sendProgress(cells, true, coords);
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
