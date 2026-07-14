import React, { useState, useEffect } from "react";
import { 
  FiSliders, 
  FiTool, 
  FiCode, 
  FiCalendar, 
  FiFileText,
  FiCamera,
  FiGift,
  FiShoppingBag,
  FiLayers, 
  FiX 
} from "react-icons/fi"; 
import "./sidebar.css"; 

export default function Sidebar({
  activeTab,
  setActiveTab,
  mastersCount = 0,
  codesCount = 0,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  lang = "uz"
}) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.full_name) setAdminName(userObj.full_name);
      } catch (e) {
        console.error("User parsing error", e);
      }
    }
  }, []);

  const translations = {
    uz: {
      brandSub: "DO'KON BOSHQARUVI",
      dashboard: "Dashboard / Asosiy",
      masters: `Ustalar Bazasi (${mastersCount})`,
      generator: `Kod Generator (${codesCount})`,
      katalog: "Mahsulotlar Katalogi", 
      magazin: "Sovg'alar Do'koni", 
      aksiya: "Aksiya Muddatlari",
      news: "Yangiliklar va Maslahatlar",
      history: "Kodlar Tarixi (Foto)", 
      role: "Admin"
    },
    ru: {
      brandSub: "УПРАВЛЕНИЕ МАГАЗИНОМ",
      dashboard: "Главная / Панель",
      masters: `База Мастеров (${mastersCount})`,
      generator: `Генератор Кодов (${codesCount})`,
      katalog: "Каталог Товаров", 
      magazin: "Магазин Подарков", 
      aksiya: "Сроки Акций",
      news: "Новости и Советы",
      history: "История Кодов (Фото)", 
      role: "Админ"
    }
  };

  const t = translations[lang] || translations.uz;

  const menuItems = [
    { id: "dashboard", label: t.dashboard, icon: <FiSliders /> },
    { id: "ustalar", label: t.masters, icon: <FiTool /> },
    { id: "random", label: t.generator, icon: <FiCode /> },
    { id: "katalog", label: t.katalog, icon: <FiLayers /> }, 
    { id: "magazin", label: t.magazin, icon: <FiGift /> }, 
    { id: "aksiya", label: t.aksiya, icon: <FiCalendar /> },
    { id: "maslahatlar", label: t.news, icon: <FiFileText /> }, 
    { id: "history", label: t.history, icon: <FiCamera /> }, 
  ];

  // Admin ismining birinchi harfini avatar uchun olish (masalan, "Sayyidbek" -> "S")
  const firstLetter = adminName ? adminName.charAt(0).toUpperCase() : "A";

  return (
    <aside className={`custom-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      
      {/* Yuqori qism: Brend */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FiShoppingBag size={20} style={{ strokeWidth: "2.5px" }} />
        </div>
        <div className="brand-text">
          <h2>ADMIN PANEL</h2>
          <span>{t.brandSub}</span>
        </div>

        {isMobileMenuOpen && (
          <button className="sidebar-close-inner" onClick={() => setIsMobileMenuOpen(false)}>
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Navigatsiya menyusi */}
      <nav className="sidebar-menu">
        <ul>
          {/* Asosiy menyu elementlari */}
          {menuItems.map((item) => (
            <li 
              key={item.id} 
              className={activeTab === item.id ? "active" : ""}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false); 
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {activeTab === item.id && <span className="active-indicator"></span>}
            </li>
          ))}

          {/* 👥 Chiziq (Ajratuvchi) */}
          <li className="menu-divider"></li>

          {/* 👤 Menyu tugmasi shaklidagi yangi profil elementi */}
          <li 
            className={`profile-menu-item ${activeTab === "profil" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("profil");
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="menu-avatar">
              {firstLetter}
            </div>
            <span className="menu-label">{adminName} ({t.role})</span>
            {activeTab === "profil" && <span className="active-indicator"></span>}
          </li>
        </ul>
      </nav>

    </aside>
  );
}