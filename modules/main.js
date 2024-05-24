import * as constants from "./constants.js";
import { Game } from "./game.js";

const game = new Game();
let helpMode = false;

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

		if (helpMode) {
			game.drawAllMines();
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
	cell.draw();
	game.mines = cell.isMarked ? game.mines - 1 : game.mines + 1;
}

/** @type {Cell[]} */
let latestCellHover = [];
function canvasOnMouseMove(e) {
	if (!helpMode || !game.started || game.allMinesFound() || game.lost) {
		return;
	}

	const mousePos = constants.getMouseClickPosition(e);
	const cell = game.findCellAtPosition(mousePos.x, mousePos.y);

	if (cell == undefined) {
		return;
	}

	if (helpMode) {
		constants.updateDebugText(`X: ${cell.pos.x} Y: ${cell.pos.y}`);
	}

	constants.ctx.save();

	if (latestCellHover != null) {
		constants.ctx.lineWidth = 4;
		constants.ctx.strokeStyle = "black";

		for (let i = 0; i < latestCellHover.length; ++i) {
			if (!latestCellHover[i].opened) {
				latestCellHover[i].draw();
			}
		}
	}

	latestCellHover = cell.getNeighbours(game.cells);

	constants.ctx.lineWidth = 2;
	constants.ctx.strokeStyle = "yellow";

	for (let i = 0; i < latestCellHover.length; ++i) {
		if (!latestCellHover[i].opened) {
			constants.ctx.setLineDash([6]);
			constants.ctx.strokeRect(
				latestCellHover[i].bounds.x,
				latestCellHover[i].bounds.y,
				constants.CELL_SIZE.w,
				constants.CELL_SIZE.h
			);
		}
	}

	constants.ctx.restore();
}

/**
 *
 * @param {KeyboardEvent} e
 */
function canvasOnKeyPress(e) {
	if (e.key == "h") {
		helpMode = !helpMode;
	}
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
		constants.canvas.addEventListener("keypress", canvasOnKeyPress);
	}

	if (!game.started) {
		return requestAnimationFrame(render);
	}

	const now = new Date();
	const elapsedSeconds = Math.floor(
		(now.getTime() - game.timer.getTime()) / 1000
	);

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
