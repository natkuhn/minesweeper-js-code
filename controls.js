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
	
	sizeButtons = document.getElementsByName("tsize");
	for ( var i=0 ; i < sizeButtons.length ; i++ ) {
		sizeButtons[i].onclick = resizeBoard
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
	
	if ( theBoard.num == null || !equalParams(newp, theBoard.num) ) {
		theBoard.makeBoard(newp, els.tsize.value);
	}
	
	theBoard.newGame();
}

function resizeBoard(e) {
	theBoard.tileSize = controlsForm.elements.tsize.value;
	theBoard.tableElt.setAttribute("class", "tiles-" + controlsForm.elements.tsize.value );

	theBoard.allTiles( refreshTile );
}

function refreshTile(t) {
	t.tdElt.setAttribute( "class", t.myClass(theBoard.tileSize) );
	t.tdElt.innerHTML = t.myHTML(theBoard.tileSize) ;
}
