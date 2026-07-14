import React, { useState, useEffect, useRef } from "react";
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaSave, 
  FaSignOutAlt, 
  FaChevronLeft, 
  FaChevronDown, 
  FaChevronUp,
  FaHeadset,
  FaGlobe
} from "react-icons/fa";
import "./setting.css";

const regionsData = {
  "Toshkent shahri": [
    "Yunusobod tumani", "Chilonzor tumani", "Mirzo Ulug'bek tumani", 
    "Yashnobod tumani", "Mirobod tumani", "Sergeli tumani", "Uchtepa tumani",
    "Shayxontohur tumani", "Olmazor tumani", "Yakkasaroy tumani", "Bektemir tumani", "Yangihayot tumani"
  ],
  "Toshkent viloyati": [
    "Nurafshon shahri", "Angren shahri", "Olmaliq shahri", "Chirchiq shahri", "Bekobod shahri",
    "Oqqurgan tumani", "Olmaliq tumani", "Bekobod tumani", "Bo'stonliq tumani", "Bo'ka tumani",
    "Chinaz tumani", "Qibray tumani", "Parkent tumani", "Pskent tumani", "Zangiota tumani",
    "Yuqorichirchiq tumani", "Yangiyo'l tumani", "O'rtachirchiq tumani", "Toshkent tumani"
  ],
  "Samarqand": [
    "Samarqand shahri", "Kattaqo'rg'on shahri", "Pastdarg'om tumani", "Oqdaryo tumani", 
    "Bulung'ur tumani", "Jomboy tumani", "Urgut tumani", "Ishtixon tumani", "Kattaqo'rg'on tumani",
    "Narpay tumani", "Nurobod tumani", "Payariq tumani", "Pasdarg'om tumani", "Samarqand tumani",
    "Toyloq tumani", "Qo'shrabot tumani"
  ],
  "Andijon": [
    "Andijon shahri", "Xonobod shahri", "Asaka tumani", "Shahrixon tumani", "Izboskan tumani", 
    "Marhamat tumani", "Andijon tumani", "Baliqchi tumani", "Bo'ston tumani", "Buloqboshi tumani",
    "Jalaquduq tumani", "Katta Farg'ona tumani", "Paxtaobod tumani", "Ulug'nor tumani", "Xo'jaobod tumani"
  ],
  "Buxoro": [
    "Buxoro shahri", "Kogon shahri", "Gijduvon tumani", "Kogon tumani", "Vobkent tumani", 
    "Qorako'l tumani", "Olot tumani", "Buxoro tumani", "Jondor tumani", "Qorashina tumani",
    "Romitan tumani", "Shofirkon tumani", "Peshku tumani"
  ],
  "Farg'ona": [
    "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", "Quvasoy shahri", "Quva tumani", 
    "Oltiariq tumani", "Rishton tumani", "Bog'dod tumani", "Beshariq tumani", "Buvayda tumani",
    "Dang'ara tumani", "Farg'ona tumani", "Furqat tumani", "Qo'shtepa tumani", "Yozyovon tumani",
    "Uchko'prik tumani", "O'zbekiston tumani", "Yazyavan tumani"
  ],
  "Jizzax": [
    "Jizzax shahri", "Arnasoy tumani", "Baxmal tumani", "Do'stlik tumani", "Sharaf Rashidov tumani",
    "G'allaarol tumani", "Forish tumani", "Yangiobod tumani", "Paxtakor tumani", "Mirzacho'l tumani",
    "Zamin tumani", "Zafarobod tumani"
  ],
  "Namangan": [
    "Namangan shahri", "Chust tumani", "Kosonsoy tumani", "Mingbuloq tumani", "Namangan tumani",
    "Norin tumani", "Pop tumani", "To'raqo'rg'on tumani", "Uychi tumani", "Uchqo'rg'on tumani",
    "Chortoq tumani", "Yangiqo'rg'on tumani", "Davlatobod tumani"
  ],
  "Navoiy": [
    "Navoiy shahri", "Zarafshon shahri", "Karmana tumani", "Konimex tumani", "Navbahor tumani",
    "Nurota tumani", "Tomdi tumani", "Uchquduq tumani", "Xatirchi tumani", "Qiziltepa tumani"
  ],
  "Qashqadaryo": [
    "Karshi shahri", "Shahrisabz shahri", "Chiroqchi tumani", "Dehqonobod tumani", "G'uzor tumani",
    "Kasbi tumani", "Kitob tumani", "Koson tumani", "Mirishkor tumani", "Muborak tumani",
    "Nishon tumani", "Qamashi tumani", "Shahrisabz tumani", "Yakkabog' tumani", "Ko'kdala tumani"
  ],
  "Surxondaryo": [
    "Termiz shahri", "Angor tumani", "Boysun tumani", "Denov tumani", "Jarqo'rg'on tumani",
    "Kizirik tumani", "Kumqo'rg'on tumani", "Muzrabot tumani", "Oltinsoy tumani", "Sariosiyo tumani",
    "Sherobod tumani", "Sho'rchi tumani", "Termiz tumani", "Uzun tumani"
  ],
  "Sirdaryo": [
    "Guliston shahri", "Shirin shahri", "Yangiyer shahri", "Boyovut tumani", "Guliston tumani",
    "Mirzaobod tumani", "Oqoltin tumani", "Sayxunobod tumani", "Sardoba tumani", "Sirdaryo tumani",
    "Xavast tumani"
  ],
  "Xorazm": [
    "Urganch shahri", "Xiva shahri", "Bog'ot tumani", "Gurlan tumani", "Qo'shko'pir tumani",
    "Shovot tumani", "To'proqqala tumani", "Xazorasp tumani", "Xanka tumani", "Xiva tumani",
    "Yangiariq tumani", "Yangibozor tumani"
  ],
  "Qoraqalpog'iston Respublikasi": [
    "Nukus shahri", "Amudaryo tumani", "Beruniy tumani", "Chimboy tumani", "Ellikqal'a tumani",
    "Kegeyli tumani", "Mo'ynoq tumani", "Nukus tumani", "Qanliko'l tumani", "Qo'ng'irot tumani",
    "Qorao'zak tumani", "Shumanay tumani", "Taxtako'pir tumani", "To'rtko'l tumani", "Xo'jayli tumani",
    "Taxiatosh shahri", "Bo'zatov tumani"
  ]
};

export default function SettingsTab({
  isEditing,
  setIsEditing,
  editName,
  setEditName,
  editRegion,
  setEditRegion,
  editDistrict,      
  setEditDistrict,   
  currentUser,
  saveLoading,
  handleSaveProfile,
  setShowLogoutModal,
  lang,          
  changeLanguage, 
  onBack
}) {
  const [districtsList, setDistrictsList] = useState([]);
  
  // Custom dropdownlarning ochiq/yopiqligini boshqarish
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const regionRef = useRef(null);
  const districtRef = useRef(null);

  // Dropdown ochilganda boshqa joyga bossa avtomatik yopilish mexanizmi
  useEffect(() => {
    function handleClickOutside(event) {
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        setIsRegionOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Viloyat o'zgarganda tumanlar ro'yxatini shakllantirish
  useEffect(() => {
    if (editRegion && regionsData[editRegion]) {
      setDistrictsList(regionsData[editRegion]);
    } else {
      setDistrictsList([]);
    }
  }, [editRegion]);

  const translations = {
    uz: {
      headerTitle: "Profil sozlamalari",
      fullNameLabel: "To'liq ism-sharifingiz",
      fullNamePlaceholder: "Ism va familiyangizni kiriting",
      regionLabel: "Viloyat",
      regionPlaceholder: "Viloyatni tanlang",
      districtLabel: "Tuman",
      districtPlaceholder: "Tumanni tanlang",
      saveBtn: "O'zgarishlarni saqlash",
      savingBtn: "Saqlanmoqda...",
      logoutBtn: "Tizimdan chiqish",
      supportTitle: "Mijozlarni qo'llab-quvvatlash xizmati",
      supportContact: "Biz bilan bog'lanish",
      langLabel: "Tizim tili"
    },
    ru: {
      headerTitle: "Настройки профиля",
      fullNameLabel: "Ваше полное имя",
      fullNamePlaceholder: "Введите имя и фамилию",
      regionLabel: "Область",
      regionPlaceholder: "Выберите область",
      districtLabel: "Район",
      districtPlaceholder: "Выберите район",
      saveBtn: "Сохранить изменения",
      savingBtn: "Сохранение...",
      logoutBtn: "Выйти из системы",
      supportTitle: "Служба поддержки клиентов",
      supportContact: "Связаться с нами",
      langLabel: "Язык системы"
    }
  };

  const t = translations[lang] || translations["uz"];

  return (
    <div className="settings-tab-wrapper">
      
      {/* 1. HEADER */}
      <div className="settings-tab-header">
        <button className="settings-back-arrow" onClick={onBack}>
          <FaChevronLeft size={18} />
        </button>
        <h2>{t.headerTitle}</h2>
        <div style={{ width: 40 }}></div>
      </div>

      {/* 2. ASOSIY KARTA (MAIN CARD) */}
      <div className="settings-main-card">
        
        {/* AVATAR QISMI (Kamera belgisi butunlay olib tashlandi) */}
        <div className="settings-user-profile-summary">
          <div className="settings-large-avatar">
            <FaUser size={40} />
          </div>
          <h3>{currentUser?.full_name || (lang === "uz" ? "Foydalanuvchi" : "Пользователь")}</h3>
          <p className="settings-user-phone">{currentUser?.phone || "+998 -- --- -- --"}</p>
        </div>

        {/* 🌐 TIZIM TILI SEKSIYASI */}
        <div className="settings-input-block">
          <label><FaGlobe className="form-icon-accent" /> {t.langLabel}</label>
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ fontWeight: "600", cursor: "pointer" }}
          >
            <option value="uz">O'zbekcha (UZ)</option>
            <option value="ru">Русский (RU)</option>
          </select>
        </div>

        {/* INPUT: TO'LIQ ISM */}
        <div className="settings-input-block">
          <label><FaUser className="form-icon-accent" /> {t.fullNameLabel}</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t.fullNamePlaceholder}
          />
        </div>

        {/* CUSTOM DROPDOWN: VILOYAT */}
        <div className="settings-input-block" ref={regionRef}>
          <label><FaMapMarkerAlt className="form-icon-accent" /> {t.regionLabel}</label>
          <div 
            className={`custom-select-trigger ${isRegionOpen ? "open" : ""}`}
            onClick={() => setIsRegionOpen(!isRegionOpen)}
          >
            <span>{editRegion || t.regionPlaceholder}</span>
            {isRegionOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </div>
          
          {isRegionOpen && (
            <div className="custom-select-options">
              {Object.keys(regionsData).map((regionName) => (
                <div 
                  key={regionName} 
                  className={`custom-option ${editRegion === regionName ? "selected" : ""}`}
                  onClick={() => {
                    setEditRegion(regionName);
                    if (typeof setEditDistrict === "function") {
                      setEditDistrict(""); // Viloyat o'zgarsa tuman qiymatini tozalaydi
                    }
                    setIsRegionOpen(false);
                  }}
                >
                  {regionName}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOM DROPDOWN: TUMAN / SHAHAR */}
        <div className={`settings-input-block ${!editRegion ? "disabled-block" : ""}`} ref={districtRef}>
          <label><FaMapMarkerAlt className="form-icon-accent" /> {t.districtLabel}</label>
          <div 
            className={`custom-select-trigger ${isDistrictOpen ? "open" : ""} ${!editRegion ? "disabled" : ""}`}
            onClick={() => editRegion && setIsDistrictOpen(!isDistrictOpen)}
          >
            <span>{editDistrict || t.districtPlaceholder}</span>
            {isDistrictOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </div>
          
          {isDistrictOpen && editRegion && (
            <div className="custom-select-options">
              {districtsList.map((districtName) => (
                <div 
                  key={districtName} 
                  className={`custom-option ${editDistrict === districtName ? "selected" : ""}`}
                  onClick={() => {
                    if (typeof setEditDistrict === "function") {
                      setEditDistrict(districtName);
                    }
                    setIsDistrictOpen(false);
                  }}
                >
                  {districtName}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAQLASH VA CHIQISH TUGMALARI */}
        <div className="settings-action-buttons">
          <button 
            className="settings-submit-btn" 
            onClick={handleSaveProfile}
            disabled={saveLoading}
          >
            <FaSave /> {saveLoading ? t.savingBtn : t.saveBtn}
          </button>

          <button className="settings-exit-btn" onClick={() => setShowLogoutModal(true)}>
            <FaSignOutAlt /> {t.logoutBtn}
          </button>
        </div>
      </div>

      {/* 3. SUPPORT (QO'LLAB-QUVVATLASH) BLOKI - Yangilangan raqam va telegram bot */}
      <div className="settings-support-container-card">
        <div className="settings-support-heading">
          <FaHeadset className="support-blue-icon" />
          <h4>{t.supportTitle}</h4>
        </div>
        
        <div className="settings-support-row">
          <span className="support-service-label">{lang === "uz" ? "Telefon raqam" : "Номер телефона"}</span>
          <a href="tel:+998955000044" className="support-phone-anchor">+998 (95) 500 00 44</a>
        </div>

        <div className="settings-support-telegram-box">
          <span className="support-service-label">Telegram</span>
          <a href="https://t.me/titova_sam" target="_blank" rel="noopener noreferrer" className="support-telegram-anchor">
            @titova_sam
          </a>
        </div>
      </div>

    </div>
  );
}