import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaTools, 
  FaBarcode, 
  // FaUserPlus, 
  FaCheck, 
  // FaSortAmountDown, 
  FaSpinner 
} from "react-icons/fa";
import { supabase } from "../../../supabase/client"; // Supabase client manzilingizni tekshiring
import { toast } from "react-toastify";
import "./dashboard.css"; 

export default function DashboardTab({
  stats = { totalUsers: 0, activeMasters: 0, totalCodes: 0, newClients: 0 },
  // sortOrder,
  // setSortOrder,
  sortedChartData = [],
  lang = "uz"
}) {
  // --- STATE-LAR ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // --- MAX BALL (DIAGRAMMA UCHUN) ---
  const maxBall = sortedChartData.length > 0 
    ? Math.max(...sortedChartData.map(m => m.kiritishlarSonini)) 
    : 1;

  // --- TARJIMAlAR LUG'ATI ---
  const translations = {
    uz: {
      totalUsers: "Umumiy Foydalanuvchilar",
      activeMasters: "Faol Ustalar",
      totalCodes: "Jami Kodlar",
      newClients: "Yangi Mijozlar (Oy)",
      chartTitle: "📊 Top Ustalar Ballari Diagrammasi",
      sortDesc: "Kamayish tartibida (Max)",
      sortAsc: "O'sish tartibida (Min)",
      noChartData: "Hozircha grafik uchun ma'lumot yo'q",
      tableTitle: "📋 Tasdiqlash kutilayotgan promo-kodlar",
      thName: "Usta F.I.Sh",
      thRegionPhone: "Viloyat / Telefon",
      thPromo: "Promo Kod",
      thAction: "Amal",
      actionApprove: "Tasdiqlash",
      noTableData: "Tasdiqlash kutilayotgan so'rovlar mavjud emas 🔍",
      unit: "ta",
      loadingText: "Yuklanmoqda..."
    },
    ru: {
      totalUsers: "Всего Пользователей",
      activeMasters: "Активные Мастера",
      totalCodes: "Всего Одобренных Кодов",
      newClients: "Новые Клиенты (Месяц)",
      chartTitle: "📊 Диаграмма Баллов Топ Мастеров",
      sortDesc: "По убыванию (Max)",
      sortAsc: "По возрастанию (Min)",
      noChartData: "Пока нет данных для графика",
      tableTitle: "📋 Промо-коды, ожидающие подтверждения",
      thName: "Ф.И.О Мастера",
      thRegionPhone: "Регион / Телефон",
      thPromo: "Промо Код",
      thAction: "Действие",
      actionApprove: "Подтвердить",
      noTableData: "Ожидающих запросов нет 🔍",
      unit: "шт",
      loadingText: "Загрузка..."
    }
  };

  const t = translations[lang] || translations.uz;

  // --- KUTILAYOTGAN SO'ROVLARNI YUKLASH ---
  const fetchPendingRequests = async () => {
    setTableLoading(true);
    try {
      const { data, error } = await supabase
        .from("used_codes")
        .select(`
          id,
          created_at,
          status,
          user_id,
          code_id,
          profiles ( full_name, phone, region ),
          promo_codes ( code )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err) {
      console.error("So'rovlarni yuklashda xatolik:", err.message);
      toast.error("Kutilayotgan so'rovlarni yuklab bo'lmadi");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // --- TASDIQLASH FUNKSIYASI ---
  const handleApproveBonus = async (request) => {
    setActionLoadingId(request.id);
    try {
      // 1. used_codes jadvalida ushbu yozuv holatini 'approved' ga o'zgartiramiz
      const { error: statusError } = await supabase
        .from("used_codes")
        .update({ status: "approved" })
        .eq("id", request.id);

      if (statusError) throw statusError;

      // 2. Ustaning hozirgi ayni vaqtdagi bonusini olish
      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("bonus")
        .eq("id", request.user_id)
        .single();

      if (profError) throw profError;

      const currentBonus = profile?.bonus || 0;

      // 3. Ustaning profiliga +1 ball qo'shish
      const { error: bonusError } = await supabase
        .from("profiles")
        .update({ bonus: currentBonus + 1 })
        .eq("id", request.user_id);

      if (bonusError) throw bonusError;

      toast.success(lang === "uz" ? "Kod tasdiqlandi va 1 ball berildi! 🎉" : "Код подтвержден, 1 балл начислен! 🎉");
      
      // Ro'yxatni qayta yangilaymiz
      fetchPendingRequests();
    } catch (err) {
      console.error("Tasdiqlash xatoligi:", err.message);
      toast.error(lang === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="tab-section fade-in">
      
      {/* 📊 Statistik Kartalar */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h4>{t.totalUsers}</h4>
            <div className="icon-wrapper blue"><FaUsers /></div>
          </div>
          <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h4>{t.activeMasters}</h4>
            <div className="icon-wrapper green"><FaTools /></div>
          </div>
          <p className="stat-number">{stats.activeMasters.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h4>{t.totalCodes}</h4>
            <div className="icon-wrapper orange"><FaBarcode /></div>
          </div>
          <p className="stat-number">{stats.totalCodes.toLocaleString()} {t.unit}</p>
        </div>

        {/* <div className="stat-card">
          <div className="stat-card-header">
            <h4>{t.newClients}</h4>
            <div className="icon-wrapper purple"><FaUserPlus /></div>
          </div>
          <p className="stat-number">{stats.newClients.toLocaleString()}</p>
        </div> */}
      </div>

      {/* 📊 Diagramma Bo'limi */}
      <div className="chart-fullwidth-section">
        <div className="chart-header-container">
          <h4 className="chart-title">{t.chartTitle}</h4>
          {/* <div className="select-wrapper">
            <FaSortAmountDown className="select-icon" />
            <select
              className="text-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">{t.sortDesc}</option>
              <option value="asc">{t.sortAsc}</option>
            </select>
          </div> */}
        </div>

        <div className="chart-scroll-wrapper">
          <div className="vertical-chart-container">
            <div className="chart-y-axis">
              <span>{maxBall}</span>
              <span>{Math.round(maxBall * 0.75)}</span>
              <span>{Math.round(maxBall * 0.5)}</span>
              <span>{Math.round(maxBall * 0.25)}</span>
              <span>0</span>
            </div>
            
            <div className="chart-bars-area">
              {sortedChartData.map((master, index) => {
                const barHeightPercentage = (master.kiritishlarSonini / maxBall) * 100;
                return (
                  <div key={index} className="v-chart-bar-wrapper">
                    <div className="v-chart-bar-track">
                      <div 
                        className="v-chart-bar-fill" 
                        style={{ height: `${Math.max(barHeightPercentage, 5)}%` }}
                        title={`${master.name}: ${master.kiritishlarSonini} ball`}
                      >
                        <span className="bar-value-tooltip">{master.kiritishlarSonini}</span>
                      </div>
                    </div>
                    <span className="v-chart-label" title={master.name}>{master.name}</span>
                  </div>
                );
              })}
              {sortedChartData.length === 0 && (
                <p className="no-data">{t.noChartData}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📋 TASDIQLASH KUTILAYOTGAN KODLAR JADVALI (YANGI QO'SHILDI) */}
      <div className="chart-fullwidth-section" style={{ marginTop: "30px", padding: "20px" }}>
        <h4 className="chart-title" style={{ marginBottom: "20px" }}>{t.tableTitle}</h4>
        
        {tableLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4px", gap: "10px", color: "#64748b" }}>
            <FaSpinner className="spinner-anime" /> <span>{t.loadingText}</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "14px", color: "#475569", fontWeight: "600" }}>{t.thName}</th>
                  <th style={{ padding: "14px", color: "#475569", fontWeight: "600" }}>{t.thRegionPhone}</th>
                  <th style={{ padding: "14px", color: "#475569", fontWeight: "600" }}>{t.thPromo}</th>
                  <th style={{ padding: "14px", color: "#475569", fontWeight: "600", textMetrics: "center" }}>{t.thAction}</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" }} className="table-row-hover">
                      <td style={{ padding: "14px", color: "#1e293b", fontWeight: "500" }}>
                        {req.profiles?.full_name || "Noma'lum Usta"}
                      </td>
                      <td style={{ padding: "14px", color: "#64748b" }}>
                        <span style={{ display: "block", fontSize: "14px", color: "#334155" }}>{req.profiles?.region || "-"}</span>
                        <span style={{ fontSize: "12px" }}>{req.profiles?.phone || "-"}</span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>
                          {req.promo_codes?.code || "KOD YO'Q"}
                        </span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <button
                          className="approve-action-btn"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleApproveBonus(req)}
                          style={{ 
                            background: "#22c55e", 
                            color: "#fff", 
                            border: "none", 
                            padding: "8px 16px", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px",
                            fontWeight: "500",
                            boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)"
                          }}
                        >
                          {actionLoadingId === req.id ? (
                            <FaSpinner className="spinner-anime" size={14} />
                          ) : (
                            <FaCheck size={12} />
                          )}
                          {t.actionApprove}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "15px" }}>
                      {t.noTableData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}