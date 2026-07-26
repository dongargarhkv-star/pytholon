/* =====================================================
   CODING BATTLE ARENA
   MASTER CHALLENGE ENGINE
   app.js
   Version : 1.0
===================================================== */


/* =====================================================
   GLOBAL CONFIGURATION
===================================================== */

const TOTAL_QUESTIONS = 10;

const STORAGE_KEY = "masterChallengeSession";

const QUESTION_FOLDER = "data/";

const DEFAULT_LEVEL = "hard";

const PASS_PERCENTAGE = 100;


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let pyodide = null;

let player = {};

let session = {};

let questionBank = [];

let sessionQuestions = [];

let currentQuestion = 0;

let currentLevel = DEFAULT_LEVEL;

let timerInterval = null;

let startTime = null;

let editor = null;


/* =====================================================
   SESSION TEMPLATE
===================================================== */

function createEmptySession() {

    return {

        playerName: "",

        level: DEFAULT_LEVEL,

        questions: [],

        answers: {},

        results: {},

        currentQuestion: 0,

        startTime: "",

        endTime: "",

        completed: false,

        timeTaken: 0

    };

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveSession() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(session)

    );

}


function loadSession() {

    let data = localStorage.getItem(STORAGE_KEY);

    if (data) {

        return JSON.parse(data);

    }

    return null;

}


function clearSession() {

    localStorage.removeItem(STORAGE_KEY);

}


/* =====================================================
   PLAYER
===================================================== */

function loadPlayer() {

    if (typeof getPlayer === "function") {

        player = getPlayer();

    }

    else {

        player = {

            name: "Guest"

        };

    }

}


/* =====================================================
   PYODIDE
===================================================== */

async function initializePyodideEngine() {

    try {

        pyodide = await loadPyodide();

        console.log("Pyodide Ready");

    }

    catch (error) {

        console.error(error);

        alert("Unable to load Python Engine");

    }

}


/* =====================================================
   LOAD QUESTION BANK
===================================================== */

async function loadQuestionBank(level = DEFAULT_LEVEL) {

    currentLevel = level;

    let file =

        QUESTION_FOLDER +

        level +

        ".json";


    try {

        let response = await fetch(file);

        questionBank = await response.json();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load Question Bank");

    }

}


/* =====================================================
   SHUFFLE ARRAY
===================================================== */

function shuffle(array) {

    for (

        let i = array.length - 1;

        i > 0;

        i--

    ) {

        let j =

            Math.floor(

                Math.random() *

                (i + 1)

            );

        [array[i], array[j]] =

            [array[j], array[i]];

    }

}


/* =====================================================
   CREATE RANDOM SESSION
===================================================== */

function createRandomQuestionSet() {

    let temp = [...questionBank];

    shuffle(temp);

    sessionQuestions =

        temp.slice(

            0,

            TOTAL_QUESTIONS

        );

}


/* =====================================================
   START NEW SESSION
===================================================== */

function createSession() {

    session = createEmptySession();

    session.playerName = player.name;

    session.level = currentLevel;

    session.questions = sessionQuestions;

    session.currentQuestion = 0;

    session.startTime = Date.now();

    session.completed = false;

    saveSession();

}


/* =====================================================
   RESUME SESSION
===================================================== */

function resumeSession(saved) {

    session = saved;

    sessionQuestions =

        session.questions;

    currentQuestion =

        session.currentQuestion;

}


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

    startTime = Date.now();

    timerInterval =

        setInterval(

            updateTimer,

            1000

        );

}


function updateTimer() {

    let seconds =

        Math.floor(

            (Date.now() - startTime)

            / 1000

        );

    let minutes =

        Math.floor(seconds / 60);

    seconds %= 60;

    let timer =

        document.getElementById(

            "timer"

        );

    if (timer) {

        timer.innerText =

            String(minutes)

                .padStart(2, "0")

            +

            ":"

            +

            String(seconds)

                .padStart(2, "0");

    }

}


/* =====================================================
   AUTO SAVE
===================================================== */

function autoSave() {

    session.currentQuestion =

        currentQuestion;

    saveSession();

}


/* =====================================================
   INITIALIZE MASTER CHALLENGE
===================================================== */

async function initializeMasterChallenge() {

    loadPlayer();

    await initializePyodideEngine();

    await loadQuestionBank(DEFAULT_LEVEL);

    let saved = loadSession();

    if (

        saved &&

        !saved.completed

    ) {

        resumeSession(saved);

    }

    else {

        createRandomQuestionSet();

        createSession();

    }

    startTimer();

    displayQuestion();

}


document.addEventListener(

    "DOMContentLoaded",

    initializeMasterChallenge

);

/* =====================================================
   QUESTION DISPLAY ENGINE
===================================================== */

function displayQuestion() {

    if (sessionQuestions.length === 0) return;

    let question = sessionQuestions[currentQuestion];

    /* Update Header */

    document.getElementById("questionNumber").innerText =
        currentQuestion + 1;

    document.getElementById("totalQuestions").innerText =
        sessionQuestions.length;

    document.getElementById("battleTitle").innerText =
        question.title;

    document.getElementById("questionText").innerText =
        question.caseStudy + "\n\n" + question.statement;

    /* Starter Code */

    let codingArea =
        document.getElementById("codingArea");

    codingArea.innerHTML = `

<textarea
id="codeEditor"
spellcheck="false"
style="
width:100%;
height:350px;
font-family:monospace;
font-size:15px;
padding:15px;
border-radius:10px;
resize:vertical;
">

${question.starterCode}

</textarea>

`;

    restoreAnswer();

    updatePalette();

    updateNavigationButtons();

    updateProgress();

}


/* =====================================================
   SAVE ANSWER
===================================================== */

function saveAnswer() {

    let editor =
        document.getElementById("codeEditor");

    if (!editor) return;

    session.answers[currentQuestion] =
        editor.value;

    autoSave();

}


/* =====================================================
   RESTORE ANSWER
===================================================== */

function restoreAnswer() {

    let editor =
        document.getElementById("codeEditor");

    if (!editor) return;

    if (session.answers[currentQuestion]) {

        editor.value =
            session.answers[currentQuestion];

    }

}


/* =====================================================
   NEXT QUESTION
===================================================== */

function nextQuestion() {

    saveAnswer();

    if (
        currentQuestion <
        sessionQuestions.length - 1
    ) {

        currentQuestion++;

        displayQuestion();

    }

}


/* =====================================================
   PREVIOUS QUESTION
===================================================== */

function previousQuestion() {

    saveAnswer();

    if (currentQuestion > 0) {

        currentQuestion--;

        displayQuestion();

    }

}


/* =====================================================
   JUMP TO QUESTION
===================================================== */

function jumpQuestion(index) {

    saveAnswer();

    currentQuestion = index;

    displayQuestion();

}


/* =====================================================
   QUESTION PALETTE
===================================================== */

function createQuestionPalette() {

    let palette =
        document.getElementById(
            "questionPalette"
        );

    if (!palette) return;

    palette.innerHTML = "";

    for (
        let i = 0;
        i < sessionQuestions.length;
        i++
    ) {

        let button =
            document.createElement("button");

        button.innerText = i + 1;

        button.className = "palette-btn";

        button.onclick = function () {

            jumpQuestion(i);

        };

        palette.appendChild(button);

    }

}


/* =====================================================
   UPDATE PALETTE
===================================================== */

function updatePalette() {

    let buttons =
        document.querySelectorAll(
            ".palette-btn"
        );

    buttons.forEach(function(btn,index){

        btn.classList.remove("current");

        btn.classList.remove("answered");

        if(index===currentQuestion){

            btn.classList.add("current");

        }

        if(session.answers[index]){

            btn.classList.add("answered");

        }

    });

}


/* =====================================================
   PROGRESS
===================================================== */

function updateProgress(){

    let solved =

        Object.keys(

            session.answers

        ).length;

    let percent =

        Math.round(

            solved/

            sessionQuestions.length

            *100

        );

    let progress =

        document.getElementById(

            "progress"

        );

    if(progress){

        progress.innerText=

        percent+"%";

    }

}


/* =====================================================
   NAVIGATION BUTTONS
===================================================== */

function updateNavigationButtons(){

    let previous =

        document.getElementById(

            "previousBtn"

        );

    let next =

        document.getElementById(

            "nextBtn"

        );

    if(previous){

        previous.disabled =

            currentQuestion===0;

    }

    if(next){

        next.disabled=

        currentQuestion===

        sessionQuestions.length-1;

    }

}


/* =====================================================
   AUTO SAVE WHILE TYPING
===================================================== */

document.addEventListener(

"input",

function(e){

    if(

        e.target.id===

        "codeEditor"

    ){

        saveAnswer();

    }

});


/* =====================================================
   BUTTON EVENTS
===================================================== */

document.addEventListener(

"DOMContentLoaded",

function(){

    createQuestionPalette();

    let next=

    document.getElementById(

        "nextBtn"

    );

    let previous=

    document.getElementById(

        "previousBtn"

    );

    if(next){

        next.onclick=

        nextQuestion;

    }

    if(previous){

        previous.onclick=

        previousQuestion;

    }

});

