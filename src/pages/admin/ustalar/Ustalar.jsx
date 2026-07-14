import React, { useState } from "react";
import { 
  FaEye, FaArrowLeft, FaPhoneAlt, FaMapMarkerAlt, 
  FaAward, FaBarcode, FaClock, FaCheckCircle, FaToggleOn, FaToggleOff,
  FaSearch 
} from "react-icons/fa";
import { supabase } from "../../../supabase/client"; 
import { toast } from "react-toastify";
import "./ustalar.css"; 

export default function MastersTab({ mastersList = [], toggleMasterStatus, lang = "uz" }) {
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🌍 Ustalar bo'limi uchun ko'p tillilik lug'ati
  const translations = {
    uz: {
      backToList: "Ro'yxatga qaytish",
      professionalMaster: "Professional Usta / Hamkor",
      statusActive: "FAOL",
      statusInactive: "FAOL EMAS",
      totalScanned: "Jami skanerlangan",
      unitProducts: "ta mahsulot",
      totalBonus: "To'plangan jami bonus",
      unitBall: "ball",
      serviceRegion: "Xizmat ko'rsatish hududi",
      notEntered: "Kiritilmagan",
      notIndicated: "Ko'rsatilmagan",
      historyTitle: "Skanerlangan Shtrix-kodlar Tarixi",
      thBarcode: "Shtrix-kod (Promo)",
      thScannedTime: "Skanerlangan vaqti",
      thStatus: "Holati",
      loadingHistory: "Tarix yuklanmoqda...",
      noHistory: "Ushbu usta hali shtrix-kod skanerlamagan.",
      approved: "Tasdiqlangan",
      mainTitle: "Ustalar Umumiy Bazasi",
      searchPlaceholder: "Ism, raqam, viloyat yoki tuman...",
      thName: "F.I.Sh (To'liq ism)",
      thPhone: "Telefon Raqami",
      thRegion: "Viloyat / Tuman",
      thScore: "To'plangan Ball",
      thMasterStatus: "Holati", // 🌟 Duplikat kalit o'zgartirildi
      thProfile: "Profil",
      actionActive: "Faol",
      actionInactive: "Yopiq",
      btnView: "Ko'rish",
      noMasters: "Bazada hozircha birorta ham usta mavjud emas.",
      noResults: "Qidiruv bo'yicha hech qanday usta topilmadi."
    },
    ru: {
      backToList: "Вернуться к списку",
      professionalMaster: "Профессиональный Мастер / Партнер",
      statusActive: "АКТИВЕН",
      statusInactive: "НЕ АКТИВЕН",
      totalScanned: "Всего отсканировано",
      unitProducts: "шт. товаров",
      totalBonus: "Всего накоплено бонусов",
      unitBall: "баллов",
      serviceRegion: "Территория обслуживания",
      notEntered: "Не указано",
      notIndicated: "Не указано",
      historyTitle: "История отсканированных штрих-кодов",
      thBarcode: "Штрих-код (Промо)",
      thScannedTime: "Время сканирования",
      thStatus: "Статус",
      loadingHistory: "Загрузка истории...",
      noHistory: "Этот мастер еще не сканировал штрих-коды.",
      approved: "Подтверждено",
      mainTitle: "Общая База Мастеров",
      searchPlaceholder: "Имя, номер, регион или район...",
      thName: "Ф.И.О (Полное имя)",
      thPhone: "Номер телефона",
      thRegion: "Регион / Район",
      thScore: "Набранные баллы",
      thMasterStatus: "Статус", // 🌟 Duplikat kalit o'zgartirildi
      thProfile: "Профиль",
      actionActive: "Активен",
      actionInactive: "Закрыт",
      btnView: "Смотреть",
      noMasters: "В базе пока нет ни одного мастера.",
      noResults: "По вашему запросу мастера не найдены."
    }
  };

  const t = translations[lang] || translations.uz;

  const handleMasterClick = async (master) => {
    setSelectedMaster(master);
    setLoadingCodes(true);
    try {
      const { data: codesData, error: codesError } = await supabase
        .from("used_codes")
        .select(`
          id,
          created_at,
          promo_codes (code)
        `)
        .eq("user_id", master.id)
        .order("created_at", { ascending: false });

      if (!codesError && codesData) {
        setScannedCodes(codesData);
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === "ru" ? "Ошибка при загрузке истории" : "Tarixni yuklashda xatolik yuz berdi");
    } finally {
      setLoadingCodes(false);
    }
  };

  // 🔍 Qidiruv tizimi
  const filteredMasters = mastersList.filter((master) => {
    const fullName = (master.full_name || "").toLowerCase();
    const phone = (master.phone || "").toLowerCase();
    const region = (master.region || "").toLowerCase();
    const district = (master.district || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      fullName.includes(search) || 
      phone.includes(search) || 
      region.includes(search) || 
      district.includes(search)
    );
  });

  // 👤 BATAFSIL PROFIL SAHIFASI
  if (selectedMaster) {
    const avatarText = selectedMaster.full_name 
      ? selectedMaster.full_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
      : "US";

    return (
      <div className="tab-section fade-in-tab">
        <button onClick={() => setSelectedMaster(null)} className="back-to-list-btn">
          <FaArrowLeft /> {t.backToList}
        </button>

        <div className="master-profile-main-card">
          <div className="profile-header-flex">
            <div className="profile-avatar-large">
              {avatarText}
            </div>
            <div className="profile-main-info">
              <h2>{selectedMaster.full_name || t.notEntered}</h2>
              <p className="profile-subtitle">{t.professionalMaster}</p>
              <div className="profile-contact-row">
                <span><FaPhoneAlt /> {selectedMaster.phone || "-"}</span>
                <span className={selectedMaster.is_active !== false ? "status-badge-active" : "status-badge-inactive"}>
                  {selectedMaster.is_active !== false ? t.statusActive : t.statusInactive}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-stats-grid">
          <div className="detail-stat-item-card">
            <div className="card-icon-wrap blue-bg">
              <FaBarcode />
            </div>
            <div className="card-icon-wrap">
              <span>{t.totalScanned}</span>
              <h3>{scannedCodes.length} {t.unitProducts}</h3>
            </div>
          </div>

          <div className="detail-stat-item-card">
            <div className="card-icon-wrap gold-bg">
              <FaAward />
            </div>
            <div className="card-icon-wrap">
              <span>{t.totalBonus}</span>
              <h3 className="gold-text">{selectedMaster.bonus || 0} {t.unitBall}</h3>
            </div>
          </div>

          <div className="detail-stat-item-card">
            <div className="card-icon-wrap green-bg">
              <FaMapMarkerAlt />
            </div>
            <div className="card-icon-wrap">
              <span>{t.serviceRegion}</span>
              <h3>
                {selectedMaster.region 
                  ? `${selectedMaster.region}${selectedMaster.district ? ` / ${selectedMaster.district}` : ""}`
                  : t.notIndicated}
              </h3>
            </div>
          </div>
        </div>

        <div className="history-table-section-card">
          <div className="section-title-wrap">
            <FaClock className="title-icon" />
            <h3>{t.historyTitle}</h3>
          </div>

          <div className="detail-table-wrapper">
            <table className="detail-custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.thBarcode}</th>
                  <th>{t.thScannedTime}</th>
                  <th>{t.thStatus}</th>
                </tr>
              </thead>
              <tbody>
                {loadingCodes ? (
                  <tr>
                    <td colSpan="4" className="empty-table-text">{t.loadingHistory}</td>
                  </tr>
                ) : scannedCodes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-table-text">{t.noHistory}</td>
                  </tr>
                ) : (
                  scannedCodes.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td className="barcode-font">{item.promo_codes?.code || "NOMA'LUM"}</td>
                      <td>{new Date(item.created_at).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")}</td>
                      <td>
                        <span className="status-success-label">
                          <FaCheckCircle /> {t.approved}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 📋 ASOSIY USTALAR RO'YXATI SAHIFASI
  return (
    <div className="tab-section fade-in-tab">
      <div className="table-header-flex">
        <h3>{t.mainTitle}</h3>
        
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t.thName}</th>
              <th>{t.thPhone}</th>
              <th>{t.thRegion}</th>
              <th>{t.thScore}</th>
              <th>{t.thMasterStatus}</th> {/* 🌟 Yangi kalit nomi ulandi */}
              <th>{t.thProfile}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMasters.map((master, index) => {
              const isActive = master.is_active !== false;
              return (
                <tr key={master.id} className="clickable-row" onClick={() => handleMasterClick(master)}>
                  <td>{index + 1}</td>
                  <td className="master-name">{master.full_name || t.notEntered}</td>
                  <td>{master.phone || "-"}</td>
                  <td>
                    {master.region 
                      ? `${master.region}${master.district ? `, ${master.district}` : ""}` 
                      : "-"}
                  </td>
                  <td>
                    <span className="master-score">{master.bonus || 0} {t.unitBall}</span>
                  </td>
                  <td>
                    <button 
                      className={`status-toggle-btn ${isActive ? "active" : "inactive"}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        if (toggleMasterStatus) {
                          toggleMasterStatus(master.id, master.is_active);
                        } else {
                          console.warn("toggleMasterStatus funksiyasi props orqali kelmadi!");
                        }
                      }}
                    >
                      {isActive ? <FaToggleOn size={22} color="#10b981" /> : <FaToggleOff size={22} color="#ef4444" />}
                      <span style={{ marginLeft: "5px" }}>{isActive ? t.actionActive : t.actionInactive}</span>
                    </button>
                  </td>
                  <td>
                    <button className="view-profile-btn" onClick={(e) => {
                      e.stopPropagation(); 
                      handleMasterClick(master);
                    }}>
                      <FaEye /> {t.btnView}
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {mastersList.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row-text">{t.noMasters}</td>
              </tr>
            )}

            {mastersList.length > 0 && filteredMasters.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row-text">{t.noResults}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}