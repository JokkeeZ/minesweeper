import * as constants from "./constants.js";
import { Game } from "./game.js";

const game = new Game();

/**
 * @param {MouseEvent} e Event that occurred when
 * mouse was clicked on the canvas.
 */
function canvasOnClick(e) {
	const mousePos = constants.getMouseClickPosition(e);

	if (game.allMinesFound()) {
		return;
	}

	const cell = game.findCellAtPosition(mousePos.x, mousePos.y);

	if (cell == undefined) {
		return;
	}

	if (!game.started) {
		game.initializeStartingCell(cell);

		if (constants.DEBUG) {
			// game.drawAllMines();
		}
	}

	if (cell.mine) {
		game.onMineClicked();
		return;
	}

	if (!cell.opened) {
		game.openNeighboringCells(cell);
	}
}

/**
 * @param {MouseEvent} e Event that occurred when
 * mouse was right-clicked on the canvas.
 */
function canvasOnContextMenu(e) {
	// Disable right-click menu.
	e.preventDefault();

	if (!game.started || game.allMinesFound()) {
		return;
	}

	const mousePos = constants.getMouseClickPosition(e);
	const cell = game.findCellAtPosition(mousePos.x, mousePos.y);

	if (cell == undefined || cell.opened) {
		return;
	}

	cell.isMarked = !cell.isMarked;
	cell.drawMarker();
	game.mines = cell.isMarked ? game.mines - 1 : game.mines + 1;
}

/** @type {Cell[]} */
let latest = [];
function canvasOnMouseMove(e) {
	if (!game.started || game.allMinesFound() || game.lost) {
		return;
	}

	const mousePos = constants.getMouseClickPosition(e);
	const cell = game.findCellAtPosition(mousePos.x, mousePos.y);

	if (cell == undefined) {
		return;
	}

	constants.updateDebugText(`X: ${cell.pos.x} Y: ${cell.pos.y}`);

	const neighbours = cell.getNeighbours(game.cells);

	constants.ctx.save();

	if (latest != null) {
		constants.ctx.lineWidth = 4;
		constants.ctx.strokeStyle = "black";

		for (let i = 0; i < latest.length; ++i) {
			if (latest[i].opened) continue;
			latest[i].globalDraw();
		}
	}

	latest = neighbours;

	constants.ctx.lineWidth = 2;
	constants.ctx.strokeStyle = "yellow";

	for (let i = 0; i < latest.length; ++i) {
		const c = latest[i];
		if (c.opened) continue;
		constants.ctx.strokeRect(c.bounds.x, c.bounds.y, constants.CELL_SIZE.w, constants.CELL_SIZE.h);
	}

	constants.ctx.restore();
}

/**
 * Canvas update loop.
 */
(function render() {
	if (!game.gridInitialized) {
		game.initialize();
		constants.canvas.addEventListener("contextmenu", canvasOnContextMenu);
		constants.canvas.addEventListener("click", canvasOnClick);
		constants.canvas.addEventListener("mousemove", canvasOnMouseMove);
	}

	if (!game.started) {
		return requestAnimationFrame(render);
	}

	const now = new Date();
	const elapsedSeconds =
		Math.floor((now.getTime() - game.timer.getTime()) / 1000);

	if (game.allMinesFound()) {
		constants.updateStatsText(elapsedSeconds, game.mines, true);
		constants.canvas.removeEventListener("click", canvasOnClick);
	} else if (game.lost) {
		constants.updateStatsText(elapsedSeconds, game.mines, false);
		constants.canvas.removeEventListener("click", canvasOnClick);
	} else {
		constants.updateStatsText(elapsedSeconds, game.mines);
	}

	requestAnimationFrame(render);
})();
