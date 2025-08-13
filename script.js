const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];

const pieces = {
    'R': '\u2656', 'N': '\u2658', 'B': '\u2657', 'Q': '\u2655', 'K': '\u2654', 'P': '\u2659',
    'r': '\u265C', 'n': '\u265E', 'b': '\u265D', 'q': '\u265B', 'k': '\u265A', 'p': '\u265F'
};

let layout = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
];

let selectedSquare = null;
let lastMoved = null;
let moveHistory = [];

const gameContainer = document.createElement('div');
gameContainer.style.display = 'flex';
gameContainer.style.alignItems = 'flex-start';
document.body.appendChild(gameContainer);

const boardWrapper = document.createElement('div');
boardWrapper.style.position = 'relative';
boardWrapper.style.display = 'inline-block';
gameContainer.appendChild(boardWrapper);

const numberCol = document.createElement('div');
numberCol.style.display = 'grid';
numberCol.style.gridTemplateRows = 'repeat(8, 60px)';
numberCol.style.position = 'absolute';
numbers.forEach(number => {
    const cell = document.createElement('div');
    cell.style.textAlign = 'center';
    cell.style.lineHeight = '60px';
    cell.textContent = number;
    numberCol.appendChild(cell);
});
boardWrapper.appendChild(numberCol);

const boardContainer = document.createElement('div');
boardContainer.style.display = 'grid';
boardContainer.style.gridTemplateColumns = 'repeat(8, 60px)';
boardContainer.style.gridTemplateRows = 'repeat(8, 60px)';
boardContainer.style.width = '480px';
boardContainer.style.border = '2px solid black';
boardContainer.style.margin = '0 0 0 6px';
boardContainer.style.position = 'relative';
boardContainer.style.left = '15px';
boardWrapper.appendChild(boardContainer);

const startWhitePawnRow = 6;
const startBlackPawnRow = 1;

let hasWhiteKingMoved = false;
let hasWhiteRookKingsideMoved = false;
let hasWhiteRookQueensideMoved = false;

let hasBlackKingMoved = false;
let hasBlackRookKingsideMoved = false;
let hasBlackRookQueensideMoved = false;

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.style.width = '60px';
        square.style.height = '60px';
        square.style.display = 'flex';
        square.style.alignItems = 'center';
        square.style.justifyContent = 'center';
        square.style.fontSize = '32px';
        square.style.cursor = 'pointer';
        square.style.backgroundColor = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';

        square.dataset.row = row;
        square.dataset.col = col;

        if (layout[row][col]) {
            square.textContent = pieces[layout[row][col]];
        }

        square.addEventListener('click', () => {
            if (!selectedSquare && square.textContent) {
                selectedSquare = square;
                square.style.outline = '2px solid red';
            } 
            else if (selectedSquare) {
                const fromNotation = toChessNotation(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col));
                const toNotation = toChessNotation(parseInt(square.dataset.row), parseInt(square.dataset.col));
                if (square.dataset.row === selectedSquare.dataset.row && square.dataset.col === selectedSquare.dataset.col) {
                    selectedSquare.style.outline = 'none';
                    selectedSquare = null;
                }
                else if (selectedSquare.textContent === pieces['P']) {
                    if(parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) + 1 || parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) - 1) { 
                            if (!(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) - 1)) {
                            return;
                        }
                        else if (square.textContent && checkBlackPiece(square)) {
                            makeAMove(square, "White", toNotation);
                            return;
                        }
                    }
                    if (square.dataset.col !== selectedSquare.dataset.col || checkBlackPiece(square) || checkWhitePiece(square)) {
                        return;
                    }
                    else if (parseInt(selectedSquare.dataset.row) === startWhitePawnRow) {
                        if (!(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) - 1 ||
                              parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) - 2)) {
                            return;
                        }
                    }
                    else {
                        if (!(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) - 1)) {
                            return;
                        }
                    }
                    makeAMove(square, "White", toNotation);
                }
                else if (selectedSquare.textContent === pieces['p']) {
                    if(parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) + 1 || parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) - 1) { 
                        if (!(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) + 1)) {
                            return;
                        }
                        else if (square.textContent && checkWhitePiece(square)) {
                            makeAMove(square, "Black", toNotation);
                            return;
                        }
                    }
                    if (square.dataset.col !== selectedSquare.dataset.col || checkBlackPiece(square) || checkWhitePiece(square)) {
                        return;
                    }
                    if (parseInt(selectedSquare.dataset.row) === startBlackPawnRow) {
                        if (!(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) + 1 ||
                              parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) + 2)) {
                            return;
                        }
                    }
                    else {
                        if (!(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) + 1)) {
                            return;
                        }
                    }
                    makeAMove(square, "Black", toNotation);
                }
                else if(selectedSquare.textContent === pieces['R'] || selectedSquare.textContent === pieces['r']) {
                    if(selectedSquare.dataset.row !== square.dataset.row && selectedSquare.dataset.col !== square.dataset.col)
                    {
                        return;
                    }
                    if(!isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        return;
                    }
                    if((selectedSquare.textContent === pieces['R'] && checkWhitePiece(square)) || (selectedSquare.textContent === pieces['r'] && checkBlackPiece(square))) {
                        return;
                    }
                    if(selectedSquare.textContent === pieces['R'] && fromNotation === "A1") {
                        hasWhiteRookQueensideMoved = true;
                    }
                    else if(selectedSquare.textContent === pieces['r'] && fromNotation === "A8") {
                        hasBlackRookQueensideMoved = true;
                    }
                    else if(selectedSquare.textContent === pieces['r'] && fromNotation === "H8") {
                        hasWhiteRookKingsideMoved = true;
                    }
                    else if(selectedSquare.textContent === pieces['R'] && fromNotation === "H1") {
                        hasBlackRookKingsideMoved = true;
                    }
                    makeAMove(square, selectedSquare.textContent === pieces['R'] ? "White" : "Black", toNotation);
                }
                else if(selectedSquare.textContent === pieces['N'] || selectedSquare.textContent === pieces['n']) {
                    if(square.textContent && ((checkWhitePiece(square) && selectedSquare.textContent === pieces['N']) || (checkBlackPiece(square) && selectedSquare.textContent === pieces['n']))) {
                        return;
                    }
                    if(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) + 2) {
                        if(parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) + 1 || parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) - 1)
                            makeAMove(square, selectedSquare.textContent === pieces['N'] ? "White" : "Black", toNotation);
                        else {
                            return;
                        }
                    }
                    else if(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) - 2) {
                        if(parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) + 1 || parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) - 1)
                            makeAMove(square, selectedSquare.textContent === pieces['N'] ? "White" : "Black", toNotation);
                        else {
                            return;
                        }
                    }
                    else if(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) + 1) {
                        if(parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) + 2 || parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) - 2)
                            makeAMove(square, selectedSquare.textContent === pieces['N'] ? "White" : "Black", toNotation);
                        else {
                            return;
                        }
                    }
                    else if(parseInt(square.dataset.row) === parseInt(selectedSquare.dataset.row) - 1) {
                        if(parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) + 2 || parseInt(square.dataset.col) === parseInt(selectedSquare.dataset.col) - 2)
                            makeAMove(square, selectedSquare.textContent === pieces['N'] ? "White" : "Black", toNotation);
                        else {
                            return;
                        }
                    }
                    else {
                        return;
                    }
                }
                else if(selectedSquare.textContent === pieces['B'] || selectedSquare.textContent === pieces['b']) {
                    const rowDiff = square.dataset.row > selectedSquare.dataset.row ? parseInt(square.dataset.row) - parseInt(selectedSquare.dataset.row) : parseInt(selectedSquare.dataset.row) - parseInt(square.dataset.row);
                    const colDiff = square.dataset.col > selectedSquare.dataset.col ? parseInt(square.dataset.col) - parseInt(selectedSquare.dataset.col) : parseInt(selectedSquare.dataset.col) - parseInt(square.dataset.col);
                    if(!isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        return;
                    }
                    if((selectedSquare.textContent === pieces['B'] && checkWhitePiece(square)) || (selectedSquare.textContent === pieces['b'] && checkBlackPiece(square))) {
                        return;
                    }
                    if(rowDiff === colDiff)
                        makeAMove(square, selectedSquare.textContent === pieces['B'] ? "White" : "Black", toNotation)
                    else {
                        return;
                    }
                }
                else if(selectedSquare.textContent === pieces['Q'] || selectedSquare.textContent === pieces['q']) {
                    const rowDiff = square.dataset.row > selectedSquare.dataset.row ? parseInt(square.dataset.row) - parseInt(selectedSquare.dataset.row) : parseInt(selectedSquare.dataset.row) - parseInt(square.dataset.row);
                    const colDiff = square.dataset.col > selectedSquare.dataset.col ? parseInt(square.dataset.col) - parseInt(selectedSquare.dataset.col) : parseInt(selectedSquare.dataset.col) - parseInt(square.dataset.col);
                    if(rowDiff !== colDiff) {
                        if(selectedSquare.dataset.row !== square.dataset.row && selectedSquare.dataset.col !== square.dataset.col) {
                            return;
                        }
                    }
                    if(!isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        return;
                    }
                    if((selectedSquare.textContent === pieces['Q'] && checkWhitePiece(square)) || (selectedSquare.textContent === pieces['q'] && checkBlackPiece(square))) {
                        return;
                    }
                    makeAMove(square, selectedSquare.textContent === pieces['Q'] ? "White" : "Black", toNotation);
                }
                else if(selectedSquare.textContent === pieces['K'] || selectedSquare.textContent === pieces['k']) {
                    if(selectedSquare.textContent === pieces['K'] && fromNotation === "E1" && 
                        toNotation === "G1" && !hasWhiteKingMoved && !hasWhiteRookKingsideMoved && 
                        isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        makeAMove(square, "White", toNotation);
                        const rookSquare = boardContainer.children[parseInt(square.dataset.row) * 8 + 7];
                        const targetRookSquare = boardContainer.children[parseInt(square.dataset.row) * 8 + 5];
                        targetRookSquare.textContent = rookSquare.textContent;
                        rookSquare.textContent = '';
                        return;
                    }
                    else if(selectedSquare.textContent === pieces['K'] && fromNotation === "E1" && 
                        toNotation === "C1" && !hasWhiteKingMoved && !hasWhiteRookQueensideMoved && 
                        isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        makeAMove(square, "White", toNotation);
                        const rookSquare = boardContainer.children[parseInt(square.dataset.row) * 8 + 0];
                        const targetRookSquare = boardContainer.children[parseInt(square.dataset.row) * 8 + 3];
                        targetRookSquare.textContent = rookSquare.textContent;
                        rookSquare.textContent = '';
                        return;
                    }
                    else if(selectedSquare.textContent === pieces['k'] && fromNotation === "E8" && 
                        toNotation === "G8" && !hasBlackKingMoved && !hasBlackRookQueensideMoved && 
                        isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        makeAMove(square, "Black", toNotation);
                        const rookSquare = boardContainer.children[parseInt(square.dataset.row) * 1 + 7];
                        const targetRookSquare = boardContainer.children[parseInt(square.dataset.row) * 1 + 5];
                        targetRookSquare.textContent = rookSquare.textContent;
                        rookSquare.textContent = '';
                        return;
                    }
                    else if(selectedSquare.textContent === pieces['k'] && fromNotation === "E8" && 
                        toNotation === "C8" && !hasBlackKingMoved && !hasBlackRookQueensideMoved && 
                        isPathClear(parseInt(selectedSquare.dataset.row), parseInt(selectedSquare.dataset.col), parseInt(square.dataset.row), parseInt(square.dataset.col))) {
                        makeAMove(square, "Black", toNotation);
                        const rookSquare = boardContainer.children[parseInt(square.dataset.row) * 1 + 0];
                        const targetRookSquare = boardContainer.children[parseInt(square.dataset.row) * 1 + 3];
                        targetRookSquare.textContent = rookSquare.textContent;
                        rookSquare.textContent = '';
                        return;
                    }
                    const rowDiff = square.dataset.row > selectedSquare.dataset.row ? parseInt(square.dataset.row) - parseInt(selectedSquare.dataset.row) : parseInt(selectedSquare.dataset.row) - parseInt(square.dataset.row);
                    const colDiff = square.dataset.col > selectedSquare.dataset.col ? parseInt(square.dataset.col) - parseInt(selectedSquare.dataset.col) : parseInt(selectedSquare.dataset.col) - parseInt(square.dataset.col);
                    if(rowDiff > 1 || colDiff > 1) {
                        return;
                    }
                    if(square.textContent && ((checkWhitePiece(square) && selectedSquare.textContent === pieces['K']) || (checkBlackPiece(square) && selectedSquare.textContent === pieces['k']))) {
                        return;
                    }
                    if(selectedSquare.textContent === pieces['K'] && fromNotation === "E1") {
                        hasWhiteKingMoved = true;
                    }
                    else if(selectedSquare.textContent === pieces['k'] && fromNotation === "E8") {
                        hasBlackKingMoved = true;
                    }
                    makeAMove(square, selectedSquare.textContent === pieces['K'] ? "White" : "Black", toNotation);
                }
            }
        });

        boardContainer.appendChild(square);
    }
}

const letterRow = document.createElement('div');
letterRow.style.display = 'grid';
letterRow.style.gridTemplateColumns = 'repeat(8, 60px)';
letterRow.style.marginTop = '5px';
letterRow.style.position = 'relative';
letterRow.style.left = '20px';
letters.forEach(letter => {
    const cell = document.createElement('div');
    cell.style.textAlign = 'center';
    cell.textContent = letter;
    letterRow.appendChild(cell);
});
boardWrapper.appendChild(letterRow);

const historyPanel = document.createElement('div');
historyPanel.style.marginLeft = '20px';
historyPanel.style.width = '150px';
historyPanel.style.fontFamily = 'monospace';
gameContainer.appendChild(historyPanel);

function toChessNotation(row, col) {
    const file = letters[col];
    const rank = numbers[row];
    return file + rank;
}

function makeAMove(square, lastMovedColor, toNotation){
    if ((!lastMoved && lastMovedColor === "Black") || lastMovedColor === lastMoved) {
        alert("Wrong move order");
        return;
    }

    const moveNotation = selectedSquare.textContent + toNotation;

    if (lastMovedColor === "White") {
        moveHistory.push({ white: moveNotation, black: "" });
    } else {
        moveHistory[moveHistory.length - 1].black = moveNotation;
    }

    updateHistoryDisplay();

    square.textContent = selectedSquare.textContent;
    selectedSquare.textContent = '';
    selectedSquare.style.outline = 'none';
    selectedSquare = null;
    lastMoved = lastMovedColor;
}

function updateHistoryDisplay() {
    historyPanel.innerHTML = "<h3>Moves</h3>";
    moveHistory.forEach((move, index) => {
        const moveLine = document.createElement('div');
        moveLine.textContent = `${index + 1}. ${move.white} ${move.black}`;
        historyPanel.appendChild(moveLine);
    });
}

function checkWhitePiece(square) {
    return square.textContent === pieces['P'] || square.textContent === pieces['R'] || square.textContent === pieces['N'] || square.textContent === pieces['B'] || square.textContent === pieces['Q'];
}

function checkBlackPiece(square) {
    return square.textContent === pieces['p'] || square.textContent === pieces['r'] || square.textContent === pieces['n'] || square.textContent === pieces['b'] || square.textContent === pieces['q'];
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    const stepRow = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
    const stepCol = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;

    if (!(fromRow === toRow || fromCol === toCol || Math.abs(rowDiff) === Math.abs(colDiff))) {
        return false;
    }

    let row = fromRow + stepRow;
    let col = fromCol + stepCol;
    while (row !== toRow || col !== toCol) {
        const idx = row * 8 + col;
        if (boardContainer.children[idx].textContent) return false;
        row += stepRow;
        col += stepCol;
    }

    return true;
}
