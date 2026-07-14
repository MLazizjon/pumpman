import React from "react";
import { FaChartBar, FaKey, FaGift, FaCogs, FaSignOutAlt, FaThList } from "react-icons/fa";
import "./sidebar.css";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  setShowLogoutModal, 
  currentUser,
  lang // 🌍 UserDash-dan kelayotgan til state-i
}) {

  // 📝 Sidebar uchun tillar tarjimasi
  const translations = {
    uz: {
      panel: "Panel",
      kodKiritish: "Kod kiritish",
      katalog: "Katalog", // 📂 Yangi tarjima
      magazin: "Magazin",
      sozlamalar: "Sozlamalar",
      chiqish: "Chiqish",
      usta: "Usta"
    },
    ru: {
      panel: "Панель",
      kodKiritish: "Ввод кода",
      katalog: "Каталог", // 📂 Yangi tarjima
      magazin: "Магазин",
      sozlamalar: "Настройки",
      chiqish: "Выйти",
      usta: "Мастер"
    }
  };

  const t = translations[lang] || translations["uz"];

  return (
    <aside className="dash-sidebar">
      
      {/* 💻 LOGOTIP QISMI */}
      <div className="sidebar-top-section">
        <div className="sidebar-logo">
          <div className="logo-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>  
          </div>
          <div className="logo-text">
            <h2>USTA PANEL</h2>
            <span>USTALAR BAZASI</span>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATSIYA MENYUSI */}
      <nav className="sidebar-menu">
        <button 
          className={`menu-item ${activeTab === "home" ? "active" : ""}`} 
          onClick={() => setActiveTab("home")}
        >
          <div className="icon-wrapper">
            <FaChartBar className="icon" />
          </div>
          <span>{t.panel}</span>
          {activeTab === "home" && <span className="active-indicator" />}
        </button>

        <button 
          className={`menu-item ${activeTab === "code" ? "active" : ""}`} 
          onClick={() => setActiveTab("code")}
        >
          <div className="icon-wrapper">
            <FaKey className="icon" />
          </div>
          <span>{t.kodKiritish}</span>
          {activeTab === "code" && <span className="active-indicator" />}
        </button>

        {/* 📂 READ-ONLY KATALOG TUGMASI */}
        <button 
          className={`menu-item ${activeTab === "katalog" ? "active" : ""}`} 
          onClick={() => setActiveTab("katalog")}
        >
          <div className="icon-wrapper">
            <FaThList className="icon" />
          </div>
          <span>{t.katalog}</span>
          {activeTab === "katalog" && <span className="active-indicator" />}
        </button>

        <button 
          className={`menu-item ${activeTab === "magazin" ? "active" : ""}`} 
          onClick={() => setActiveTab("magazin")}
        >
          <div className="icon-wrapper">
            <FaGift className="icon" />
          </div>
          <span>{t.magazin}</span>
          {activeTab === "magazin" && <span className="active-indicator" />}
        </button>

        <button 
          className={`menu-item ${activeTab === "settings" ? "active" : ""}`} 
          onClick={() => setActiveTab("settings")}
        >
          <div className="icon-wrapper">
            <FaCogs className="icon" />
          </div>
          <span>{t.sozlamalar}</span>
          {activeTab === "settings" && <span className="active-indicator" />}
        </button>

        <button className="menu-item mobile-logout-btn" onClick={() => setShowLogoutModal(true)}>
          <div className="icon-wrapper">
            <FaSignOutAlt className="icon" />
          </div>
          <span>{t.chiqish}</span>
        </button>
      </nav>

      {/* 👤 PROFIL KARTASI (Ekran kichrayganda ham yo'qolmaydi) */}
      <div className="sidebar-footer show-on-mobile">
        <div className="user-profile-card">
          <div className="user-avatar">
            <span>{currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "U"}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.full_name || t.usta}</span>
            <span className="user-role">{t.usta}</span>
          </div>
          <button className="sidebar-logout-shortcut" onClick={() => setShowLogoutModal(true)} title={t.chiqish}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>

    </aside>
  );
}