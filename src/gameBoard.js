const gamesBoardContainer = document.querySelector("#gamesboard-container");
const width = 10;

export function createBoard(color, user) {
  let name;
  user === "player" ? (name = "PLAYER") : (name = "COMPUTER");

  const board = document.createElement("div");
  board.classList.add("board");

  const boardTitle = document.createElement("div");
  boardTitle.classList.add("board-title");

  const title = document.createElement("div");
  title.textContent = name;

  const gameBoardContainer = document.createElement("div");
  gameBoardContainer.classList.add("game-board");
  gameBoardContainer.style.backgroundColor = color;
  gameBoardContainer.id = user;

  //create 10x10 blocks
  for (let i = 0; i < width * width; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    block.id = i;

    gameBoardContainer.append(block);
  }

  boardTitle.append(title);
  board.append(boardTitle);
  board.append(gameBoardContainer);
  gamesBoardContainer.append(board);
  
}

export function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStartIndex = isHorizontal
      ? startIndex <= width * width - ship.length
        ? startIndex
        : width * width - ship.length
      : //not horizontal
      startIndex <= width * width - width * ship.length
      ? startIndex
      : startIndex - ship.length * width + width;
  
    let shipBlocks = [];
  
    for (let i = 0; i < ship.length; i++) {
      //start from block start index to adjacent blocks to the right
      if (isHorizontal) {
        shipBlocks.push(allBoardBlocks[Number(validStartIndex) + i]);
  
        //vertical
      } else {
        shipBlocks.push(allBoardBlocks[Number(validStartIndex) + i * width]);
      }
    }
  
    //check if valid to put whole ship in one line horizontal/vertical without wrapping
    let valid;
  
    if (isHorizontal) {
      shipBlocks.every(
        (_shipBlock, index) =>
          (valid =
            shipBlocks[0].id % width !==
            width - (shipBlocks.length - (index + 1)))
      );
    } else {
      shipBlocks.every(
        (_shipBlock, index) =>
          (valid = shipBlocks[0].id < 90 + (width * index + 1))
      );
    }
  
    //check the block is not taken
    const notTaken = shipBlocks.every(
      (shipBlock) => !shipBlock.classList.contains("taken")
    );
  
    return {
      shipBlocks,
      valid,
      notTaken,
    };
  }

  export function isShipDroppped(droppedShips, checkShip){

    let notAdd = false;

    droppedShips.forEach((dropship) => {
        if (dropship === checkShip) {
          notAdd =  true;
        }
      });

      return notAdd;

  }