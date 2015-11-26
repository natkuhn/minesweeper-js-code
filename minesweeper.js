/* minesweeper.js
	Nat Kuhn, started 11/26/15
*/


onload = init

function init() {
	rows = 10;
	cols = 15;
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

function Tile(i,j) {
	this.myRow = i;
	this.myRow = j;
	this.tdElt = document.createElement('td');
	this.tdElt.onclick = this.click
}

Tile.prototype = {
	click: function(evt) {
	
	}
}

	