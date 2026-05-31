const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Result = require("./models/Result");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/onlineexam")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const questions = [
  {
    question: "HTML stands for?",
    options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool Markup Language", "None"],
    answer: "Hyper Text Markup Language"
  },
  {
    question: "CSS is used for?",
    options: ["Database", "Styling", "Server", "Compiler"],
    answer: "Styling"
  },
  {
    question: "React is used for?",
    options: ["Frontend", "Backend", "Database", "OS"],
    answer: "Frontend"
  },
  {
    question: "MongoDB stores data in?",
    options: ["Tables", "Documents", "Rows", "Files only"],
    answer: "Documents"
  },
  {
    question: "Node.js is used for?",
    options: ["Backend", "CSS", "HTML", "Image Editing"],
    answer: "Backend"
  }
];

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    return res.json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword
  });

  await user.save();

  res.json({ message: "Registration successful" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: "Invalid password" });
  }

  res.json({
    success: true,
    message: "Login successful",
    user: {
      name: user.name,
      email: user.email
    }
  });
});

app.get("/questions", (req, res) => {
  const safeQuestions = questions.map((q) => {
    return {
      question: q.question,
      options: q.options
    };
  });

  res.json(safeQuestions);
});

app.post("/submit-exam", async (req, res) => {
  const { studentName, email, answers } = req.body;

  let score = 0;

  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].answer) {
      score++;
    }
  }

  const result = new Result({
    studentName,
    email,
    score,
    total: questions.length,
    answers
  });

  await result.save();

  res.json({
    message: "Exam submitted successfully",
    score,
    total: questions.length
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});