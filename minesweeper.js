/* minesweeper.js
	Nat Kuhn, started 11/26/15
*/


onload = init;

function init() {
//	alert('loading');
	rows = 3;
	cols = 4;
	var board = new Board(rows, cols);
};

function Board(r,c) {
	this.tableElt = document.getElementById("grid");
	this.buildBoard(r,c)
};

Board.prototype = {
	buildBoard: function(r,c) {
		this.numrows = r
		this.numcols = c
		this.board = []	//array for tiles
	
		//clear out the existing table
		var ch = this.tableElt.firstChild;
		while (ch) {
			this.tableElt.removeChild(ch);
			ch = this.tableElt.firstChild;
		}
	
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
	
	click: function(evt) {
	
	}
}

	