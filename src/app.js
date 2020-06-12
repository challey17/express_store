require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const { v4: uuid } = require("uuid");

const app = express();
//set up env variables for local and heroku
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(express.json());

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const users = [
  {
    id: "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    username: "sallyStudent",
    password: "c00d1ng1sc00l",
    favoriteClub: "Cache Valley Stone Society",
    newsLetter: "true",
  },
  {
    id: "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    username: "johnBlocton",
    password: "veryg00dpassw0rd",
    favoriteClub: "Salt City Curling Club",
    newsLetter: "false",
  },
];

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("Post request recieved");
});

/*
{
  "username": "String between 6 and 20 characters",
  "password": "String between 8 and 36 characters, must contain at least one number",
  "favoriteClub": "One of 'Cache Valley Stone Society', 'Ogden Curling Club', 'Park City Curling Club', 'Salt City Curling Club' or 'Utah Olympic Oval Curling Club'",
  "newsLetter": "True - receive newsletters or False - no newsletters"
}
*/

app.post("/register", (req, res) => {
  console.log(req.body);
  // const username = req.body.username
  //newsLetter set to false by default so it won't come back
  //undefined if it isn't included in response!
  const { username, password, favoriteClub, newsLetter = false } = req.body;
  //validation, this ONLY CHECKS FOR WHETHER/NOT FIELDS ARE FILLED OUT
  //NOT ANY SPECIFICS I.E. IS THE FORMAT VALID?
  if (!username) {
    return res.status(400).send("Username required");
  }

  if (!password) {
    return res.status(400).send("Password required");
  }

  if (!favoriteClub) {
    return res.status(400).send("favorite Club required");
  }

  // FULL ON VALIDATION OF FORMAT
  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }

  // password length
  if (password.length < 8 || password.length > 36) {
    return res.status(400).send("Password must be between 8 and 36 characters");
  }

  // password contains digit, using a regex here
  //REGEX MISERABLE BULLSHIT
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send("Password must be contain at least one digit");
  }

  const clubs = [
    "Cache Valley Stone Society",
    "Ogden Curling Club",
    "Park City Curling Club",
    "Salt City Curling Club",
    "Utah Olympic Oval Curling Club",
  ];

  // make sure the club is valid, MUST BE IN ABOVE ARRAY
  if (!clubs.includes(favoriteClub)) {
    return res.status(400).send("Not a valid club");
  }

  const id = uuid(); // generate a unique id
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter,
  };

  users.push(newUser);

  res.status(201).location(`http://localhost:8000/user/${id}`).json({ id: id });
});

app.delete("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const index = users.findIndex((u) => u.id === userId);

  // make sure we actually find a user with that id
  if (index === -1) {
    return res.status(404).send("User not found");
  }

  users.splice(index, 1);

  res.status(204).end();
});

app.get("/user", (req, res) => {
  res.json(users);
});

// ERROR HANDLING: SHOW DETAILED ERRORS IN DEVELOPMENT,
// NON DETAILED MESSAGES IN PRODUCTION FOR SECURITY
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
