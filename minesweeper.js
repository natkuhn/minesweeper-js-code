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
}

function Board(r,c) {
	this.tableElt = document.getElementById("grid");
	this.numrows = null;
	this.numcols = null;
	
	this.newBoard = function(r,c) {
		this.playing = true;	//set to false at end of game
		theTimer.reset();
		if ( this.numrows == r && this.numcols == c ) {
			//no need for new board
			for ( i=0 ; i < this.numrows ; i++ ) {
				for ( j=0 ; j < this.numcols ; j++ ) {
					this.board[i][j].reset();
				}
			}
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
//		this.nonBombs = n - k;
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
	this.tdElt.onclick = this.clickHandler(i,j);
	this.reset();
//	alert('got here');
}

Tile.prototype = {
	reset: function() {
//		console.log('resetting');
		this.bomb = false
		this.status = COVERED
		this.bombNeighbors = -1;	//unrevealed
		this.setIcon("icon"+this.status);
	},
	
	setIcon: function(iconName) {
//		console.log('updating');
		this.tdElt.setAttribute("class", iconName);
	},
	
	setBomb: function(v) {
		this.bomb = v;
	},
	
	clickHandler: function(i,j) {	//returns a handler which invokes the click() method
		return function(evt) {
			var t = theBoard.board[i][j];	//the tile in question
			t.click();
		}
	},
	
	click: function() {
		console.log('mouseclick in tile '+this.myRow+','+this.myCol);
		if ( this.status == FLAG || this.status == UNCOVERED ) return;	//ignore clicks on flags or already uncovered
		if ( this.bomb ) {	//oops, you lose
			this.setIcon("xb");
			this.status = UNCOVERED;
			theTimer.stop()
			theCounter.decrement();
			//game over, loss
			for ( i=0 ; i < theBoard.numrows ; i++ ) {
				for ( j=0 ; j < theBoard.numcols ; j++ ) {
					var t = theBoard.board[i][j];
					if ( t.bomb && t.status != UNCOVERED ) {
						t.setIcon("uxb");
						if (t.status == FLAG) theCounter.decrement();
					}
				}
			}
		}
		
		else {	//not a bomb
	
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
