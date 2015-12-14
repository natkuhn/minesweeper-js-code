var paramObj = {
	b:	new Params( 9, 9, 10 ),
	i:	new Params( 16, 16, 40 ),
	a:	new Params( 16, 30, 99 )
}

function Controls() {
	this.controlsForm = document.getElementById("controls");
	this.ctrlElements = this.controlsForm.elements;
	
	this.controlsForm.onsubmit = function(e) {
		e.preventDefault();			//don't want to submit an actual form
		theControls.newGameButton();
	}
	
	radioControl( "tsize", this.resizeTiles );	
	radioControl( "level", this.changeLevel );
	
	this.rowform = document.getElementById("rows");
	this.colform = document.getElementById("columns");
	this.bombform = document.getElementById("bombs");
	
	this.newGameButton();
}

Controls.prototype = {
	newGameButton: function(e) {
	
		var els = this.ctrlElements;
		if (els.level.value == 'c') {
			/* validation could go here */
			paramObj.c = new Params( els.rows.value, els.columns.value, els.bombs.value );
		}
		var newp = paramObj[els.level.value];
	
		if ( theBoard.num == null || !equalParams(newp, theBoard.num) ) {
			theBoard.makeBoard(newp, els.tsize.value);
		}
	
		theBoard.newGame();
	},

	resizeTiles: function(e) {
		theBoard.tileSize = theControls.ctrlElements.tsize.value;
		theBoard.tableElt.setAttribute("class", "tiles-" + theControls.ctrlElements.tsize.value );

		theBoard.allTiles( refreshImage );
	},

	changeLevel: function(e) {
		var level = theControls.ctrlElements.level.value;
		if ( level == 'c' ) {
			//validation here? or not...
		}
		else if ( theBoard.game != PLAYING ) theControls.newGameButton(e);
	}
}

function radioControl(name, routine) {
	buttons = document.getElementsByName( name );
	for ( var i=0 ; i < buttons.length ; i++ ) {
		buttons[i].onclick = routine
	}

}

function equalParams(a,b) {
	if (a.rows != b.rows) return false;
	if (a.cols != b.cols) return false;
	if (a.bombs != b.bombs) return false;
	return true;
}
