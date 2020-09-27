const express = require("express");
const app = express();
var port = process.env.PORT;
const fs = require("fs");

var NUM_ROWS = 6;
var NUM_COLUMNS = 7;
var winner = null;
var isGameOver = false;
var tokenRow = -1;
var tokenColumn = -1;
var board = [];
let data = JSON.stringify({
  turn: `NEW`,
});
fs.writeFileSync("lastTurn.json", data);

var board = [];
function setupBoard() {
  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
    board[rowIndex] = ["_", "_", "_", "_", "_", "_", "_"];
  }
}

setupBoard();

app.get("/", (req, res) => {
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  res.send(
    `Welcome to Connect 4 by Uddeshya. To create a table go to ${fullUrl}createGame`
  );
});

app.get("/createGame", (req, res) => {
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
    var bbb = " " + board[rowIndex].join(" | ");
    console.log(bbb);
  }

  res.send(
    `Table has been created. You can start the game now. TO start go to baseUrl/RED/1`
  );
});

app.get("/:playerId/:columndId", function (req, res) {
  var column = req.params.columndId;
  var player = req.params.playerId.toUpperCase();
  console.log(player);
  if (player == "RED" || player == "BLUE") {
    let lastTurnRead = JSON.parse(fs.readFileSync("lastTurn.json"));
    if (lastTurnRead.turn == player) {
      res.send(
        `Sorry ${player}, you cannot play two chances. It's next player turn.`
      );
    } else {
      let data = JSON.stringify({
        turn: `${player}`,
      });
      fs.writeFileSync("lastTurn.json", data);
      console.log(`This is ${player}'s turn.`);
      function playGame(player, column) {
        var currentPlayer = player;
        console.log("Player " + currentPlayer + "'s turn : ");
        handleTurn(currentPlayer, column);
        checkIfGameIsOver(currentPlayer);
      }

      function handleTurn(player, column) {
        tokenColumn = column;
        if (tokenColumn >= 1 && tokenColumn <= 7) {
          tokenColumn = parseInt(tokenColumn - 1); // for ZERO INDEXING
          dropToken(player);
        } else {
          res.send("wrong selection");
        }
      }

      function dropToken(player) {
        let isTokenDropped = false;
        let row = NUM_ROWS - 1;
        while (!isTokenDropped && row >= 0) {
          if (board[row][tokenColumn] == "_") {
            isTokenDropped = true;
            board[row][tokenColumn] = player;
            // remember the row where we dropped the token
            tokenRow = row;
          }
          // move to next row
          row--;
        }
        if (!isTokenDropped && row < 0) {
          console.log("Column is FULL ! Please choose different value.");
        }
      }

      function checkIfGameIsOver(player) {
        const didSomeBodyWin = checkForWinner(player);
        if (didSomeBodyWin) {
          console.log("The winner is " + winner);
          return isGameOver;
        }
      }

      function checkForWinner(player) {
        checkForHorizontalWin(player);
        !isGameOver && checkForVerticalWin(player);
        return isGameOver;
      }

      function checkForHorizontalWin(player) {
        for (let j = 0; j <= NUM_COLUMNS - 4; j++) {
          if (board[tokenRow][j] == player) {
            if (
              board[tokenRow][j + 1] == player &&
              board[tokenRow][j + 2] == player &&
              board[tokenRow][j + 3] == player
            ) {
              winner = player;
              isGameOver = true;
              break;
            }
          }
        }
        if (winner !== null) {
          res.send(`${winner} wins by Horizontol win`);
        }
        return isGameOver;
      }

      function checkForVerticalWin() {
        for (let i = 0; i <= NUM_ROWS - 4; i++) {
          if (board[i][tokenColumn] == player) {
            if (
              board[i + 1][tokenColumn] == player &&
              board[i + 2][tokenColumn] == player &&
              board[i + 3][tokenColumn] == player
            ) {
              winner = player;
              isGameOver = true;
              break;
            }
          }
        }
        if (winner != null) {
          res.send(`${winner} wins by Vertical win`);
        }
        return isGameOver;
      }
      playGame(player, column);
      if (!isGameOver) {
        res.send(`${player} chance over. Next Turn`);
      }
    }
  } else {
    res.send("Only RED and BLUE players allowed");
  }
});

if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
