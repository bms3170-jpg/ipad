import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNoteStore } from "../../stores/noteStore";
import { useTaskStore } from "../../stores/taskStore";
import type { Note, NoteType } from "../../types";
import { makeId } from "../../utils/date";

export function NotesPage() {
  const notes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const addTask = useTaskStore((s) => s.addTask);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(params.get("id") ?? notes[0]?.id ?? "");
  const [draft, setDraft] = useState<Note | null>(null);
  const [savedState, setSavedState] = useState("저장됨 ✓");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((note) => `${note.title} ${note.content} ${note.tags.join(" ")} ${note.checklist.map((i) => i.text).join(" ")}`.toLowerCase().includes(q));
  }, [notes, query]);

  useEffect(() => {
    const selected = notes.find((note) => note.id === selectedId) ?? notes[0] ?? null;
    setDraft(selected ? { ...selected, checklist: selected.checklist.map((item) => ({ ...item })) } : null);
  }, [notes, selectedId]);

  useEffect(() => {
    if (!draft) return;
    const original = notes.find((note) => note.id === draft.id);
    if (!original) return;
    const changed = JSON.stringify({ title: draft.title, content: draft.content, tags: draft.tags, checklist: draft.checklist, pinned: draft.pinned, favorite: draft.favorite }) !== JSON.stringify({ title: original.title, content: original.content, tags: original.tags, checklist: original.checklist, pinned: original.pinned, favorite: original.favorite });
    if (!changed) return;
    setSavedState("저장 중…");
    const timer = window.setTimeout(async () => {
      await updateNote(draft.id, { title: draft.title, content: draft.content, tags: draft.tags, checklist: draft.checklist, pinned: draft.pinned, favorite: draft.favorite });
      setSavedState("저장됨 ✓");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [draft, notes, updateNote]);

  const create = async (type: NoteType) => {
    const note = await addNote(type, { title: type === "quick" ? "Quick Note" : type === "checklist" ? "새 체크리스트" : type === "photo" ? "새 사진 메모" : "새 메모" });
    setSelectedId(note.id); setParams({ id: note.id });
  };

  const select = (id: string) => { setSelectedId(id); setParams({ id }); };

  if (!draft && notes.length === 0) return <section className="page notes-page"><button className="primary" onClick={() => create("normal")}>첫 메모 만들기</button></section>;

  return (
    <section className="page notes-page">
      <div className="notes-shell">
        <aside className="notes-list-panel">
          <div className="notes-list-head"><div><span className="kicker">LIBRARY</span><h1>NOTE</h1></div><button className="primary" onClick={() => create("normal")}>+</button></div>
          <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="메모 검색" />
          <div className="note-type-buttons"><button onClick={() => create("quick")}>QUICK</button><button onClick={() => create("checklist")}>CHECKLIST</button><button onClick={() => create("photo")}>PHOTO</button></div>
          <div className="note-list">{filtered.map((note) => <button key={note.id} className={selectedId === note.id ? "active" : ""} onClick={() => select(note.id)}><span>{note.pinned ? "◆ " : ""}{note.type.toUpperCase()}</span><b>{note.title || "제목 없음"}</b><small>{new Date(note.updatedAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</small></button>)}</div>
        </aside>

        {draft && <main className="note-editor">
          <header><div className="note-editor-meta"><span className="kicker">{draft.type.toUpperCase()}</span><span>{savedState}</span></div><div className="toolbar-actions"><button className={draft.pinned ? "active" : ""} onClick={() => setDraft({ ...draft, pinned: !draft.pinned })}>PIN</button><button className={draft.favorite ? "active" : ""} onClick={() => setDraft({ ...draft, favorite: !draft.favorite })}>♡</button><button onClick={() => { deleteNote(draft.id); setSelectedId(""); }}>DELETE</button></div></header>
          <input className="note-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="제목" />

          {draft.type === "checklist" ? <div className="checklist-editor">
            <div className="check-progress">{draft.checklist.filter((i) => i.completed).length}/{draft.checklist.length} COMPLETE</div>
            {draft.checklist.map((item) => <div className="check-edit-row" key={item.id}><button onClick={() => setDraft({ ...draft, checklist: draft.checklist.map((v) => v.id === item.id ? { ...v, completed: !v.completed } : v) })}>{item.completed ? "✓" : "○"}</button><input value={item.text} onChange={(e) => setDraft({ ...draft, checklist: draft.checklist.map((v) => v.id === item.id ? { ...v, text: e.target.value } : v) })} /><button onClick={() => setDraft({ ...draft, checklist: draft.checklist.filter((v) => v.id !== item.id) })}>×</button></div>)}
            <button className="wide" onClick={() => setDraft({ ...draft, checklist: [...draft.checklist, { id: makeId("check"), text: "새 항목", completed: false }] })}>+ 항목 추가</button>
            <button className="wide" onClick={() => draft.checklist.filter((i) => !i.completed).forEach((item) => addTask({ title: item.text }))}>미완료를 TODAY로 보내기</button>
          </div> : <textarea className="note-body" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder={draft.type === "photo" ? "사진에 대한 기록을 남겨보세요. Gallery에서 사진을 연결할 수 있습니다." : "무엇이든 적어보세요…"} />}

          <div className="tag-editor"><span>#</span><input value={draft.tags.join(", ")} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} placeholder="태그, 쉼표로 구분" /></div>
          {draft.type !== "checklist" && <button className="send-today" onClick={() => addTask({ title: draft.title || draft.content.split("\n")[0] || "메모에서 가져온 할 일" })}>+ TODAY TASK로 보내기</button>}
        </main>}
      </div>
    </section>
  );
}
