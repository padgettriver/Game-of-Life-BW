import React from "react";
import "./game.css";
import GameCell from './gamecell'
import { Link } from 'react-router-dom';

const game_cell = 20; // cell size
const game_width = 640; // grid width
const game_height = 500; // grid height


class Game extends React.Component {
  constructor() {
    super();
    this.rows = game_height / game_cell; //rows = height / cell
    this.columns = game_width / game_cell; //cols = width / cell
    this.gameboard = this.makeNewBoard(); // makeNewBoard function
  }
  state = {
    gamecells: [],
    interval: 100, //speed
    isEngaged: false, //starts dead
    generationNum: 0 //starts at gen 0
  };

  makeNewBoard() { //new board
    let gameboard = [];
    for (let y = 0; y < this.rows; y++) {
      gameboard[y] = [];
      for (let x = 0; x < this.columns; x++) {
        gameboard[y][x] = false;
      }
    }
    return gameboard;
  }

  makeNewCells() { //new cells
    let gamecells = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (this.gameboard[y][x]) {
          gamecells.push({ x, y });
        }
      }
    }
    return gamecells;
  }

  getElement() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;

    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop
    };
  }

  handleClick = e => {
    const elemOffset = this.getElement();
    const offsetX = e.clientX - elemOffset.x;
    const offsetY = e.clientY - elemOffset.y;

    const x = Math.floor(offsetX / game_cell);
    const y = Math.floor(offsetY / game_cell);

    if (x >= 0 && x <= this.columns && y >= 0 && y <= this.rows) {
      this.gameboard[y][x] = !this.gameboard[y][x];
    }
    this.setState({ gamecells: this.makeNewCells() });
  };

  startGame = () => { //starts game
    this.setState({ isEngaged: true }, () => this.iterationMethod());
  };

  stopGame = () => { //stops game
    this.setState({ isEngaged: false });
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };

  handleClear = () => { //clears & resets gen
    this.gameboard = this.makeNewBoard();
    this.setState({ gamecells: this.makeNewCells(), isEngaged: false, generationNum: -1 }); //if game in progress, stops & sets gen to 0
  };

  handleClear2 = () => { //clears & resets gen
    this.gameboard = this.makeNewBoard();
    this.setState({ gamecells: this.makeNewCells(), isEngaged: false, generationNum: 0 }); // if game not in progress / stopped, sets to 0
  };

  handleRandom = () => {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        this.gameboard[y][x] = Math.random() >= 0.7;
      }
    }
    this.setState({ gamecells: this.makeNewCells() });
  };

  iterationMethod = () => {
    let newGameBoard = this.makeNewBoard();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        let neighbors = this.neighborsMethod(this.gameboard, x, y);
        if (this.gameboard[y][x]) {
          if (neighbors === 2 || neighbors === 3) {
            newGameBoard[y][x] = true;
          }
          else {
            newGameBoard[y][x] = false;
          }
        }
        else {
          if (!this.gameboard[y][x] && neighbors === 3) {
            newGameBoard[y][x] = true;
          }
        }
      }
    }

    this.gameboard = newGameBoard;
    this.setState({ gamecells: this.makeNewCells() });

    if (this.state.isEngaged) {
      this.timeoutHandler = window.setTimeout(() => {
        this.iterationMethod();
      }, this.state.interval);
    }

    let newGeneration = this.state.generationNum;
    ++newGeneration;
    this.setState({ generationNum: newGeneration });
    console.log(this.state.generationNum);
  }

  neighborsMethod(gameboard, x, y) {
    let neighbors = 0;
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]]; //8 neighbors in all directions
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];

      if (
        x1 >= 0 &&
        x1 < this.columns &&
        y1 >= 0 &&
        y1 < this.rows &&
        gameboard[y1][x1]
      ) {
        neighbors++;
      }
    }
    return neighbors;
  }

  handleInterval = e => {
    this.setState({ interval: e.target.value });
  };

  render() {
    const { gamecells } = this.state;
    return (
      <div class="flex">
        <div className="controls">
          <div ><h3 class="gen">Generation: {this.state.generationNum}</h3>
            {this.state.isEngaged ? (
              <button className="button" onClick={this.stopGame}>
                Stop Game
              </button> //stops game
            ) : (
                <button className="button" onClick={this.startGame}>
                  Start Game
                </button> //starts game
              )}
            <button className="button" onClick={this.handleRandom}>
              Random
          </button>
            {/* randomizes cells on board */}
            <button className="button" onClick={this.iterationMethod}>
              One Step
          </button>
            {/* 1 generation at a time */}
            {this.state.isEngaged ? (
              <button className="button" onClick={this.handleClear}>
                Clear
              </button>) : (
                <button className="button" onClick={this.handleClear2}>
                  Clear
                </button>
                // If game is engaged, clears board and resets generations
                // If game is not engaged, resets generations to 0
              )}

            <div className="speed">
              Update Every{" "}
              <input
                value={this.state.interval}
                onChange={this.handleInterval}
              />{" "}
          milliseconds
          </div>
          </div>
          <div className="container">
            <div
              className="gameBoard"
              style={{
                width: game_width,
                height: game_height,
                backgroundSize: `${game_cell}px ${game_cell}px`
              }}
              onClick={this.handleClick}
              ref={n => {
                this.boardRef = n;
              }}
            >
              {gamecells.map(gamecell => (
                <GameCell x={gamecell.x} y={gamecell.y} key={`${gamecell.x}, ${gamecell.y}`} />
              ))}
            </div>

            <div>
              <div> <Link to='/' className="home-link"><button className="home-button button">Home</button></Link></div>
            </div>

          </div>

        </div>

      </div>
    );
  }
}

export default Game;