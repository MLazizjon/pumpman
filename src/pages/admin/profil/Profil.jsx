import React, { useState, useEffect, useRef } from "react";
import { 
  FiGlobe, FiSettings, FiLogOut, FiUser, 
  FiAlertTriangle, FiArrowLeft, FiPhone, FiChevronDown 
} from "react-icons/fi";
import { FaHeadset } from "react-icons/fa";
import "./profil.css";

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
    "Dang'ara tumani", "Farg'ona tumani", "Furqat tumani", "Qo'shtepa tumani", "Uchko'prik tumani", 
    "O'zbekiston tumani", "Yazyavan tumani"
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

export default function ProfilTab({ handleLogout, lang, changeLanguage }) {
  const [adminData, setAdminData] = useState({
    full_name: "Samandar",
    phone: "+998902700901",
    role: "Admin",
    region: "Samarqand",
    district: ""
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubSettings, setShowSubSettings] = useState(false);
  const [districtsList, setDistrictsList] = useState([]);

  // Custom Dropdownlar uchun ochiq/yopiq holat statelari
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const [editForm, setEditForm] = useState({ ...adminData });

  const regionRef = useRef(null);
  const districtRef = useRef(null);

  const t = {
    uz: {
      langTitle: "Tizim tili (Language)",
      settingsTitle: "Nastroyka / Boshqaruv",
      settingsSub: "Profil ma'lumotlari, hudud va shaxsiy sozlamalar",
      open: "Ochish",
      logoutTitle: "Tizimdan chiqish",
      logoutBtn: "Tizimdan chiqish",
      modalText: "Rostdan ham chiqmoqchimisiz?",
      cancel: "Bekor qilish",
      confirm: "Chiqish",
      save: "Saqlash",
      myProfile: "Mening profilim",
      supportTitle: "Mijozlarni qo'llab-quvvatlash xizmati"
    },
    ru: {
      langTitle: "Язык системы (Language)",
      settingsTitle: "Настройки / Управление",
      settingsSub: "Данные профиля, регион и личные настройки",
      open: "Открыть",
      logoutTitle: "Выход из системы",
      logoutBtn: "Выйти из системы",
      modalText: "Вы действительно хотите выйти?",
      cancel: "Отмена",
      confirm: "Выйти",
      save: "Сохранить",
      myProfile: "Мой профиль",
      supportTitle: "Служба поддержки клиентов"
    }
  }[lang] || { uz: {} };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        const initialData = {
          full_name: userObj.full_name || "Samandar",
          phone: userObj.phone || "+998902700901",
          role: userObj.role || "Admin",
          region: userObj.region || "Samarqand",
          district: userObj.district || ""
        };
        setAdminData(initialData);
        setEditForm(initialData);
      } catch (e) {
        console.error("Xatolik:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (editForm.region && regionsData[editForm.region]) {
      setDistrictsList(regionsData[editForm.region]);
    } else {
      setDistrictsList([]);
    }
  }, [editForm.region]);

  // Tashqariga bosilganda dropdownlarni yopish elementlari
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

  const handleSaveSettings = () => {
    setAdminData({ ...editForm });
    localStorage.setItem("user", JSON.stringify({ ...JSON.parse(localStorage.getItem("user") || "{}"), ...editForm }));
    alert(lang === "uz" ? "Ma'lumotlar muvaffaqiyatli saqlandi!" : "Данные успешно сохранены!");
    setShowSubSettings(false);
  };

  if (showSubSettings) {
    return (
      <div className="profil-tab-container animate-fade">
        <div className="edit-profile-navbar">
          <button className="nav-back-btn" onClick={() => setShowSubSettings(false)}>
            <FiArrowLeft />
          </button>
          <h2>{t.myProfile}</h2>
          <button className="nav-save-btn" onClick={handleSaveSettings}>
            {t.save}
          </button>
        </div>

        {/* Avatar qismi - Rasm yuklash (Badge va input) butunlay olib tashlandi */}
        <div className="edit-avatar-container">
          <div className="edit-avatar-wrapper">
            <FiUser className="edit-avatar-icon" />
          </div>
        </div>

        <div className="edit-form-grid">
          
          {/* Custom Dropdown: Viloyat */}
          <div className="edit-input-group" ref={regionRef}>
            <label>{lang === "uz" ? "Viloyat" : "Регион"}</label>
            <div className="custom-dropdown-container">
              <div 
                className={`custom-dropdown-header ${isRegionOpen ? "active" : ""}`}
                onClick={() => setIsRegionOpen(!isRegionOpen)}
              >
                <span>{editForm.region || (lang === "uz" ? "Viloyatni tanlang" : "Выберите регион")}</span>
                <FiChevronDown className={`dropdown-arrow-icon ${isRegionOpen ? "rotate" : ""}`} />
              </div>
              
              {isRegionOpen && (
                <div className="custom-dropdown-menu animate-dropdown">
                  {Object.keys(regionsData).map((regionName) => (
                    <div 
                      key={regionName}
                      className={`custom-dropdown-item ${editForm.region === regionName ? "selected" : ""}`}
                      onClick={() => {
                        setEditForm({ ...editForm, region: regionName, district: "" });
                        setIsRegionOpen(false);
                      }}
                    >
                      {regionName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Dropdown: Tuman */}
          <div className="edit-input-group" ref={districtRef}>
            <label>{lang === "uz" ? "Tuman" : "Район"}</label>
            <div className="custom-dropdown-container">
              <div 
                className={`custom-dropdown-header ${isDistrictOpen ? "active" : ""} ${!editForm.region ? "disabled" : ""}`}
                onClick={() => editForm.region && setIsDistrictOpen(!isDistrictOpen)}
              >
                <span>{editForm.district || (lang === "uz" ? "Tumanni tanlang" : "Выберите район")}</span>
                <FiChevronDown className={`dropdown-arrow-icon ${isDistrictOpen ? "rotate" : ""}`} />
              </div>

              {isDistrictOpen && editForm.region && (
                <div className="custom-dropdown-menu animate-dropdown">
                  {districtsList.map((districtName) => (
                    <div 
                      key={districtName}
                      className={`custom-dropdown-item ${editForm.district === districtName ? "selected" : ""}`}
                      onClick={() => {
                        setEditForm({ ...editForm, district: districtName });
                        setIsDistrictOpen(false);
                      }}
                    >
                      {districtName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ism va Familiya */}
          <div className="edit-input-group">
            <label>{lang === "uz" ? "Ism va Familiya" : "Фамилия и Имя"}</label>
            <input 
              type="text" 
              value={editForm.full_name} 
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              placeholder={lang === "uz" ? "Ism va familiyani kiriting" : "Введите имя и фамилию"}
            />
          </div>

          {/* Telefon / Referal Raqam */}
          <div className="edit-input-group">
            <label>{lang === "uz" ? "Referal raqami" : "Номер реферала"}</label>
            <div className="phone-input-wrapper">
              <span className="phone-icon-badge"><FiPhone /></span>
              <input 
                type="text" 
                value={editForm.phone} 
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+998902700901"
              />
            </div>
          </div>
        </div>

        {/* Mijozlarni qo'llab-quvvatlash xizmati */}
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

  return (
    <div className="profil-tab-container animate-fade">
      <div className="profil-header">
        <div className="profil-avatar">
          <FiUser />
        </div>
        <div className="profil-meta">
          <h2>{adminData.full_name}</h2>
          <span className="role-badge">{adminData.role.toUpperCase()}</span>
          <p className="phone-text">{adminData.phone} | {adminData.region} {adminData.district && `, ${adminData.district}`}</p>
        </div>
      </div>

      <hr className="profil-divider" />

      <div className="profil-sections">
        <div className="profil-card">
          <div className="card-title">
            <FiGlobe className="card-icon language-icon-color" />
            <h3>{t.langTitle}</h3>
          </div>
          <div className="language-selector">
            <button 
              className={lang === "uz" ? "lang-btn active" : "lang-btn"} 
              onClick={() => changeLanguage("uz")}
            >
              O'zbekcha (UZ)
            </button>
            <button 
              className={lang === "ru" ? "lang-btn active" : "lang-btn"} 
              onClick={() => changeLanguage("ru")}
            >
              Русский (RU)
            </button>
          </div>
        </div>

        <div className="profil-card click-card" onClick={() => { setEditForm({...adminData}); setShowSubSettings(true); }}>
          <div className="card-title-flex">
            <div className="card-title">
              <FiSettings className="card-icon settings-icon-color" />
              <div>
                <h3>{t.settingsTitle}</h3>
                <p className="card-subtext">{t.settingsSub}</p>
              </div>
            </div>
            <button className="open-settings-action-btn">{t.open}</button>
          </div>
        </div>

        <div className="profil-card logout-card">
          <button className="profil-logout-btn" onClick={() => setIsModalOpen(true)}>
            <FiLogOut /> {t.logoutBtn}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">
              <FiAlertTriangle />
            </div>
            <h3>{t.logoutTitle}</h3>
            <p>{t.modalText}</p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setIsModalOpen(false)}>
                {t.cancel}
              </button>
              <button className="modal-btn confirm-btn" onClick={handleLogout}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}