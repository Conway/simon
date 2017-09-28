var pattern; // the correct pattern
var response; // the user's response
var audioContext = new AudioContext();
var width = window.innerWidth; //height of the window
var height = window.innerHeight; //width of the window
var accepting = false; //whether click events should be accepted or not
var round = 1; // the game's round
$(document).on("click", function(e) {
    //registers where clicks happened
    if (!accepting) {
        return;
    }
    var x = e.pageX;
    var y = e.pageY;
    if (x < width / 2 && y < height / 2) {
        flashPanel("red", 600);
        response.push("red");
    } else if (x < width / 2 && y > height / 2) {
        flashPanel("yellow", 600);
        response.push("yellow");
    } else if (x > width / 2 && y < height / 2) {
        flashPanel("blue", 600);
        response.push("blue");
    } else {
        flashPanel("green", 600);
        response.push("green");
    }
    for (var i = 0; i < response.length; i++) {
        //see if the user's answer was correct or not
        if (response[i] != pattern[i]) {
            accepting = false;
            showGameOverModal();
        }
    }
    if (response.length == pattern.length) {
        //final validation and creation of next round
        accepting = false;
        var out = checkResult();
        if (out) {
            response = [];
            round++;
            doRound();
        } else {
            showGameOverModal();
        }
    }
});

/**
 * Shows the welcome modal, and provides instructions for the user.
 */
function showWelcome() {
    $.confirm({
        title: "Welcome",
        content: "Welcome to Simon! Click OK to begin.",
        buttons: {
            OK: function() {
                beginGame();
            },
            instructions: {
                text: "Instructions",
                btnClass: "btn-blue",
                action: function() {
                    $.alert({
                        title: "Instructions",
                        content: "The computer will highlight buttons for you. Remember the order that they are displayed in, and then click them in that order. Click OK to begin.",
                        buttons: {
                            ok: function() {
                                beginGame();
                            }
                        }
                    });
                }
            }
        }
    });
}

/**
 * Plays a tone for a duration
 */
function playTone(tone, duration) {
    let time = duration / 1000;
    var oscillator = audioContext.createOscillator();
    console.log("Frequency " + tone + " played.");
    oscillator.frequency.value = tone;
    oscillator.connect(audioContext.destination);
    oscillator.start(0);
    oscillator.stop(audioContext.currentTime + time);
}

/**
 * Temporarily changes the color of a quadrant for a duration passed to the function
 * This is used to show when a specific panel is clicked on, or selected by the computer
 */
function flashPanel(color, duration = 800) {
    if (
        color != "red" &&
        color != "blue" &&
        color != "green" &&
        color != "yellow"
    ) {
        color = pattern[color];
    }
    var thing = $("#" + color);
    var tone = 0;
    //source of sound frequencies: http://www.waitingforfriday.com/?p=586#Sound_frequencies_and_timing
    switch (color) {
        case "red":
            tone = 209;
            break;
        case "blue":
            tone = 252;
            break;
        case "yellow":
            tone = 310;
            break;
        case "green":
            tone = 415;
            break;
    }
    playTone(tone, duration - 200);
    thing
        .animate({
            opacity: 0.2
        }, duration / 2)
        .animate({
            opacity: 1.0
        }, duration / 2);
}

/**
 * This plays the whole pattern for the human to memorize
 */
function playPattern(flashback = false) {
    var duration = 800; //duration of 1 flash
    for (var i = 0; i < pattern.length; i++) {
        var delayTime = i * duration;
        setTimeout(flashPanel, delayTime, i);
    }
    setTimeout(function() {
        if (!flashback) {
            accepting = true;
        } else {
            showGameOverModal();
        }
    }, duration * pattern.length);
}

/**
 * This generates a random color sequence
 */
function generateRound(number) {
    var choices = ["blue", "red", "yellow", "green"];
    for (var i = 0; i < number; i++) {
        var choice = choices[Math.floor(Math.random() * choices.length)];
        pattern.push(choice);
    }
    console.log(pattern);
}

/**
 * This checks a user's input
 */
function checkResult() {
    for (var i = 0; i < pattern.length; i++) {
        if (pattern[i] != response[i]) {
            return false;
        }
    }
    return true;
}

/**
 * This runs a round of Simon
 */
function doRound() {
    // runs the next round of the current game
    $.alert({
        title: "Round " + round,
        content: "Click OK to begin.",
        buttons: {
            ok: function() {
                generateRound(1);
                playPattern();
            }
        }
    });
}

/**
 * This sets/resets the game variables 
 */
function beginGame() {
    // sets up a new game
    pattern = [];
    round = 1;
    response = [];
    generateRound(3);
    doRound();
}
window.addEventListener("resize", function() {
    width = window.innerWidth;
    height = window.innerHeight;
});

/**
 * This shows the game over modal, and the player's final score
 */
function showGameOverModal() {
    //shows the game over modal and options of what to do next
    $.alert({
        title: "Game Over",
        content: "Sorry, that wasn't the correct answer.",
        buttons: {
            showAnswer: {
                text: "Show Correct Sequence",
                btnClass: "btn-blue",
                action: function() {
                    playPattern(true);
                }
            },
            restart: {
                text: "New Game",
                btnClass: "btn-blue",
                action: function() {
                    showWelcome();
                }
            }
        }
    });
}
showWelcome();
