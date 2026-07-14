import React, { useState } from "react";
import { FiArrowLeft, FiGrid, FiPackage, FiImage, FiMapPin, FiPhone } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./katalog.css";

// === Barcha importlarni eng tepaga joylashtiramiz ===
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// === PUMPMAN-ГЛ PAPKASIDAN RASMLAR IMPORTI ===
import imgQB from "./pumpman¦-гл/QB.png";
import imgCPm from "./pumpman¦-гл/4TMS.png";
import imgPW from "./pumpman¦-гл/PW.png";
import imgPWE from "./pumpman¦-гл/PW-E.png";
import imgPWF from "./pumpman¦-гл/PW.png"; 
// import imgQDX from "./pumpman¦-гл/QDX.png";
// import imgTCM from "./pumpman¦-гл/TCM.png";
// import imgTCH from "./pumpman¦-гл/THF.png";
// import imgJET from "./pumpman¦-гл/JET.png";

// === Leaflet marker ikonkalarini endi sozlaymiz (importlardan keyin) ===
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// === 1. DO'KONLAR COORDINATALARI ===
const MOCK_SHOPS = [
  { 
    id: 1, 
    name: "IT Tat o'quv markazi (Bosh Ofis)", 
    address: "Samarqand sh., Mirzo Ulug'bek ko'chasi, 47-uy", 
    lat: 39.677544, 
    lng: 66.926537, 
    phone: "+998 90 123-45-67" 
  },
  { 
    id: 2, 
    name: "Nasoslar ombori (Samarqand filiali)", 
    address: "Samarqand sh., Gagarin ko'chasi", 
    lat: 39.661245, 
    lng: 66.912384, 
    phone: "+998 93 987-65-43" 
  }
];

// === 2. BARCHA TOIFALAR ===
const MOCK_CATEGORIES = [
  { id: 1, name_uz: "Nasoslar", image_url: "https://via.placeholder.com/250x180?text=Nasoslar" }
];

// === 3. MAHSULOTLAR RO'YXATI ===
const MOCK_PRODUCTS = [
  // === QB (Вихревой) - 4 ta ===
  { id: 1, category_id: 1, title_uz: "Pumpman QB60 ECO (Вихревой)", price: 280000, image_url: imgQB,
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "35" }, { key: "Balandligi (Подъём, m)", value: "32" } ] },
  { id: 2, category_id: 1, title_uz: "Pumpman QB60 (Вихревой)", price: 320000, image_url: imgQB,
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "35" }, { key: "Balandligi (Подъём, m)", value: "35" } ] },
  { id: 3, category_id: 1, title_uz: "Pumpman QB70 (Вихревой)", price: 520000, image_url: imgQB,
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "45" }, { key: "Balandligi (Подъём, m)", value: "45" } ] },
  { id: 4, category_id: 1, title_uz: "Pumpman QB80 (Вихревой)", price: 570000, image_url: imgQB,
    specs: [ { key: "Turi", value: "Вихревой" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "45" }, { key: "Balandligi (Подъём, m)", value: "53" } ] },

  // === CPm (Центробежный) - 5 ta ===
  { id: 5, category_id: 1, title_uz: "Pumpman CPm130 (Центробежный)", price: 510000, image_url: imgCPm,
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "105" }, { key: "Balandligi (Подъём, m)", value: "22" } ] },
  { id: 6, category_id: 1, title_uz: "Pumpman CPm146 (Центробежный)", price: 620000, image_url: imgCPm,
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "125" }, { key: "Balandligi (Подъём, m)", value: "27" } ] },
  { id: 7, category_id: 1, title_uz: "Pumpman CPm158 (Центробежный)", price: 690000, image_url: imgCPm,
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "125" }, { key: "Balandligi (Подъём, m)", value: "32" } ] },
  { id: 8, category_id: 1, title_uz: "Pumpman CPm170 (Центробежный)", price: 1120000, image_url: imgCPm,
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "1.1" }, { key: "Suv sarfi (л/м)", value: "133" }, { key: "Balandligi (Подъём, m)", value: "41" } ] },
  { id: 9, category_id: 1, title_uz: "Pumpman CPm200 (Центробежный)", price: 1250000, image_url: imgCPm,
    specs: [ { key: "Turi", value: "Центробежный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "1.5" }, { key: "Suv sarfi (л/м)", value: "133" }, { key: "Balandligi (Подъём, m)", value: "43" } ] },

  // === PW (Периферийный) - 6 ta ===
  { id: 10, category_id: 1, title_uz: "Pumpman PW125 (Периферийный)", price: 550000, image_url: imgPW,
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.125" }, { key: "Suv sarfi (л/м)", value: "33" }, { key: "Balandligi (Подъём, m)", value: "24" } ] },
  { id: 11, category_id: 1, title_uz: "Pumpman PW250 (Периферийный)", price: 570000, image_url: imgPW,
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.25" }, { key: "Suv sarfi (л/м)", value: "36" }, { key: "Balandligi (Подъём, m)", value: "30" } ] },
  { id: 12, category_id: 1, title_uz: "Pumpman PW370 (Периферийный)", price: 580000, image_url: imgPW,
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.37" }, { key: "Suv sarfi (л/м)", value: "40" }, { key: "Balandligi (Подъём, m)", value: "36" } ] },
  { id: 13, category_id: 1, title_uz: "Pumpman PW550 (Периферийный)", price: 700000, image_url: imgPW,
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.55" }, { key: "Suv sarfi (л/м)", value: "50" }, { key: "Balandligi (Подъём, m)", value: "42" } ] },
  { id: 14, category_id: 1, title_uz: "Pumpman PW750 (Периферийный)", price: 780000, image_url: imgPW,
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "25*25" }, { key: "Quvvati (кВт)", value: "0.75" }, { key: "Suv sarfi (л/м)", value: "56" }, { key: "Balandligi (Подъём, m)", value: "50" } ] },
  { id: 15, category_id: 1, title_uz: "Pumpman PW1100 (Периферийный)", price: 1070000, image_url: imgPW,
    specs: [ { key: "Turi", value: "Периферийный" }, { key: "Kirish/Chiqish (Вх/Вых)", value: "40*40" }, { key: "Quvvati (кВт)", value: "1.1" }, { key: "Suv sarfi (л/м)", value: "100" }, { key: "Balandligi (Подъём, m)", value: "55" } ] },

  // === PWE (Периферийный с сухой защитой) - 5 ta ===
  { id: 16, category_id: 1, title_uz: "Pumpman PWE 125", price: 620000, image_url: imgPWE,
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.125 кВт" }, { key: "Suv sarfi", value: "33 л/м" }, { key: "Balandligi", value: "24 m" } ] },
  { id: 17, category_id: 1, title_uz: "Pumpman PWE 250", price: 670000, image_url: imgPWE,
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.25 кВт" }, { key: "Suv sarfi", value: "36 л/м" }, { key: "Balandligi", value: "30 m" } ] },
  { id: 18, category_id: 1, title_uz: "Pumpman PWE 370", price: 690000, image_url: imgPWE,
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.37 кВт" }, { key: "Suv sarfi", value: "40 л/м" }, { key: "Balandligi", value: "36 m" } ] },
  { id: 19, category_id: 1, title_uz: "Pumpman PWE 550", price: 840000, image_url: imgPWE,
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.55 кВт" }, { key: "Suv sarfi", value: "50 л/м" }, { key: "Balandligi", value: "42 m" } ] },
  { id: 20, category_id: 1, title_uz: "Pumpman PWE 750", price: 920000, image_url: imgPWE,
    specs: [ { key: "Turi", value: "Периферийный с сухой защитой" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.75 кВт" }, { key: "Suv sarfi", value: "56 л/м" }, { key: "Balandligi", value: "50 m" } ] },

  // === PWF (Периферийный с защитой Адаптивный) - 4 ta ===
  { id: 21, category_id: 1, title_uz: "Pumpman PWF 125", price: 670000, image_url: imgPWF,
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.125 кВт" }, { key: "Suv sarfi", value: "33 л/м" }, { key: "Balandligi", value: "24 m" } ] },
  { id: 22, category_id: 1, title_uz: "Pumpman PWF 250", price: 710000, image_url: imgPWF,
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.25 кВт" }, { key: "Suv sarfi", value: "36 л/м" }, { key: "Balandligi", value: "30 m" } ] },
  { id: 23, category_id: 1, title_uz: "Pumpman PWF 370", price: 750000, image_url: imgPWF,
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.37 кВт" }, { key: "Suv sarfi", value: "40 л/м" }, { key: "Balandligi", value: "36 m" } ] },
  { id: 24, category_id: 1, title_uz: "Pumpman PWF 550", price: 900000, image_url: imgPWF,
    specs: [ { key: "Turi", value: "Адаптивный" }, { key: "Kirish/Chiqish", value: "25*25" }, { key: "Quvvati", value: "0.55 кВт" }, { key: "Suv sarfi", value: "50 л/м" }, { key: "Balandligi", value: "42 m" } ] }
];

export default function KatalogTab() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = MOCK_PRODUCTS.filter(
    (prod) => selectedCategory && prod.category_id === selectedCategory.id
  );

  // --- REJIM 3: MAHSULOT DETALI ---
  if (selectedProduct) {
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedProduct(null)}>
            <FiArrowLeft size={16} /> Orqaga
          </button>
          <h2>Mahsulot xususiyatlari</h2>
        </div>

        <div className="product-detail-container">
          <div className="product-detail-main">
            <div className="product-detail-img">
              <img src={selectedProduct.image_url} alt={selectedProduct.title_uz} />
            </div>
            <div className="product-detail-info">
              <h3 className="product-detail-title">{selectedProduct.title_uz}</h3>
              <p className="product-detail-price">
                Narxi: {selectedProduct.price ? `${selectedProduct.price.toLocaleString()} so'm` : "Kelishilgan narx"}
              </p>
            </div>
          </div>

          {selectedProduct.specs && selectedProduct.specs.length > 0 && (
            <div className="product-specs-section">
              <table className="specs-table">
                <tbody>
                  {selectedProduct.specs.map((spec, index) => (
                    <tr key={index}>
                      <td className="spec-key">{spec.key}</td>
                      <td className="spec-value">{spec.value}</td>
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

  // --- REJIM 2: MAHSULOTLAR RO'YXATI (KATEGORIYA ICHIDA) ---
  if (selectedCategory) {
    return (
      <div className="katalog-light-wrapper">
        <div className="katalog-inner-header">
          <button className="katalog-back-btn" onClick={() => setSelectedCategory(null)}>
            <FiArrowLeft size={16} /> Orqaga
          </button>
          <div className="inner-title-box">
            <h2>{selectedCategory.name_uz}</h2>
            <span className="badge">{filteredProducts.length} ta mahsulot</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-data-box">
            <FiPackage size={44} />
            <p>Bu katalogda hozircha mahsulotlar mavjud emas.</p>
          </div>
        ) : (
          <div className="products-light-grid">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="product-light-card" 
                onClick={() => setSelectedProduct(prod)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-img-box">
                  <img src={prod.image_url} alt={prod.title_uz} />
                </div>
                <div className="product-details">
                  <h4 className="product-title">{prod.title_uz}</h4>
                  <p className="product-price">
                    {prod.price ? `${prod.price.toLocaleString()} so'm` : "Kelishilgan narx"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- REJIM 1: ASOSIY KATALOGLAR REJIMI ---
  return (
    <div className="katalog-light-wrapper">
      <div className="katalog-light-banner">
        <div className="banner-left-info">
          <div className="banner-icon-title">
            <FiGrid className="main-grid-icon" />
            <h2>Xo'jalik Mollari Katalogi</h2>
          </div>
          <p>Kerakli toifani tanlang va mahsulotlar bilan tanishing</p>
        </div>
      </div>

      <div className="katalog-map-section" style={{ margin: "20px 0 30px 0", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiMapPin style={{ color: "#3b82f6" }} />
          <strong style={{ fontSize: "14px", color: "#1e293b" }}>Bizning do'konlarimiz xaritasi</strong>
        </div>
        
        <div style={{ height: "320px", width: "100%" }}>
          <MapContainer 
            center={[39.677544, 66.926537]} 
            zoom={13} 
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {MOCK_SHOPS.map((shop) => (
              <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                <Popup>
                  <div style={{ fontFamily: "sans-serif", padding: "5px" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "14px", fontWeight: "bold" }}>{shop.name}</h4>
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b" }}>{shop.address}</p>
                    {shop.phone && (
                      <p style={{ margin: "0", fontSize: "12px", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                        <FiPhone size={12} /> {shop.phone}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="section-divider">
        <h3>Mavjud Kataloglar</h3>
        <span className="badge-count">{MOCK_CATEGORIES.length} toifa</span>
      </div>

      <div className="categories-light-grid">
        {MOCK_CATEGORIES.map((cat) => (
          <div key={cat.id} className="category-light-card" onClick={() => setSelectedCategory(cat)}>
            <div className="card-img-top">
              <div className="no-image-placeholder">
                <FiImage size={28} />
              </div>
            </div>
            <div className="card-body-content">
              <h3>{cat.name_uz}</h3>
              <div className="card-footer-action">
                <span>Tovarlarni ko'rish</span>
                <span className="arrow-icon">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}