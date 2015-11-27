/* minesweeper.js
	Nat Kuhn, started 11/26/15
*/

var theTimer;
var theCounter;
var theBoard;

onload = init;

function init() {
//	alert('loading');
	var rows = 9;
	var cols = 9;
	var bombs = 10;
	theTimer = new Timer();
	theCounter = new Counter();
	theBoard = new Board();
	theBoard.newBoard(rows, cols);
	theBoard.setBombs( bombs );
	theCounter.setTo( bombs );
	window.oncontextmenu = function() { return false };	//override context menu, 
	//per http://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event
}

function Board(r,c) {
	this.tableElt = document.getElementById("grid");
	this.numrows = null;
	this.numcols = null;
	
	this.newBoard = function(r,c) {
		this.playing = true;	//set to false at end of game
		theTimer.reset();
		this.playing = true;
		
		if ( this.numrows == r && this.numcols == c ) {
			//no need for new board
			this.allTiles( function(t) { t.reset() } );
//			for ( i=0 ; i < this.numrows ; i++ ) {
//				for ( j=0 ; j < this.numcols ; j++ ) {
//					this.board[i][j].reset();
//				}
//			}
			return;
		}
		this.numrows = r
		this.numcols = c
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
	}
	
	this.allTiles = function(iter) {
		for ( i=0 ; i < this.numrows ; i++ ) {
			for ( j=0 ; j < this.numcols ; j++ ) {
				iter(this.board[i][j]);
			}
		}
	};
}

//values of Tile.status
var UNCOVERED = -1;
var COVERED = 0;
var FLAG = 1;
var QUESTION = 2;
var EXCLAMATION = 3;	//not a status per se but used for displaying hints

function Tile(i,j) {
//	console.log('building tile '+i+','+j);
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
//		console.log('resetting');
		this.bomb = false
		this.status = COVERED
		this.bombNeighbors = -1;	//unrevealed
		this.setIcon("covered");
	},
	
	setIcon: function(iconName) {
//		console.log('updating');
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
			this.status == FLAG;
			this.setIcon("flag");
			return false;
		}
		if ( this.status == FLAG ) {	//there could be a setting to go straight back to covered w/o going through ?
			theCounter.increment();
			this.status == QUESTION;
			this.setIcon("question");
			return false;
		}
		if ( this.status == QUESTION ) {
			this.status == COVERED;
			this.setIcon("question");
			return false;
		}
		assert(false, "Tile has invalid status: "+this.status);
	},
	
	leftClick: function(evtObj) {
		console.log('mouseclick in tile '+this.myRow+','+this.myCol);
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
			alert('You lose!');
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
			alert('You win!');
			return;	//need other game-ending code?			
			
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

function Timer() {
	//make the timer here?
	this.reset = function() {
		this.going = false;
		//etc
	}
	
	this.start = function() {
		this.going = true;
		//etc
	}
	
	this.stop = function() {
		this.going = false;
	}

}

function Counter() {
	this.setTo = function(k) {
		
	}
	
	this.decrement = function() {
		
	}
	
	this.increment = function() {
		
	}
}

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
