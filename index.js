(() => {
  const crypto = require("crypto");
  const select = require("@inquirer/select");
  const { Table } = require("console-table-printer");

  class TableGenerator {
    generate(moves) {
      const table = new Table({
        columns: [
          { name: "v PC\\User >", alignment: "left" },
          ...moves.map((choice) => ({ name: choice })),
        ],
      });

      for (let pc = 0; pc < moves.length; pc++) {
        const row = { "v PC\\User >": moves[pc] };
        const half = Math.floor(moves.length / 2);

        for (let player = 0; player < moves.length; player++) {
          if (pc === player) {
            row[moves[player]] = "Draw";
          } else if ((pc - player + moves.length) % moves.length <= half) {
            row[moves[player]] = "Lose";
          } else {
            row[moves[player]] = "Win";
          }
        }
        table.addRow(row);
      }

      table.printTable();
    }
  }
  class Game {
    // rock-paper-scissors game (with the supports of arbitrary odd number of arbitrary combinations)
    constructor(moves) {
      this.moves = moves;
      this.moveCount = moves.length;
      this.validateMoves(moves);
    }

    validateMoves(moves) {
      const MINIMUM_AMOUNT = 3;
      if (moves.length < MINIMUM_AMOUNT) {
        throw new Error(
          "Should be at least 3 choices. For example : Rock Scissors Paper"
        );
      }

      if (moves.length % 2 === 0) {
        throw new Error("Provided choices should be odd");
      }

      if (new Set(moves).size !== moves.length) {
        throw new Error(
          "Choices should be unique. For example : Rock Scissors Paper"
        );
      }
    }

    getMoveCount() {
      return this.moveCount;
    }

    getMove(index) {
      return this.moves[index];
    }

    getWinner(moves, computerMove, playerMove) {
      if (computerMove === playerMove) {
        return "It's a tie!";
      }

      const half = Math.floor(moves / 2);
      if ((computerMove - playerMove + moves) % moves <= half) {
        return `Computer win!`;
      } else {
        return `You win!`;
      }
    }

    async getSelectionMenu() {
      const moves = this.moves.map((move, index) => {
        return {
          name: `${index + 1} - ${move}`,
          value: index,
        };
      });

      const helpAndExit = [
        {
          name: `0 - exit`,
          value: "exit",
        },
        {
          name: `? - help`,
          value: "help",
        },
      ];

      return await select.default({
        message: "Available moves:",
        choices: [...moves, ...helpAndExit],
      });
    }

    play() {
      const key = new KeyGenerator().generateKey();
      const computerMove = Math.floor(Math.random() * this.getMoveCount());
      const hmac = new HMACGenerator().generateHmac(
        key,
        this.getMove(computerMove)
      );
      console.log(`HMAC: ${key}`);
      this.getSelectionMenu().then((value) => {
        const playerMove = value;

        if (value === "exit") {
          return;
        }

        if (value === "help") {
          new TableGenerator().generate(this.moves);
          init();
          return;
        }

        const winner = this.getWinner(this.moveCount, computerMove, playerMove);
        console.log(`Your move: ${this.moves[playerMove]}`);
        console.log(`Computer move: ${this.moves[computerMove]}`);
        console.log(`${winner}`);
        console.log(`HMAC key: ${hmac}`);
      });
    }
  }
  class KeyGenerator {
    generateKey() {
      return crypto.randomBytes(32).toString("hex");
    }
  }

  class HMACGenerator {
    generateHmac(key, message) {
      return crypto.createHmac("sha256", key).update(message).digest("hex");
    }
  }

  function init() {
    try {
      new Game(process.argv.slice(2)).play();
    } catch (error) {
      console.error(error.message);
    }
  }

  init();
})();
