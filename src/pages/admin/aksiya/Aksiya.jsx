import React, { useState, useEffect, useCallback } from "react"; // 1. useCallback qo'shildi
import { FaCalendarPlus, FaTrashAlt, FaClock, FaGift, FaImage } from "react-icons/fa";
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import "./aksiya.css"; 

export default function AksiyaTab({ lang = "uz" }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageFile, setImageFile] = useState(null); 
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌍 Aksiya bo'limi uchun ko'p tillilik lug'ati
  const translations = {
    uz: {
      formTitle: "Yangi Aksiya Muddatini Belgilash",
      formDesc: "Bu yerda belgilangan muddat ichida foydalanuvchilar o'z panellarida aksiya bannerini ko'rib turishadi.",
      labelTitle: "Aksiya Nomi *",
      placeholderTitle: "Masalan: Bahoriy Omadli Kunlar Aksiyasi",
      labelImage: "Aksiya Rasmi",
      optional: "(Ixtiyoriy)",
      labelStart: "Boshlanish Sanasi va Vaqti *",
      labelEnd: "Tugash Sanasi va Vaqti *",
      btnPublish: "Aksiyani E'lon Qilish",
      btnSaving: "Saqlanmoqda...",
      listTitle: "📋 Mavjud Aksiya Muddatlari",
      thImage: "Rasm",
      thName: "Aksiya Nomi",
      thStart: "Boshlanish Vaqti",
      thEnd: "Tugash Vaqti",
      thStatus: "Holat",
      thAction: "Amal",
      statusWaiting: "Kutilmoqda",
      statusActive: "🟢 Faol",
      statusEnded: "Yakunlangan",
      noCampaigns: "Hozircha hech qanday aksiya muddati kiritilmagan.",
      toastFieldsErr: "Iltimos, barcha majburiy maydonlarni to'ldiring!",
      toastDatesErr: "Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak!",
      toastSuccessGen: "Yangi aksiya muddati muvaffaqiyatli qo'shildi! 🎉",
      toastSuccessDel: "Aksiya muvaffaqiyatli o'chirildi 🗑️",
      confirmDelete: "Rostdan ham ushbu aksiyani butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.",
      errorLoad: "Mavjud aksiyalarni yuklab bo'lmadi",
      errorLoadConsole: "Aksiyalarni yuklashda xatolik:",
      errorAction: "Xatolik yuz berdi: "
    },
    ru: {
      formTitle: "Установка Сроков Новой Акции",
      formDesc: "В течение указанного здесь периода пользователи будут видеть баннер акции в своих панелях.",
      labelTitle: "Название / Заголовок Акции *",
      placeholderTitle: "Например: Весенняя Акция Удачливых Дней",
      labelImage: "Баннер / Изображение Акции",
      optional: "(Необязательно)",
      labelStart: "Дата и Время Начала *",
      labelEnd: "Дата и Время Окончания *",
      btnPublish: "Опубликовать Акцию",
      btnSaving: "Сохранение...",
      listTitle: "📋 Доступные Сроки Акций",
      thImage: "Фото",
      thName: "Название Акции",
      thStart: "Время Начала",
      thEnd: "Время Окончания",
      thStatus: "Статус",
      thAction: "Действие",
      statusWaiting: "В ожидании",
      statusActive: "🟢 Активна",
      statusEnded: "Завершена",
      noCampaigns: "На данный момент сроки акций не введены.",
      toastFieldsErr: "Пожалуйста, заполните все обязательные поля!",
      toastDatesErr: "Дата окончания должна быть позже даты начала!",
      toastSuccessGen: "Срок новой акции успешно добавлен! 🎉",
      toastSuccessDel: "Акция успешно удалена 🗑️",
      confirmDelete: "Вы действительно хотите полностью удалить эту акцию? Это действие нельзя отменить.",
      errorLoad: "Не удалось загрузить существующие акции",
      errorLoadConsole: "Ошибка при загрузке акций:",
      errorAction: "Произошла ошибка: "
    }
  };

  const t = translations[lang] || translations.uz;

  // 2. Funksiya useCallback ichiga olindi va unga til o'zgarganda yangilanishi uchun t.errorLoadConsole va t.errorLoad bog'landi
  const fetchCampaigns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error(t.errorLoadConsole, err);
      toast.error(t.errorLoad);
    }
  }, [t.errorLoadConsole, t.errorLoad]); 

  // 3. useEffect faollashtirildi va fetchCampaigns uning ichiga bog'liqlik sifatida qo'shildi
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Yangi aksiya yaratish
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !startDate || !endDate) {
      toast.error(t.toastFieldsErr);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error(t.toastDatesErr);
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}_${Date.now()}.${fileExt}`;
        const filePath = `campaign-banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("campaigns") 
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("campaigns")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("campaigns").insert([
        {
          title: title.trim(),
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          image_url: imageUrl, 
        },
      ]);

      if (error) throw error;

      toast.success(t.toastSuccessGen);
      setTitle("");
      setStartDate("");
      setEndDate("");
      setImageFile(null); 
      
      const fileInput = document.getElementById("campaign-image");
      if (fileInput) fileInput.value = "";

      fetchCampaigns();
    } catch (err) {
      toast.error(t.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  // O'chirish amali
  const handleDeleteCampaign = async (id) => {
    const isConfirmed = window.confirm(t.confirmDelete);
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      
      toast.info(t.toastSuccessDel);
      fetchCampaigns();
    } catch (err) {
      toast.error(t.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-section fade-in aksiya-container">
      
      {/* YANGI AKSIYA YARATISH FORMASI */}
      <div className="aksiya-card">
        <h4 className="aksiya-card-title">
          <FaGift style={{ color: "#10b981" }} /> {t.formTitle}
        </h4>
        <p className="aksiya-card-desc">
          {t.formDesc}
        </p>

        <form onSubmit={handleCreateCampaign} className="aksiya-form">
          <div className="input-group">
            <label>{t.labelTitle}</label>
            <input
              type="text"
              placeholder={t.placeholderTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>{t.labelImage} <span style={{ fontWeight: "normal", color: "#94a3b8" }}>{t.optional}</span></label>
            <input
              id="campaign-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="file-input-style"
            />
          </div>

          <div className="dates-row">
            <div className="input-group flex-1">
              <label>{t.labelStart}</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="input-group flex-1">
              <label>{t.labelEnd}</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            <FaCalendarPlus /> {loading ? t.btnSaving : t.btnPublish}
          </button>
        </form>
      </div>

      {/* MAVJUD AKSIYALAR RO'YXATI JADVALI */}
      <div className="aksiya-card">
        <h4 className="aksiya-card-title">{t.listTitle}</h4>
        
        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t.thImage}</th>
                <th>{t.thName}</th>
                <th>{t.thStart}</th>
                <th>{t.thEnd}</th>
                <th>{t.thStatus}</th>
                <th style={{ textAlign: "center" }}>{t.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => {
                const now = new Date();
                const start = new Date(camp.start_date);
                const end = new Date(camp.end_date);
                
                let statusBadge = "";
                if (now < start) {
                  statusBadge = <span className="badge badge-waiting">{t.statusWaiting}</span>;
                } else if (now >= start && now <= end) {
                  statusBadge = <span className="badge badge-active">{t.statusActive}</span>;
                } else if (now > end) {
                  statusBadge = <span className="badge badge-ended">{t.statusEnded}</span>;
                }

                return (
                  <tr key={camp.id}>
                    <td>
                      {camp.image_url ? (
                        <img 
                          src={camp.image_url} 
                          alt="Aksiya" 
                          className="table-campaign-img"
                        />
                      ) : (
                        <div className="table-campaign-no-img"><FaImage /></div>
                      )}
                    </td>
                    <td><strong>{camp.title}</strong></td>
                    <td>
                      <div className="time-cell">
                        <FaClock size={13} style={{ color: "#94a3b8" }} /> {new Date(camp.start_date).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <FaClock size={13} style={{ color: "#94a3b8" }} /> {new Date(camp.end_date).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                      </div>
                    </td>
                    <td>{statusBadge}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteCampaign(camp.id)}
                        className="btn-delete"
                        title={lang === "ru" ? "Удалить" : "O'chirish"}
                        disabled={loading}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-row" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    {t.noCampaigns}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}