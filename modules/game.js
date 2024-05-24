import {
	ROW_COLS,
	MAX_MINES,
	SYMBOLS,
	MAP_SIZE,
	CELL_SIZE,
	canvas,
	ctx,
} from "./constants.js";
import { Cell } from "./cell.js";

/**
 * Contains game-wide functions.
 */
export class Game {
	/**
	 * Initializes an default instance of the game.
	 */
	constructor() {
		this.gridInitialized = false;
		this.started = false;
		this.lost = false;
		this.mines = 0;
		this.timer = null;

		/** @type {Cell[]} */
		this.cells = [];
	}

	/**
	 * Handles the event when user clicks a mine cell.
	 */
	onMineClicked() {
		this.lost = true;
		this.drawAllMines();
	}

	/**
	 * Initializes the game canvas and cells.
	 */
	initialize() {
		this.setCanvasSize();
		this.createCells();
		this.drawGrid();
		this.gridInitialized = true;
	}

	/**
	 * After first revealed cell, sets starting cell
	 * and calculates the neighbour cells mine count.
	 *
	 * @param {Cell} cell Starting cell.
	 */
	initializeStartingCell(cell) {
		cell.start = true;

		this.mines = this.generateMines(MAX_MINES);
		this.calculateCellValues();
		this.openNeighboringCells(cell);

		this.started = true;
		this.timer = new Date();
	}

	/**
	 * Creates empty cell grid.
	 */
	createCells() {
		for (let i = 0; i < ROW_COLS * ROW_COLS; ++i) {
			const x = i % ROW_COLS;
			const y = Math.floor(i / ROW_COLS);
			this.cells.push(new Cell(x, y));
		}
	}

	/**
	 * Generates mines on random positions through cell list.
	 *
	 * @returns {number} Amount of mines created.
	 */
	generateMines() {
		let mines = 0;

		/** @type {Cell[]} */
		const mineLocations = [];
		const interval = Math.floor(this.cells.length / MAX_MINES);

		for (let i = 0; i < MAX_MINES; i++) {
			const start = i * interval;
			const end = (i + 1) * interval;
			const randomIdx = Math.floor(Math.random() * (end - start)) + start;

			if (
				this.cells[randomIdx].start ||
				mineLocations.find((c) => c == this.cells[randomIdx])
			) {
				continue;
			}

			mineLocations.push(this.cells[randomIdx]);
		}

		for (let i = 0; i < this.cells.length; ++i) {
			if (mineLocations.find((c) => c.pos == this.cells[i].pos)) {
				this.cells[i].mine = true;
				mines++;
			}
		}

		return mines;
	}

	/**
	 * Sets canvas width and height.
	 */
	setCanvasSize() {
		canvas.width = MAP_SIZE.w;
		canvas.height = MAP_SIZE.h;
	}

	/**
	 * Draws the minesweeper grid.
	 */
	drawGrid() {
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'black';

		const cells = (MAP_SIZE.h / CELL_SIZE.h) * (MAP_SIZE.w / CELL_SIZE.w);
		for (let i = 0; i < cells; ++i) {
			const x = i % ROW_COLS;
			const y = Math.floor(i / ROW_COLS);

			ctx.moveTo(x * CELL_SIZE.w, 0);
			ctx.lineTo(x * CELL_SIZE.w, MAP_SIZE.h);
			ctx.stroke();

			ctx.moveTo(0, y * CELL_SIZE.h);
			ctx.lineTo(MAP_SIZE.w, y * CELL_SIZE.h);
			ctx.stroke();
		}
	}

	/**
	 * Opens neighboring cells that are not already opened,
	 * marked or does not contain mine.
	 *
	 * @param {Cell} cell Cell where opening begins.
	 */
	openNeighboringCells(cell) {
		if (!cell.valid() || cell.mine || cell.opened) {
			return;
		}

		cell.opened = true;
		cell.drawNormal();

		if (cell.value != 0) {
			return;
		}

		let n = cell.getNeighbours(this.cells).filter((rr) => !rr.mine);
		n.forEach((l) => this.openNeighboringCells(l));
	}

	/**
	 * Calculates values for each cell in the cells array.
	 */
	calculateCellValues() {
		for (let i = 0; i < this.cells.length; ++i) {
			const neighbours = this.cells[i].getNeighbours(this.cells);
			const minesInNeighbour = neighbours.filter((n) => n.mine);

			if (this.cells[i].start) {
				this.cells[i].value = 0;
			} else if (this.cells[i].mine) {
				this.cells[i].value = SYMBOLS.MINE;
			} else {
				this.cells[i].value = minesInNeighbour.length;
			}
		}
	}

	/**
	 * Displays all mines in the event of losing the game.
	 */
	drawAllMines() {
		for (let i = 0; i < this.cells.length; ++i) {
			this.cells[i].drawMine();
		}
	}

	/**
	 * Checks if all mine locations are found.
	 *
	 * @returns {boolean} If all mine locations are found, returns `true`;
	 * otherwise `false`.
	 */
	allMinesFound() {
		return this.cells.filter((c) => !c.mine).every((c) => c.opened);
	}

	/**
	 * Gets a cell that intersects with X and Y position.
	 *
	 * @param {number} x X-axis position.
	 * @param {number} y Y-axis position.
	 * @returns {Cell|undefined} If cell was found, returns `Cell`;
	 * otherwise `undefined`.
	 */
	findCellAtPosition(x, y) {
		return this.cells.find((c) => c.intersects(x, y));
	}
};
