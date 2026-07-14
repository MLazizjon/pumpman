import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../../../supabase/client";
import { 
  FaBell, 
  FaUserCircle, 
  FaExclamationTriangle, 
  FaChevronRight, 
  FaGlobe, 
  // FaQuestionCircle, 
  FaSignOutAlt, 
  FaChevronLeft,
  FaGift 
} from "react-icons/fa";

import Sidebar from "../sidebar/Sidebar";
import HomeTab from "../home/Home";
import CodeTab from "../kodkirish/KodKiritish";
import SettingsTab from "../setting/Setting";
import UserMagazin from "../magazine/Magazine"; 
import UserKatalog from "../katalog/Katalog"; // 📂 Yangi qo'shilgan foydalanuvchi katalogi

import "./userDash.css";

// Oylar massivini komponent tashqarisiga chiqaramiz (useCallback xatoligini oldini olish uchun)
const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

export default function UserDash() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [bonusCode, setBonusCode] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 📂 KATALOG FILTRLARI UCHUN STATE (READ-ONLY)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 📅 FILTRLAR STATE'LARI
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("Iyul");
  const [statType, setStatType] = useState("hafta");

  // 📈 STATISTIKA STATE'LARI    
  const [codeCount, setCodeCount] = useState(0);          
  const [pendingCount, setPendingCount] = useState(0);     
  const [totalUsedCount, setTotalUsedCount] = useState(0);  
  const [userRank, setUserRank] = useState(1);              
  const [dynamicChartData, setDynamicChartData] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [loading, setLoading] = useState(false);

  // 👤 PROFIL SOZLAMALARI STATE'LARI
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editDistrict, setEditDistrict] = useState(""); 
  const [saveLoading, setSaveLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 🌍 TIZIM TILI STATE'LARINI BOSHQARISH
  const [lang, setLang] = useState(localStorage.getItem("app_lang") || "uz");

  const navigate = useNavigate();

  // 🔄 TAB ALMASHTIRISHNI NAZORAT QILUVCHI FUNKSIYA
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSelectedCategory(null); // Boshqa tabga o'tganda katalog ichki holatini boshlang'ich nuqtaga qaytaradi
  };

  // ⚡ AMALDAGI AKSANING MUDDATINI TEKSHIRISH
  const checkActiveCampaign = useCallback(async () => {
    try {
      const nowISO = new Date().toISOString();
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .lte("start_date", nowISO)
        .gte("end_date", nowISO)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setActiveCampaign(data[0]);
      } else {
        setActiveCampaign(null);
      }
    } catch (err) {
      console.error("Aksiyani tekshirishda xatolik:", err);
    }
  }, []);

  // 🌍 TILNI INTERFEYSDA VA SUPABASE BAZASIDA YANGILASH FUNKSIYASI
  const changeLanguage = async (newLang) => {
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
    
    if (currentUser?.id) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ language: newLang })
          .eq("id", currentUser.id);
          
        if (error) throw error;

        const updatedUser = { ...currentUser, language: newLang };
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success(newLang === "uz" ? "Til muvaffaqiyatli o'zgartirildi!" : "Язык успешно изменен!");
      } catch (err) {
        console.error("Tilni bazaga saqlashda xatolik:", err);
      }
    }
  };

  // 🔄 MA'LUMOTLARNI DINAMIK FILTRLAB YUKLASH FUNKSIYASI
  const fetchUserData = useCallback(async (user, currentYear = year, currentMonth = month, currentStatType = statType) => {
    try {
      if (!user?.id) return;

      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("full_name, phone, region, district, bonus, is_active, language") 
        .eq("id", user.id)
        .single();

      if (profError) throw profError;

      if (profile.is_active === false) {
        toast.error("Sizning profilingiz faol emas! Admin bilan bog'laning.");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (profile.language) {
        setLang(profile.language);
        localStorage.setItem("app_lang", profile.language);
      }

      setEditName(profile.full_name || "");
      setEditRegion(profile.region || "");
      setEditDistrict(profile.district || ""); 

      const updatedLocalUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      setCurrentUser(updatedLocalUser);

      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, bonus")
        .order("bonus", { ascending: false });

      if (allProfiles) {
        const myRank = allProfiles.findIndex(p => p.id === user.id) + 1;
        setUserRank(myRank || 1);
      }

      const monthIndex = monthsUz.indexOf(currentMonth);
      const formattedMonth = String(monthIndex + 1).padStart(2, '0');
      const startDate = `${currentYear}-${formattedMonth}-01T00:00:00.000Z`;

      const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
      const nextMonthYear = monthIndex === 11 ? parseInt(currentYear) + 1 : currentYear;
      const formattedNextMonth = String(nextMonthIndex + 1).padStart(2, '0');
      const endDate = `${nextMonthYear}-${formattedNextMonth}-01T00:00:00.000Z`;

      const { data: usedCodes, error: codesError } = await supabase
        .from("used_codes")
        .select("created_at, status")
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .lt("created_at", endDate);

      if (!codesError && usedCodes) {
        const approvedCodes = usedCodes.filter(c => c.status === "approved");
        const pendingCodes = usedCodes.filter(c => c.status === "pending");

        setCodeCount(approvedCodes.length); 
        setPendingCount(pendingCodes.length); 
        setTotalUsedCount(usedCodes.length); 

        let generatedStats = [];
        const joriyVaqt = new Date();

        if (currentStatType === "kun") {
          const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
          });

          generatedStats = last7Days.map(date => {
            const dayStr = date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
            const dayVal = approvedCodes.filter(c => new Date(c.created_at).toDateString() === date.toDateString()).length;
            return { label: dayStr, realVal: dayVal, value: 0, active: joriyVaqt.toDateString() === date.toDateString() };
          });

        } else if (currentStatType === "hafta") {
          const daysMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
          approvedCodes.forEach(c => {
            const day = new Date(c.created_at).getDay(); 
            daysMap[day] += 1;
          });

          const labels = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];
          const JS_DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];
          generatedStats = JS_DAYS_ORDER.map((dayKey, idx) => ({
            label: labels[idx],
            realVal: daysMap[dayKey],
            value: 0,
            active: joriyVaqt.getFullYear() === parseInt(currentYear) && joriyVaqt.getMonth() === monthIndex && joriyVaqt.getDay() === dayKey
          }));

        } else if (currentStatType === "oy") {
          const weeksMap = { H1: 0, H2: 0, H3: 0, H4: 0 };
          approvedCodes.forEach(c => {
            const dayOfMonth = new Date(c.created_at).getDate();
            if (dayOfMonth <= 7) weeksMap.H1 += 1;
            else if (dayOfMonth <= 14) weeksMap.H2 += 1;
            else if (dayOfMonth <= 21) weeksMap.H3 += 1;
            else weeksMap.H4 += 1;
          });

          const joriyKun = joriyVaqt.getDate();
          const isCurrentMonth = joriyVaqt.getFullYear() === parseInt(currentYear) && joriyVaqt.getMonth() === monthIndex;

          generatedStats = [
            { label: "1-Hafta", realVal: weeksMap.H1, active: isCurrentMonth && joriyKun <= 7 },
            { label: "2-Hafta", realVal: weeksMap.H2, active: isCurrentMonth && joriyKun > 7 && joriyKun <= 14 },
            { label: "3-Hafta", realVal: weeksMap.H3, active: isCurrentMonth && joriyKun > 14 && joriyKun <= 21 },
            { label: "4-Hafta", realVal: weeksMap.H4, active: isCurrentMonth && joriyKun > 21 },
          ];
        }

        const maxVal = Math.max(...generatedStats.map(s => s.realVal), 1);
        const finalStats = generatedStats.map(s => ({
          ...s,
          value: Math.min(Math.round((s.realVal / maxVal) * 100), 100)
        }));

        setDynamicChartData(finalStats);
      } else {
        setCodeCount(0);
        setPendingCount(0);
        setTotalUsedCount(0);
        const emptyLabels = currentStatType === "oy" ? ["1-Hafta", "2-Hafta", "3-Hafta", "4-Hafta"] : ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];
        setDynamicChartData(emptyLabels.map(l => ({ label: l, value: 0, realVal: 0, active: false })));
      }
    } catch (err) {
      console.error("Ma'lumot yuklashda xatolik:", err);
    }
  }, [year, month, statType, navigate]);

  // 🗓️ FILTRLAR O'ZGARGANIDA TRIGGER BO'LUVCHI EFFECT
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      fetchUserData(user, year, month, statType);
    }
  }, [year, month, statType, fetchUserData]);

  // 🔔 BIRINCHI SAHIFA YUKLANGANDA VA REAL-TIME SUBSCRIPTION
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    setCurrentUser(user);
    fetchUserData(user, year, month, statType);
    checkActiveCampaign();

    const realtimeSubscription = supabase
      .channel(`user-dash-realtime-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "used_codes", filter: `user_id=eq.${user.id}` },
        () => { fetchUserData(user, year, month, statType); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => { fetchUserData(user, year, month, statType); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeSubscription);
    };
  }, [navigate, checkActiveCampaign, fetchUserData, year, month, statType]);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    toast.info("Tizimdan chiqdingiz");
    navigate("/login");
  };

  const handleSendCode = async () => {
    if (loading) return;
    const trimmedCode = bonusCode.trim().toUpperCase();
    if (!trimmedCode) {
      toast.error("Iltimos, kodni kiriting!");
      return;
    }
    setLoading(true);
    try {
      const { data: promoCode, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", trimmedCode)
        .single();

      if (promoError || !promoCode) {
        toast.error("Bunday promo-kod tizimda mavjud emas! ❌");
        return;
      }
      if (!promoCode.is_active) {
        toast.error("Bu kod allaqachon ishlatilgan yoki tasdiqlash kutilmoqda! ⚠️");
        return;
      }

      const { error: insertError } = await supabase
        .from("used_codes")
        .insert([{ 
          user_id: currentUser.id, 
          code_id: promoCode.id,
          status: "pending" 
        }]);

      if (insertError) throw insertError;

      await supabase.from("promo_codes").update({ is_active: false }).eq("id", promoCode.id);

      toast.info("Kod muvaffaqiyatli yuborildi! Admin tasdiqlashini kuting. ⏳");
      setBonusCode("");
      handleTabChange("home");
      fetchUserData(currentUser, year, month, statType);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Ism maydoni bo'sh bo'lishi mumkin emas!");
      return;
    }
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: editName.trim(), 
          region: editRegion.trim(),
          district: editDistrict.trim() 
        })
        .eq("id", currentUser.id);

      if (error) throw error;
      toast.success("Ma'lumotlar muvaffaqiyatli yangilandi! 💾");
      setIsEditing(false);
      fetchUserData(currentUser, year, month, statType);
    } catch (err) {
      toast.error("Saqlashda xatolik: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="dash-container">
      
      {/* MOBIL TOP HEADER */}
      <header className="mobile-top-header">
        <button className="mobile-profile-btn" onClick={() => setIsDrawerOpen(true)} title="Profil paneli">
          <FaUserCircle size={28} />
        </button>
        <div className="mobile-header-center" onClick={() => handleTabChange("home")}>
          <span className="mobile-header-label">Mening joriy ballim</span>
          <span className="mobile-header-value">
            {currentUser?.bonus || 0} <span className="arrow-detail">›</span>
          </span>
        </div>
        <button className="mobile-notif-btn" title="Bildirishnomalar">
          <FaBell size={22} />
        </button>
      </header>

      {/* SIDEBAR & BOTTOM NAVIGATION BAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        setShowLogoutModal={setShowLogoutModal} 
        currentUser={currentUser}
      />

      {/* DINAMIK TAB ALMAShUVI */}
      <main className="dash-main">
        <section className="dash-content">
          {activeTab === "home" && (
            <HomeTab 
              activeCampaign={activeCampaign} 
              currentBonus={currentUser?.bonus || 0} 
              rank={userRank} 
              confirmedCount={codeCount} 
              pendingCount={pendingCount} 
              totalUsedCount={totalUsedCount} 
              region={currentUser?.region || "Samarqand"} 
              dynamicChartData={dynamicChartData} 
              setActiveTab={handleTabChange} 
              year={year}
              setYear={setYear}
              month={month}
              setMonth={setMonth}
              statType={statType}
              setStatType={setStatType}
              monthsUz={monthsUz}
              lang={lang}
            />
          )}

          {activeTab === "code" && (
            <CodeTab 
              bonusCode={bonusCode} 
              setBonusCode={setBonusCode} 
              handleSendCode={handleSendCode} 
              loading={loading} 
              lang={lang}
            />
          )}

          {/* 📂 READ-ONLY MAHSULOTLAR KATALOGI */}
          {activeTab === "katalog" && (
            <UserKatalog
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
              lang={lang}
            />
          )}

          {/* 🎁 MAGAZIN (SOVG'ALAR DO'KONI) TABI */}
          {activeTab === "magazin" && (
            <UserMagazin 
              currentUser={currentUser} 
              fetchUserData={() => fetchUserData(currentUser, year, month, statType)} 
              lang={lang}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab 
              isEditing={isEditing} 
              setIsEditing={setIsEditing} 
              editName={editName} 
              setEditName={setEditName} 
              editRegion={editRegion} 
              setEditRegion={setEditRegion} 
              editDistrict={editDistrict}         
              setEditDistrict={setEditDistrict}   
              currentUser={currentUser} 
              saveLoading={saveLoading} 
              handleSaveProfile={handleSaveProfile} 
              fetchUserData={() => fetchUserData(currentUser, year, month, statType)} 
              setShowLogoutModal={setShowLogoutModal} 
              lang={lang}
              changeLanguage={changeLanguage}
              onBack={() => {
                setIsDrawerOpen(true);
                handleTabChange("home");
              }}
            />
          )}
        </section>
      </main>

      {/* MOBIL PROFILE DRAWER MENU */}
      {isDrawerOpen && (
        <div className="mobile-profile-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="mobile-profile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="profile-drawer-header">
              <button className="drawer-back-btn" onClick={() => setIsDrawerOpen(false)}>
                <FaChevronLeft size={16} />
              </button>
              <h2>{lang === "uz" ? "Profil" : "Профиль"}</h2>
              <div style={{ width: 36 }}></div>
            </div>

            <div className="drawer-menu-list">
              <button className="drawer-item" onClick={() => { handleTabChange("settings"); setIsDrawerOpen(false); }}>
                <div className="d-item-left">
                  <div className="d-icon-box"><FaUserCircle /></div>
                  <span>{lang === "uz" ? "Sozlamalar" : "Настройки"}</span>
                </div>
                <FaChevronRight className="d-chevron" />
              </button>

              {/* 🌐 TIL TUGMASI - ENDI BOSILGANDA TILLARNI ALMAShTIRADI */}
              <button 
                className="drawer-item" 
                onClick={() => {
                  const nextLang = lang === "uz" ? "ru" : "uz";
                  changeLanguage(nextLang);
                }}
              >
                <div className="d-item-left">
                  <div className="d-icon-box"><FaGlobe /></div>
                  <span>{lang === "uz" ? "Til" : "Язык"}</span>
                </div>
                <div className="d-item-right">
                  <span className="d-lang-val">{lang === "uz" ? "Uz" : "Ru"}</span>
                  <FaChevronRight className="d-chevron" />
                </div>
              </button>

              {/* 🎁 MAGAZIN TUGMASI */}
              <button className="drawer-item" onClick={() => { handleTabChange("magazin"); setIsDrawerOpen(false); }}>
                <div className="d-item-left">
                  <div className="d-icon-box"><FaGift /></div>
                  <span>{lang === "uz" ? "Sovg'alar do'koni" : "Магазин подарков"}</span>
                </div>
                <FaChevronRight className="d-chevron" />
              </button>

              {/* <button className="drawer-item">
                <div className="d-item-left">
                  <div className="d-icon-box"><FaQuestionCircle /></div>
                  <span>F.A.Q</span>
                </div>
                <FaChevronRight className="d-chevron" />
              </button> */}

              <button className="drawer-item d-logout-style" onClick={() => { setIsDrawerOpen(false); setShowLogoutModal(true); }}>
                <div className="d-item-left">
                  <div className="d-icon-box"><FaSignOutAlt /></div>
                  <span>{lang === "uz" ? "Chiqish" : "Выйти"}</span>
                </div>
                <FaChevronRight className="d-chevron" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL BOX */}
      {showLogoutModal && (
        <div className="logout-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <FaExclamationTriangle size={28} />
            </div>
            <h3>{lang === "uz" ? "Tizimdan chiqish" : "Выход из системы"}</h3>
            <p>{lang === "uz" ? "Haqiqatan ham shaxsiy kabinetingizdan chiqmoqchimisiz?" : "Вы действительно хотите выйти из своего личного кабинета?"}</p>
            <div className="logout-modal-actions">
              <button className="modal-confirm-btn" onClick={confirmLogout}>{lang === "uz" ? "Ha, chiqish" : "Да, выйти"}</button>
              <button className="modal-cancel-btn" onClick={() => setShowLogoutModal(false)}>{lang === "uz" ? "Bekor qilish" : "Отмена"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}