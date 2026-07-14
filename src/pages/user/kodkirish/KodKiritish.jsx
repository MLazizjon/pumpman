import React, { useState, useEffect, useCallback } from "react";
import { FaCloudUploadAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaTrashAlt, FaHashtag } from "react-icons/fa";
import { supabase } from "../../../supabase/client"; 
import "./kodkiritish.css";

export default function CodeTab({ lang = "uz", userId = "" }) {
  const [bonusCode, setBonusCode] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const translations = {
    uz: {
      title: "Kodni faollashtirish",
      hint: "Mahsulot ichidagi maxfiy kodni kiriting va qadoq rasmini yuklang",
      placeholder: "KODNI KIRITING (Masalan: AKFA77)",
      uploadText: "Mahsulot qadog'i rasmini yuklash",
      uploadHint: "Formatlar: JPG, PNG (Maksimal 5MB)",
      btnConfirm: "Kodni jo'natish",
      checking: "Yuborilmoqda...",
      historyTitle: "Oxirgi kiritilgan kodlaringiz",
      thCode: "Kod",
      thTime: "Sana va Vaqt",
      thStatus: "Holati",
      statusApproved: "Tasdiqlandi",
      statusPending: "Kutilmoqda",
      statusRejected: "Rad etildi",
      noData: "Siz hali kod kiritmadingiz",
      alertSuccess: "Kod muvaffaqiyatli tekshirishga yuborildi!",
      alertWarning: "Iltimos, kodni kiriting va rasmini yuklang!",
      alertError: "Xatolik yuz berdi: "
    },
    ru: {
      title: "Активация кода",
      hint: "Введите секретный код товара и загрузите фото упаковки",
      placeholder: "ВВЕДИТЕ КОД (Например: AKFA77)",
      uploadText: "Загрузить фото упаковки",
      uploadHint: "Форматы: JPG, PNG (Макс. 5МБ)",
      btnConfirm: "Отправить код",
      checking: "Отправка...",
      historyTitle: "История ваших кодов",
      thCode: "Код",
      thTime: "Дата и Время",
      thStatus: "Статус",
      statusApproved: "Одобрен",
      statusPending: "В ожидании",
      statusRejected: "Отклонен",
      noData: "Вы еще не вводили коды",
      alertSuccess: "Код успешно отправлен на проверку!",
      alertWarning: "Пожалуйста, введите код и загрузите фото!",
      alertError: "Произошла ошибка: "
    }
  };

  const t = translations[lang] || translations.uz;

  // 🔄 1. getActiveUserId funksiyasi
  const getActiveUserId = useCallback(async () => {
    if (userId) return userId;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) return parsed.id;
      } catch (e) {
        console.error("Localstorage parslashda xato");
      }
    }
    return null;
  }, [userId]);

  // 🔄 2. fetchHistory funksiyasi
  const fetchHistory = useCallback(async () => {
    try {
      const activeId = await getActiveUserId();
      if (!activeId) return;

      const { data, error } = await supabase
        .from("used_codes")
        .select("*, promo_codes(code)") 
        .eq("user_id", activeId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) setHistoryData(data);
    } catch (err) {
      console.error(err);
    }
  }, [getActiveUserId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = (e) => {
    e.preventDefault();
    setSelectedFile(null);
    setImagePreview(null);
  };

  // 🚀 3. To'g'rilangan handleSendCodeSubmit (barcha kerakli dependencies qo'shildi)
  const handleSendCodeSubmit = useCallback(async () => {
    if (!bonusCode.trim() || !selectedFile) {
      alert(t.alertWarning);
      return;
    }

    setLoading(true);
    try {
      const activeId = await getActiveUserId();
      if (!activeId) {
        throw new Error("Tizimga kirgan foydalanuvchi aniqlanmadi. Profilga qayta kiring!");
      }

      const cleanCode = bonusCode.trim().toUpperCase();

      const { data: promoData, error: promoError } = await supabase
        .from("promo_codes")
        .select("id")
        .eq("code", cleanCode)
        .single();

      if (promoError || !promoData) {
        throw new Error("Kiritilgan kod xato yoki bazada mavjud emas!");
      }

      const { data: alreadyUsed, error: checkError } = await supabase
        .from("used_codes")
        .select("id")
        .eq("user_id", activeId)
        .eq("code_id", promoData.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (alreadyUsed) {
        throw new Error("Siz bu kodni allaqachon tekshirishga yuborgansiz! ❌");
      }

      const fileExt = selectedFile.name.split('.').pop();
      const cleanFileName = `${Date.now()}.${fileExt}`;
      const filePath = `${activeId}/${cleanFileName}`;

      const { error: storageError } = await supabase.storage
        .from("product_images")
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true 
        });

      if (storageError) throw new Error(`Rasm yuklanmadi: ${storageError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from("product_images")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("used_codes")
        .insert([
          {
            user_id: activeId,
            code_id: promoData.id, 
            image_url: publicUrl,
            status: "pending",
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      setBonusCode("");
      setSelectedFile(null);
      setImagePreview(null);
      fetchHistory();
      alert(t.alertSuccess);

    } catch (error) {
      console.error(error);
      alert(error.message); 
    } finally {
      setLoading(false);
    }
  }, [bonusCode, selectedFile, getActiveUserId, fetchHistory, t.alertSuccess, t.alertWarning]);

  const renderStatusBadge = (status) => {
    if (status === "approved" || status === "confirmed") {
      return <span className="badge badge-success"><FaCheckCircle /> {t.statusApproved}</span>;
    } else if (status === "rejected" || status === "failed") {
      return <span className="badge badge-danger"><FaTimesCircle /> {t.statusRejected}</span>;
    }
    return <span className="badge badge-warning"><FaHourglassHalf /> {t.statusPending}</span>;
  };

  return (
    <div className="code-tab-container fade-in">
      <div className="code-card-header">
        <div className="header-icon-box"><FaHashtag /></div>
        <div>
          <h3 className="code-main-title">{t.title}</h3>
          <p className="code-sub-title">{t.hint}</p>
        </div>
      </div>

      <div className="code-grid-layout">
        <div className="code-form-panel">
          <div className="input-block">
            <input 
              type="text" 
              placeholder={t.placeholder} 
              value={bonusCode}
              onChange={(e) => setBonusCode(e.target.value)}
              className="code-modern-input"
              disabled={loading}
            />
          </div>

          {!imagePreview ? (
            <div className="upload-dropzone">
              <label htmlFor="image-input-file" className="dropzone-label">
                <FaCloudUploadAlt className="dropzone-icon" />
                <span className="dropzone-text">{t.uploadText}</span>
                <span className="dropzone-hint">{t.uploadHint}</span>
              </label>
              <input 
                type="file" 
                id="image-input-file" 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={loading}
                className="real-file-input"
              />
            </div>
          ) : (
            <div className="image-preview-box">
              <img src={imagePreview} alt="Preview" className="preview-img" />
              <button className="remove-preview-btn" onClick={removeSelectedFile}>
                <FaTrashAlt /> O'chirish
              </button>
            </div>
          )}

          <button 
            className="modern-submit-btn" 
            onClick={handleSendCodeSubmit} 
            disabled={loading || !bonusCode.trim() || !selectedFile}
          >
            {loading ? "Yuborilmoqda..." : t.btnConfirm}
          </button>
        </div>

        <div className="code-history-panel">
          <h4 className="history-block-title">{t.historyTitle}</h4>
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{t.thCode}</th>
                  <th>{t.thTime}</th>
                  <th>{t.thStatus}</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="font-bold text-dark">
                        {item.promo_codes?.code || `ID: ${item.code_id}`}
                      </td>
                      <td className="text-muted">
                        {new Date(item.created_at).toLocaleDateString("uz-UZ")} <br />
                        <span className="time-lbl">
                          {new Date(item.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td>{renderStatusBadge(item.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-table-text">{t.noData}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}