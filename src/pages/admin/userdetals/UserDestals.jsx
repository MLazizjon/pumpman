import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/client"; 
import { 
  FaArrowLeft, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBarcode, 
  FaCalendarAlt 
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./userdetals.css"; 

export default function UserDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [master, setMaster] = useState(null);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMasterAndCodesData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Ustaning hamma ma'lumotlarini profiles jadvalidan olish (*)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setMaster(profileData);

      // 2. Usta skaner qilgan kodlarni used_codes jadvalidan olish
      const { data: codesData, error: codesError } = await supabase
        .from("used_codes")
        .select(`
          id,
          created_at,
          promo_codes (
            code
          )
        `)
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (codesError) throw codesError;
      setScannedCodes(codesData || []);

    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMasterAndCodesData();
    }
  }, [id, fetchMasterAndCodesData]);

  if (loading) return <div className="loading-container">Usta ma'lumotlari yuklanmoqda...</div>;
  if (!master) return <div className="loading-container">Usta topilmadi! ❌</div>;

  return (
    <div className="tab-section fade-in full-width-layout">
      {/* ⬅️ Orqaga qaytish */}
      <div className="details-header-action">
        <button className="back-to-list-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Ustalar ro'yxatiga qaytish
        </button>
      </div>

      {/* 💳 Ustaning profili */}
      <div className="master-profile-hero-card">
        <div className="hero-avatar-wrap">
          <div className="avatar-placeholder">
            {master.full_name ? master.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2>{master.full_name}</h2>
            <span className="hero-role-badge">{master.role || "Usta"}</span>
          </div>
        </div>

        <div className="hero-details-grid">
          <div className="hero-detail-item">
            <FaPhone className="hero-icon" />
            <div>
              <span>Telefon raqami</span>
              <p>{master.phone || "Ko'rsatilmagan"}</p>
            </div>
          </div>
          
          {/* 📍 Alohida sahifadagi Manzil qismi (Viloyat va tuman birgalikda) */}
          <div className="hero-detail-item">
            <FaMapMarkerAlt className="hero-icon" />
            <div>
              <span>Xizmat ko'rsatish hududi</span>
              <p>
                {master.region 
                  ? `${master.region}${master.district ? ` (${master.district} tumani)` : ""}` 
                  : "Kiritilmagan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Skanerlar soni vidjeti */}
      <div className="detail-stats-grid" style={{ marginTop: "24px" }}>
        <div className="detail-stat-item-card" style={{ maxWidth: "350px" }}>
          <div className="card-icon-wrap blue-bg">
            <FaBarcode />
          </div>
          <div className="card-stat-value-wrap">
            <span>Skanerlangan kodlar soni</span>
            <h3>{scannedCodes.length} ta kod</h3>
          </div>
        </div>
      </div>

      {/* 📋 Skaner qilingan kodlar ro'yxati */}
      <div className="history-table-section" style={{ marginTop: "32px" }}>
        <div className="table-section-title">
          <FaCalendarAlt style={{ color: "#2563eb", marginRight: "8px" }} />
          <h3>Skaner Qilingan Kodlar Ro'yxati</h3>
        </div>

        <div className="custom-table-wrapper" style={{ marginTop: "16px" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Skaner qilingan kod matni</th>
                <th>Skanerlangan vaqti</th>
              </tr>
            </thead>
            <tbody>
              {scannedCodes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-row-text">
                    Bu usta hali biror marta kod skaner qilmadi. 📥
                  </td>
                </tr>
              ) : (
                scannedCodes.map((item, index) => (
                  <tr key={item.id} className="table-row-hover-effect">
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: "bold", color: "#2563eb", letterSpacing: "1px" }}>
                      <FaBarcode style={{ marginRight: "6px", color: "#94a3b8" }} />
                      {item.promo_codes?.code || "NOMA'LUM KOD"}
                    </td>
                    <td style={{ color: "#475569" }}>
                      {new Date(item.created_at).toLocaleString("uz-UZ", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
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