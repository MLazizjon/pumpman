import { useState, useEffect, useCallback } from "react"; // 1. useCallback import qilindi
import { supabase } from "../../../supabase/client";
import { 
  FaPlus, 
  FaBarcode, 
  FaCopy, 
  FaTrashAlt, 
  FaLayerGroup, 
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTimesCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./kodgenerator.css";

const generateRandomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function CodeGenerator({ lang = "uz" }) {
  const [quantity, setQuantity] = useState(5);
  const [generatedGroups, setGeneratedGroups] = useState([]);
  const [usedCodes, setUsedCodes] = useState([]); 
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroupCodes, setSelectedGroupCodes] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🌍 Tarjimalar lug'ati
  const translations = {
    uz: {
      mainTitle: "Mukammal Kod Generatori",
      subtitle: "Tizim uchun unikal shtrix-kodlar guruhini yarating va boshqaring",
      quantityLabel: "Miqdori:",
      btnGenerate: "Kod Yaratish",
      generating: "Yaratilmoqda...",
      sectionTitle: "Aktiv Partiyalar & Ishlatilganlar",
      partiya: "PARTIYA",
      createdAt: "Yaratilgan vaqti",
      statusActive: "Aktiv",
      statusUsed: "Ishlatilgan",
      available: "Mavjud:",
      unitCodes: "ta kod",
      usedTitle: "Ishlatilgan Kodlar",
      usedSubtitle: "Mijozlar ishlatib bo'lgan eski kodlar",
      noUsedCodes: "Hozircha ishlatilgan kodlar yo'q",
      totalUsed: "Jami ishlatilgan:",
      modalTitle: "O'chirishni tasdiqlaysizmi?",
      modalDesc1: "Rostdan ham ushbu (",
      modalDesc2: " ta) kodlarni o'chirib tashlamoqchimisiz? Bu amalni mutlaqo ortga qaytarib bo'lmaydi.",
      modalConfirm: "Ha, o'chirilsin",
      modalDeleting: "O'chirilmoqda...",
      modalCancel: "Bekor qilish",
      toastLimit: "Iltimos, 1 dan 100 gacha son kiriting!",
      toastSuccessGen: "Yangi promo-kod yaratildi! 🎉",
      toastSuccessDel: "Kodlar muvaffaqiyatli o'chirildi! 🗑️",
      toastCopied: "Kodlar nusxalandi! 📋",
      toastErrLoad: "Kodlarni yuklashda xatolik:",
      toastErrDel: "O'chirishda xatolik: ",
      summaryBadge: "YAKUNIY XULOSA"
    },
    ru: {
      mainTitle: "Совершенный Генератор Кодов",
      subtitle: "Создавайте и управляйте группами уникальных штрих-кодов для системы",
      quantityLabel: "Количество:",
      btnGenerate: "Создать Код",
      generating: "Создание...",
      sectionTitle: "Активные Партии и Использованные",
      partiya: "ПАРТИЯ",
      createdAt: "Время создания",
      statusActive: "Активен",
      statusUsed: "Использован",
      available: "Доступно:",
      unitCodes: "шт. кодов",
      usedTitle: "Использованные Коды",
      usedSubtitle: "Старые коды, которые клиенты уже использовали",
      noUsedCodes: "Использованных кодов пока нет",
      totalUsed: "Всего использовано:",
      modalTitle: "Подтвердите удаление?",
      modalDesc1: "Вы действительно хотите удалить эти (",
      modalDesc2: " шт.) коды? Это действие невозможно отменить.",
      modalConfirm: "Да, удалить",
      modalDeleting: "Удаление...",
      modalCancel: "Отмена",
      toastLimit: "Пожалуйста, введите число от 1 до 100!",
      toastSuccessGen: "Созданы новые промокоды! 🎉",
      toastSuccessDel: "Коды успешно удалены! 🗑️",
      toastCopied: "Коды скопированы! 📋",
      toastErrLoad: "Ошибка при загрузке кодов:",
      toastErrDel: "Ошибка при удалении: ",
      summaryBadge: "ИТОГ"
    }
  };

  const t = translations[lang] || translations.uz;

  // 2. Funksiya useCallback ichiga olindi va lang o'zgaruvchisiga bog'landi
  const fetchRecentCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        const spent = data.filter(c => !c.is_active);
        setUsedCodes(spent);

        const activeCodes = data.filter(c => c.is_active);
        
        const groups = {};
        activeCodes.forEach(item => {
          const dateObj = new Date(item.created_at);
          const currentLocale = lang === "ru" ? "ru-RU" : "uz-UZ";
          const timeKey = dateObj.toLocaleTimeString(currentLocale, {
            hour: "2-digit",
            minute: "2-digit"
          }) + " - " + dateObj.toLocaleDateString(currentLocale);

          if (!groups[timeKey]) {
            groups[timeKey] = [];
          }
          groups[timeKey].push(item);
        });

        const formattedGroups = Object.keys(groups).map(key => ({
          time: key,
          codes: groups[key]
        }));

        setGeneratedGroups(formattedGroups);
      }
    } catch (err) {
      console.error(t.toastErrLoad, err);
    }
  }, [lang, t.toastErrLoad]); // Bog'liqliklar

  // 3. useEffect ichiga fetchRecentCodes qo'shildi
  useEffect(() => {
    fetchRecentCodes();
  }, [fetchRecentCodes]);

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 100) {
      toast.error(t.toastLimit);
      return;
    }

    setLoading(true);
    const newCodesArray = [];
    for (let i = 0; i < quantity; i++) {
      newCodesArray.push({
        code: generateRandomCode(),
        is_active: true
      });
    }

    try {
      const { error } = await supabase.from("promo_codes").insert(newCodesArray);
      if (error) throw error;

      toast.success(`Yangi ${quantity} ${t.toastSuccessGen}`);
      fetchRecentCodes();
    } catch (err) {
      toast.error("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (codes) => {
    setSelectedGroupCodes(codes);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = async () => {
    if (selectedGroupCodes.length === 0) return;
    setDeleteLoading(true);

  
    try {
      const idsToDelete = selectedGroupCodes.map(c => c.id);
      const { error } = await supabase.from("promo_codes").delete().in("id", idsToDelete);
      if (error) throw error;

      toast.success(t.toastSuccessDel);
      fetchRecentCodes();
    } catch (err) {
      toast.error(t.toastErrDel + err.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setSelectedGroupCodes([]);
    }
  };

  const copyGroupToClipboard = (codes) => {
    const text = codes.map(c => c.code).join("\n");
    navigator.clipboard.writeText(text);
    toast.info(t.toastCopied);
  };

  return (
    <div className="generator-wrapper fade-in">
      
      <div className="generator-header-card">
        <div className="header-info">
          <div className="header-icon-container">
            <FaLayerGroup size={22} />
          </div>
          <div>
            <h3>{t.mainTitle}</h3>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="generator-controls">
          <div className="custom-input-group">
            <label>{t.quantityLabel}</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={quantity === 0 ? "" : quantity} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setQuantity(0);
                } else {
                  setQuantity(parseInt(val, 10) || 0);
                }
              }}
              disabled={loading}
            />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="main-generate-btn">
            {loading ? t.generating : <><FaPlus size={13} /> {t.btnGenerate}</>}
          </button>
        </div>
      </div>

      <div className="generated-title-bar">
        <h4><FaCalendarAlt color="#64748b"/> {t.sectionTitle}</h4>
      </div>

      <div className="groups-grid-layout">
        
        {generatedGroups.map((group, index) => (
          <div className="group-batch-card" key={index}>
            <div className="batch-card-header">
              <div>
                <span className="batch-badge">#{generatedGroups.length - index} {t.partiya}</span>
                <h5>{t.createdAt}</h5>
                <p>{group.time}</p>
              </div>
              
              <div className="batch-action-buttons">
                <button onClick={() => openDeleteModal(group.codes)} className="btn-action-delete">
                  <FaTrashAlt size={12} />
                </button>
                <button onClick={() => copyGroupToClipboard(group.codes)} className="btn-action-copy">
                  <FaCopy size={12} />
                </button>
              </div>
            </div>

            <div className="batch-codes-scroll">
              <ul>
                {group.codes.map((item) => (
                  <li key={item.id}>
                    <div className="code-item-left">
                      <FaBarcode className="barcode-icon" />
                      <span>{item.code}</span>
                    </div>
                    <span className="status-pill active-pill">{t.statusActive}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="batch-card-footer">
              <span>{t.available} <b>{group.codes.length} {t.unitCodes}</b></span>
            </div>
          </div>
        ))}

        <div className="group-batch-card used-codes-special-card">
          <div className="batch-card-header">
            <div>
              <span className="batch-badge used-badge">{t.summaryBadge}</span>
              <h5 className="used-title-heading">
                <FaTimesCircle /> {t.usedTitle}
              </h5>
              <p>{t.usedSubtitle}</p>
            </div>
            {usedCodes.length > 0 && (
              <button onClick={() => openDeleteModal(usedCodes)} className="btn-action-delete">
                <FaTrashAlt size={12} />
              </button>
            )}
          </div>

          <div className="batch-codes-scroll">
            {usedCodes.length === 0 ? (
              <div className="empty-used-text">
                {t.noUsedCodes}
              </div>
            ) : (
              <ul>
                {usedCodes.map((item) => (
                  <li key={item.id} className="used-code-li">
                    <div className="code-item-left">
                      <FaBarcode className="barcode-icon disabled-icon" />
                      <span className="strikethrough-text">{item.code}</span>
                    </div>
                    <span className="status-pill used-pill">{t.statusUsed}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="batch-card-footer used-footer-top">
            <span>{t.totalUsed}</span>
            <span className="used-count-text">{usedCodes.length} {t.unitCodes}</span>
          </div>
        </div>

      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-icon-wrapper">
              <FaExclamationTriangle size={24} />
            </div>
            <h3>{t.modalTitle}</h3>
            <p>{t.modalDesc1}{selectedGroupCodes.length}{t.modalDesc2}</p>
            <div className="modal-buttons-group">
              <button onClick={confirmDeleteGroup} disabled={deleteLoading} className="modal-confirm-btn">
                {deleteLoading ? t.modalDeleting : t.modalConfirm}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setSelectedGroupCodes([]); }} disabled={deleteLoading} className="modal-cancel-btn">
                {t.modalCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}