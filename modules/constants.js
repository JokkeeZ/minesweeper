/**
 * Canvas element.
 *
 * @type {HTMLCanvasElement}
 */
export const canvas = document.getElementById("game");

/**
 * Canvas 2D context.
 *
 * @type {CanvasRenderingContext2D}
 */
export const ctx = canvas.getContext("2d");

/**
 * `h1` element that contains game status and mine count.
 *
 * @type {HTMLElement} h1
 */
export const stats = document.getElementById("stats");

/**
 * `h1` element that contains game debug stuff.
 *
 * @type {HTMLElement} h1
 */
export const debugTxt = document.getElementById("debug");

/**
 * Represents how many rows and columns grid has.
 *
 * @type {number}
 */
export const ROW_COLS = 9;

/**
 * Canvas size.
 */
export const MAP_SIZE = {
	w: 600,
	h: 600,
};

/**
 * Cell size.
 */
export const CELL_SIZE = {
	w: MAP_SIZE.w / ROW_COLS,
	h: MAP_SIZE.h / ROW_COLS,
};

/**
 * Maximum amount of mines that minesweeper grid should have.
 *
 * @type {number}
 */
export const MAX_MINES = Math.round(ROW_COLS * ROW_COLS * 0.15);

/**
 * Symbols used to mark mines or flags.
 *
 * @type {{MINE: string, MARK: string}}
 */
export const SYMBOLS = {
	MINE: "💥",
	MARK: "🚩",
};

/**
 * Gets mouse click position on canvas.
 *
 * @param {MouseEvent} e Event that occurred on mouse click.
 * @returns {{x: number, y: number}} X- and Y-axis position of the click.
 */
export function getMouseClickPosition(e) {
	const rect = canvas.getBoundingClientRect();
	return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

/**
 * Updates `h1` element innerText.
 *
 * @param {string} text Text to display
 */
export function updateStatsText(time, mines, state = null) {
	let text = `Time: ${time}s  |  Mines: ${mines}`;

	if (state == null) {
		stats.innerText = text;
		return;
	}

	text += `  |  ${state ? "GAME WON!" : "GAME LOST!"}`;
	stats.innerText = text;
}

export function updateDebugText(text) {
	debugTxt.innerText = text;
}
