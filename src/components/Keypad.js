export function Button({ label, onClick }) {
  return (
    <button className="button" onClick={() => onClick(label)}>
      {label}
    </button>
  );
}

export default function Keypad({ onKey }) {
  const numbers = ["7","8","9","4","5","6","1","2","3","0",".","C"];
  const operators = ["+","-","*","/","%","="];

  return (
    <div className="keypad">
      <div className="numbers">
        {numbers.map(n => (
          <Button key={n} label={n} onClick={onKey} />
        ))}
      </div>
      <div className="operators">
        {operators.map(o => (
          <Button key={o} label={o} onClick={onKey} />
        ))}
      </div>
    </div>
  );
}

