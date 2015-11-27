/* minesweeper.js
	Nat Kuhn, started 11/26/15
*/


onload = init;

function init() {
//	alert('loading');
	var rows = 3;
	var cols = 4;
	var bombs = 5;
	var theTimer = new Timer();
	var theCounter = new Counter();
	var theBoard = new Board();
	theBoard.newBoard(rows, cols);
	theBoard.setBombs( bombs);
}

function Board(r,c) {
	this.tableElt = document.getElementById("grid");
	this.numrows = null;
	this.numcols = null;
}

Board.prototype = {
	newBoard: function(r,c) {
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
	}
	
	setBombs: function(k) {
		var n = this.numrows * this.numcols;
//		this.nonBombs = n - k;
		while ( n > 0 ) {
			n--;
			var cutoff = Math.floor( Math.random() * n ); //random # >=0 and <n
			if ( cutoff < k ) {
				var j = n % numcols;
				var i = Math.floor(n / numcols);
				this.board[i][j].setBomb(true);
			}
		}
	}
};

//values of Tile.status
var UNCOVERED = -1;
var COVERED = 0;
var FLAG = 1;
var QUESTION = 2;
var EXCLAMATION = 3;	//not a status per se but used for displaying hints

function Tile(i,j) {
//	console.log('building tile '+i+','+j);
	this.myRow = i;
	this.myRow = j;
	this.tdElt = document.createElement('td');
	this.tdElt.onclick = this.click
	this.reset();
//	alert('got here');
}

Tile.prototype = {
	reset: function() {
//		console.log('resetting');
		this.bomb = false
		this.status = COVERED
		this.bombNeighbors = -1;	//unrevealed
		this.updateIcon();
	},
	
	updateIcon: function() {
//		console.log('updating');
		this.tdElt.setAttribute("class","icon"+this.status);
	},
	
	setBomb(b): function(v) {
		this.bomb = v;
	}
	
	click: function(evt) {
		
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
	
}
