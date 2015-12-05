var paramObj = {
	b:	new Params( 9, 9, 10 ),
	i:	new Params( 16, 16, 40 ),
	a:	new Params( 16, 30, 99 )
}

var controlsForm;

function initControls() {
	controlsForm = document.getElementById("controls");
	controlsForm.onsubmit = function(e) {
		e.preventDefault();			//don't want to submit an actual form
		newGameButton();
	}
	newGameButton();
}

function equalParams(a,b) {
	if (a.rows != b.rows) return false;
	if (a.cols != b.cols) return false;
	if (a.bombs != b.bombs) return false;
	return true;
}

function newGameButton(e) {
	
	var els = controlsForm.elements;
	if (els.level.value == 'c') {
		/* validation could go here */
		paramObj.c = new Params( els.rows.value, els.columns.value, els.bombs.value );
	}
	var newp = paramObj[els.level.value];
	var newts = els.tsize.value;
	
	if ( theBoard.num == null || 
		 !equalParams(newp, theBoard.num) || 
		 newts != theBoard.tileSize ) theBoard.makeBoard(newp, newts);
	
	theBoard.newGame();
}
