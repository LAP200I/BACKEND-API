const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const mongodb = require('mongodb');
let cors = require("cors");
app.use(cors());
// decode req.body from form-data
app.use(express.urlencoded({ extended: true }));
// decode req.body from post body message
app.use(bodyParser.json());
app.use(express.json());


const DB_NAME = 'wpr-quiz';
const MONGO_URL = `mongodb://127.0.0.1:27017/${DB_NAME}`; //127.0.0.1
let db = null;
let collection = null;
let attemptCol = null;
async function startServer() {
    // Set the db and collection variables before starting the server.
    const client = await mongodb.MongoClient.connect(MONGO_URL);
    db = client.db("wpr-quiz");
    /**
     * if collection does not exist, it will be created
     * if collection exists, it will be used
     */

    if (db.collection('attempts') == null) {
        db.createCollection('attempts');
    }

    collection = db.collection('questions');
    attemptCol = db.collection('attempts');
    await app.listen(3000);
    console.log('Server started on port 3000');
}
startServer();




//insert question to attempt collection
async function insertQuestion(req, res) {
    //request data:none

    const questions = await collection.find({}).toArray();
    // await attemptCol.drop();
    //delete data from attempts collection before insert
    await attemptCol.deleteMany({});
    //random 10 questions
    var randomQuestions = [];
    for (var i = 0; i < 10; i++) {
        var randomIndex = Math.floor(Math.random() * questions.length);
        randomQuestions.push(questions[randomIndex]);

        const fields = {

            text: questions[randomIndex].text,
            answers: questions[randomIndex].answers,
            correctAnswer: questions[randomIndex].correctAnswer
        }

        await attemptCol.insertOne(fields);
    }
    //all in object question


    var newAttempt1 = {
        _id: new mongodb.ObjectID(),
        startedAt: new Date(),
        completed: false
    };

    var newAttempt = await attemptCol.find({}).toArray();
    //save to db
    const data = {
        'questions': newAttempt,
        '_id': newAttempt1._id,
        'startedAt': newAttempt1.startedAt,
        'completed': newAttempt1.completed
    };
    //insert to db
    res.status(201).json(data);

}
app.post('/attempts', insertQuestion);

//submit attempt
async function submitAnswer(req, res) {
    const questions = await attemptCol.find({}).toArray();
    const id = req.params.id;
    const userAnswers = req.body;
    //correctAnswers 
    const correctAnswers = {};
    for (let i = 0; i < questions.length; i++) {
        correctAnswers[questions[i]._id] = questions[i].correctAnswer;
    }


    //Compute score by comparing user’s answers with the corresponding correct answers for each question. (Max 10 since we have only 10 questions)


    let score = 0;
    for (let i in userAnswers.userAnswers) {
        if (userAnswers.userAnswers[i] == correctAnswers[i]) {
            score++;
        }
    }





    //choose scoreText
    var scoreText = "";
    if (score < 5) {
        scoreText = "Practice more to improve it :D";
    } else if (score < 7) {
        scoreText = "Good, keep up!";
    } else if (score < 9) {
        scoreText = "Well done!";
    } else {
        scoreText = "Perfect!!";
    }

    const data = {
        _id: id,
        questions: questions,
        userAnswers: userAnswers.userAnswers,
        correctAnswers: correctAnswers,
        score: score,
        scoreText: scoreText,
        completed: true
    };
    res.status(200).json(data);
    console.log(data);
}
app.post('/attempts/:id/submit', submitAnswer);