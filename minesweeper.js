/* minesweeper.js
	Nat Kuhn, started 11/26/15
	
	v0.1 11/27/15: handles left click, right click, and standard game play
	v0.2 2/25/17: added "Back" button, though in a fairly hackish way
	
	* TODO: clicking custom should set rows and columns to the last game, and turn off any errors?
	* TODO: make fixed width for bomberrormsg (between 15 and 25 em?)
	* TODO: turn settings into menu which is shown or hidden
	* TODO: larger tiles for tablet
	* TODO: how to make work on tablet?
	* TODO: force screen to scroll not shrink the tiles
	* TODO: make other things besides grid non-selectable (e.g. settings)?
	* TODO: top margin on the two-column table should be fixed, no auto
	* BUG: auto-uncover seems to uncover flagged squares which are non-bombs, leading to a negative count at the end
*/

/* Here are all the different appearances of tiles:

covered, non-bomb (set in Tile.reset() )
covered-flag, covered-question-mark--in rightClick

exploded bomb (redsquare background)
uncovered bomb (gray background)-after losing
uncovered non-bomb-after losing
uncovered with blank or number, while playing
covered-flag after winning

*/

var theTimer;
var theCounter;
var theBoard;
var theControls;

onload = init;

function init() {
	theTimer = new Timer("timer");
	theCounter = new Counter("counter");
	theBoard = new Board();
	window.oncontextmenu = function() { return false };	/*override context menu, 
	per http://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event.
	Note that post provides an alternate approach to left-vs-right click detection,
	in case some right-clicks are sneaking through as left-clicks. */
	
	window.onbeforeunload = function() {
		return theBoard.game == PLAYING ? "Leaving this page will lose your current progress" : null
	}
	
	theControls = new Controls(); 
	
	theControls.newGameButton();	//needs to be called after theControls has value b/c 
									//button is disabled in new game.
}

function Params(r,c,b) {
	this.rows = r;
	this.cols = c;
	this.bombs = b;
}

//modified slightly (to include default value) from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/
function getURLParameter(name, defaultVal) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1]
  	.replace(/\+/g, '%20'))||defaultVal
}

function Board() {
	this.num = null;	// needed in newGameButton()
	
	this.tableElt = document.getElementById("grid");
	
	this.faceElt = document.getElementById("face");
	this.faceElt.onclick = function(e) {
		theBoard.newGame();
	}

	this.newGame = function() {
		this.game = WAITING;
		this.allTiles( function(t) { t.reset() } );
		theBoard.setBombs( this.num.bombs );
		theCounter.setTo( this.num.bombs );
		theTimer.reset();
		this.setFace("neutral");
		theControls.backButton.disabled = true;
	}
	
	this.endGame = function(win) {
		this.game = OVER;	//don't accept more clicks
		theTimer.stop();
		this.setFace( win ? "happy" : "sad" );
	}
	
	//restore the state for "Back" button
	this.goBack = function(e) {
		if (theBoard.game == WAITING) return;
		if (theBoard.game == OVER) {
			theBoard.game = PLAYING;
			theBoard.setFace("neutral");
			theTimer.start()
		}
		theBoard.allTiles( function(t) { t.goBack() } );
		theBoard.nonBombs = theBoard.saveNonBombs;
		theCounter.setTo(theBoard.saveCounter);
		theControls.backButton.disabled = true;
	}
	
	this.setFlags = function(e) {
		//need code here to set flags
		theBoard.allTiles( function (t) {
			if (t.status != UNCOVERED) return;
			if (t.bombNeighbors <= 0) return;
			var n = t.getNeighbors();
			var cn = 0;
			for (var i in n) {
				if (n[i].status != UNCOVERED) cn++;	//count covered, question mark, flagged
			}
			assert (cn >= t.bombNeighbors, "more bombs than covered neighbors");
			if (cn == t.bombNeighbors) {	//all neighbors must be bombs, flag them
				for (i in n) {
					if (n[i].status == COVERED) n[i].setFlag();
				}
			}
		} );
	}
	
	this.makeBoard = function(p, t) {
		this.num = p;
		this.tileSize = t;
		this.tableElt.setAttribute("class", "tiles-"+this.tileSize)
		this.board = []	//array for tiles
	
		//clear out the existing table
		var ch = this.tableElt.firstChild;
		while (ch) {
			this.tableElt.removeChild(ch);
			ch = this.tableElt.firstChild;
		}
		
		//build new the board
		for ( i=0 ; i < this.num.rows ; i++ ) {
			var newRow = []
			var newRowElt = document.createElement('tr');
		
			for ( j=0 ; j < this.num.cols ; j++ ) {
				var newTile = new Tile(i,j);
				newRow.push(newTile);
				newRowElt.appendChild(newTile.tdElt)
			}
		
			this.board.push(newRow);
			this.tableElt.appendChild(newRowElt);
		}
	};
	
	this.setBombs = function(k) {
		var n = this.num.rows * this.num.cols;
		assert(k<=n, "Too many bombs!");
		this.nonBombs = n - k;
		while ( n > 0 ) {
			n--;
			if ( Math.random() < k/n ) {	//prob of bomb should be k/n, never true if k=0, always true if k=n
				var j = n % this.num.cols;
				var i = Math.floor(n / this.num.cols);
				this.board[i][j].bomb = true;
				k--;
			}
		}
	};

	this.getTile = function(i,j) {
		if ( i < 0 || i >= this.num.rows ) return null;
		if ( j < 0 || j >= this.num.cols ) return null;
		return this.board[i][j];
	};
	
	this.allTiles = function(iter) {
		for ( i=0 ; i < this.num.rows ; i++ ) {
			for ( j=0 ; j < this.num.cols ; j++ ) {
				iter(this.board[i][j]);
			}
		}
	};
	
	this.setFace = function(str) {
		this.faceElt.setAttribute("class", str);
	}
}

//values of Tile.status
var UNCOVERED = -1;
var COVERED = 0;
var FLAG = 1;
var QUESTION = 2;
var EXCLAMATION = 3;	//not a status per se but used for displaying hints

var WAITING = 0;
var PLAYING = 1;
var OVER = 2;

function Tile(i,j) {
	this.myRow = i;
	this.myCol = j;
	this.tdElt = document.createElement('td');

	var self = this;
	this.tdElt.onclick = function(e) {
		self.leftClick();
	};
	this.tdElt.oncontextmenu = function(e) {
		self.rightClick();
	};

	this.reset();
}

Tile.prototype = {
	reset: function() {
		this.bomb = false
		this.status = COVERED
		this.bombNeighbors = -1;	//unrevealed
		this.setImage( addSize("covered-"), retString("") );
		this.back = {};
	},
	
	rightClick: function(evtObj) {
		//do nothing if game over or already uncovered
		if ( theBoard.game == OVER || this.status == UNCOVERED ) return false;
		if ( this.status == COVERED ) {
			this.setFlag();
// 			theCounter.decrement();
// 			this.status = FLAG;
// 			this.setImage( addSize("covered-"), iconHTML("flag") );
			return false;
		}
		if ( this.status == FLAG ) {	//there could be a setting to go straight back to covered w/o going through ?
			theCounter.increment();
			this.status = QUESTION;
			this.setImage( addSize("covered-"), retString("?") );
			return false;
		}
		if ( this.status == QUESTION ) {
			this.status = COVERED;
			this.setImage( addSize("covered-"), retString("") );
			return false;
		}
		assert(false, "Tile has invalid status: "+this.status);
	},
	
	leftClick: function(evtObj) {
		console.log('mouseclick in tile '+this.myRow+','+this.myCol);
		if ( theBoard.game == WAITING ) {
			theTimer.start();
			theBoard.game = PLAYING;
		}

		//ignore clicks if game over, or on flags or already uncovered
		if ( theBoard.game == OVER || this.status == FLAG || this.status == UNCOVERED ) return;
		
		//save the state for the "Back" button
		theBoard.allTiles( function(t) { t.saveMe() } );
		theBoard.saveNonBombs = theBoard.nonBombs;
		theBoard.saveCounter = theCounter.getVal();
		theControls.backButton.disabled = false;
		
		if ( this.bomb ) {	//oops, you lose
			this.status = UNCOVERED;
			theCounter.decrement();
			this.setImage( addSize("redsquare-"), iconHTML("bomb") );
			//game over, loss
			theBoard.allTiles( function(t) {
				if ( t.status == UNCOVERED ) return;
				if ( t.bomb ) {
					t.setImage( addSize("uncovered-"), iconHTML("bomb") );
				}
				else /*covered non-bomb*/ if (t.status == FLAG) {
					theCounter.increment();		//counter should show only correct guesses
					t.setImage( addSize("uncovered-"), iconHTML("bombx") );
				} 
			} );
			theBoard.endGame(false);	//you lose
		}
		
		else {	//not a bomb
			this.uncoverNonbomb();
		}
	},
	
	uncoverNonbomb: function() {
		assert(!this.bomb, "uncoverNonbomb: tile at ["+i+","+j+"] shouldn't be a bomb, but it is");
		var i;
		
		var neighbors = this.getNeighbors();
		this.bombNeighbors = 0;
		for (i in neighbors) if (neighbors[i].bomb) this.bombNeighbors++;
		
		this.status = UNCOVERED;
		
		if (this.bombNeighbors > 0) {
			this.setImage( addSize( "n" + this.bombNeighbors + " uncovered-" ), retString(""+this.bombNeighbors) );
		}
		else {
			this.setImage( addSize("uncovered-"), retString("") );
		}
		
		theBoard.nonBombs--;
		
		if (theBoard.nonBombs == 0 ) {
			//game over, win
			theBoard.allTiles( function(t) {
				if ( t.status == UNCOVERED ) return;	//don't care about uncovered
				if ( t.status != FLAG ) theCounter.decrement();	//could just set counter to zero but this is fail-safe
				assert(t.bomb, "Player won, but there is a covered non-bomb");
				t.setImage( addSize("covered-"), iconHTML("flag") );
			} );
			theBoard.endGame(true);
			return;
		}
		
		if (this.bombNeighbors > 0) return;
		
		//all neighbors are non-bombs, uncover them
		for ( i in neighbors ) {
			var t = neighbors[i];
			if ( t.status != UNCOVERED ) t.uncoverNonbomb();
		}
	},
	
	setFlag: function() {
		theCounter.decrement();
		this.status = FLAG;
		this.setImage( addSize("covered-"), iconHTML("flag") );
	
	},
	
	//note that the arguments c and h are _functions_ which, when 
	//called with tile size as argument, return the appropriate strings
	//addSize, retStr, and iconHTML below, are function factories, 
	//returning appropriate functions to pass to setImage
	setImage: function(c,h) {
		this.myClass = c;
		this.myHTML = h;
		refreshImage(this);
	},
	
	saveMe:	function() {
		this.back.status = this.status;
		this.back.myHTML = this.myHTML;
		this.back.myClass = this.myClass;
	},
	
	goBack:	function () {
		this.status = this.back.status;
		this.setImage(this.back.myClass,this.back.myHTML);
	},
	
	getNeighbors:	function () {
		var neigh = [];
		var i = this.myRow;
		var j = this.myCol;
		
		addIn( neigh, i-1 , j-1 );
		addIn( neigh, i-1 , j   );
		addIn( neigh, i-1 , j+1 );
		addIn( neigh, i   , j-1 );
		addIn( neigh, i   , j+1 );
		addIn( neigh, i+1 , j-1 );
		addIn( neigh, i+1 , j   );
		addIn( neigh, i+1 , j+1 );
		
		return neigh;

		function addIn( list, i, j ) {
			var x = theBoard.getTile(i,j);
			if (x) list.push(x);
		}
	}
}

function refreshImage(t) {
	t.tdElt.setAttribute( "class", t.myClass(theBoard.tileSize) );
	t.tdElt.innerHTML = t.myHTML(theBoard.tileSize) ;
}

function addSize(str) {
	return function(size) { return str + size ; }
}

function retString(str) {
	return function(size) { return str ; }
}

function iconHTML(name) {
	return function(size) {
		return '<div class="' + name + '-' + size + '"><img src="graphics/' + name + '-' + 
			size + '.png" /></div>';
	}
}

function Counter(element) {
	if (element) this.myElement = document.getElementById(element);
	
	this.show = function() {
		if (this.myValue >= 0) var str = ("00"+Math.min(this.myValue,999)).slice(-3);
		else var str = "-"+("0"+Math.min(-this.myValue,99)).slice(-2);
		this.myElement.textContent = str	//for IE<9, use innerHTML
	}
	
	this.getVal = function() {
		return this.myValue
	}
	
	this.setTo = function(k) {
		this.myValue = k;
		this.show();
	}
	
	this.decrement = function() {
		this.myValue--;
		this.show();
	}
	
	this.increment = function() {
		this.myValue++;
		this.show();
	}
}

function Timer(element) {
	if (element) this.myElement = document.getElementById(element);
	var self = this;
	this.timerFn = function() { self.increment() };
	this.timerObj = null

	this.reset = function() {
		if (this.timerObj) this.stop();
		this.setTo(0);
	}
	
	this.start = function() {
		this.timerObj = window.setInterval(this.timerFn, 1000);
	}
	
// 	this.going = function() {
// 		if (! this.timerObj ) this.start();
// 	}
// 	
	this.stop = function() {
		window.clearInterval(this.timerObj);
		this.timerObj = null;
	}
}

Timer.prototype = new Counter(null)

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
