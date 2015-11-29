/* minesweeper.js
	Nat Kuhn, started 11/26/15
	
	v0.1 11/27/15: handles left click, right click, and standard game play
	
	* TODO: needs a way to start a new game
	* TODO: needs settings, especially board size including custom
	* TODO: sizes: beginner 9x9 with 10 bombs; intermediate 16x16 with 40 bombs; expert 16x30 with 99 bombs
	* TODO: make counter max out a 999, min out at -99
*/

var theTimer;
var theCounter;
var theBoard;

onload = init;

function init() {
	var rows = 16;
	var cols = 16;
	var bombs = 40;
	theTimer = new Timer("timer");
	theCounter = new Counter("counter");
	theBoard = new Board();
	theBoard.makeBoard(rows, cols, bombs);
	window.oncontextmenu = function() { return false };	/*override context menu, 
	per http://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event.
	Note that post provides an alternate approach to left-vs-right click detection,
	in case some right-clicks are sneaking through as left-clicks. */
	theBoard.newGame();
}

function Board() {
	this.tableElt = document.getElementById("grid");
	this.faceElt = document.getElementById("face");
	this.faceElt.onclick = function() { theBoard.newGame(); };
	
	this.newGame = function() {
		this.playing = true;
		this.allTiles( function(t) { t.reset() } );
		theBoard.setBombs( this.numBombs );
		theCounter.setTo( this.numBombs );
		theTimer.reset();
		this.setFace("neutral");
	}
	
	this.endGame = function(win) {
		this.playing = false;	//don't accept more clicks
		theTimer.stop();
		if (win) this.setFace("happy");
		else this.setFace("sad");
	}
	
	this.makeBoard = function(r, c, bombs) {
		this.numrows = r
		this.numcols = c
		this.numBombs = bombs;
		this.board = []	//array for tiles
	
		//clear out the existing table
		var ch = this.tableElt.firstChild;
		while (ch) {
			this.tableElt.removeChild(ch);
			ch = this.tableElt.firstChild;
		}
		
		//build new the board
		for ( i=0 ; i < this.numrows ; i++ ) {
			var newRow = []
			var newRowElt = document.createElement('tr');
		
			for ( j=0 ; j < this.numcols ; j++ ) {
				var newTile = new Tile(i,j);
				newRow.push(newTile);
				newRowElt.appendChild(newTile.tdElt)
			}
		
			this.board.push(newRow);
			this.tableElt.appendChild(newRowElt);
		}
	};
	
	this.setBombs = function(k) {
		var n = this.numrows * this.numcols;
		this.nonBombs = n - k;
		while ( n > 0 ) {
			n--;
			var cutoff = Math.floor( Math.random() * n ); //random # >=0 and <n
			if ( cutoff < k ) {
				var j = n % this.numcols;
				var i = Math.floor(n / this.numcols);
				this.board[i][j].setBomb(true);
				k--;
			}
		}
	};
	
	this.getTile = function(i,j) {
		if ( i < 0 || i >= this.numrows ) return null;
		if ( j < 0 || j >= this.numcols ) return null;
		return this.board[i][j];
	};
	
	this.allTiles = function(iter) {
		for ( i=0 ; i < this.numrows ; i++ ) {
			for ( j=0 ; j < this.numcols ; j++ ) {
				iter(this.board[i][j]);
			}
		}
	};
	
	this.setFace = function(str) {
		this.faceElt.setAttribute("class", str);
	}
}

//values of Tile.status
var UNCOVERED = -1;
var COVERED = 0;
var FLAG = 1;
var QUESTION = 2;
var EXCLAMATION = 3;	//not a status per se but used for displaying hints

function Tile(i,j) {
	this.myRow = i;
	this.myCol = j;
	this.tdElt = document.createElement('td');
	
	var self = this;
	this.tdElt.onclick = function(e) { self.leftClick(e) };
	this.tdElt.oncontextmenu = function(e) { self.rightClick(e) };
	this.reset();
}

Tile.prototype = {
	reset: function() {
		this.bomb = false
		this.status = COVERED
		this.bombNeighbors = -1;	//unrevealed
		this.setIcon("covered");
	},
	
	setIcon: function(iconName) {
		this.tdElt.setAttribute("class", iconName);
	},
	
	setBomb: function(v) {
		this.bomb = v;
	},
	
	rightClick: function(evtObj) {
		//do nothing if game over or already uncovered
		if ( !theBoard.playing || this.status == UNCOVERED ) return false;
		if ( this.status == COVERED ) {
			theCounter.decrement();
			this.status = FLAG;
			this.setIcon("flag");
			return false;
		}
		if ( this.status == FLAG ) {	//there could be a setting to go straight back to covered w/o going through ?
			theCounter.increment();
			this.status = QUESTION;
			this.setIcon("question");
			return false;
		}
		if ( this.status == QUESTION ) {
			this.status = COVERED;
			this.setIcon("covered");
			return false;
		}
		assert(false, "Tile has invalid status: "+this.status);
	},
	
	leftClick: function(evtObj) {
		console.log('mouseclick in tile '+this.myRow+','+this.myCol);
		theTimer.going();	//make sure the timer is going
		//ignore clicks if game over, or on flags or already uncovered
		if ( !theBoard.playing || this.status == FLAG || this.status == UNCOVERED ) return;
		if ( this.bomb ) {	//oops, you lose
			this.setIcon("xb");
			this.status = UNCOVERED;
			theTimer.stop()
			theCounter.decrement();
			//game over, loss
			theBoard.playing = false;
			theBoard.allTiles( function(t) {
				if ( t.status == UNCOVERED ) return;
				if ( t.bomb ) t.setIcon("uxb");
				else /*covered non-bomb*/ if (t.status == FLAG) {
					theCounter.increment();		//counter should show only correct guesses
					t.setIcon("nb");
				} 
			} );
			theBoard.endGame(false);	//you lose
		}
		
		else {	//not a bomb
			this.uncoverNonbomb();
		}
	},
	
	uncoverNonbomb: function() {
		var neighbors = [];
		var bombNeighbors = 0;
		var i = this.myRow;
		var j = this.myCol;
		addIn( theBoard.getTile( i-1 , j-1 ) );
		addIn( theBoard.getTile( i-1 , j   ) );
		addIn( theBoard.getTile( i-1 , j+1 ) );
		addIn( theBoard.getTile( i   , j-1 ) );
		addIn( theBoard.getTile( i   , j+1 ) );
		addIn( theBoard.getTile( i+1 , j-1 ) );
		addIn( theBoard.getTile( i+1 , j   ) );
		addIn( theBoard.getTile( i+1 , j+1 ) );
		
		this.status = UNCOVERED;
		this.setIcon("n"+bombNeighbors);
		
		theBoard.nonBombs--;
		
		if (theBoard.nonBombs == 0 ) {
			//game over, win
			theBoard.playing = false;
			theTimer.stop();
			theBoard.allTiles( function(t) {
				if ( t.status == UNCOVERED ) return;	//don't care about uncovered
				assert(t.bomb, "Player won, but there is a covered non-bomb");
				t.setIcon("flag");
			} );
			theBoard.endGame(true);
			return;
		}
		
		if (bombNeighbors > 0) return;
		
		//all neighbors are non-bombs, uncover them
		for ( i=0 ; i < neighbors.length ; i++ ) {
			var t = neighbors[i];
			if ( t.status != UNCOVERED ) t.uncoverNonbomb();
		}

		function addIn(x) {
			if (x) {
				neighbors.push(x);
				if (x.bomb) bombNeighbors++;
			}
		}
	}
}

function Counter(element) {
	if (element) this.myElement = document.getElementById(element);
	
	this.show = function() {
		if (this.myValue >= 0) var str = ("00"+Math.min(this.myValue,999)).slice(-3);
		else var str = "-"+("0"+Math.min(-this.myValue,99)).slice(-2);
		this.myElement.innerHTML = str
	}
	
	this.setTo = function(k) {
		this.myValue = k;
		this.show();
	}
	
	this.decrement = function() {
		this.myValue--;
		this.show();
	}
	
	this.increment = function() {
		this.myValue++;
		this.show();
	}
}

function Timer(element) {
	if (element) this.myElement = document.getElementById(element);
	var self = this;
	this.timerFn = function() { self.increment() };
	this.timerObj = null

	this.reset = function() {
		if (this.timerObj) this.stop();
		this.setTo(0);
	}
	
	this.start = function() {
		this.timerObj = window.setInterval(this.timerFn, 1000);
	}
	
	this.going = function() {
		if (! this.timerObj ) this.start();
	}
	
	this.stop = function() {
		window.clearInterval(this.timerObj);
		this.timerObj = null;
	}
}

Timer.prototype = new Counter(null)

//see: http://stackoverflow.com/questions/15313418/javascript-assert
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
