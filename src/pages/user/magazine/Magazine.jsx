import React, { useState, useEffect, useCallback } from "react"; // 💡 useCallback qo'shildi
import { supabase } from "../../../supabase/client";
import { toast } from "react-toastify";
import { FaCoins, FaGift, FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../magazine/magazine.css";

export default function UserMagazin({ currentUser, lang = "uz" }) {
  const [prizes, setPrizes] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [userBonus, setUserBonus] = useState(0);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // 📝 Magazin qismi uchun tillar tarjimasi lug'ati
  const translations = {
    uz: {
      storeTitle: "🎁 Sovg'alar do'koni",
      storeSub: "Yig'gan ballaringizni ajoyib sovg'alarga almashtiring!",
      yourBalance: "Sizning balansingiz:",
      points: "ball",
      availablePrizes: "Mavjud sovg'alar",
      noPrizes: "Hozircha do'konda sovg'alar yo'q.",
      orderHistory: "Buyurtmalaringiz tarixi",
      noOrders: "Sizda hali buyurtmalar mavjud emas.",
      thName: "Sovg'a nomi",
      thPoints: "Sarflangan ball",
      thDate: "Sana",
      thStatus: "Status",
      deletedPrize: "O'chirilgan mahsulot",
      statusPending: "Kutilmoqda",
      statusApproved: "Topshirildi",
      statusRejected: "Rad etildi",
      btnLoading: "Yuborilmoqda...",
      btnNotAvailable: "Do'kon yopiq ",
      btnBuy: "Sotib olish",
      btnNoPoints: "Ball yetarli emas",
      toastFetchError: "Ma'lumotlarni yuklashda xatolik: ",
      toastStockOut: "Kechirasiz, bu mahsulot sotuvda tugagan yoki admin tomonidan muzlatilgan! 🔒",
      toastNoPoints: "Kechirasiz, balansingizda yetarli ball mavjud emas! 😔",
      toastSuccess: "Buyurtma qabul qilindi! Admin tasdiqlashini kuting. 🎁",
      toastError: "Xatolik yuz berdi: ",
      confirmPrefix: '"',
      confirmSuffix: '" sovg\'asini '
    },
    ru: {
      storeTitle: "🎁 Магазин подарков",
      storeSub: "Обменивайте накопленные баллы на отличные подарки!",
      yourBalance: "Ваш баланс:",
      points: "балл",
      availablePrizes: "Доступные подарки",
      noPrizes: "В магазине пока нет подарков.",
      orderHistory: "История ваших заказов",
      noOrders: "У вас еще нет заказов.",
      thName: "Название подарка",
      thPoints: "Потраченные баллы",
      thDate: "Дата",
      thStatus: "Статус",
      deletedPrize: "Удаленный товар",
      statusPending: "В ожидании",
      statusApproved: "Вручено",
      statusRejected: "Отклонено",
      btnLoading: "Отправка...",
      btnNotAvailable: "Магазин закрыт",
      btnBuy: "Купить",
      btnNoPoints: "Недостаточно баллов",
      toastFetchError: "Ошибка при загрузке данных: ",
      toastStockOut: "Извините, этот товар закончился или заблокирован админом! 🔒",
      toastNoPoints: "Извините, на вашем балансе недостаточно баллов! 😔",
      toastSuccess: "Заказ принят! Ожидайте подтверждения админа. 🎁",
      toastError: "Произошла ошибка: ",
      confirmPrefix: 'Вы хотите купить подарок "',
      confirmSuffix: '" за '
    }
  };

  const t = translations[lang] || translations["uz"];

  // 💡 Ma'lumotlarni yuklash funksiyasi useCallback ichiga olindi
  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      // Barcha sovg'alarni narxi bo'yicha tartiblab olish
      const { data: pData, error: pErr } = await supabase
        .from("prizes")
        .select("*")
        .order("price", { ascending: true });
      if (pErr) throw pErr;
      setPrizes(pData || []);

      // Foydalanuvchining joriy balansini (bonus) olish
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("bonus")
        .eq("id", currentUser.id)
        .single();
      if (profErr) throw profErr;
      setUserBonus(profData?.bonus || 0);

      // Foydalanuvchining buyurtmalar tarixini yuklash
      const { data: oData, error: oErr } = await supabase
        .from("orders")
        .select("id, status, created_at, prizes(name, price)")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (oErr) throw oErr;
      setMyOrders(oData || []);

    } catch (err) {
      toast.error(t.toastFetchError + err.message);
    }
  }, [currentUser?.id, t.toastFetchError]); // Bog'liqliklar (dependencies)

  // 💡 useEffect ichiga fetchData to'g'ri bog'liqlik sifatida qo'shildi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sotib olish funksiyasi
  const handleBuyPrize = async (prize) => {
    if (prize.stock <= 0) {
      return toast.error(t.toastStockOut);
    }

    if (userBonus < prize.price) {
      return toast.error(t.toastNoPoints);
    }

    const confirmMessage = lang === "ru"
      ? `${t.confirmPrefix}${prize.name}${t.confirmSuffix}${prize.price} ${t.points}?`
      : `${t.confirmPrefix}${prize.name}${t.confirmSuffix}${prize.price} ${t.points}ga sotib olmoqchimisiz?`;

    const confirmBuy = window.confirm(confirmMessage);
    if (!confirmBuy) return;

    setLoadingOrderId(prize.id);
    try {
      const newBonus = userBonus - prize.price;
      const newStock = prize.stock - 1;

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ bonus: newBonus })
        .eq("id", currentUser.id);
      if (profileErr) throw profileErr;

      const { error: prizeErr } = await supabase
        .from("prizes")
        .update({ stock: newStock })
        .eq("id", prize.id);
      if (prizeErr) throw prizeErr;

      const { error: orderErr } = await supabase
        .from("orders")
        .insert([
          {
            user_id: currentUser.id,
            prize_id: prize.id,
            status: "pending"
          }
        ]);
      if (orderErr) throw orderErr;

      toast.success(t.toastSuccess);
      fetchData(); 
    } catch (err) {
      toast.error(t.toastError + err.message);
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="user-magazin-container">
      
      {/* 💳 Header va Balans qismi */}
      <div className="magazin-header-card">
        <div className="header-info">
          <h2>{t.storeTitle}</h2>
          <p>{t.storeSub}</p>
        </div>
        <div className="user-balance-badge">
          <FaCoins className="coin-icon" />
          <div className="balance-text">
            <span>{t.yourBalance}</span>
            <strong>{userBonus} {t.points}</strong>
          </div>
        </div>
      </div>

      {/* 🛍 Mahsulotlar panjarasi */}
      <h3 className="section-title"><FaShoppingBag /> {t.availablePrizes}</h3>
      <div className="prizes-grid">
        {prizes.length === 0 ? (
          <p className="empty-text">{t.noPrizes}</p>
        ) : (
          prizes.map((prize) => {
            const isAffordable = userBonus >= prize.price;
            const isAvailable = prize.stock > 0;

            return (
              <div className={`prize-card ${!isAffordable || !isAvailable ? "locked" : ""}`} key={prize.id}>
                
                <div className="prize-icon-wrapper" style={{ overflow: "hidden", height: "150px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                  {prize.image_url ? (
                    <img 
                      src={prize.image_url} 
                      alt={prize.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <FaGift style={{ fontSize: "40px", color: "#cbd5e1" }} />
                  )}
                </div>

                <div className="prize-details">
                  <h4>{prize.name}</h4>
                  <div className="prize-price-tag">
                    <FaCoins /> {prize.price} {t.points}
                  </div>
                  
                  <button
                    className={`buy-btn ${isAffordable && isAvailable ? "active" : "disabled"}`}
                    onClick={() => handleBuyPrize(prize)}
                    disabled={!isAffordable || !isAvailable || loadingOrderId === prize.id}
                  >
                    {loadingOrderId === prize.id 
                      ? t.btnLoading 
                      : !isAvailable 
                        ? t.btnNotAvailable 
                        : isAffordable 
                          ? t.btnBuy 
                          : t.btnNoPoints}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 📥 Foydalanuvchining shaxsiy buyurtmalari tarixi */}
      <h3 className="section-title"><FaClock /> {t.orderHistory}</h3>
      <div className="orders-history-card">
        {myOrders.length === 0 ? (
          <p className="empty-text">{t.noOrders}</p>
        ) : (
          <div className="user-orders-table-wrapper">
            <table className="user-orders-table">
              <thead>
                <tr>
                  <th>{t.thName}</th>
                  <th>{t.thPoints}</th>
                  <th>{t.thDate}</th>
                  <th>{t.thStatus}</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.prizes?.name || t.deletedPrize}</strong></td>
                    <td className="table-price"><FaCoins /> {order.prizes?.price || 0}</td>
                    <td>{new Date(order.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}</td>
                    <td>
                      <span className={`user-status-badge ${order.status}`}>
                        {order.status === "pending" && <><FaClock /> {t.statusPending}</>}
                        {order.status === "approved" && <><FaCheckCircle /> {t.statusApproved}</>}
                        {order.status === "rejected" && <><FaTimesCircle /> {t.statusRejected}</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}