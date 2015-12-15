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
	
	this.customform = document.getElementById("customform");
	this.rowform = document.getElementById("rows");
	this.colform = document.getElementById("columns");
	this.bombform = document.getElementById("bombs");
	this.bomberrormsg = document.getElementById("bomberrormsg");
	
	this.rows = null;
	this.rowform.onblur = function(e) {
		theControls.rows = theControls.validateNum(theControls.rowform, 1, 99, "rowerror", true);
	}
	
	this.cols = null;
	this.colform.onblur = function(e) {
		theControls.cols = theControls.validateNum(theControls.colform, 1, 99, "colerror", true);
	}
	
	this.bombs = null;
	this.bombform.onblur = function(e) {
		var area = theControls.rows * theControls.cols;
		theControls.bomberrormsg.textContent = "Must be a number between 0 and " +
			(area ? area : "9999");
		theControls.bombs = theControls.validateBombs(true);
	}
	
	this.newGameButton();
}

Controls.prototype = {
	validateNum: function(item, min, max, errorId, soft) {
		var value = item.value;
		if ( soft && item.value == "" ) var valid = true;
		else {
			valid = /^\d+$/.test(value)
			if ( valid ) {
				var num = 1 * value;
				if ( num < min || num > max ) valid = false;
			}
		}
		//fail
		document.getElementById(errorId).setAttribute( "class", valid ? "noerror" : "error" );
		return valid ? num : null;
	},
	
	validateBombs: function(soft) {
		var area = theControls.rows * theControls.cols;
		theControls.bomberrormsg.textContent = "Must be a number between 0 and " +
			(area ? area : "9999");
		return theControls.validateNum(theControls.bombform, 0, 9999, "bomberror", soft);
	},
	
	newGameButton: function(e) {
		var els = this.ctrlElements;
		if (els.level.value == 'c') {
			//need to revalidate with soft = false, to not allow null values
			this.rows = this.validateNum(theControls.rowform, 1, 99, "rowerror", false);
			this.cols = this.validateNum(theControls.colform, 1, 99, "colerror", false);
			if ( this.rows == null || this.cols == null ) return;
			
			this.bombs = this.validateBombs(false);
			if ( this.bombs == null ) return;
			
			paramObj.c = new Params( this.rows, this.cols, this.bombs );
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
 			theControls.customform.setAttribute("class", "showcustom" );
			//validation here? or not...
		}
		else {
 			theControls.customform.setAttribute("class", "hidecustom" );
			if ( theBoard.game != PLAYING ) theControls.newGameButton(e);
		}
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
