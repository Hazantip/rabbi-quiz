/**
 *
 * Created by Khazan on 18.05.2016.
 */

const $         = require('jquery');

/**
 * Timer
 * @param duration {number}
 * @param container {jQuery}
 * @constructor
 * Created by Khazan on 18/05/2016.
 */
function Timer(duration, container) {
    this.duration       = duration;
    this.$container     = container;
    this.enabled        = false;
    this.pastTime       = 0;
}

Timer.prototype.run = function() {
    var self = this;
    var time = this.duration / 1000;

    this.enabled = true;
    this.$container.text(time); // print initial time

    this.timerId = setInterval(function go() {
        if (time > 0 && self.enabled === true) {
            time--;
            self.pastTime += 1;
            self.$container.text(time);
        }
    }, 1000);
};

Timer.prototype.stop = function() {
    clearInterval(this.timerId);
    this.enabled = false;
};

Timer.prototype.getPastedTime = function () {
    return this.pastTime;
};



/**
 * @type {*[]}
 */
var questions = [
    {
        q: '../static/img/content/cola.png',
        a: ['#96ceb4', '#ffeead', '#ff6f69', '#ffcc5c'],
        c: ['#ff6f69']
    },
    {
        q: '../static/img/content/levis.png',
        a: ['#96ceb4', '#ffeead', '#ff6f69', '#ffcc5c'],
        c: ['#ff6f69']
    }/*,
    {
        q: '../static/img/content/mars.jpg',
        a: ['#96ceb4', '#ffeead', '#ff6f69', '#ffcc5c'],
        c: ['#ff6f69']
    },
    {
        q: '../static/img/content/oracle.png',
        a: ['#96ceb4', '#ffeead', '#ff6f69', '#ffcc5c'],
        c: ['#ff6f69']
    },
    {
        q: '../static/img/content/adobe.png',
        a: ['#96ceb4', '#ffeead', '#ff6f69', '#ffcc5c'],
        c: ['#ff6f69']
    },
    {
        q: '../static/img/content/hm.jpg',
        a: ['#96ceb4', '#ffeead', '#ff6f69', '#ffcc5c'],
        c: ['#ff6f69']
    }*/

];



/**
 * QUIZ
 * @param container - {jQuery}
 * @param params - {object} - settings
 * @constructor
 */
function Quiz(container, params) {
    // extending with parameters
    this.params = $.extend(true, {}, this.defaultParams, params);
    // main
    this.$container          = container;
    this.position            = 0;
    // results
    this.totalPastedTime     = 0;
    this.results             = [];
    this.timer               = null;
    // params
    this.questionsArr        = this.params.questions;
    this.quiestionsArrLenght = this.questionsArr.length;
    this.timerDuration       = this.params.timerDuration;
    this.waitingTime         = this.params.waitingTime;
    this.signatureLink       = this.params.signatureLink;
    this.onAfterEnd          = this.params.onAfterEnd || null;
    // Run
    this.init();
}

/**
 * Default configuration (parameters)
 * @type {{timerDuration: number, waitingTime: number}}
 */
Quiz.prototype.defaultParams = {
    timerDuration: 10000,
    waitingTime: 3000,
    signatureLink: 'http://rabbi.co.il'
};

/**
 * Main function with all logic
 * @private
 */
Quiz.prototype._printQuestions = function () {

    let self = this;

    let cur = this.questionsArr[this.position];
    let curQ = cur.q;
    let curA = cur.a;
    let curC = cur.c;
    let curResults = {
        question: curQ,
        answer: null,
        correct: null,
        pastTime: 0
    };

    let questionsContainer      = this.$container.find('.quiz__question');
    let answersContainer        = this.$container.find('.quiz__answers');
    let resultsContainer        = this.$container.find('.quiz__results');
    let timerContainer          = this.$container.find('.quiz__timer');

    // *********
    // PRINTING:
    // *********

    // PRINT QUESTION
    questionsContainer.html(`<img src="${curQ}" alt="brand"/>`);
    // PRINT ANSWERS
    this._printAnswers(answersContainer, curA);
    questionsContainer.removeClass('active');
    // PRINT TIMERS
    this.timer = new Timer( self.timerDuration, timerContainer );
    this.timer.run();


    //
    /**
     * Get answer and push results
     */
    $('.quiz__answers .item input').on("change", function(e) {

        let el = $(event.target);
        let val = event.target.value;
        let correct = val == curC;

        // stop timer
        self.totalPastedTime += self.timer.pastTime;
        self.timer.stop();

        // disable inputs
        answersContainer.find('.item input').prop('disabled', true);

        // set question colored
        questionsContainer.addClass('active');

        // get active current choice
        // el.parent().addClass('active').siblings().removeClass('active');

        if ( correct ) {
            console.log('Correct');
            el.parent().addClass('correct animated flip');
        } else {
            console.log('Incorrect');
            el.parent().addClass('incorrect animated shake');
            answersContainer.find('input[value="'+curC+'"]').parent().addClass('correct');
        }

        pushResults(val, correct);
    });

    /**
     * PUSH RESULTS && NEXT STEP
     * @param answer - {string}
     * @param correct - {boolean}
     */
    function pushResults(answer, correct) {
        // PUSH RESULTS
        curResults.question = curQ;
        curResults.answer   = answer;
        curResults.correct  = correct;
        curResults.pastTime += self.timer.getPastedTime();
        self.results.push( curResults );

        // NEXT
        if ( self.questionsArr[self.position + 1] ) {
            self.position++;
            setTimeout(function() {
                self._printQuestions();
            }, self.waitingTime);
        } else {
            self.end = true;
            setTimeout(function() {
                self.$container.find('.quiz__inner').fadeOut(2000).promise().done(function () {
                    printResults();
                    self.onAfterEndCallback();
                });
            }, self.waitingTime);
        }
    }

    /**
     * Print to DOM results
     */
    function printResults() {
        console.log(self, 'Total question: ' + self.quiestionsArrLenght);
        console.log(self.results);
        self.$container.addClass('quiz-done').find( resultsContainer ).html(
            `<p>Results: ${getTotalCorrect(self.results)}\\${self.quiestionsArrLenght}</p>
             <p>Total spent time ${self.totalPastedTime}</p>
             <p><a href="${self.signatureLink}" target="_blank">${self.signatureLink.replace(/.*?:\/\//g, "")}</a></p>`
        );
    }

    /**
     *
     * @param arr - {array}
     * @returns {number}
     */
    function getTotalCorrect(arr) {
        let totalCorrect = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].correct) {
                totalCorrect += 1;
            }
        }
        return totalCorrect;
    }

};

/**
 * Print to DOM answers of every question
 * @param aContainer - {jQuery}
 * @param aArr - {array} - array of answers
 * @private
 */
Quiz.prototype._printAnswers = function(aContainer, aArr) {
    aContainer.empty();
    aArr.map(function(el, i){
        aContainer.append(
            `<div class="item" style="background-color: ${el};">
                    <input type="radio" name="quiz" id="quiz-${i+1}" value="${el}">
                    <label for="quiz-${i+1}"></label>
            </div>`
        );
    });
};

/**
 * Callback function which runs after end of the quiz;
 * Function executed inside pushResults();
 */
Quiz.prototype.onAfterEndCallback = function() {
    var self = this;
    if ( self.onAfterEnd && $.isFunction( self.onAfterEnd ) ) {
       self.onAfterEnd();
    } else {
        console.log('callback not a function...')
        
    }
};

/**
 * Restart with from scratch
 */
Quiz.prototype.restart = function() {
    console.log('Restart..');
    this.results            = [];
    this.end                = false;
    this.position           = 0;
    this.totalPastedTime    = 0;

    this.timer.stop(); // clear timer

    this.$container.removeClass('quiz-done').find('.quiz__inner').fadeIn(600);

    this.init();
};

/**
 * Initialization
 */
Quiz.prototype.init = function() {
    this._printQuestions();
};


$(document).ready(function() {

    var demo = new Quiz( $('.quiz-1'), {
        questions: questions,
        onAfterEnd: function() {
            console.log('onAfterEndCallback runs...');
        }
    });

    // var demo2 = new Quiz( $('.quiz-2'), {
    //     questions: questions
    // });

    $('.quiz__restart').on('click', function() {
        demo.restart();
    });

});

