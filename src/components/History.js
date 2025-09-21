// src/components/History.jsx
export default function History({ records, onClear }) {
  if (!records || records.length === 0) {
    return <div className="history placeholder">History</div>;
  }

  return (
    <div className="history-wrap">
      <div className="history-header">
        <span>History</span>
        <button className="history-clear" onClick={onClear}>
          지우기
        </button>
      </div>
      <ul className="history">
        {records.map((r, idx) => (
          <li key={idx}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
