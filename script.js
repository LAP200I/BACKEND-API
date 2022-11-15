let screen1 = document.getElementById("introduction");
let screen2 = document.getElementById("attempt-quiz");
let screen3 = document.getElementById("review-quiz");

//fetch API and call method to display data
async function displayForm() {
    let startScreen = document.querySelector("#introduction");
    if (startScreen.style.display === "none") {
        startScreen.style.display = "block";
    } else {
        startScreen.style.display = "none";
    }
    const res = await fetch("http://localhost:3000/attempts/", { method: "POST" });
    let data = await res.json();
    console.log(data);
    const quesId = [];
    const quesSubmitted = [];
    const answerData = [];
    const answerInput = [];

    showAttemptView(data.questions);

    //add highlight event to labels
    document.querySelectorAll(".option").forEach((ans) => {
        ans.addEventListener("click", onSelectedAns);
    });

    document.querySelectorAll(".input-option").forEach((ansInput) => {
        if (ansInput.value == 0) {
            answerInput.push(ansInput.parentNode.parentNode);
        }
    });

    const submitBtn = document.querySelector("#btn-submit");
    submitBtn.addEventListener("click", function onSubmitBtn() {
        for (let i = 0; i < answerInput.length; i++) {
            for (let j = 0; j < answerInput[i].children.length; j++) {
                let chosenAnswer = answerInput[i].children[j].children[0];
                if (chosenAnswer.checked === true) {
                    quesId.push(answerInput[i].id);
                    quesSubmitted.push(answerInput[i]);
                    answerData.push(chosenAnswer.value);
                }
            }
        }
        alert("You have submitted your answers!");

        //hide attempt view then show review view
        if (screen2.style.display === "none") {
            screen2.style.display = "block";
            screen3.style.display = "none";
        } else {
            screen1.style.display = "none";
            screen2.style.display = "none";
            screen3.style.display = "block";
        }
        //create the object to pass in as json body
        let object = { userAnswers: {} };
        for (let i = 0; i < answerData.length; i++) {
            object.userAnswers[quesId[i]] = answerData[i];
        }

        fetch("http://localhost:3000/attempts/" + data._id + "/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(object),
            })
            .then((res) => {

                return res.json();
            })
            .then((reviewData) => showReviewQuiz(reviewData, quesSubmitted));

    });

}



//start quiz
const btnStart = document.querySelector("#btn-start");
btnStart.addEventListener("click", displayForm);

//create the attempt quiz view
const showAttemptView = (questions) => {
    const quesContainer = document.querySelector("#attempt-quiz");
    const formSection = document.createElement("form");
    formSection.className = "attempt-quiz-questions";
    formSection.method = "POST";

    questions.forEach((question, index) => {
        let h = 0;
        index = index + 1;
        const questionSection = document.createElement("div");
        questionSection.innerHTML = `<div class = "question" >
            <div class = ""question-index>
                <h2>Question ${index} of 10</h2>
            </div>
            <div class = "question-text"></div>
            <div class = "answer answer-wrap${index}" id = "${question._id}">
            </div>
        </div>`;

        questionSection.querySelector(".question-text").innerHTML = question.text;

        let optionContainer = questionSection.querySelector(".answer");

        question.answers.forEach((answer, k) => {
            k = k + 1;
            const optionSection = document.createElement("div");
            optionSection.className = "answer-radio";
            optionSection.innerHTML = `<input type="radio" id="q${index}${k}" name="question${index}" class = "input-option" value="${h}"/>
        <label for="q${index}${k}" class="option option-unselected"></label>`;
            optionSection.querySelector(".option").innerText = answer;
            optionContainer.appendChild(optionSection);
            h = h + 1;
        });

        formSection.appendChild(questionSection);
    });

    //   create submit box
    const submitSection = document.createElement("div");
    submitSection.id = "box-submit";
    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.id = "btn-submit";
    submitBtn.textContent = "Submit your answers ❯";
    submitSection.appendChild(submitBtn);
    formSection.appendChild(submitSection);
    quesContainer.appendChild(formSection);
    let formAttempt = document.querySelector(".attempt-quiz-questions");
    formAttempt.scrollIntoView(true);
};

//function to highlight clicks
function onSelectedAns(event) {
    const label = event.currentTarget;
    const getDiv = label.parentNode.parentNode;
    const selected = getDiv.querySelector(".option-selected");
    if (selected) {
        selected.classList.add("option-unselected");
        selected.classList.remove("option-selected");
    }
    label.classList.add("option-selected");
    label.classList.remove("option-unselected");
}

const tryAgainBtn = document.createElement("button");
//create the review view
const showReviewQuiz = (reviewData, quesSubmitted) => {
    const reviewContainer = document.querySelector("#review-quiz");
    const formSection = document.createElement("form");
    formSection.className = "review-quiz-questions";
    const resultSection = document.createElement("div");
    const answerInput = document.querySelectorAll(".input-option");
    let checkedIndex = [];

    answerInput.forEach((ans) => {
        if (ans.checked === true) {
            ans.classList.add("checked");
        }
    });
    for (let i = 0; i < answerInput.length; i++) {
        if (answerInput[i].classList.contains("checked")) {
            checkedIndex.push(i);
        }
    }

    reviewData.questions.forEach((question, index) => {
        let h = 0;
        index = index + 1;
        const reviewQuestionSection = document.createElement("div");
        reviewQuestionSection.id = "attempt";
        reviewQuestionSection.innerHTML = `<div class = "question">
        <div class = "question-index-r">
            <h2>Question ${index} of 10</h2>
        </div>
        <div class = "question-text-r"></div>
        <div class = "answer-r answer-wrap${index}-r">
        </div>
    </div>`;

        reviewQuestionSection.querySelector(".question-text-r").innerHTML = question.text;

        let reviewOptionContainer = reviewQuestionSection.querySelector(".answer-r");

        question.answers.forEach((answer, k) => {
            k = k + 1;
            const optionSection = document.createElement("div");
            optionSection.className = "answer-radio";
            optionSection.innerHTML = `<input type="radio" id="r${index}${k}" name="review${index}" class = "input-option-r" value="${h}" />
        <label for="r${index}${k}" class="option-r option-unselected"></label>`;
            optionSection.querySelector(".option-r").innerText = answer;
            reviewOptionContainer.appendChild(optionSection);
            h = h + 1;
        });

        // create result box

        resultSection.id = "box-result";
        resultSection.innerHTML = `<h2>Result</h2>
    <div class="score">${reviewData.score}/10</div>
    <h4>${(reviewData.score / 10) * 100}%</h4>
    <div class="review">${reviewData.scoreText}</div>`;

        // create try again button
        tryAgainBtn.type = "button";
        tryAgainBtn.id = "btn-try-again";
        tryAgainBtn.textContent = "Try again";
        resultSection.appendChild(tryAgainBtn);
        formSection.appendChild(reviewQuestionSection);
    });
    reviewContainer.appendChild(formSection);
    reviewContainer.appendChild(resultSection);

    let formReview = document.querySelector(".review-quiz-questions");
    formReview.scrollIntoView(true);

    //   design correct, incorrect answer
    const answerReview = document.querySelectorAll(".input-option-r");

    // disable all the text
    for (let i = 0; i < answerReview.length; i++) {
        answerReview[i].disabled = true;
        // add checked to the chosen answer in previous screen
        for (let j = 0; j < checkedIndex.length; j++) {
            if (i === checkedIndex[j]) {
                answerReview[i].checked = true;
                answerReview[i].classList.add("checked-r");
            }
        }
    }

    const checkedValue = document.querySelectorAll(".checked-r");
    let object = {};
    for (let i = 0; i < quesSubmitted.length; i++) {
        object[quesSubmitted[i].id] = checkedValue[i];
    }

    const allQuestions = {};
    let allAnswers = document.querySelectorAll(".answer-r");
    for (let i = 0; i < allAnswers.length; i++) {
        allQuestions[reviewData.questions[i]._id] = allAnswers[i];
    }

    //Add class to the labels if the answer was wrong or right
    let correctAnswers = reviewData.correctAnswers;
    for (let i in correctAnswers) {
        for (let j in object) {
            if (i == j) {
                if (correctAnswers[i] == object[j].value) {
                    let answer = object[j].nextElementSibling;
                    answer.className = "option option-unselected correct-answer";
                } else {
                    let answer = object[j].nextElementSibling;
                    answer.className = "option option-unselected wrong-answer";
                }
            }
        }
        //Give correct answer grey color if not checked
        for (let j in allQuestions) {
            for (let k = 0; k < allQuestions[j].children.length; k++) {
                if (i == j) {
                    if (correctAnswers[i] == k) {
                        let correctAnswer = allQuestions[j].children[k].children[0];
                        if (correctAnswer.checked === false) {
                            let correct = correctAnswer.nextElementSibling;
                            correct.className = "option-r option-unselected-r option-correct";
                        }
                    }
                }
            }
        }
    }
};

//try again function
tryAgainBtn.addEventListener("click", function onTryAgainBtn() {
    screen1.style.display = "block";
    screen2.style.display = "block";
    screen2.innerHTML = "";
    screen3.innerHTML = "";
});