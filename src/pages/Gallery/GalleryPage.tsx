import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGalleryStore } from "../../stores/galleryStore";
import { useNoteStore } from "../../stores/noteStore";
import type { GalleryPhoto } from "../../types";
import { localDateKey } from "../../utils/date";

function PhotoImage({ photo, className = "" }: { photo: GalleryPhoto; className?: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => { const url = URL.createObjectURL(photo.blob); setSrc(url); return () => URL.revokeObjectURL(url); }, [photo.blob]);
  return src ? <img className={className} src={src} alt={photo.title} /> : <div className={`photo-loading ${className}`}>LOADING</div>;
}

export function GalleryPage() {
  const photos = useGalleryStore((s) => s.photos); const addFiles = useGalleryStore((s) => s.addFiles); const toggleFavorite = useGalleryStore((s) => s.toggleFavorite); const setTodayMemory = useGalleryStore((s) => s.setTodayMemory); const setWallpaper = useGalleryStore((s) => s.setWallpaper); const deletePhoto = useGalleryStore((s) => s.deletePhoto); const updatePhoto = useGalleryStore((s) => s.updatePhoto);
  const addNote = useNoteStore((s) => s.addNote); const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "today" | "favorite" | "wallpaper">("all"); const [selectedId, setSelectedId] = useState<string | null>(null); const [full, setFull] = useState(false);
  const selected = photos.find((photo) => photo.id === selectedId) ?? null;
  const filtered = photos.filter((photo) => filter === "all" ? !photo.hidden : filter === "today" ? photo.todayMemoryDate === localDateKey() : filter === "favorite" ? photo.favorite : photo.isWallpaper);

  return <section className="page gallery-page">
    <div className="page-head compact-head"><div><span className="kicker">MEMORY / ASSET</span><h1>GALLERY</h1><p>사진, TODAY 대표사진, 배경, Theme Asset을 관리합니다.</p></div><label className="primary file-button">+ ADD IMAGE<input type="file" accept="image/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} /></label></div>
    <div className="gallery-layout">
      <aside className="gallery-filter">{(["all","today","favorite","wallpaper"] as const).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value.toUpperCase()}<span>{value === "all" ? photos.length : value === "today" ? photos.filter((p) => p.todayMemoryDate === localDateKey()).length : value === "favorite" ? photos.filter((p) => p.favorite).length : photos.filter((p) => p.isWallpaper).length}</span></button>)}</aside>
      <main className="photo-grid">{filtered.map((photo) => <button key={photo.id} className={selectedId === photo.id ? "selected" : ""} onClick={() => setSelectedId(photo.id)} onDoubleClick={() => { setSelectedId(photo.id); setFull(true); }}><PhotoImage photo={photo} /><span>{photo.favorite ? "♥ " : ""}{photo.title}</span>{photo.todayMemoryDate === localDateKey() && <em>TODAY</em>}</button>)}{filtered.length === 0 && <div className="empty gallery-empty">사진을 추가하면 여기에 표시됩니다.</div>}</main>
      <aside className="photo-detail card">{selected ? <><PhotoImage photo={selected} className="detail-image" /><input value={selected.title} onChange={(e) => updatePhoto(selected.id, { title: e.target.value })} /><textarea value={selected.caption} onChange={(e) => updatePhoto(selected.id, { caption: e.target.value })} placeholder="사진 설명" /><small>{new Date(selected.createdAt).toLocaleString("ko-KR")}</small><div className="photo-actions"><button onClick={() => toggleFavorite(selected.id)}>{selected.favorite ? "♥ 즐겨찾기" : "♡ 즐겨찾기"}</button><button onClick={() => setTodayMemory(selected.id)}>TODAY 대표사진</button><button onClick={() => setWallpaper(selected.id)}>배경으로 사용</button><button onClick={async () => { const note = await addNote("photo", { title: selected.title, content: selected.caption, photoIds: [selected.id] }); navigate(`/notes?id=${note.id}`); }}>사진 메모</button><button onClick={() => setFull(true)}>전체 보기</button><button className="danger" onClick={() => { deletePhoto(selected.id); setSelectedId(null); }}>삭제</button></div></> : <p className="empty">사진을 선택하세요.</p>}</aside>
    </div>
    {full && selected && <div className="full-photo" onClick={() => setFull(false)}><button>×</button><PhotoImage photo={selected} /><span>{selected.title}</span></div>}
  </section>;
}
