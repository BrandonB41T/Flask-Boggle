from flask import Flask, request, render_template, session, redirect, jsonify
from boggle import Boggle

app = Flask(__name__)

app.config['SECRET_KEY'] = "quiet!"
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

boggle_game = Boggle()

@app.route("/")
def home():
    """Show gameboard and main info, set score to 0."""
    session['score'] = 0
    played = session.get('numplayed', 0)
    highscore = session.get('highscore', 0)
    
    board = boggle_game.make_board()
    session["board"] = board
    return render_template("base.html", board=board, score=0, highscore=highscore, played=played)

@app.route("/check-word")
def check_word():
    word = request.args["word"]
    board = session["board"]
    result = boggle_game.check_valid_word(board, word)

    if result == "ok":
        session['score'] += len(word)

    return jsonify({'result': result})

@app.route("/trackers")
def handle_trackers():
    """Handles all tracked game stats and returns new id"""
    played  = session.get('numplayed', 0)
    played += 1
    session['numplayed'] = played

    # update highscore if necessary
    highscore = session.get('highscore', 0)
    if session['score'] > highscore:
        session['highscore'] = session['score']

    gameid = int(request.args["gamenum"]) + 1
    return jsonify({'id': gameid})


@app.route("/new-board", methods=['GET'])
def make_new_board():
    """Resets score, and redirects to home, generating new board"""
    session['score'] = 0
    return redirect('/')