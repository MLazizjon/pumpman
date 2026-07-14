import React, { useState, useEffect } from "react";
import { FaTrophy, FaCheckCircle, FaHourglassHalf, FaListOl, FaChartBar, FaCalendarAlt, FaTimes, FaLightbulb } from "react-icons/fa";
import { supabase } from "../../../supabase/client"; 
import "./home.css"; 

// 📝 Ko'p tilli tarjimalar lug'ati (Komponentdan tashqariga chiqarildi)
const translations = {
  uz: {
    place: "-o'rin",
    confirmed: "Tasdiqlangan",
    pending: "Kutilmoqda",
    totalEntered: "Kiritilgan jami",
    activeCampaigns: "Faol Aksiyalar",
    noCampaigns: "Hozircha faol aksiyalar mavjud emas.",
    adminTips: "Admin Maslahatlari",
    noTips: "Maslahatlar mavjud emas.",
    yearLabel: "Yil",
    monthLabel: "Oy",
    collectedPoints: "To'plangan ball",
    points: "ball",
    activityStat: "Faollik statistikasi",
    chartAnalysis: "Tanlangan davr bo'yicha grafik tahlil",
    statDaily: "Sutkalik",
    statWeekly: "Haftalik",
    statMonthly: "Oylik",
    totalCodesMonth: "Oydagi jami kodlar",
    avgBonusPoint: "O'rtacha bonus ball",
    modalCampaign: "AKSIYA",
    modalTip: "MASLAHAT",
    startDate: "Boshlanishi",
    endDate: "Tugashi",
    ta: "ta",
    weekLabels: ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"],
    monthLabels: ["1-Hafta", "2-Hafta", "3-Hafta", "4-Hafta"]
  },
  ru: {
    place: "-е место",
    confirmed: "Подтверждено",
    pending: "В ожидании",
    totalEntered: "Всего введено",
    activeCampaigns: "Активные Акции",
    noCampaigns: "Активных акций пока нет.",
    adminTips: "Советы от Админа",
    noTips: "Советы отсутствуют.",
    yearLabel: "Год",
    monthLabel: "Месяц",
    collectedPoints: "Собранные баллы",
    points: "балл",
    activityStat: "Статистика активности",
    chartAnalysis: "Графический анализ за выбранный период",
    statDaily: "Суточный",
    statWeekly: "Еженедельный",
    statMonthly: "Ежемесячный",
    totalCodesMonth: "Всего кодов за месяц",
    avgBonusPoint: "Средний бонусный балл",
    modalCampaign: "АКЦИЯ",
    modalTip: "СОВЕТ",
    startDate: "Начало",
    endDate: "Конец",
    ta: "шт",
    weekLabels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    monthLabels: ["1-Неделя", "2-Неделя", "3-Неделя", "4-Неделя"]
  }
};

const monthsUzDefault = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const monthsRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

export default function HomeTab({ 
  userId = "", 
  currentBonus = 0, 
  rank = 1,
  confirmedCount = 0,
  pendingCount = 0,
  totalUsedCount = 0,
  region = "Samarqand",
  year,
  setYear,
  month,
  setMonth,
  statType,
  setStatType,
  lang = "uz", 
  monthsUz = monthsUzDefault
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [news, setNews] = useState([]); 
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(""); 
  const [filteredBonus, setFilteredBonus] = useState(0);
  const [chartStats, setChartStats] = useState([]);
  const [monthlyTotalCodes, setMonthlyTotalCodes] = useState(0);
  const [monthlyAverageBonus, setMonthlyAverageBonus] = useState(0);

  const t = translations[lang] || translations["uz"];
  const currentMonthsList = lang === "ru" ? monthsRu : monthsUz;

  // 1. FAOL AKSIYALARNI YUKLASH
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .lte("start_date", now)   
          .gte("end_date", now) 
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        if (data) setCampaigns(data);
      } catch (error) {
        console.error("Aksiyalarni yuklashda xatolik:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // 2. MASLAHATLAR VA YANGILIKLARNI YUKLASH
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        if (data) setNews(data);
      } catch (error) {
        console.error("Maslahatlarni yuklashda xatolik:", error);
      }
    };
    fetchNews();
  }, []);

  // 3. DINAMIK FILTRLASH VA STATISTIKANI HISOBLASH
  useEffect(() => {
    const fetchRealStatistics = async () => {
      try {
        let activeUserId = userId;
        
        if (!activeUserId) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            activeUserId = JSON.parse(storedUser).id;
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) activeUserId = user.id;
          }
        }

        if (!activeUserId) return;

        let monthIndex = monthsUz.indexOf(month);
        if (monthIndex === -1) {
          monthIndex = monthsRu.indexOf(month);
        }
        if (monthIndex === -1) return;
        
        const startDate = new Date(parseInt(year), monthIndex, 1, 0, 0, 0).toISOString();
        const endDate = new Date(parseInt(year), monthIndex + 1, 1, 0, 0, 0).toISOString();

        const { data: codes, error } = await supabase
          .from("used_codes") 
          .select("created_at, status")
          .eq("user_id", activeUserId)
          .gte("created_at", startDate)
          .lt("created_at", endDate);

        if (error) throw error;

        const approvedCodes = codes ? codes.filter(c => c.status === "approved" || c.status === "confirmed") : [];
        const confirmedBonusSum = approvedCodes.length; 
        
        setFilteredBonus(confirmedBonusSum);
        setMonthlyTotalCodes(codes ? codes.length : 0);
        setMonthlyAverageBonus(confirmedBonusSum > 0 ? "1.0" : "0.0");

        let generatedStats = [];
        const joriyVaqt = new Date();

        if (statType === "kun") {
          const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
          });

          generatedStats = last7Days.map(date => {
            const dayStr = date.toLocaleDateString(lang === "ru" ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'short' });
            const dayVal = approvedCodes.filter(c => new Date(c.created_at).toDateString() === date.toDateString()).length;
            return { label: dayStr, realVal: dayVal, active: joriyVaqt.toDateString() === date.toDateString() };
          });

        } else if (statType === "hafta") {
          const daysMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
          approvedCodes.forEach(c => {
            const day = new Date(c.created_at).getDay(); 
            daysMap[day] += 1;
          });
          const labels = t.weekLabels;
          const JS_DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];
          generatedStats = JS_DAYS_ORDER.map((dayKey, idx) => ({
            label: labels[idx],
            realVal: daysMap[dayKey],
            active: joriyVaqt.getFullYear() === parseInt(year) && joriyVaqt.getMonth() === monthIndex && joriyVaqt.getDay() === dayKey
          }));

        } else if (statType === "oy") {
          const weeksMap = { H1: 0, H2: 0, H3: 0, H4: 0 };
          approvedCodes.forEach(c => {
            const dayOfMonth = new Date(c.created_at).getDate();
            if (dayOfMonth <= 7) weeksMap.H1 += 1;
            else if (dayOfMonth <= 14) weeksMap.H2 += 1;
            else if (dayOfMonth <= 21) weeksMap.H3 += 1;
            else weeksMap.H4 += 1;
          });
          const joriyKun = joriyVaqt.getDate();
          const isCurrentMonth = joriyVaqt.getFullYear() === parseInt(year) && joriyVaqt.getMonth() === monthIndex;

          generatedStats = [
            { label: t.monthLabels[0], realVal: weeksMap.H1, active: isCurrentMonth && joriyKun <= 7 },
            { label: t.monthLabels[1], realVal: weeksMap.H2, active: isCurrentMonth && joriyKun > 7 && joriyKun <= 14 },
            { label: t.monthLabels[2], realVal: weeksMap.H3, active: isCurrentMonth && joriyKun > 14 && joriyKun <= 21 },
            { label: t.monthLabels[3], realVal: weeksMap.H4, active: isCurrentMonth && joriyKun > 21 },
          ];
        }

        const maxVal = Math.max(...generatedStats.map(s => s.realVal), 1);
        const finalStats = generatedStats.map(s => ({
          ...s,
          value: Math.min(Math.round((s.realVal / maxVal) * 100), 100)
        }));

        setChartStats(finalStats);

      } catch (err) {
        console.error("Statistikani hisoblashda xatolik:", err);
        const labels = statType === "oy" ? t.monthLabels : t.weekLabels;
        setChartStats(labels.map(l => ({ label: l, value: 0, realVal: 0, active: false })));
      }
    };

    fetchRealStatistics();
  }, [year, month, statType, userId, lang, monthsUz, t.monthLabels, t.weekLabels]);

  const handleOpenModal = (data, type) => {
    setModalData(data);
    setModalType(type);
  };

  return (
    <div className="tab-section fade-in">
      {/* Yuqoridagi ko'rsatkichlar kartasi */}
      <div className="stats-card-container">
        <div className="stats-row">
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper trophy-bg"><FaTrophy /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{rank}{t.place}</span>
              <span className="stat-lbl-text">{region}...</span>
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper check-bg"><FaCheckCircle /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{confirmedCount} {t.ta}</span>
              <span className="stat-lbl-text">{t.confirmed}</span>
            </div>
          </div>
        </div>
        
        <div className="horizontal-divider"></div>
        
        <div className="stats-row">
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper times-bg" style={{ backgroundColor: "#eab308" }}><FaHourglassHalf /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{pendingCount} {t.ta}</span>
              <span className="stat-lbl-text">{t.pending}</span>
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div className="inner-stat-box">
            <div className="stat-icon-wrapper list-bg" style={{ backgroundColor: "#8b5cf6" }}><FaListOl /></div>
            <div className="stat-text-wrapper">
              <span className="stat-val-text">{totalUsedCount} {t.ta}</span>
              <span className="stat-lbl-text">{t.totalEntered}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="white-content-body">
        {/* FAOL AKSIYALAR */}
        <h3 className="section-title">{t.activeCampaigns}</h3>
        <div className="promo-banners-container">
          {campaigns.length > 0 ? (
            campaigns.map((camp) => (
              <div key={camp.id} className="promo-banner-card" style={{ cursor: "pointer" }} onClick={() => handleOpenModal(camp, "campaign")}>
                {camp.image_url ? <img src={camp.image_url} alt={camp.title} /> : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box", textAlign: "center" }}>
                    <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "14px" }}>{camp.title}</span>
                  </div>
                )}
                <div className="banner-badge">{camp.title.toUpperCase()}</div>
              </div>
            ))
          ) : (
            <div className="no-data-box" style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", width: "100%" }}>
              {t.noCampaigns}
            </div>
          )}
        </div>

        {/* ADMIN MASLAHATLARI */}
        <h3 className="section-title" style={{ marginTop: "24px" }}><FaLightbulb style={{ color: "#eab308", marginRight: "6px" }} /> {t.adminTips}</h3>
        <div className="news-grid-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {news.length > 0 ? (
            news.map((item) => (
              <div key={item.id} className="news-compact-card" style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px", border: "1px solid #e2e8f0", cursor: "pointer" }} onClick={() => handleOpenModal(item, "news")}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }} />
                )}
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>{item.title}</h4>
                <p style={{ fontSize: "13px", color: "#64748b", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.content}</p>
              </div>
            ))
          ) : (
            <div className="no-data-box" style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", width: "100%", gridColumn: "1/-1" }}>
              {t.noTips}
            </div>
          )}
        </div>

        {/* SANANI BELGILASH */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">{t.yearLabel}</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="filter-select">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.monthLabel}</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="filter-select">
              {currentMonthsList.map((m, idx) => (
                <option key={idx} value={lang === "ru" ? monthsRu[idx] : monthsUz[idx]}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BALLAR */}
        <div className="total-score-box">
          <span className="score-title">{t.collectedPoints} ({month} - {year})</span>
          <div className="score-divider"></div>
          <span className="score-number" style={{ color: "#2563eb" }}>{filteredBonus} {t.points}</span>
        </div>

        {/* GRAFIK */}
        <div className="home-bottom-statistics">
          <div className="stats-header-row">
            <div className="stats-header-title">
              <FaChartBar className="chart-icon-lead" />
              <div>
                <h3>{t.activityStat}</h3>
                <p>{t.chartAnalysis}</p>
              </div>
            </div>
            
            <div className="stats-header-badge" style={{ padding: "2px 6px", background: "#f1f5f9" }}>
              <select value={statType} onChange={(e) => setStatType(e.target.value)} style={{ border: "none", background: "none", fontSize: "12px", fontWeight: "600", color: "#475569", outline: "none", cursor: "pointer" }}>
                <option value="kun">{t.statDaily}</option>
                <option value="hafta">{t.statWeekly}</option>
                <option value="oy">{t.statMonthly}</option>
              </select>
            </div>
          </div>

          <div className="visual-chart-bars">
            {chartStats.map((item, index) => (
              <div className="chart-bar-column" key={index}>
                <div className="bar-track">
                  <div className={`bar-fill ${item.active ? "bar-active" : ""}`} style={{ height: `${item.value}%` }}>
                    <span className="bar-tooltip-val">{item.realVal} {t.points}</span>
                  </div>
                </div>
                <span className="bar-label-day" style={{ fontSize: "11px" }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="stats-summary-footer">
            <div className="summary-item">
              <span className="sum-lbl">{t.totalCodesMonth}</span>
              <span className="sum-val">{monthlyTotalCodes} {t.ta}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-item">
              <span className="sum-lbl">{t.avgBonusPoint}</span>
              <span className="sum-val">+{monthlyAverageBonus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DINAMIK MODAL */}
      {modalData && (
        <div className="home-modal-overlay" onClick={() => { setModalData(null); setModalType(""); }}>
          <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="home-modal-close" onClick={() => { setModalData(null); setModalType(""); }}><FaTimes /></button>
            
            {modalData.image_url ? (
              <img src={modalData.image_url} alt={modalData.title} className="home-modal-img" style={{ width: "100%", maxHeight: "240px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "180px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "18px" }}>{modalData.title}</span>
              </div>
            )}
            
            <div className="home-modal-body">
              <span style={{ fontSize: "12px", background: modalType === "campaign" ? "#dbeafe" : "#fef08a", color: modalType === "campaign" ? "#1e40af" : "#854d0e", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
                {modalType === "campaign" ? t.modalCampaign : t.modalTip}
              </span>
              <h3 style={{ marginTop: "8px" }}>{modalData.title}</h3>
              
              {modalData.content && <p className="home-modal-text" style={{ marginTop: "10px", marginBottom: "14px", color: "#475569", lineHeight: "1.5" }}>{modalData.content}</p>}
              
              {modalType === "campaign" && (
                <div className="home-modal-dates" style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <p style={{ margin: "4px 0" }}><FaCalendarAlt /> <strong>{t.startDate}:</strong> {new Date(modalData.start_date).toLocaleDateString(lang === "ru" ? 'ru-RU' : 'uz-UZ')}</p>
                  <p style={{ margin: "4px 0" }}><FaCalendarAlt /> <strong>{t.endDate}:</strong> {new Date(modalData.end_date).toLocaleDateString(lang === "ru" ? 'ru-RU' : 'uz-UZ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}