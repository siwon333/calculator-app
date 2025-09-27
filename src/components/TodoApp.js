import { useEffect, useMemo, useRef, useState } from "react";
// import "./todo-styles.css";

export default function TodoApp() {
  // ---- 상태 ----
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("📘");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  // 편집 상태
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editEmoji, setEditEmoji] = useState("📘");
  const [editPriority, setEditPriority] = useState("medium");
  const editInputRef = useRef(null);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // 파생
  const remaining = useMemo(() => todos.filter(t => !t.done).length, [todos]);
  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter(t => !t.done);
    if (filter === "completed") return todos.filter(t => t.done);
    return todos;
  }, [todos, filter]);

  // 색상 팔레트(항목 배경)
  const colors = ["#e7f5ff", "#fff9db", "#f4fce3", "#fff5f5"];

  // ---- CRUD ----
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: trimmed, done: false, emoji, priority },
    ]);
    setText("");
  };

  const toggleDone = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editId === id) cancelEdit();
  };

  // ---- 편집 ----
  const startEdit = (t) => {
    setEditId(t.id);
    setEditText(t.text);
    setEditEmoji(t.emoji ?? "📘");
    setEditPriority(t.priority ?? "medium");
    // 다음 틱에 포커스
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      cancelEdit();
      return;
    }
    setTodos(prev =>
      prev.map(t =>
        t.id === editId ? { ...t, text: trimmed, emoji: editEmoji, priority: editPriority } : t
      )
    );
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText("");
    setEditEmoji("📘");
    setEditPriority("medium");
  };

  // ---- 재정렬 (Drag & Drop + 버튼) ----
  const dragId = useRef(null);

  const onDragStart = (id) => (e) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    // 드래그 미리보기 작게
    const img = new Image();
    img.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgc3R5bGU9ImZpbGw6I2VlZjFmNjsiLz48L3N2Zz4=";
    e.dataTransfer.setDragImage(img, 16, 16);
  };

  const onDragOver = (e) => {
    e.preventDefault(); // drop 허용
  };

  const onDrop = (targetId) => (e) => {
    e.preventDefault();
    const from = todos.findIndex(t => t.id === dragId.current);
    const to = todos.findIndex(t => t.id === targetId);
    if (from === -1 || to === -1 || from === to) return;

    setTodos(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragId.current = null;
  };

  const moveUp = (id) => {
    setTodos(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (id) => {
    setTodos(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  // ---- UI ----
  return (
    <div className="todo-wrap">
      <div className="todo-card">
        <h1 className="todo-title">To Do List</h1>

        <div className="todo-top">
          <div className="today">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <div className="count">
            <span className="count-dot" />
            남은 할 일&nbsp;<strong>{remaining}</strong>
          </div>
        </div>

        {/* 입력 */}
        <form className="todo-form" onSubmit={handleSubmit}>
          <select className="select-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)}>
            <option>📘</option><option>📚</option><option>💪</option>
            <option>🍽</option><option>💻</option><option>📝</option><option>✅</option>
          </select>

          <input
            className="todo-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="할 일을 입력하세요"
          />

          <select
            className="select-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="btn-add" type="submit">추가</button>
        </form>

        {/* 필터 */}
        <div className="filters">
          {["all", "active", "completed"].map(f => (
            <button
              key={f}
              className={`chip ${filter === f ? "is-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "모두 보기" : f === "active" ? "활성 항목" : "완료 항목"}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <ul className="todo-list">
          {filtered.map((t) => {
            const bg = colors[t.id % colors.length];

            // 편집 모드
            if (editId === t.id) {
              return (
                <li key={t.id} className="todo-item editing" style={{ backgroundColor: bg }}>
                  <span className="drag-handle" aria-hidden>⋮⋮</span>

                  <span className="edit-fields">
                    <select
                      className="select-emoji"
                      value={editEmoji}
                      onChange={(e) => setEditEmoji(e.target.value)}
                    >
                      <option>📘</option><option>📚</option><option>💪</option>
                      <option>🍽</option><option>💻</option><option>📝</option><option>✅</option>
                    </select>

                    <input
                      ref={editInputRef}
                      className="todo-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      onBlur={commitEdit}
                      placeholder="내용 수정"
                    />

                    <select
                      className="select-priority"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="high">높음</option>
                      <option value="medium">중간</option>
                      <option value="low">낮음</option>
                    </select>
                  </span>

                  <span className="edit-actions">
                    <button className="btn-add" type="button" onClick={commitEdit}>저장</button>
                    <button className="btn-del" type="button" onClick={cancelEdit}>취소</button>
                  </span>
                </li>
              );
            }

            // 일반 모드
            return (
              <li
              key={t.id}
              className={`todo-item ${t.done ? "is-done" : ""}`}
              style={{ backgroundColor: bg }}
              draggable
              onDragStart={onDragStart(t.id)}
              onDragOver={onDragOver}
              onDrop={onDrop(t.id)}
              onDoubleClick={() => startEdit(t)}
            >
              {/* 왼쪽: 드래그 핸들 */}
              <span className="drag-handle" title="드래그해서 순서 변경">⋮⋮</span>

              {/* 체크박스 */}
              <label className="check">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(t.id)}
                />
                <span className="check-visual" />
              </label>

              {/* 텍스트 */}
              <span className="todo-text">
                <span className="emoji">{t.emoji}</span> {t.text}
              </span>

              {/* 우선순위 뱃지 */}
              <span className={`badge ${t.priority}`}>
                {t.priority === "high" ? "High" : t.priority === "medium" ? "Medium" : "Low"}
              </span>

              {/* 오른쪽: 수정 + 삭제 */}
              <div className="row-actions">
                <button className="ghost" onClick={() => startEdit(t)}>✎</button>
                <button className="btn-del" onClick={() => deleteTodo(t.id)}>삭제</button>
              </div>
            </li>

            );
          })}
        </ul>
      </div>
    </div>
  );
}
