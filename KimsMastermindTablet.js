
/**********************************************************************************
*   This code is based on a program I wrote on Khan Academy.
*   It has been modified to work on your own site.
***********************************************************************************/
var canvasWidth=400, canvasHeight=500;
// Make sure your code includes this line to setup a 400x400 pixel canvas
void setup() { 
  size(canvasWidth, canvasHeight); 
} 
var printText=[];
var colHeight = 50;
var guessHeight = round(colHeight/3);
var guessWidth = guessHeight;
var codeLength=6;
var code2guess = Array(codeLength);
var win = false;
var maxSteps=2*codeLength;
var endGame=false;
var spacing = 10;
var numCol;
var canvasCol=color(200,100,0);
var cWhite = color(255,255,255);
var cBlack = color(0, 0, 0);
var cGray = color(200, 200, 200);
var cRed = color(255,0,0);
var cGreen = color(0,255,0);
var currentGuess = [];
var resultShow=false;
var currentGuessPos =  0;
var startGuessPosX=spacing + 100;
var startGuessPosY=spacing+15;
var lastGuessPosY=0;
var guesses=[];
var buttons=[];
var guessButtons=[];
var noDelay = true;

var guessResult=function(guess, spotOn, spotted){
    this.guess=guess;
    this.spotOn=spotOn;
    this.spotted=spotted;
};
var bTypeColor=0,bTypeReset=1,bTypeSubmit=2,bTypeGuess=3;
var actionCols = [{name:" Reset",rgb:color(200, 200, 200),contrast:cBlack},{name:" Check",rgb:color(200, 200, 200),contrast:cBlack},{name:" Guess",rgb:color(cWhite),contrast:cBlack}];
var cols = [
        {name:"  Red",rgb:color(255, 0, 0), contrast:color(0,255,255)},
        {name:"  Blue",rgb:color(0, 0, 255), contrast:color(255,255,0)},
        {name:" Green",rgb:color(0, 255, 0), contrast:color(255,0,255)},
        {name:"  Black",rgb:color(0, 0, 0), contrast:color(255,255,255)},
        {name:" Yellow",rgb:color(255, 255, 0), contrast:color(0,0,255)},
        {name:"Orange",rgb:color(255, 128, 0), contrast:color(0,50,255)},
        {name:"   Pink",rgb:color(255, 0, 255), contrast:color(0,255,0)},
        {name:"  Gray",rgb:color(200, 200, 200), contrast:color(0,100,0)}];

var Button = function(posX,posY,col,bWidth,bHeight,bType) {
    this.name = col.name;
    this.bContrast=col.contrast;
    this.rgb = col.rgb;
    this.posX=round(posX);
    this.posY=round(posY);
    this.bWidth=bWidth;
    this.bHeight=bHeight;
    this.bType=bType;
    this.active=false;
    buttons.push(this);
};

Button.prototype.draw= function(title) {
    fill(this.rgb);
    rect(this.posX,this.posY,this.bWidth,this.bHeight);
    fill(this.bContrast);
    textSize(15);
    text(title,this.posX,this.posY+this.bHeight-3);
};

Button.prototype.select = function(){
    stroke(255, 255, 255);
    this.draw();
};

Button.prototype.hit = function(x,y){
    var isHit=false;
    if (this.active){

        if (this.posX <= x && x <= (this.posX+this.bWidth) && this.posY <= y && y <= (this.posY + this.bHeight)){
            isHit=true;
            return isHit;
        }
    }
};

var GuessButton = function(x,y,col,bWidth,bHeight){
    Button.call(this,x,y,col,bWidth,bHeight,bTypeGuess);
};

var ColorButton = function(x,y,col,bWidth,bHeight){
    Button.call(this,x,y,col,bWidth,bHeight,bTypeColor);
};

var ResetButton = function(x,y,col,bWidth,bHeight){
    Button.call(this,x,y,col,bWidth,bHeight,bTypeReset);
};

var SubmitButton = function(x,y,col,bWidth,bHeight){
    Button.call(this,x,y,col,bWidth,bHeight,bTypeSubmit);
};

var makeListColors = function(){
    var col, baseWidth, baseHeight, posY;
    var numCols = cols.length;
    var button;
    baseWidth = canvasWidth/numCols;
    baseHeight=colHeight;
    posY = canvasHeight - baseHeight;
    for (var i = 0; i < numCols; i++){
        col = cols[i];
        button=new ColorButton(i*baseWidth,posY,col,colHeight,colHeight);
        button.active=true;
    }    
};

var drawColors = function(){
    var col;
    var numCols = cols.length;
    for (var i = 0; i < numCols; i++){
        col = cols[i];
        buttons[i].draw(buttons[i].name);
    }
};

var newCode = function() {
    //make a random code to guess
    var code = [];
    var tal;
    for (var i=0;i<codeLength;i++){
    	tal=round(random(-0.5,7.5));
    	if (tal===8){i--;}
    	else {code[i]=tal;}
    }
    return code;
};

var drawCode = function(){
    //draw code to guess
    var codeX,codeY;
    for (var i = 0; i < code2guess.length; i++){
        codeX = startGuessPosX + i*(guessWidth+spacing);
        codeY = startGuessPosY;
        fill(cols[code2guess[i]].rgb);
        rect(codeX,codeY,guessWidth,guessHeight);
    }
    fill(0, 0, 0);
    strokeWeight(4);
//    line(0,guessHeight+startGuessPosY + 0.5*spacing,codeLength*(spacing+guessWidth)+spacing,guessHeight+startGuessPosY + 0.5*spacing);
    line(0,guessHeight+startGuessPosY + 0.5*spacing,canvasWidth,guessHeight+startGuessPosY + 0.5*spacing);
    strokeWeight(1);
};

var returnButton = function(x,y){
    // if button is hit, return set button
    var button=null;
        for (var i = 0; i < buttons.length; i++){
        if (buttons[i].hit(x,y)){
            button=[buttons[i],i];
        }
    }
	return button;
};

var evaluate = function(origCode,newCode){
    //find out how many colors are placed right (spotOn)
    //and how many are only the right colors
    var spotOn=0, isColor=0, result=[0,0], origC=[], newC=[];
    for (var i = 0; i < origCode.length; i++){
        if (origCode[i]===newCode[i]){
            spotOn++;
        }
        else {
            origC.push(origCode[i]);
            newC.push(newCode[i]);
        }
        result[0]=spotOn;
    }
    for (var i= 0; i < origC.length; i++){
        for(var k = 0; k < newC.length; k++){
            if (origC[i]===newC[k]){
		    origC[i]=-1;
                newC.splice([k], 1);
                isColor++;
            }
        }
    }
    result[1]=isColor;
    return result;
};
var initGuess = function(){
    //make the current guess line of buttons
    var guess;
    var posX;
    var button;
    for (var i = 0; i < codeLength;i++){
        posX=startGuessPosX+startGuessPosX*i;
        button = new GuessButton(startGuessPosX,startGuessPosY,actionCols[2],guessWidth,guessHeight);
        button.name = i;
        guessButtons.push(button);
        button.active=true;
    
    }
};

var resetGuess = function(){
    //get the guess line reset
    for (var i = 0; i < guessButtons.length; i++){
        guessButtons[i].rgb=cWhite;
        currentGuessPos=0;
    }
};

var  mouseEvent = function(x,y){
    //handle what happens when a button is pushed
    var b;
    b = returnButton(x,y);
	if (b!==null){
    if (b[0].bType===bTypeReset){
        //the reset button resets the game
	guesses=[];
        endGame=false;
	code2guess = newCode();
	win=false;
    }
    if (!endGame){
        if (b[0] instanceof Button){
		if (b[0].bType===bTypeColor){
                numCol=b[1];
                currentGuess[currentGuessPos] = numCol;
                currentGuessPos++;
                if (currentGuessPos === codeLength){currentGuessPos=0;}
            }
            if (b[0].bType===bTypeGuess){
                currentGuessPos=b[0].name;
            }
            //code guess sent from user
            else if (b[0].bType===bTypeSubmit){
                fill(cWhite);
                var result=evaluate(code2guess,currentGuess);
                guesses.push(new guessResult(currentGuess,result[0],result[1]));
                resetGuess();
		currentGuess=[];
		    //if the code is guessed, the game ends with a win
                if (result[0]===codeLength){
                    endGame=true;
                    win=true;
                }
                
                //if the max number of guesses is reached, the game is ended with a lose
                if (guesses.length===maxSteps){endGame=true;}
                
            }
        }
    }
	}
};

var printFunc = function() {
        fill(240, 255, 203);
        textSize(30);
        text("Kims Mastermind", spacing,25);    
    for (var i = 0; i < printText.length; i++){
        fill(cWhite);
        text(printText[i], 200,250+i*25);
    }
};

var drawGuess = function(){
    var guessX, guessY;

    //draw guess
    for (var i = 0; i < code2guess.length; i++){
        try{
            guessButtons[i].rgb=cols[currentGuess[i]].rgb;

        }
        catch(e){}
        //guessButtons[i].rgb=cWhite;
        guessButtons[i].posX = i*(guessWidth+spacing)+startGuessPosX;
        guessButtons[i].posY = startGuessPosY + (guesses.length+1)*(guessHeight+spacing);
        guessButtons[i].draw();
            
            //draw circle arround current guess position
        if (i === currentGuessPos) {
            noFill();
            strokeWeight(3);
            stroke(cWhite);
            ellipse(guessButtons[i].posX+round(guessWidth/2),guessButtons[i].posY + round(guessHeight/2) ,26,26);
            strokeWeight(2);
            stroke(cBlack);
        }
    }
};

var showGuesses = function(){
    var guessX, guessY;

    for (var i = 0; i < guesses.length; i++){
        guessY=startGuessPosY + (i+1)*(guessHeight + spacing);
	    lastGuessPosY=guessY;
        for (var k = 0; k < code2guess.length; k++){
            try{
            fill(cols[guesses[i].guess[k]].rgb);
            }
            catch(e){fill(cWhite);}
            guessX = k*(guessWidth+spacing)+startGuessPosX;
            rect(guessX,guessY,guessWidth,guessHeight);
        }
            fill(cGreen);
//            try{text("guessed " + guesses[i].spotOn + ", colors  " + guesses[i].spotted, 150, guessY+guessHeight);}catch(e){}
            try{text(guesses[i].spotOn, spacing, guessY+guessHeight);}catch(e){}
	    fill(cWhite);
	    try{text(", " + guesses[i].spotted, (spacing*2), guessY+guessHeight);}catch(e){}
	    fill(cBlack);
	    try{text(": (" + (guesses[i].spotted+guesses[i].spotOn) +")", (spacing*4), guessY+guessHeight);}catch(e){}

}
};

var showResult = function(){
fill(24, 255, 255);
    if (win){
        textSize(30);
        text(" You win in step: " + guesses.length, 10,lastGuessPosY + spacing + guessHeight + 20);
    }
    else{
        textSize(30);
        text("Game over! You lose!", 10,lastGuessPosY + spacing + guessHeight + 20);
    }
};

code2guess = newCode();
GuessButton.prototype=Object.create(Button.prototype);
ColorButton.prototype=Object.create(Button.prototype);
ResetButton.prototype=Object.create(Button.prototype);
SubmitButton.prototype=Object.create(Button.prototype);
makeListColors();
initGuess();

var reset=new ResetButton(400-4*guessWidth-spacing,spacing,actionCols[0],4*guessWidth,1.5*guessHeight);
//var reset=new ResetButton(400-4*guessWidth-spacing,(2*spacing) + guessHeight,actionCols[0],4*guessWidth,1.5*guessHeight);

var submit=new SubmitButton(reset.posX,reset.posY,actionCols[1],reset.bWidth,reset.bHeight);


void draw() { 
    var b;
    background(200, 100, 0);
//	drawCode();
	drawColors();
	showGuesses();
    	printFunc();

	if (endGame){
        drawCode();
        showResult();
        reset.draw(reset.name);
        reset.active=true;
        submit.active=false;
	}
    
    if (!endGame){
        drawGuess();
        submit.draw(submit.name + " " + guesses.length);
        reset.active=false;
        submit.active=true;
    }
};
void delay() {
	noDelay = true;
}
void mouseClicked() {
	if (noDelay) {
		noDelay = false;
		mouseEvent(mouseX,mouseY);
		setTimeout(delay, 500);
	}
};
