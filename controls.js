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
	
	//attach validators to "onblur" methods here
	this.rowform.onblur = function(e) {
		theControls.validateNum(theControls.rowform, 1, 99, "rowerror", true);
	}
	this.colform.onblur = function(e) {
		theControls.validateNum(theControls.colform, 1, 99, "colerror", true);
	}
	this.bombform.onblur = function(e) {
		theControls.bomberrormsg.textContent = "Must be a number between 0 and 9999";
		theControls.validateNum(theControls.bombform, 0, 9999, "bomberror", true);
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
	
	newGameButton: function(e) {
		var els = this.ctrlElements;
		if (els.level.value == 'c') {
			var rows = theControls.validateNum(theControls.rowform, 1, 99, "rowerror", false);
			var cols = theControls.validateNum(theControls.colform, 1, 99, "colerror", false);
			if ( rows == null || cols == null ) return;
			
			var area = rows * cols;
			theControls.bomberrormsg.textContent = "Must be a number between 0 and "+area;
			var bombs = theControls.validateNum(theControls.bombform, 0, area, "bomberror", false);
			if ( bombs == null ) return;
			
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
