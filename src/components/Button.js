export default function Button({ label, onClick }) {
  return (
    <button
      className="button"
      data-label={label}          
      onClick={() => onClick(label)}
    >
      {label}
    </button>
  );
}
