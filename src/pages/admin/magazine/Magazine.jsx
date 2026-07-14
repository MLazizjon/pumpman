import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import { FaPlus, FaCheck, FaTimes, FaTrash, FaImage, FaUpload, FaSnowflake, FaFire } from "react-icons/fa";
import "../magazine/magazine.css"; 

export default function MagazinTab({ lang = "uz" }) {
  const [prizes, setPrizes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10"); 
  const [imageUrl, setImageUrl] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  // 🌍 Ko'p tilli matnlar lug'ati (Translations Array/Object)
  const translations = {
    uz: {
      title: "🎁 Sovg'alar Do'koni (Admin Panel)",
      closeStore: "Do'konni Yopish (Hammasini Muzlatish)",
      openStore: "Do'konni Ochish (Hammasini Aktiv qilish)",
      closing: "Muzlatilmoqda...",
      opening: "Yoqilmoqda...",
      addNewPrize: "Yangi sovg'a e'lon qilish",
      prizeName: "Sovg'a nomi",
      ballPrice: "Ball narxi (Masalan: 15)",
      quantity: "Soni (Zaxira)",
      uploadingImg: "Rasm yuklanmoqda...",
      chooseImg: "Rasm tanlash",
      imgReady: "Rasm tayyor!",
      publish: "E'lon qilish",
      availablePrizes: "📦 Do'konda mavjud sovg'alar",
      noPrizes: "Do'konda hozircha hech qanday sovg'a yo'q.",
      inStock: "Sotuvda bor",
      outOfStock: "Sotuvda yo'q (Muzlatilgan)",
      freeze: "Muzlatish",
      activate: "Aktiv qilish",
      delete: "O'chirish",
      incomingOrders: "📥 Kelib tushgan so'rovlar",
      thMaster: "Usta (Foydalanuvchi)",
      thPhone: "Telefon",
      thItem: "So'ralgan narsa",
      thPrice: "Ketti (Ball)",
      thStatus: "Status",
      thAction: "Amal",
      stApproved: "Tasdiqlandi",
      stRejected: "Rad etildi",
      stPending: "Kutilmoqda",
      toastFieldsError: "Hamma maydonlarni to'ldiring!",
      toastImgOnly: "Iltimos, faqat rasm faylini tanlang!",
      toastImgSuccess: "Rasm muvaffaqiyatli yuklandi! 📸",
      toastImgError: "Rasm yuklashda xatolik: ",
      toastLoadError: "Ma'lumot yuklashda xatolik: ",
      toastFrozen: "Mahsulot muzlatildi!",
      toastActivated: "Mahsulot sotuvga chiqarildi!",
      toastAllFrozen: "Do'kondagi barcha mahsulotlar muvaffaqiyatli muzlatildi! ❄️",
      toastAllActivated: "Barcha mahsulotlar sotuvga qaytarildi! 🔥",
      toastAdded: "Yangi sovg'a do'konga qo'shildi! 🎁",
      toastDeleted: "Sovg'a o'chirib tashlandi.",
      toastStatusChanged: "Buyurtma holati o'zgardi: ",
      confirmFreezeAll: "Haqiqatdan ham do'kondagi BARCHA mahsulotlarni birdaniga muzlatmoqchimisiz?",
      confirmActivateAll: "Haqiqatdan ham barcha mahsulotlarni jilddan sotuvga chiqarmoqchimisiz? (Har biriga 10 tadan joylanadi)",
      confirmDelete: "Haqiqatdan ham bu sovg'ani do'kondan o'chirmoqchimisiz?"
    },
    ru: {
      title: "🎁 Магазин Подарков (Админ Панель)",
      closeStore: "Закрыть магазин (Заморозить все)",
      openStore: "Открыть магазин (Активировать все)",
      closing: "Замораживается...",
      opening: "Включается...",
      addNewPrize: "Объявить новый подарок",
      prizeName: "Название подарка",
      ballPrice: "Цена в баллах (Например: 15)",
      quantity: "Количество (Запас)",
      uploadingImg: "Загрузка изображения...",
      chooseImg: "Выбрать изображение",
      imgReady: "Изображение готово!",
      publish: "Опубликовать",
      availablePrizes: "📦 Доступные подарки в магазине",
      noPrizes: "В магазине пока нет подарков.",
      inStock: "В продаже",
      outOfStock: "Нет в продаже (Заморожен)",
      freeze: "Заморозить",
      activate: "Активировать",
      delete: "Удалить",
      incomingOrders: "📥 Поступившие запросы",
      thMaster: "Мастер (Пользователь)",
      thPhone: "Телефон",
      thItem: "Запрошенный товар",
      thPrice: "Списано (Баллы)",
      thStatus: "Статус",
      thAction: "Действие",
      stApproved: "Одобрено",
      stRejected: "Отклонено",
      stPending: "В ожидании",
      toastFieldsError: "Пожалуйста, заполните все поля!",
      toastImgOnly: "Пожалуйста, выберите только файл изображения!",
      toastImgSuccess: "Изображение успешно загружено! 📸",
      toastImgError: "Ошибка загрузки изображения: ",
      toastLoadError: "Ошибка загрузки данных: ",
      toastFrozen: "Товар заморожен!",
      toastActivated: "Товар выставлен на продажу!",
      toastAllFrozen: "Все товары в магазине успешно заморожены! ❄️",
      toastAllActivated: "Все товары возвращены в продажу! 🔥",
      toastAdded: "Новый подарок добавлен в магазин! 🎁",
      toastDeleted: "Подарок удален.",
      toastStatusChanged: "Статус заказа изменен: ",
      confirmFreezeAll: "Вы действительно хотите заморозить ВСЕ товары в магазине одновременно?",
      confirmActivateAll: "Вы действительно хотите выставить все товары на продажу? (Каждому будет присвоено по 10 шт.)",
      confirmDelete: "Вы действительно хотите удалить этот подарок из магазина?"
    }
  };

  const t = translations[lang] || translations.uz;

  // Ma'lumotlarni yuklash
  const fetchData = async () => {
    try {
      const { data: prizesData, error: pErr } = await supabase
        .from("prizes")
        .select("*")
        .order("created_at", { ascending: false }); 
      if (pErr) throw pErr;

      const { data: ordersData, error: oErr } = await supabase
        .from("orders")
        .select("id, status, user_id, prize_id, profiles(full_name, phone), prizes(name, price)")
        .order("created_at", { ascending: false });
      if (oErr) throw oErr;

      setPrizes(prizesData || []);
      setOrders(ordersData || []);
    } catch (err) {
      toast.error(t.toastLoadError + err.message);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // 📷 Rasmni Supabase Storage-ga yuklash
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error(t.toastImgOnly);
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `prize-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("prizes")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("prizes").getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
      toast.success(t.toastImgSuccess);
    } catch (error) {
      toast.error(t.toastImgError + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 🔄 Bitta mahsulotni muzlatish / aktiv qilish
  const toggleStockStatus = async (id, currentStock) => {
    try {
      const newStock = currentStock > 0 ? 0 : 10; 
      const { error } = await supabase
        .from("prizes")
        .update({ stock: newStock })
        .eq("id", id);

      if (error) throw error;
      toast.success(newStock === 0 ? t.toastFrozen : t.toastActivated);
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  // ❄️ HAMMASINI BIR DANIGA MUZLATISH FUNKSIYASI
  const freezeAllPrizes = async () => {
    if (!window.confirm(t.confirmFreezeAll)) return;
    setGlobalLoading(true);
    try {
      const { error } = await supabase
        .from("prizes")
        .update({ stock: 0 })
        .gt("id", 0); 

      if (error) throw error;
      toast.success(t.toastAllFrozen);
      fetchData();
    } catch (err) {
      toast.error("Global xatolik: " + err.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  // 🔥 HAMMASINI BIR DANIGA FAOLLASHTIRISH FUNKSIYASI
  const activateAllPrizes = async () => {
    if (!window.confirm(t.confirmActivateAll)) return;
    setGlobalLoading(true);
    try {
      const { error } = await supabase
        .from("prizes")
        .update({ stock: 10 })
        .gt("id", 0);

      if (error) throw error;
      toast.success(t.toastAllActivated);
      fetchData();
    } catch (err) {
      toast.error("Global xatolik: " + err.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Yangi sovg'a qo'shish
  const addPrize = async () => {
    if (!name.trim() || !price || !stock) return toast.error(t.toastFieldsError);
    setLoading(true);
    try {
      const { error } = await supabase.from("prizes").insert([
        { 
          name: name.trim(), 
          price: Number(price),
          stock: Number(stock), 
          image_url: imageUrl.trim() || null 
        }
      ]);
      if (error) throw error;

      toast.success(t.toastAdded);
      setName("");
      setPrice("");
      setStock("10");
      setImageUrl("");
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sovg'ani o'chirish
  const deletePrize = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      const { error } = await supabase.from("prizes").delete().eq("id", id);
      if (error) throw error;
      toast.success(t.toastDeleted);
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  // Buyurtma statusini yangilash
  const updateOrderStatus = async (order, newStatus) => {
    try {
      if (newStatus === "rejected") {
        const { data: prof } = await supabase.from("profiles").select("bonus").eq("id", order.user_id).single();
        if (prof) {
          const refundBonus = (prof.bonus || 0) + (order.prizes?.price || 0);
          await supabase.from("profiles").update({ bonus: refundBonus }).eq("id", order.user_id);
        }
        
        const { data: prz } = await supabase.from("prizes").select("stock").eq("id", order.prize_id).single();
        if (prz) {
          await supabase.from("prizes").update({ stock: prz.stock + 1 }).eq("id", order.prize_id);
        }
      }

      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
      if (error) throw error;

      const friendlyStatus = newStatus === "approved" ? t.stApproved : t.stRejected;
      toast.info(`${t.toastStatusChanged} ${friendlyStatus} 🔄`);
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    }
  };

  return (
    <div className="magazin-admin">
      <h2>{t.title}</h2>
      
      {/* 🚨 GLOBAL BOSHQARUV TUGMALARI BLOKI */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
        <button 
          onClick={freezeAllPrizes} 
          disabled={globalLoading || prizes.length === 0}
          style={{ background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FaSnowflake /> {globalLoading ? t.closing : t.closeStore}
        </button>

        <button 
          onClick={activateAllPrizes} 
          disabled={globalLoading || prizes.length === 0}
          style={{ background: "#22c55e", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FaFire /> {globalLoading ? t.opening : t.openStore}
        </button>
      </div>
      
      {/* ➕ Sovg'a qo'shish formasi */}
      <div className="add-prize-form-container" style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>{t.addNewPrize}</h3>
        <div className="add-prize-form" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input value={name} placeholder={t.prizeName} onChange={(e) => setName(e.target.value)} style={{ flex: 2 }} />
            <input value={price} type="number" placeholder={t.ballPrice} onChange={(e) => setPrice(e.target.value)} style={{ flex: 1 }} />
            <input value={stock} type="number" placeholder={t.quantity} onChange={(e) => setStock(e.target.value)} style={{ flex: 1 }} />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <label htmlFor="file-upload" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 15px", background: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "500", color: "#475569" }}>
                <FaUpload /> {uploading ? t.uploadingImg : t.chooseImg}
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: "none" }} />
            </div>

            {imageUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "6px 12px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                <img src={imageUrl} alt="Uploaded" style={{ width: "30px", height: "30px", objectFit: "cover", borderRadius: "4px" }} />
                <span style={{ fontSize: "12px", color: "#16a34a" }}>{t.imgReady}</span>
              </div>
            )}

            <button onClick={addPrize} disabled={loading || uploading} style={{ height: "42px", whiteSpace: "nowrap" }}>
              <FaPlus /> {t.publish}
            </button>
          </div>
        </div>
      </div>

      {/* 🛍️ Mavjud sovg'alar ro'yxati */}
      <h3>{t.availablePrizes} ({prizes.length} ta)</h3>
      <div className="prizes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {prizes.length > 0 ? (
          prizes.map(p => (
            <div key={p.id} className="prize-admin-card" style={{ background: "#ffffff", borderRadius: "10px", padding: "14px", border: "1px solid #e2e8f0", position: "relative", textAlign: "center" }}>
              <div style={{ width: "100%", height: "120px", background: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: "10px" }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <FaImage style={{ fontSize: "32px", color: "#94a3b8" }} />
                )}
              </div>
              <h4 style={{ margin: "5px 0", fontSize: "16px", color: "#0f172a" }}>{p.name}</h4>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#2563eb", display: "block" }}>{p.price} ball</span>
              
              <span style={{ fontSize: "12px", fontWeight: "500", color: p.stock > 0 ? "#16a34a" : "#dc2626", display: "block", margin: "6px 0 12px 0" }}>
                {p.stock > 0 ? `${t.inStock}: ${p.stock} ta` : t.outOfStock}
              </span>
              
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                <button
                  onClick={() => toggleStockStatus(p.id, p.stock)}
                  style={{ background: p.stock > 0 ? "#fffbeb" : "#f0fdf4", color: p.stock > 0 ? "#b45309" : "#15803d", border: p.stock > 0 ? "1px solid #fde68a" : "1px solid #bbf7d0", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}
                >
                  {p.stock > 0 ? t.freeze : t.activate}
                </button>

                <button onClick={() => deletePrize(p.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                  <FaTrash /> {t.delete}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#64748b", gridColumn: "1/-1" }}>{t.noPrizes}</p>
        )}
      </div>

      {/* 📥 Kelgan so'rovlar */}
      <h3>{t.incomingOrders} ({orders.length} ta)</h3>
      <table className="orders-table">
        <thead>
          <tr>
            <th>{t.thMaster}</th>
            <th>{t.thPhone}</th>
            <th>{t.thItem}</th>
            <th>{t.thPrice}</th>
            <th>{t.thStatus}</th>
            <th>{t.thAction}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.profiles?.full_name || "Noma'lum"}</td>
              <td>{o.profiles?.phone || "-"}</td>
              <td>{o.prizes?.name || "O'chirilgan"}</td>
              <td>{o.prizes?.price || 0}</td>
              <td>
                <span className={`status-text ${o.status}`}>
                  {o.status === "approved" ? t.stApproved : o.status === "rejected" ? t.stRejected : t.stPending}
                </span>
              </td>
              <td>
                {o.status === "pending" && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => updateOrderStatus(o, "approved")} title="Tasdiqlash" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      <FaCheck />
                    </button>
                    <button onClick={() => updateOrderStatus(o, "rejected")} title="Rad etish" style={{ background: "#fef2f2", color: "#dc2626" }}>
                      <FaTimes />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}