class Boggle {
    constructor(gameNum, secs=60) {
        this.score = 0;
        this.secs = secs;
        this.wordsGuessed = [];
        this.gameNum = gameNum;
        this.startTimer(secs);
    }

    // adds "new game" button next to submit button after a delay (1.5s)
    showNewGameButton() {
        setTimeout(function() {
            $('.new-game-btn').show();
        }, 1500)
    }

    // creates and handles timer
    startTimer(seconds) {
        let timeRemaining = seconds;
      
        const timer = setInterval(() => {
            if (timeRemaining <= 0) {
                $(".timer").text(timeRemaining);
                clearInterval(timer);
                this.showNewGameButton();
                $(".message-box").text(`You earned a score of ${this.score}.`);

                // disable input box when time runs out
                $("#guess-input").prop("disabled", true).val("");
            } else {
                $(".timer").text(timeRemaining);
                timeRemaining--;
            }
        }, 1000);
    }

    // function that updates message box text and adds words to list
    showMessage(word, result="ok") {
        // create capitalized version of word (for purpose of UI)
        const capped = word.charAt(0).toUpperCase() + word.slice(1);

        const $messageBox = $(".message-box");
        if (result === "ok"){
            // check to see if the word has already been guessed and added
            if(this.wordsGuessed.includes(word)){
                $messageBox.text(`"${capped}" already added`);
                return;
            }
            // add word (capitalized) to list and tell user
            $messageBox.text(`Added "${capped}" to list`);
            const li = $(`<li>${capped}</li>`);
            $(".words-found").append(li);

            // push word to wordsGuessed array
            this.wordsGuessed.push(word)
        }
        else if (result === "not-on-board"){
            $messageBox.text(`"${capped}" is not a valid word on this board`)
        }
        else {
            $messageBox.text(`"${word}" is not a word`);
        }
    }

    async handleGuess(evt) {
        evt.preventDefault();
        const word = $("#guess-input").val();
    
        if (!word) return;
        
        const response = await axios.get("/check-word", { params: { word: word }});

        // if word is valid and hasn't been guessed already, update score
        if (response.data.result === "ok" && !(this.wordsGuessed.includes(word))) {
            this.score += word.length;
            $("#score").text(`Score: ${this.score}`);
        }

        // show message based on response, reset and focus on input
        this.showMessage(word, response.data.result);
        $("#guess-input").val("");
        $("#guess-input").focus();
    }

    refreshBoggle() {
        this.score = 0;
        this.wordsGuessed = [];
    }

    async startNewGame(evt) {
        const response = await axios.get("/trackers", { params: { 
            score: this.score, gamenum: this.gameNum, 
        }});
       
        this.gameNum = response.data.id
        this.refreshBoggle();
        this.startTimer(this.secs);
    }
}

// create game and add event listeners for buttons
const boggleGame = new Boggle(6, 50);

$("#guess-form").on("click", ".enter", boggleGame.handleGuess.bind(boggleGame));
$("#guess-form").on("click", ".new-game-btn", boggleGame.startNewGame.bind(boggleGame));

// add event listener to window that handles a guess if the user presses the enter key
$(document).ready(function() {
    $(window).keydown(function(event){
      if(event.keyCode == 13) {
        boggleGame.handleGuess(event);
        return false;
      }
    });
});