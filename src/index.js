import { createBoard, getValidity, isShipDroppped } from "./gameBoard";

const optionContainer = document.querySelector(".option-container");
const flipButton = document.querySelector("#flip-button");
const startButton = document.querySelector("#start-button");
const infoDisplay = document.querySelector("#info-display");
const turnDisplay = document.querySelector("#turn-display");
const setupDisplay = document.querySelector(".setup");

let dropped = [];

//flip ships
let angle = 0;
function flip() {
  const optionShips = Array.from(optionContainer.children);

  angle = angle === 0 ? 90 : 0;
  optionShips.forEach(
    (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
  );
}

flipButton.addEventListener("click", flip);

const width = 10;

createBoard("hsl(200, 100%, 50%)", "player");
createBoard("hsl(200, 100%, 40%", "computer");

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }

}

const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const carrier = new Ship("carrier", 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;

function addShipPiece(user, ship, startId) {

  let notAdd = isShipDroppped(dropped, ship);

  if (notAdd === false) {
    console.log("current user : " + user);

    const allBoardBlocks = document.querySelectorAll(`#${user} div`);
    

    let randomBoolean = Math.random() < 0.5;
    let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
    let randomStartIndex = Math.floor(Math.random() * width * width);

    let startIndex = startId ? startId : randomStartIndex;

    const { shipBlocks, valid, notTaken } = getValidity(
      allBoardBlocks,
      isHorizontal,
      startIndex,
      ship
    );

    if (valid && notTaken) {
      shipBlocks.forEach((shipBlock) => {
        shipBlock.classList.add(ship.name);
        shipBlock.classList.add("taken");
      });

      console.log("add " + ship.name + " to " + user);
    } else {
      console.log("block not valid for user: " + user);

      if (user === "computer") {
        console.log("retry add " + ship.name + " for computer");
        addShipPiece(user, ship);
      } else {
        notDropped = true;
      }
    }
  }
}

ships.forEach((ship) => addShipPiece("computer", ship));

//drag ships
let draggedShip;

const optionShips = Array.from(optionContainer.children);
optionShips.forEach((optionShip) => {
  optionShip.addEventListener("dragstart", dragStart);
});

const allPlayerBlocks = document.querySelectorAll("#player div");
allPlayerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener("dragover", dragOver);
  playerBlock.addEventListener("drop", dropShip);
});

function dragStart(e) {
  notDropped = false;
  draggedShip = e.target;
}

function dragOver(e) {
  e.preventDefault();
  const ship = ships[draggedShip.id];
  highlightArea(e.target.id, ship);
}

function dropShip(e) {
  const startId = e.target.id;
  const ship = ships[draggedShip.id];
  addShipPiece("player", ship, startId);

  if (!notDropped) {
    draggedShip.remove();
    dropped.push(ship);
  }
}

//add highlight
function highlightArea(startIndex, ship) {

  let notAdd = isShipDroppped(dropped, ship);

  if (notAdd === false) {
    const allPlayerBlocks = document.querySelectorAll("#player div");
    let isHorizontal = angle === 0;

    const { shipBlocks, valid, notTaken } = getValidity(
      allPlayerBlocks,
      isHorizontal,
      startIndex,
      ship
    );

    if (valid && notTaken) {
      shipBlocks.forEach((shipBlock) => {
        shipBlock.classList.add("hover");
        setTimeout(() => shipBlock.classList.remove("hover"), 500);
      });
    }
  }
}

let gameOver = false;
let playerTurn;

//start game when all ships on board
function startGame() {
  console.log("start");

  if (playerTurn === undefined) {
    if (optionContainer.children.length != 0) {
      console.log("please place all ships");

      infoDisplay.textContent =
        "Please place all your ships on the PLAYER board.";
    } else {
      setupDisplay.style.display = "none";
      startButton.style.display = "none";

      const playerShipsInfo = document.querySelector(".player-ships-info");
      const cpuShipInfo = document.querySelector(".cpu-ships-info");

      playerShipsInfo.textContent =
        "Player's ships: Destroyer | Submarine | Cruiser | Battleship | Carrier";
      cpuShipInfo.textContent =
        "Computer's ships: Destroyer | Submarine | Cruiser | Battleship | Carrier";

      const allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach((block) =>
        block.addEventListener("click", handleClick)
      );

      playerTurn = true;
      turnDisplay.textContent = "PLAYER's turn";
      infoDisplay.textContent = "You are attacking....";
    }
  }
}

startButton.addEventListener("click", startGame);

let playerHits = [];
let computerHits = [];
const playerSunkShips = [];
const computerSunkShips = [];

function handleClick(e) {
  if (!gameOver) {
    //if target is a ship block
    if (
      e.target.classList.contains("taken") &&
      !e.target.classList.contains("boom")
    ) {
      e.target.classList.add("boom");
      infoDisplay.textContent = "You HIT a ship!";
      let classes = Array.from(e.target.classList);
      classes = classes.filter((className) => className != "block");
      classes = classes.filter((className) => className != "boom");
      classes = classes.filter((className) => className != "taken");
      playerHits.push(...classes);

      checkScore("player", playerHits, playerSunkShips);
    } else if (!e.target.classList.contains("taken")) {
      infoDisplay.textContent = "You MISSED!";
      e.target.classList.add("miss");
    } else if (
      (e.target.classList.contains("taken") &&
        e.target.classList.contains("boom")) ||
      e.target.classList.contains("miss")
    ) {
      infoDisplay.textContent =
        "You attacked the same spot. You wasted your turn!";
    }

    playerTurn = false;

    const allBoardBlocks = document.querySelectorAll("#computer div");
    allBoardBlocks.forEach((block) =>
      block.removeEventListener("click", handleClick)
    );
    setTimeout(computerGo, 2000);
  }
}

function computerGo() {
  if (!gameOver) {
    turnDisplay.textContent = "COMPUTER's turn";
    infoDisplay.textContent = "Computer is attacking....";

    setTimeout(() => {
      //0-99
      let randomGo = Math.floor(Math.random() * width * width);
      const allBoardBlocks = document.querySelectorAll("#player div");

      if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        computerGo();
        return;
      } else if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        !allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        allBoardBlocks[randomGo].classList.add("boom");
        infoDisplay.textContent = "The computer HIT your ship!";

        let classes = Array.from(allBoardBlocks[randomGo].classList);
        classes = classes.filter((className) => className != "block");
        classes = classes.filter((className) => className != "boom");
        classes = classes.filter((className) => className != "taken");
        computerHits.push(...classes);

        checkScore("computer", computerHits, computerSunkShips);
      } else {
        infoDisplay.textContent = "The computer MISSED!";
        allBoardBlocks[randomGo].classList.add("miss");
      }
    }, 2000);

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = "PLAYER's turn";
      infoDisplay.textContent = "You are attacking....";

      const allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach((block) =>
        block.addEventListener("click", handleClick)
      );
    }, 4000);
  }
}

const playerShipsInfo = document.querySelector(".player-ships-info");
const cpuShipInfo = document.querySelector(".cpu-ships-info");

let psunk = ["Destroyer", "Submarine", "Cruiser", "Battleship", "Carrier"];
let csunk = ["Destroyer", "Submarine", "Cruiser", "Battleship", "Carrier"];

function checkScore(user, userHits, userSunkShips) {
  function checkShip(shipName, shipLength) {
    if (
      userHits.filter((storedShipName) => storedShipName === shipName)
        .length === shipLength
    ) {
      if (user === "player") {
        infoDisplay.textContent = `The player SUNK the computer's ${shipName.toUpperCase()}!`;

        let text = "";

        for (let i = 0; i < psunk.length; i++) {
          if (psunk[i] !== undefined) {

            let found = false;

            if (psunk[i].toUpperCase() === shipName.toUpperCase()) {
              found = true;
              delete psunk[i];
            }

            if (!found) {
              text += psunk[i] + " | ";
            }
          }
        }

        cpuShipInfo.textContent = "Computer ships: " + text;

        playerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }
      if (user === "computer") {
        infoDisplay.textContent = `The computer SUNK the player's ${shipName.toUpperCase()}!`;

        let ctext = "";

        for (let i = 0; i < csunk.length; i++) {
          if (csunk[i] !== undefined) {

            let found = false;

            if (csunk[i].toUpperCase() === shipName.toUpperCase()) {
              found = true;
              delete csunk[i];
            }

            if (!found) {
              ctext += csunk[i] + " | ";
            }
          }
        }

        playerShipsInfo.textContent = "Player ships: " + ctext;

        computerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }

      userSunkShips.push(shipName);
    }
  }

  checkShip("destroyer", 2);
  checkShip("submarine", 3);
  checkShip("cruiser", 3);
  checkShip("battleship", 4);
  checkShip("carrier", 5);

  console.log("player sunked ships " + playerSunkShips);
  console.log("cpu sunked ships " + computerSunkShips);

  if (playerSunkShips.length === 5) {
    infoDisplay.textContent =
      "You have sunk all the computer's ship. You WON!!";
    gameOver = true;
  }

  if (computerSunkShips.length === 5) {
    infoDisplay.textContent =
      "Computer has sunk all the player's ship. You LOSE!!";
    gameOver = true;
  }
}

infoDisplay.textContent = "Please place all your ships on the PLAYER board.";

