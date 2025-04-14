import React, { useState } from "react";
import { Button } from "@/components/ui/button";


const defaultQuestions = [
  {
    question: "Was ist ein Kakapo?",
    correctAnswer: "Ein flugunfähiger Papagei aus Neuseeland",
  },
  {
    question: "Was bedeutet das Wort 'Firlefanz'?",
    correctAnswer: "Übertriebener, nutzloser Aufwand oder Schnickschnack",
  },
];


export default function NobodyIsPerfect() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("lobby");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(defaultQuestions);
  const [answers, setAnswers] = useState({});
  const [guesses, setGuesses] = useState({});
  const [scores, setScores] = useState({});
  const [shuffledAnswers, setShuffledAnswers] = useState([]);


  const currentQuestion = questions[questionIndex];


  const addPlayer = () => {
    if (name.trim() && !players.includes(name)) {
      setPlayers([...players, name]);
      setScores((prev) => ({ ...prev, [name]: 0 }));
      setName("");
    }
  };


  const startGame = () => {
    setStage("answering");
  };


  const submitAnswer = (player, answer) => {
    setAnswers((prev) => ({ ...prev, [player]: answer }));
  };


  const allAnswered = () => {
    return players.every((p) => answers[p]);
  };


  const goToGuessing = () => {
    const allAnswers = [
      ...Object.entries(answers).map(([player, ans]) => ({ answer: ans, player })),
      { answer: currentQuestion.correctAnswer, player: "correct" },
    ];
    setShuffledAnswers(shuffleArray(allAnswers));
    setStage("guessing");
  };


  const submitGuess = (player, guess) => {
    setGuesses((prev) => ({ ...prev, [player]: guess }));
  };


  const allGuessed = () => {
    return players.every((p) => guesses[p]);
  };


  const evaluateRound = () => {
    const newScores = { ...scores };
    players.forEach((player) => {
      const guess = guesses[player];
      if (guess === "correct") {
        newScores[player] += 2;
      } else {
        const guessedPlayer = shuffledAnswers.find((a) => a.answer === guess)?.player;
        if (guessedPlayer && guessedPlayer !== "correct") {
          newScores[guessedPlayer] += 1;
        }
      }
    });
    setScores(newScores);
    setStage("result");
  };


  const nextRound = () => {
    setQuestionIndex((prev) => (prev + 1) % questions.length);
    setAnswers({});
    setGuesses({});
    setShuffledAnswers([]);
    setStage("answering");
  };


  const shuffleArray = (array) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (file.name.endsWith(".csv")) {
        const lines = content.split("\n").slice(1); // skip header
        const parsed = lines.map((line) => {
          const [question, correctAnswer] = line.split(/,(.+)/);
          return question && correctAnswer
            ? { question: question.trim(), correctAnswer: correctAnswer.trim() }
            : null;
        }).filter(Boolean);
        setQuestions(parsed);
      } else if (file.name.endsWith(".txt")) {
        const lines = content.split("\n");
        const parsed = lines.map((line) => {
          const [question, correctAnswer] = line.split(/\|(.+)/);
          return question && correctAnswer
            ? { question: question.trim(), correctAnswer: correctAnswer.trim() }
            : null;
        }).filter(Boolean);
        setQuestions(parsed);
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nobody is Perfect – Web</h1>


      {stage === "lobby" && (
        <div>
          <p className="mb-2">Spieler hinzufügen:</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mr-2"
            placeholder="Name"
          />
          <Button onClick={addPlayer}>Hinzufügen</Button>


          <ul className="mt-4">
            {players.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>


          <div className="mt-6">
            <p className="mb-1 font-semibold">Eigene Fragen hochladen (TXT oder CSV):</p>
            <input type="file" accept=".txt,.csv" onChange={handleFileUpload} />
          </div>


          {players.length > 2 && (
            <Button className="mt-4" onClick={startGame}>
              Spiel starten
            </Button>
          )}
        </div>
      )}


      {stage === "answering" && (
        <div>
          <p className="mb-2 font-semibold">Frage:</p>
          <p className="italic mb-4">{currentQuestion.question}</p>


          {players.map((p) => (
            <div key={p} className="mb-2">
              <label>{p}'s Antwort:</label>
              <input
                type="text"
                onBlur={(e) => submitAnswer(p, e.target.value)}
                className="border p-1 ml-2"
              />
            </div>
          ))}


          {allAnswered() && (
            <Button className="mt-4" onClick={goToGuessing}>
              Weiter zur Ratephase
            </Button>
          )}
        </div>
      )}


      {stage === "guessing" && (
        <div>
          <p className="mb-2 font-semibold">Welche Antwort ist die richtige?</p>
          <ul className="mb-4">
            {shuffledAnswers.map((item, index) => (
              <li key={index} className="mb-1">{item.answer}</li>
            ))}
          </ul>


          {players.map((p) => (
            <div key={p} className="mb-2">
              <label>{p}'s Tipp:</label>
              <input
                type="text"
                onBlur={(e) => submitGuess(p, e.target.value)}
                className="border p-1 ml-2"
              />
            </div>
          ))}


          {allGuessed() && (
            <Button className="mt-4" onClick={evaluateRound}>
              Auswerten
            </Button>
          )}
        </div>
      )}


      {stage === "result" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Rundenergebnis</h2>
          <ul className="mb-4">
            {Object.entries(scores).map(([p, s]) => (
              <li key={p}>{p}: {s} Punkte</li>
            ))}
          </ul>
          <Button onClick={nextRound}>Nächste Runde</Button>
        </div>
      )}
    </div>
  );
}