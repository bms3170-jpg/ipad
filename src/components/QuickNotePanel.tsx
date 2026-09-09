import { useState } from "react";
import { useNoteStore } from "../stores/noteStore";
import { useTaskStore } from "../stores/taskStore";

type Props = { open: boolean; onClose: () => void };
export function QuickNotePanel({ open, onClose }: Props) {
  const [text, setText] = useState("");
  const addNote = useNoteStore((s) => s.addNote);
  const addTask = useTaskStore((s) => s.addTask);
  if (!open) return null;
  const save = async (sendTask = false) => {
    const clean = text.trim(); if (!clean) return;
    await addNote("quick", { title: clean.split("\n")[0].slice(0, 60), content: clean });
    if (sendTask) await addTask({ title: clean.split("\n")[0] });
    setText(""); onClose();
  };
  return <div className="overlay" onPointerDown={(e) => { if (e.currentTarget === e.target) onClose(); }}><section className="quick-note-panel panel-modal"><header><div><span className="kicker">CAPTURE</span><h2>QUICK NOTE</h2></div><button onClick={onClose}>×</button></header><textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="바로 입력하세요…" /><footer><button onClick={() => save(true)}>TODAY로 보내기</button><button className="primary" onClick={() => save(false)}>저장</button></footer></section></div>;
}
