import { useState, useEffect } from "react";
import { Parser } from "expr-eval";   // ✅ 추가
import Display from "./components/Display";
import Keypad from "./components/Keypad";
import History from "./components/History";
import "./App.css";

const parser = new Parser();

// 결과 포맷팅
const formatResult = (n) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!isFinite(num)) return "Error";
  return num.toFixed(5).replace(/\.?0+$/, "");
};

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  const handleClick = (value) => {
    if (value === "C") {
      setInput("");
      return;
    }

    if (value === "Backspace") {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (value === "=") {
      if (!input) return;
      try {
        // ✅ eval 대신 parser 사용
        const rawResult = parser.evaluate(input);
        const formattedResult = formatResult(rawResult);
        const newRecord = `${input} = ${formattedResult}`;
        setInput(formattedResult);
        setHistory((prev) => [newRecord, ...prev].slice(0, 5));
      } catch {
        setInput("Error");
      }
      return;
    }

    setInput((prev) => prev + value);
  };

  // 키보드 입력
  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e;

      if (/^[0-9.]$/.test(key)) return handleClick(key);

      if (["+", "-", "*", "/", "%"].includes(key)) return handleClick(key);

      if (key === "Enter") {
        e.preventDefault();
        if (!input) return;
        return handleClick("=");
      }

      if (key === "Escape") return handleClick("C");

      if (key === "Backspace") {
        e.preventDefault();
        return handleClick("Backspace");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [input]);

  return (
    <div className="container">
      <h1>React Calculator</h1>
      <p className="subtitle">Made by siwon</p>
      <Display value={input || "0"} />
      <History records={history} onClear={() => setHistory([])} />
      <Keypad onKey={handleClick} />
    </div>
  );
}

export default App;
