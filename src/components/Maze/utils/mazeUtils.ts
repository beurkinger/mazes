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

const getShuffledDirections = (): Direction[] => {
  const directions = [
    Direction.north,
    Direction.east,
    Direction.south,
    Direction.west,
  ];
  shuffleArray(directions);
  return directions;
};

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

/* Recursively dig a labyrinth inside an array of cells */
const dig = (cells: Maze, coords: Vector): Maze => {
  const currentCell = getCell(cells, coords) as Cell;
  currentCell.visited = true;

  const directions = getShuffledDirections();

  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];
    const targetCoords = getTargetCellCoords(coords, direction);
    const targetCell = getCell(cells, targetCoords);

    if (targetCell && !targetCell.visited) {
      removeWall(currentCell, targetCell, direction);
      dig(cells, targetCoords);
    }
  }
  return cells;
};

/*
 * Asynchronously and recursively dig a labyrinth inside an array of cells,
 * step by step
 */
const digByStep = (
  cells: Maze,
  coords: Vector,
  onUpdate: (
    cells: Maze,
    isDone: boolean,
    coords: Vector,
    nextStep: () => void
  ) => void,
  goBack?: () => void
): void => {
  const currentCell = getCell(cells, coords) as Cell;
  currentCell.visited = true;

  const directions = getShuffledDirections();

  (function loop(i) {
    if (i < directions.length) {
      const direction = directions[i];
      const targetCoords = getTargetCellCoords(coords, direction);
      const targetCell = getCell(cells, targetCoords);

      if (targetCell && !targetCell.visited) {
        removeWall(currentCell, targetCell, direction);
        const goBack = () => loop(i + 1);
        const nextStep = () => digByStep(cells, targetCoords, onUpdate, goBack);
        onUpdate(cells, false, coords, nextStep);
      } else {
        loop(i + 1);
      }
    } else {
      if (goBack) {
        goBack();
      } else {
        onUpdate(cells, true, coords, () => null);
      }
    }
  })(0);
};

/* Build a new labyrinth */
export const buildLabyrinth = (nbRows: number, nbColumns: number): Maze => {
  const cells = createCells(nbRows, nbColumns);
  const coords = getRandomCellCoords(nbRows, nbColumns);
  return dig(cells, coords);
};

/* Build a new labyrinth asynchronously, step by step */
export const buildLabyrinthByStep = (
  nbRows: number,
  nbColumns: number,
  onUpdate: (
    cells: Maze,
    isDone: boolean,
    coords: Vector,
    nextStep: () => void
  ) => void
): void => {
  const cells = createCells(nbRows, nbColumns);
  const startingCoords = getRandomCellCoords(nbRows, nbColumns);
  digByStep(cells, startingCoords, onUpdate);
};

export const drawCell = (
  ctx: CanvasRenderingContext2D,
  coords: Vector,
  cell: Cell | null,
  borderWidth: number,
  cellWidth: number
): void => {
  const x = coords.x * cellWidth;
  const y = coords.y * cellWidth;

  if (cell === null || cell.walls.north) {
    ctx.fillRect(x, y, cellWidth + borderWidth, borderWidth);
  }
  if (cell === null || cell.walls.east) {
    ctx.fillRect(x + cellWidth, y, borderWidth, cellWidth + borderWidth);
  }
  if (cell === null || cell.walls.south) {
    ctx.fillRect(x + cellWidth, y + cellWidth, -cellWidth, borderWidth);
  }
  if (cell === null || cell.walls.west) {
    ctx.fillRect(x, y + cellWidth, borderWidth, -cellWidth);
  }
};

export const drawLabyrinth = (
  ctx: CanvasRenderingContext2D,
  cells: Maze,
  borderWidth: number,
  cellWidth: number
): void => {
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      drawCell(ctx, { x, y }, cells[y][x], borderWidth, cellWidth);
    }
  }
};
