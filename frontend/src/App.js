import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [page, setPage] = useState("register");
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [loggedUser, setLoggedUser] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [time, setTime] = useState(60);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const register = async () => {
    const res = await axios.post("http://localhost:5000/register", user);
    alert(res.data.message);
    setPage("login");
  };

  const login = async () => {
    const res = await axios.post("http://localhost:5000/login", user);

    if (res.data.success) {
      setLoggedUser(res.data.user);
      setPage("exam");
      startExam();
    } else {
      alert(res.data.message);
    }
  };

  const startExam = async () => {
    const res = await axios.get("http://localhost:5000/questions");
    setQuestions(res.data);
    setAnswers(new Array(res.data.length).fill(""));
  };

  const selectAnswer = (index, option) => {
    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
  };

  const submitExam = async () => {
    const res = await axios.post("http://localhost:5000/submit-exam", {
      studentName: loggedUser.name,
      email: loggedUser.email,
      answers: answers
    });

    setResult(res.data);
    setPage("result");
  };

  React.useEffect(() => {
    if (page === "exam" && time > 0) {
      const timer = setTimeout(() => {
        setTime(time - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (page === "exam" && time === 0) {
      submitExam();
    }
  }, [time, page]);

  return (
    <div className="App">
      {page === "register" && (
        <div className="box">
          <h1>Online Examination System</h1>
          <h2>Student Register</h2>

          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
          />

          <button onClick={register}>Register</button>

          <p>
            Already registered?{" "}
            <span onClick={() => setPage("login")}>Login</span>
          </p>
        </div>
      )}

      {page === "login" && (
        <div className="box">
          <h1>Online Examination System</h1>
          <h2>Student Login</h2>

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
          />

          <button onClick={login}>Login</button>

          <p>
            New student?{" "}
            <span onClick={() => setPage("register")}>Register</span>
          </p>
        </div>
      )}

      {page === "exam" && (
        <div className="exam-box">
          <h1>Online Exam</h1>
          <h2>Welcome, {loggedUser.name}</h2>
          <h3 className="timer">Time Left: {time} seconds</h3>

          {questions.map((q, index) => (
            <div className="question-card" key={index}>
              <h3>
                {index + 1}. {q.question}
              </h3>

              {q.options.map((option, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    onChange={() => selectAnswer(index, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          <button onClick={submitExam}>Submit Exam</button>
        </div>
      )}

      {page === "result" && (
        <div className="box">
          <h1>Result Generated</h1>
          <h2>{loggedUser.name}</h2>
          <h3>
            Score: {result.score} / {result.total}
          </h3>

          <button onClick={() => window.location.reload()}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;