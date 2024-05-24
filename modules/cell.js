import { CELL_SIZE, ROW_COLS, SYMBOLS, ctx, DEBUG } from "./constants.js";

/**
 * Represents a cell in the minesweeper grid.
 */
export class Cell {
	/**
	 * Initializes an default values to the cell.
	 *
	 * @param {number} x Cell index X
	 * @param {number} y Cell index Y
	 */
	constructor(x, y) {
		this.pos = { x: x, y: y };

		this.bounds = {
			x: x * CELL_SIZE.w,
			y: y * CELL_SIZE.h,
			w: x * CELL_SIZE.w + CELL_SIZE.w,
			h: y * CELL_SIZE.h + CELL_SIZE.h,
		};

		this.value = 0;
		this.isMarked = false;
		this.opened = false;
		this.mine = false;
		this.start = false;
	}

	/**
	 * Checks if x and y coords intersect with cell bounds.
	 *
	 * @param {number} x X coord
	 * @param {number} y Y coord
	 * @returns {boolean} If coords intersect, returns `true`;
	 * otherwise `false`.
	 */
	intersects(x, y) {
		return (
			this.bounds.x <= x &&
			this.bounds.w >= x &&
			this.bounds.y <= y &&
			this.bounds.h >= y
		);
	}

	/**
	 * Checks if cell position is inside the minesweeper grid.
	 *
	 * @returns {boolean} If cell is inside the grid, returns `true`;
	 * otheriwise `false`.
	 */
	valid() {
		return (
			this.pos.x >= 0 &&
			this.pos.x <= ROW_COLS &&
			this.pos.y >= 0 &&
			this.pos.y <= ROW_COLS
		);
	}

	/**
	 * Gets a color that represents this cell.
	 *
	 * @returns {string} Returns color that represents cell's value.
	 */
	getColor() {
		if (this.value == 1) {
			return "blue";
		} else if (this.value == 2) {
			return "green";
		} else if (this.value > 2) {
			return "red";
		} else {
			return "lightgray";
		}
	}

	getBgColor() {
		if (this.opened) {
			return "lightgray";
		} else {
			return "#333333";
		}
	}

	/**
	 * Gets all neighbours that surround this cell.
	 *
	 * @param {Cell[]} cells All grid cells.
	 * @returns {Cell[]} Neighbour cells.
	 */
	getNeighbours(cells) {
		const n = [
			new Cell(0, -1), // ⬆️
			new Cell(-1, 0), // ➡️
			new Cell(1, 0), // ⬅️
			new Cell(0, 1), // ⬇️
			new Cell(-1, -1), // ↖️
			new Cell(1, -1), // ↗️
			new Cell(-1, 1), // ↙️
			new Cell(1, 1), // ↘️
		];

		const neighbours = [];

		for (let i = 0; i < n.length; ++i) {
			const x = this.pos.x + n[i].pos.x;
			const y = this.pos.y + n[i].pos.y;

			if (!this.valid()) {
				continue;
			}

			const match = cells.find((c) => c.pos.x == x && c.pos.y == y);
			if (match != undefined) {
				neighbours.push(match);
			}
		}

		return neighbours;
	}

	/**
	 * Gets cell center position in for text.
	 *
	 * @returns {{x: number, y: number}} Center position in X- and Y-axis..
	 */
	getTextCenterPosition(textMetrics) {
		const textWidth = textMetrics.width;
		const textHeight =
			textMetrics.actualBoundingBoxAscent +
			textMetrics.actualBoundingBoxDescent;

		return {
			x: this.bounds.x + (this.bounds.w - this.bounds.x) / 2 - textWidth / 2,
			y:
				this.bounds.y +
				(this.bounds.h - this.bounds.y) / 2 +
				textHeight / 2 -
				textMetrics.actualBoundingBoxDescent,
		};
	}

	/**
	 * Draws this cell.
	 */
	draw() {
		ctx.fillStyle = this.getBgColor();

		ctx.fillRect(this.bounds.x, this.bounds.y, CELL_SIZE.w, CELL_SIZE.h);
		ctx.stroke();
	}

	globalDraw() {
		this.draw();

		if (this.value > 0 && this.opened) {
			this.drawText(this.value);
		} else if (this.mine && this.opened) {
			this.draw();
			this.drawText(SYMBOLS.MINE);
		} else if (this.isMarked) {
			this.drawText(SYMBOLS.MARK);
		}
	}

	/**
	 * Draws this cell and marker on it,
	 * incase it's marked or removes the marker.
	 */
	drawMarker() {
		this.draw();

		if (this.isMarked) {
			this.drawText(SYMBOLS.MARK);
		}
	}

	/**
	 * Draws this cell and it's value.
	 */
	drawNormal() {
		this.draw();

		if (this.value > 0) {
			this.drawText(this.value);
		}
	}

	/**
	 * Draws this cell and mine on it, if it has a mine.
	 */
	drawMine() {
		if (this.mine) {
			this.draw();
			this.drawText(SYMBOLS.MINE);
		}
	}

	/**
	 * Draws text on center of this cell.
	 * @param {*} text Text to be drawn.
	 */
	drawText(text) {
		ctx.font = `${CELL_SIZE.h * 0.7}px Roboto`;
		ctx.fillStyle = this.getColor();

		const textMetrics = ctx.measureText(text.toString());
		const textPosition = this.getTextCenterPosition(textMetrics);

		ctx.fillText(text, textPosition.x, textPosition.y);
	}
};
