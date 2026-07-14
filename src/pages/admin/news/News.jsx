import React, { useState, useEffect } from "react";
import { FaLightbulb, FaTrashAlt, FaPlusCircle, FaRegCommentDots, FaUpload, FaImage } from "react-icons/fa";
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import "./news.css"; 

export default function MaslahatlarTab({ lang = "uz" }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); 
  const [imageUrl, setImageUrl] = useState(""); // Государство для ссылки на изображение
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Состояние загрузки файла

  // 🌍 Ko'p tillilik lug'ati / Словарь локализации
  const translations = {
    uz: {
      formTitle: "Ustalar uchun Maslahatlar va Tavsiyalar",
      formDesc: "Bu yerga yozilgan tavsiyalar yoki muhim gaplar bevosita ustalar (userlar) panelida ko'rinadi.",
      labelTitle: " Nomlanishi *",
      placeholderTitle: "Masalan: To'lov tizimidagi yangilanishlar",
      labelContent: "Maslahat Matni *",
      placeholderContent: "Foydalanuvchilar ko'rishi kerak bo'lgan gaplar va tavsiyalarni yozing...",
      btnPublish: "E'lon Qilish",
      btnSaving: "Saqlanmoqda...",
      listTitle: "📋 Mavjud Yangiliklar",
      thTitle: "Sarlavha",
      thContent: "Matn",
      thDate: "Sana",
      thAction: "Amal",
      emptyRow: "Hozircha hech qanday ma'lumot kiritilmagan.",
      toastFieldsErr: "Iltimos, barcha maydonlarni to'ldiring!",
      toastSuccess: "Yangi maslahat/yangilik muvaffaqiyatli qo'shildi! 💡",
      toastDeleted: "Muvaffaqiyatli o'chirildi 🗑️",
      confirmDelete: "Ushbu ma'lumotni o'chirib tashlamoqchimisiz?",
      errorLoad: "Mavjud ma'lumotlarni yuklab bo'lmadi",
      errorLoadConsole: "Ma'lumotlarni yuklashda xatolik:",
      errorAction: "Xatolik yuz berdi: ",
      uploadBtn: "Rasm tanlash",
      uploadingText: "Rasm yuklanmoqda...",
      uploadSuccess: "Rasm muvaffaqiyatli yuklandi! 📸",
      uploadTypeErr: "Iltimos, faqat rasm faylini tanlang!",
      imgText: "Rasm"
    },
    ru: {
      formTitle: "Советы и Рекомендации для Мастеров",
      formDesc: "Написанные здесь рекомендации или важные сообщения будут отображаться непосредственно в панели мастеров (пользователей).",
      labelTitle: "Заголовок / Название *",
      placeholderTitle: "Например: Обновления в платежной системе",
      labelContent: "Текст Совета или Новости *",
      placeholderContent: "Напишите сообщения и рекомендации, которые должны увидеть пользователи...",
      btnPublish: "Опубликовать",
      btnSaving: "Сохранение...",
      listTitle: "📋 Доступные Советы и Новости",
      thTitle: "Заголовок",
      thContent: "Текст",
      thDate: "Дата",
      thAction: "Действие",
      emptyRow: "На данный момент информация не введена.",
      toastFieldsErr: "Пожалуйста, заполните все поля!",
      toastSuccess: "Новый совет/новость успешно добавлен! 💡",
      toastDeleted: "Успешно удалено 🗑️",
      confirmDelete: "Вы действительно хотите удалить эту информацию?",
      errorLoad: "Не удалось загрузить существующие данные",
      errorLoadConsole: "Ошибка при загрузке данных:",
      errorAction: "Произошла ошибка: ",
      uploadBtn: "Выбрать изображение с компьютера",
      uploadingText: "Изображение загружается...",
      uploadSuccess: "Изображение успешно загрузилось! 📸",
      uploadTypeErr: "Пожалуйста, выберите только файлы изображений!",
      imgText: "Фото"
    }
  };

  const t = translations[lang] || translations.uz;

  // 1. Supabase-dagi 'news' jadvalidan ma'lumotlarni yuklash (useEffect ichiga olindi)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNewsList(data || []);
      } catch (err) {
        console.error(t.errorLoadConsole, err);
        toast.error(t.errorLoad);
      }
    };

    fetchNews();
  }, [t.errorLoad, t.errorLoadConsole]);

  // Qolgan funksiyalar uchun ro'yxatni yangilash mexanizmi
  const refreshNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setNewsList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 📷 Rasmni Supabase Storage-ga yuklash funksiyasi
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error(t.uploadTypeErr);
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("prizes")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("prizes").getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
      toast.success(t.uploadSuccess);
    } catch (error) {
      toast.error(t.errorAction + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 2. Yangi maslahat/yangilik yaratish va bazaga yozish
  const handleCreateNews = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error(t.toastFieldsErr);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("news").insert([
        {
          title: title.trim(),
          content: content.trim(), 
          image_url: imageUrl.trim() || null,
        },
      ]);

      if (error) throw error;

      toast.success(t.toastSuccess);
      setTitle("");
      setContent("");
      setImageUrl(""); 
      refreshNews();
    } catch (err) {
      toast.error(t.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. O'chirish funksiyasi
  const handleDeleteNews = async (id) => {
    const isConfirmed = window.confirm(t.confirmDelete);
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;

      toast.info(t.toastDeleted);
      refreshNews();
    } catch (err) {
      toast.error(t.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-section fade-in maslahatlar-container">
      
      {/* YANGI MASLAHAT/YANGILIK QO'SHISH FORMASI */}
      <div className="aksiya-card">
        <h4 className="aksiya-card-title">
          <FaLightbulb style={{ color: "#eab308" }} /> {t.formTitle}
        </h4>
        <p className="aksiya-card-desc">
          {t.formDesc}
        </p>

        <form onSubmit={handleCreateNews} className="aksiya-form">
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
            <label>{t.labelContent}</label>
            <textarea
              placeholder={t.placeholderContent}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea-input-style"
              rows="4"
            />
          </div>

          {/* КНОПКА ЗАГРУЗКИ КАРТИНКИ */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "15px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <label htmlFor="news-file-upload" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 15px",
                background: "#f1f5f9",
                border: "1px dashed #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                color: "#475569",
                textAlign: "center"
              }}>
                <FaUpload /> {uploading ? t.uploadingText : t.uploadBtn}
              </label>
              <input 
                id="news-file-upload"
                type="file" 
                accept="image/*"
                onChange={handleImageUpload} 
                disabled={uploading}
                style={{ display: "none" }}
              />
            </div>

            {/* Превью картинки при наличии ссылки */}
            {imageUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "6px 12px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                <img src={imageUrl} alt="Uploaded preview" style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "4px" }} />
                <span style={{ fontSize: "12px", color: "#16a34a" }}>✓ Ready</span>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || uploading} className="btn-submit" style={{ background: "#eab308" }}>
            <FaPlusCircle /> {loading ? t.btnSaving : t.btnPublish}
          </button>
        </form>
      </div>

      {/* MAVJUD RO'YXAT JADBAlI */}
      <div className="aksiya-card">
        <h4 className="aksiya-card-title">{t.listTitle}</h4>
        
        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>{t.imgText}</th>
                <th style={{ width: "20%" }}>{t.thTitle}</th>
                <th style={{ width: "45%" }}>{t.thContent}</th>
                <th style={{ width: "15%" }}>{t.thDate}</th>
                <th style={{ textAlign: "center", width: "10%" }}>{t.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
                    ) : (
                      <div style={{ width: "45px", height: "45px", background: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FaImage style={{ color: "#cbd5e1" }} />
                      </div>
                    )}
                  </td>
                  <td><strong>{item.title}</strong></td>
                  <td>
                    <div className="tip-desc-cell">
                      <FaRegCommentDots style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <span>{item.content}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      {new Date(item.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="btn-delete"
                      title={lang === "ru" ? "Удалить" : "O'chirish"}
                      disabled={loading}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
              
              {newsList.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    {t.emptyRow}
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