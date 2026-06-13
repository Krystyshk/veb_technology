let board = [];
let moves = 0;
let pivot = null;
let gameCells = [];

document.addEventListener("DOMContentLoaded", function () {
    newGame();
});

// Нова гра
function newGame() {
    board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]
    ];

    moves = 0;
    updateMoves();
    document.getElementById("status").textContent = "Гра триває";

    shuffleGame();
}

// Перемішування поля правильними ходами
function shuffleGame() {
    board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]
    ];

    let previousEmpty = null;

    for (let i = 0; i < 180; i++) {
        let empty = findEmpty();

        let possibleMoves = [
            { row: empty.row - 1, col: empty.col },
            { row: empty.row + 1, col: empty.col },
            { row: empty.row, col: empty.col - 1 },
            { row: empty.row, col: empty.col + 1 }
        ];

        possibleMoves = possibleMoves.filter(function (cell) {
            return cell.row >= 0 && cell.row < 4 &&
                   cell.col >= 0 && cell.col < 4;
        });

        if (previousEmpty !== null) {
            possibleMoves = possibleMoves.filter(function (cell) {
                return !(cell.row === previousEmpty.row &&
                         cell.col === previousEmpty.col);
            });
        }

        let chosen = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        board[empty.row][empty.col] = board[chosen.row][chosen.col];
        board[chosen.row][chosen.col] = 0;

        previousEmpty = empty;
    }

    moves = 0;
    updateMoves();
    document.getElementById("status").textContent = "Гра триває";

    renderBoard();
}

// Дані для WebDataRocks
function getDataForWebDataRocks() {
    return [
        {
            A: board[0][0],
            B: board[0][1],
            C: board[0][2],
            D: board[0][3]
        },
        {
            A: board[1][0],
            B: board[1][1],
            C: board[1][2],
            D: board[1][3]
        },
        {
            A: board[2][0],
            B: board[2][1],
            C: board[2][2],
            D: board[2][3]
        },
        {
            A: board[3][0],
            B: board[3][1],
            C: board[3][2],
            D: board[3][3]
        }
    ];
}

// Створення таблиці через WebDataRocks
function renderBoard() {
    let container = document.getElementById("wdr-component");

    if (pivot !== null) {
        pivot.dispose();
        pivot = null;
        container.innerHTML = "";
    }

    gameCells = [];

    pivot = new WebDataRocks({
        container: "#wdr-component",
        toolbar: false,
        width: 500,
        height: 500,

        report: {
            dataSource: {
                data: getDataForWebDataRocks()
            },

            slice: {
                rows: [
                    { uniqueName: "A" },
                    { uniqueName: "B" },
                    { uniqueName: "C" },
                    { uniqueName: "D" }
                ]
            },

            options: {
                grid: {
                    type: "flat",
                    showHeaders: false,
                    showTotals: false,
                    showGrandTotals: false
                }
            }
        },

        reportcomplete: function () {
            setTimeout(prepareCells, 300);
        }
    });
}

// Підготовка клітинок WebDataRocks
function prepareCells() {
    let container = document.getElementById("wdr-component");
    let cells = document.querySelectorAll("#wdr-component .wdr-cell");

    gameCells = [];

    cells.forEach(function (cell) {
        let text = cell.textContent.trim();
        let number = Number(text);

        cell.onclick = null;
        cell.classList.remove("game-tile");
        cell.classList.remove("empty-tile");
        cell.classList.remove("movable-tile");

        if (number >= 0 && number <= 15 && text !== "") {
            cell.dataset.number = number;
            cell.classList.add("game-tile");

            // головна правка:
            // беремо клітинку WebDataRocks і переносимо її в контейнер поля
            container.appendChild(cell);

            gameCells.push(cell);
        }
    });

    updateVisualBoard();
}

// Оновлення поля без пересоздання WebDataRocks
function updateVisualBoard() {
    gameCells.forEach(function (cell) {
        let number = Number(cell.dataset.number);
        let position = findTile(number);

        if (position === null) {
            return;
        }

        cell.style.left = (position.col * 125) + "px";
        cell.style.top = (position.row * 125) + "px";

        cell.classList.remove("empty-tile");
        cell.classList.remove("movable-tile");

        if (number === 0) {
            cell.classList.add("empty-tile");
            cell.textContent = "";
            cell.onclick = null;
        } else {
            cell.textContent = number;

            if (canMove(number)) {
                cell.classList.add("movable-tile");
            }

            cell.onclick = function () {
                moveTile(number);
            };
        }
    });
}

// Пересування плитки
function moveTile(number) {
    let tile = findTile(number);
    let empty = findEmpty();

    let isNear =
        Math.abs(tile.row - empty.row) + Math.abs(tile.col - empty.col) === 1;

    if (isNear) {
        board[empty.row][empty.col] = number;
        board[tile.row][tile.col] = 0;

        moves++;
        updateMoves();

        if (checkWin()) {
            document.getElementById("status").textContent = "Перемога!";
        } else {
            document.getElementById("status").textContent = "Гра триває";
        }

        updateVisualBoard();
    }
}

// Чи можна пересунути плитку
function canMove(number) {
    let tile = findTile(number);
    let empty = findEmpty();

    return Math.abs(tile.row - empty.row) + Math.abs(tile.col - empty.col) === 1;
}

// Підказка
function showHint() {
    let empty = findEmpty();

    let possible = [
        { row: empty.row - 1, col: empty.col },
        { row: empty.row + 1, col: empty.col },
        { row: empty.row, col: empty.col - 1 },
        { row: empty.row, col: empty.col + 1 }
    ];

    possible = possible.filter(function (cell) {
        return cell.row >= 0 && cell.row < 4 &&
               cell.col >= 0 && cell.col < 4;
    });

    let text = "Можна пересунути: ";

    possible.forEach(function (cell, index) {
        text += board[cell.row][cell.col];

        if (index < possible.length - 1) {
            text += ", ";
        }
    });

    document.getElementById("status").textContent = text;
}

// Пошук порожньої клітинки
function findEmpty() {
    return findTile(0);
}

// Пошук плитки
function findTile(number) {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === number) {
                return {
                    row: row,
                    col: col
                };
            }
        }
    }

    return null;
}

// Оновлення лічильника ходів
function updateMoves() {
    document.getElementById("moves").textContent = moves;
}

// Перевірка перемоги
function checkWin() {
    let correct = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]
    ];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] !== correct[row][col]) {
                return false;
            }
        }
    }

    return true;
}