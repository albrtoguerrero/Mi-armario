import { useState, useRef, useEffect } from "react";

const CATEGORIES = ["Todos", "Casual", "Elegante", "Deportivo", "Noche", "Trabajo", "Playa"];

const SAMPLE_OUTFITS = [
  {
    id: 1,
    name: "Look casual primavera",
    category: "Casual",
    tags: ["jeans", "blusa", "zapatillas"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
    favorite: true,
    date: "2024-03-15",
  },
  {
    id: 2,
    name: "Elegante para cena",
    category: "Elegante",
    tags: ["vestido", "tacones"],
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
    favorite: false,
    date: "2024-03-10",
  },
  {
    id: 3,
    name: "Outfit de oficina",
    category: "Trabajo",
    tags: ["blazer", "pantalón", "blusa"],
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4012?w=400&h=500&fit=crop",
    favorite: true,
    date: "2024-02-28",
  },
];

const FloatingPetal = ({ style }) => (
  <div
    style={{
      position: "fixed",
      width: "8px",
      height: "12px",
      background: "linear-gradient(135deg, rgba(255,182,193,0.4), rgba(255,105,180,0.2))",
      borderRadius: "50% 0 50% 0",
      animation: `floatPetal ${style.duration}s ease-in-out infinite`,
      animationDelay: `${style.delay}s`,
      left: `${style.left}%`,
      top: "-20px",
      pointerEvents: "none",
      zIndex: 0,
    }}
  />
);

export default function App() {
  const [outfits, setOutfits] = useState(() => {
    try {
      const saved = localStorage.getItem("mi-armario-outfits");
      return saved ? JSON.parse(saved) : SAMPLE_OUTFITS;
    } catch {
      return SAMPLE_OUTFITS;
    }
  });

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [view, setView] = useState("home");
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [newOutfit, setNewOutfit] = useState({ name: "", category: "Casual", tags: "", image: null, preview: null });
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);
  const [randomOutfit, setRandomOutfit] = useState(null);
  const [showRandom, setShowRandom] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    try {
      localStorage.setItem("mi-armario-outfits", JSON.stringify(outfits));
    } catch {}
  }, [outfits]);

  const petals = Array.from({ length: 12 }, (_, i) => ({
    duration: 6 + (i * 0.37),
    delay: i * 0.8,
    left: (i * 8.3) % 100,
  }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = outfits.filter((o) => {
    const matchCat = activeCategory === "Todos" || o.category === activeCategory;
    const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchFav = !showFavoritesOnly || o.favorite;
    return matchCat && matchSearch && matchFav;
  });

  const toggleFavorite = (id) => {
    setOutfits((prev) => prev.map((o) => o.id === id ? { ...o, favorite: !o.favorite } : o));
  };

  const deleteOutfit = (id) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    setView("home");
    showToast("Conjunto eliminado 🗑️");
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setNewOutfit((prev) => ({ ...prev, image: file, preview: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleAddOutfit = () => {
    if (!newOutfit.name || !newOutfit.preview) {
      showToast("¡Añade un nombre y una foto! 📸", "error");
      return;
    }
    const outfit = {
      id: Date.now(),
      name: newOutfit.name,
      category: newOutfit.category,
      tags: newOutfit.tags.split(",").map((t) => t.trim()).filter(Boolean),
      image: newOutfit.preview,
      favorite: false,
      date: new Date().toISOString().split("T")[0],
    };
    setOutfits((prev) => [outfit, ...prev]);
    setNewOutfit({ name: "", category: "Casual", tags: "", image: null, preview: null });
    setView("home");
    showToast("¡Conjunto añadido con éxito! ✨");
  };

  const pickRandom = () => {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    setRandomOutfit(pick);
    setShowRandom(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff5f7; min-height: 100vh; overscroll-behavior: none; }
        @keyframes floatPetal {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        .app-wrapper {
          max-width: 430px; margin: 0 auto; min-height: 100vh;
          background: linear-gradient(160deg, #fff0f5 0%, #fce4ec 40%, #fff5f7 100%);
          position: relative; overflow: hidden;
          box-shadow: 0 0 60px rgba(255,105,180,0.15);
        }
        .header { padding: 52px 24px 20px; position: relative; z-index: 10; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .app-title {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700;
          background: linear-gradient(135deg, #e91e8c, #f06292, #ad1457);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;
        }
        .app-subtitle { font-size: 12px; color: #f48fb1; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
        .header-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #f48fb1, #e91e8c);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
          box-shadow: 0 4px 15px rgba(233,30,140,0.3);
        }
        .stats-row { display: flex; gap: 12px; padding: 0 24px 20px; position: relative; z-index: 10; }
        .stat-card {
          flex: 1; background: white; border-radius: 16px; padding: 12px 14px;
          box-shadow: 0 4px 20px rgba(255,105,180,0.1); border: 1px solid rgba(255,182,193,0.3);
          animation: fadeUp 0.5s ease both;
        }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.2s; }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 24px; color: #e91e8c; font-weight: 700; line-height: 1; }
        .stat-label { font-size: 10px; color: #f48fb1; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; font-weight: 500; }
        .search-row { padding: 0 24px 16px; position: relative; z-index: 10; display: flex; gap: 10px; }
        .search-input {
          flex: 1; background: white; border: 1.5px solid rgba(255,182,193,0.5); border-radius: 50px;
          padding: 10px 16px 10px 40px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #880e4f;
          outline: none; transition: all 0.2s; box-shadow: 0 2px 10px rgba(255,105,180,0.08); width: 100%;
        }
        .search-input:focus { border-color: #f06292; box-shadow: 0 2px 20px rgba(255,105,180,0.2); }
        .search-input::placeholder { color: #f8bbd0; }
        .search-wrap { position: relative; flex: 1; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
        .fav-btn {
          width: 42px; height: 42px; border-radius: 50%; border: none;
          cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(255,105,180,0.15); transition: all 0.2s;
          border: 1.5px solid rgba(255,182,193,0.3); background: white; flex-shrink: 0;
        }
        .fav-btn.active { background: linear-gradient(135deg, #e91e8c, #f06292); }
        .cats-scroll {
          padding: 0 24px 20px; overflow-x: auto; display: flex; gap: 8px;
          scrollbar-width: none; position: relative; z-index: 10;
        }
        .cats-scroll::-webkit-scrollbar { display: none; }
        .cat-chip {
          white-space: nowrap; padding: 7px 16px; border-radius: 50px;
          border: 1.5px solid rgba(255,182,193,0.4); background: white; font-size: 12px;
          font-family: 'DM Sans', sans-serif; font-weight: 500; color: #f06292; cursor: pointer; transition: all 0.2s;
        }
        .cat-chip.active {
          background: linear-gradient(135deg, #e91e8c, #f06292); border-color: transparent;
          color: white; box-shadow: 0 4px 15px rgba(233,30,140,0.3);
        }
        .section-header { padding: 0 24px 12px; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 18px; color: #880e4f; }
        .random-btn {
          background: linear-gradient(135deg, #fce4ec, #f8bbd0); border: 1.5px solid rgba(255,182,193,0.5);
          border-radius: 50px; padding: 6px 14px; font-size: 11px; color: #e91e8c; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 500; display: flex; align-items: center; gap: 4px; transition: all 0.2s;
        }
        .random-btn:hover { box-shadow: 0 4px 15px rgba(233,30,140,0.2); transform: translateY(-1px); }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 0 24px 120px; position: relative; z-index: 10; }
        .outfit-card {
          border-radius: 20px; overflow: hidden; background: white;
          box-shadow: 0 4px 20px rgba(255,105,180,0.12); cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); animation: scaleIn 0.4s ease both; position: relative;
        }
        .outfit-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 35px rgba(255,105,180,0.25); }
        .outfit-card:nth-child(2n) { animation-delay: 0.1s; margin-top: 18px; }
        .outfit-img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .outfit-img-placeholder { width: 100%; height: 180px; background: linear-gradient(135deg, #fce4ec, #f8bbd0); display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .outfit-info { padding: 10px 12px 12px; }
        .outfit-name { font-size: 12px; font-weight: 500; color: #880e4f; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .outfit-cat-badge { display: inline-block; background: linear-gradient(135deg, #fce4ec, #f8bbd0); color: #e91e8c; font-size: 9px; font-weight: 500; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .fav-badge { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .fav-badge:hover { transform: scale(1.2); }
        .empty-state { padding: 60px 24px; text-align: center; animation: fadeUp 0.5s ease; }
        .empty-icon { font-size: 60px; margin-bottom: 16px; display: block; }
        .empty-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #e91e8c; margin-bottom: 8px; }
        .empty-sub { font-size: 13px; color: #f48fb1; line-height: 1.5; }
        .bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 430px; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,182,193,0.3); padding: 12px 24px 28px;
          display: flex; align-items: center; justify-content: space-around; z-index: 100;
          box-shadow: 0 -4px 30px rgba(255,105,180,0.12);
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; color: #f8bbd0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; padding: 6px 12px; border-radius: 12px; }
        .nav-item.active { color: #e91e8c; }
        .nav-icon { font-size: 22px; line-height: 1; }
        .add-nav-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #e91e8c, #f06292); border: none; cursor: pointer;
          font-size: 26px; color: white; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 25px rgba(233,30,140,0.45); transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          margin-top: -20px; position: relative;
        }
        .add-nav-btn:hover { transform: scale(1.1) rotate(90deg); box-shadow: 0 8px 30px rgba(233,30,140,0.55); }
        .add-nav-btn::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid rgba(233,30,140,0.3); animation: pulse-ring 1.5s ease infinite; }
        .add-view { padding: 52px 24px 120px; animation: fadeUp 0.3s ease; position: relative; z-index: 10; }
        .view-title { font-family: 'Playfair Display', serif; font-size: 26px; color: #880e4f; margin-bottom: 4px; }
        .view-sub { font-size: 12px; color: #f48fb1; margin-bottom: 28px; font-weight: 300; }
        .upload-zone { border: 2px dashed rgba(240,98,146,0.4); border-radius: 24px; height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.7); transition: all 0.2s; margin-bottom: 20px; overflow: hidden; position: relative; }
        .upload-zone:hover { border-color: #e91e8c; background: rgba(252,228,236,0.6); }
        .upload-zone.drag-over { border-color: #e91e8c; background: rgba(252,228,236,0.8); }
        .upload-preview { width: 100%; height: 100%; object-fit: cover; }
        .upload-icon { font-size: 42px; margin-bottom: 10px; }
        .upload-text { font-size: 13px; color: #f06292; font-weight: 500; text-align: center; }
        .upload-hint { font-size: 11px; color: #f8bbd0; margin-top: 4px; text-align: center; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 11px; color: #e91e8c; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .form-input { width: 100%; background: white; border: 1.5px solid rgba(255,182,193,0.5); border-radius: 14px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #880e4f; outline: none; transition: all 0.2s; }
        .form-input:focus { border-color: #f06292; box-shadow: 0 0 0 3px rgba(240,98,146,0.1); }
        .form-input::placeholder { color: #f8bbd0; }
        .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f06292' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-color: white; padding-right: 36px; cursor: pointer; }
        .submit-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #e91e8c, #f06292); border: none; border-radius: 18px; color: white; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 6px 25px rgba(233,30,140,0.35); transition: all 0.2s; margin-top: 8px; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(233,30,140,0.45); }
        .detail-view { animation: fadeUp 0.3s ease; position: relative; z-index: 10; min-height: 100vh; }
        .detail-hero { width: 100%; height: 420px; object-fit: cover; display: block; }
        .detail-hero-placeholder { width: 100%; height: 420px; background: linear-gradient(135deg, #fce4ec, #f8bbd0); display: flex; align-items: center; justify-content: center; font-size: 80px; }
        .detail-back { position: absolute; top: 52px; left: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(0,0,0,0.1); transition: all 0.2s; }
        .detail-back:hover { transform: scale(1.1); }
        .detail-fav-btn { position: absolute; top: 52px; right: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(0,0,0,0.1); transition: all 0.2s; }
        .detail-body { padding: 24px 24px 120px; }
        .detail-name { font-family: 'Playfair Display', serif; font-size: 26px; color: #880e4f; margin-bottom: 8px; }
        .detail-cat { display: inline-block; background: linear-gradient(135deg, #e91e8c, #f06292); color: white; font-size: 11px; font-weight: 500; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .detail-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .detail-tag { background: rgba(252,228,236,0.8); color: #e91e8c; font-size: 12px; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,182,193,0.4); }
        .detail-date { font-size: 12px; color: #f48fb1; display: flex; align-items: center; gap: 6px; margin-bottom: 24px; }
        .delete-btn { width: 100%; padding: 14px; background: rgba(255,235,238,0.8); border: 1.5px solid rgba(255,182,193,0.5); border-radius: 16px; color: #e91e8c; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .delete-btn:hover { background: rgba(252,228,236,1); border-color: #e91e8c; }
        .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); color: white; padding: 12px 24px; border-radius: 50px; font-size: 13px; font-weight: 500; z-index: 1000; box-shadow: 0 6px 25px rgba(0,0,0,0.2); animation: scaleIn 0.3s ease; white-space: nowrap; }
        .toast.success { background: linear-gradient(135deg, #e91e8c, #f06292); }
        .toast.error { background: linear-gradient(135deg, #ad1457, #c2185b); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(136,14,79,0.4); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; animation: fadeUp 0.2s ease; }
        .modal-card { background: white; border-radius: 32px 32px 0 0; padding: 28px 28px 48px; width: 100%; max-width: 430px; animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .modal-handle { width: 40px; height: 4px; background: #f8bbd0; border-radius: 2px; margin: 0 auto 20px; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #880e4f; text-align: center; margin-bottom: 20px; }
        .modal-img { width: 100%; height: 280px; object-fit: cover; border-radius: 20px; margin-bottom: 16px; }
        .modal-outfit-name { font-family: 'Playfair Display', serif; font-size: 18px; color: #880e4f; text-align: center; margin-bottom: 6px; }
        .modal-cat { text-align: center; margin-bottom: 20px; }
        .modal-btns { display: flex; gap: 12px; }
        .modal-btn-secondary { flex: 1; padding: 14px; background: rgba(252,228,236,0.8); border: 1.5px solid rgba(255,182,193,0.5); border-radius: 16px; color: #e91e8c; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .modal-btn-primary { flex: 1; padding: 14px; background: linear-gradient(135deg, #e91e8c, #f06292); border: none; border-radius: 16px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 6px 20px rgba(233,30,140,0.35); transition: all 0.2s; }
        .deco-circle { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
      `}</style>

      <div className="app-wrapper">
        <div className="deco-circle" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,182,193,0.2), transparent)', top: -60, right: -60 }} />
        <div className="deco-circle" style={{ width: 150, height: 150, background: 'radial-gradient(circle, rgba(233,30,140,0.08), transparent)', top: 300, left: -50 }} />
        <div className="deco-circle" style={{ width: 100, height: 100, background: 'radial-gradient(circle, rgba(255,105,180,0.15), transparent)', bottom: 200, right: 20 }} />
        {petals.map((p, i) => <FloatingPetal key={i} style={p} />)}

        {view === "home" && (
          <>
            <div className="header">
              <div className="header-top">
                <div>
                  <div className="app-title">Mi Armario ✨</div>
                  <div className="app-subtitle">Tu colección personal</div>
                </div>
                <div className="header-avatar">👗</div>
              </div>
            </div>
            <div className="stats-row">
              <div className="stat-card"><div className="stat-num">{outfits.length}</div><div className="stat-label">Conjuntos</div></div>
              <div className="stat-card"><div className="stat-num">{outfits.filter(o => o.favorite).length}</div><div className="stat-label">Favoritos</div></div>
              <div className="stat-card"><div className="stat-num">{CATEGORIES.length - 1}</div><div className="stat-label">Categorías</div></div>
            </div>
            <div className="search-row">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Buscar conjuntos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button className={`fav-btn ${showFavoritesOnly ? 'active' : ''}`} onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
                {showFavoritesOnly ? "🩷" : "🤍"}
              </button>
            </div>
            <div className="cats-scroll">
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`cat-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
              ))}
            </div>
            <div className="section-header">
              <div className="section-title">{activeCategory === "Todos" ? "Todos los conjuntos" : activeCategory}</div>
              <button className="random-btn" onClick={pickRandom}>🎲 Sorpréndeme</button>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👗</span>
                <div className="empty-title">¡Tu armario está vacío!</div>
                <div className="empty-sub">Añade tu primer conjunto pulsando el botón ＋ de abajo</div>
              </div>
            ) : (
              <div className="grid">
                {filtered.map((outfit) => (
                  <div key={outfit.id} className="outfit-card" onClick={() => { setSelectedOutfit(outfit); setView("detail"); }}>
                    {outfit.image ? <img className="outfit-img" src={outfit.image} alt={outfit.name} /> : <div className="outfit-img-placeholder">👗</div>}
                    <div className="fav-badge" onClick={(e) => { e.stopPropagation(); toggleFavorite(outfit.id); }}>{outfit.favorite ? "🩷" : "🤍"}</div>
                    <div className="outfit-info">
                      <div className="outfit-name">{outfit.name}</div>
                      <span className="outfit-cat-badge">{outfit.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "add" && (
          <div className="add-view">
            <div className="view-title">Nuevo Conjunto</div>
            <div className="view-sub">Añade una foto y personaliza tu look</div>
            <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={(e) => handleImageUpload(e.target.files[0])} />
            <div className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}>
              {newOutfit.preview ? <img className="upload-preview" src={newOutfit.preview} alt="preview" /> : (
                <><div className="upload-icon">📸</div><div className="upload-text">Toca para subir una foto</div><div className="upload-hint">O arrastra y suelta aquí</div></>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del conjunto</label>
              <input className="form-input" placeholder="Ej: Look casual primavera..." value={newOutfit.name} onChange={(e) => setNewOutfit(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-input form-select" value={newOutfit.category} onChange={(e) => setNewOutfit(prev => ({ ...prev, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== "Todos").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Etiquetas (separadas por coma)</label>
              <input className="form-input" placeholder="Ej: vestido, tacones, bolso..." value={newOutfit.tags} onChange={(e) => setNewOutfit(prev => ({ ...prev, tags: e.target.value }))} />
            </div>
            <button className="submit-btn" onClick={handleAddOutfit}>✨ Guardar conjunto</button>
          </div>
        )}

        {view === "detail" && selectedOutfit && (
          <div className="detail-view">
            {selectedOutfit.image ? <img className="detail-hero" src={selectedOutfit.image} alt={selectedOutfit.name} /> : <div className="detail-hero-placeholder">👗</div>}
            <button className="detail-back" onClick={() => setView("home")}>←</button>
            <button className="detail-fav-btn" onClick={() => { toggleFavorite(selectedOutfit.id); setSelectedOutfit(prev => ({ ...prev, favorite: !prev.favorite })); }}>
              {selectedOutfit.favorite ? "🩷" : "🤍"}
            </button>
            <div className="detail-body">
              <div className="detail-name">{selectedOutfit.name}</div>
              <span className="detail-cat">{selectedOutfit.category}</span>
              {selectedOutfit.tags.length > 0 && (
                <div className="detail-tags">{selectedOutfit.tags.map((tag, i) => <span key={i} className="detail-tag">#{tag}</span>)}</div>
              )}
              <div className="detail-date"><span>📅</span><span>Añadido el {new Date(selectedOutfit.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span></div>
              <button className="delete-btn" onClick={() => deleteOutfit(selectedOutfit.id)}>🗑️ Eliminar conjunto</button>
            </div>
          </div>
        )}

        <div className="bottom-nav">
          <div className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            <span className="nav-icon">🏠</span><span>Inicio</span>
          </div>
          <button className="add-nav-btn" onClick={() => setView("add")}>＋</button>
          <div className={`nav-item ${view === "add" ? "active" : ""}`} onClick={() => setView("add")}>
            <span className="nav-icon">✨</span><span>Añadir</span>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {showRandom && randomOutfit && (
        <div className="modal-overlay" onClick={() => setShowRandom(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">🎲 ¡Hoy llevarás esto!</div>
            {randomOutfit.image ? <img className="modal-img" src={randomOutfit.image} alt={randomOutfit.name} /> : <div style={{ width: "100%", height: 280, background: "linear-gradient(135deg,#fce4ec,#f8bbd0)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, marginBottom: 16 }}>👗</div>}
            <div className="modal-outfit-name">{randomOutfit.name}</div>
            <div className="modal-cat"><span className="detail-cat">{randomOutfit.category}</span></div>
            <div className="modal-btns">
              <button className="modal-btn-secondary" onClick={pickRandom}>🔀 Otro</button>
              <button className="modal-btn-primary" onClick={() => { setSelectedOutfit(randomOutfit); setView("detail"); setShowRandom(false); }}>Ver detalles</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
