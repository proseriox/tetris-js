const gameBoard = document.getElementById('game-board');
const boardWidth = 10;
const boardHeight = 20;
const board = new Array(boardHeight).fill(null).map(() => new Array(boardWidth).fill(0));

const scoreElement = document.getElementById('score');
let score = 0;

const colors = [
  'cyan',    // I
  'yellow',  // O
  'purple',  // T
  'green',   // S
  'red',     // Z
  'blue',    // J
  'orange',  // L
];

const pieces = [
  // I
  [
    [
      [1, 1, 1, 1]
    ],
    [
      [1],
      [1],
      [1],
      [1]
    ]
  ],
  // O
  [
    [
      [1, 1],
      [1, 1]
    ]
  ],
  // T
  [
    [
      [1, 1, 1],
      [0, 1, 0]
    ],
    [
      [1, 0],
      [1, 1],
      [1, 0]
    ],
    [
      [0, 1, 0],
      [1, 1, 1]
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1]
    ]
  ],
  // S
  [
    [
      [0, 1, 1],
      [1, 1, 0]
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1]
    ]
  ],
  // Z
  [
    [
      [1, 1, 0],
      [0, 1, 1]
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0]
    ]
  ],
  // J
  [
    [
      [1, 1, 1],
      [0, 0, 1]
    ],
    [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    [
      [1, 0, 0],
      [1, 1, 1]
    ],
    [
      [1, 1],
      [1, 0],
      [1, 0]
    ]
  ],
  // L
  [
    [
      [1, 1, 1],
      [1, 0, 0]
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    [
      [0, 0, 1],
      [1, 1, 1]
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1]
    ]
  ]
];

function drawBoard() {
  gameBoard.innerHTML = '';
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      let cellColor = '';

      if (board[y][x]) {
        cellColor = board[y][x];
      } else if (activePiece && activePiece.y + y >= 0) {
        const piece = activePiece.piece[activePiece.rotation];
        if (piece[y - activePiece.y] && piece[y - activePiece.y][x - activePiece.x]) {
          cellColor = activePiece.color;
        }
      }

      cell.style.backgroundColor = cellColor;
      gameBoard.appendChild(cell);
    }
  }
}

class Piece {
  constructor() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    this.piece = pieces[randomIndex];
    this.color = colors[randomIndex]; // Store the color
    this.rotation = 0;
    this.x = Math.floor(boardWidth / 2) - Math.ceil(this.piece[this.rotation][0].length / 2);
    this.y = -1;
  }

  rotate() {
    const newRotation = (this.rotation + 1) % this.piece.length;
    if (this.canMove(0, 0, newRotation)) {
      this.rotation = newRotation;
    }
  }

  canMove(dx, dy, rotation = this.rotation) {
    const piece = this.piece[rotation];
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] && (
          this.y + y + dy >= boardHeight ||
          this.x + x + dx < 0 ||
          this.x + x + dx >= boardWidth ||
          (board[this.y + y + dy] !== undefined && board[this.y + y + dy][this.x + x + dx]))) {
          return false;
        }
      }
    }
    return true;
  }


  move(dx, dy) {
    if (this.canMove(dx, dy)) {
      this.x += dx;
      this.y += dy;
      return true;
    }
    return false;
  }

  place() {
    const piece = this.piece[this.rotation];
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          board[this.y + y][this.x + x] = this.color;
        }
      }
    }
  }
}

let activePiece = new Piece();

function gameLoop() {
  if (activePiece.move(0, 1)) {
    setTimeout(gameLoop, 500);
  } else {
    activePiece.place();
    clearLines();
    activePiece = new Piece();
    if (!activePiece.canMove(0, 1) && activePiece.y < 1) {
      alert('Game Over');
      updateLeaderboard(); // Update the leaderboard when the game is over
      setTimeout(() => window.location.reload(), 1000); // Reload the page after 1 second
    } else {
      setTimeout(gameLoop, 500);
    }
  }
  drawBoard();
}


function clearLines() {
  outer: for (let y = boardHeight - 1; y >= 0; y--) {
    for (let x = 0; x < boardWidth; x++) {
      if (!board[y][x]) {
        continue outer;
      }
    }
    board.splice(y, 1);
    board.unshift(new Array(boardWidth).fill(0));
    y++;

    // Increase the score and update the score display
    score += 100;
    scoreElement.textContent = 'Score: ' + score;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    activePiece.move(-1, 0);
  } else if (e.key === 'ArrowRight') {
    activePiece.move(1, 0);
  } else if (e.key === 'ArrowDown') {
    activePiece.move(0, 1);
  } else if (e.key === 'ArrowUp') {
    activePiece.rotate();
  }
  drawBoard();
});

function displayLeaderboard() {
  const leaderboard = JSON.parse(sessionStorage.getItem('leaderboard')) || [];

  const leaderboardElement = document.getElementById('leaderboard');
  leaderboardElement.innerHTML = 'Leaderboard:<br>';
  leaderboard.forEach((entry, index) => {
    leaderboardElement.innerHTML += `${index + 1}. ${entry.score}<br>`;
  });
}

function updateLeaderboard() {
  const leaderboard = JSON.parse(sessionStorage.getItem('leaderboard')) || [];
  leaderboard.push({score});
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.splice(10); // Keep only the top 10 scores

  sessionStorage.setItem('leaderboard', JSON.stringify(leaderboard));

  displayLeaderboard();
}

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
  startButton.style.display = 'none'; // Hide the start button when the game begins
  gameLoop();
});

displayLeaderboard();
