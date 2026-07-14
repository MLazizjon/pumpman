import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./register.css";

const UZBEKISTAN_DATA = {
  "Toshkent shahri": ["Bektemir tumani", "Chilonzor tumani", "Mirobod tumani", "Mirzo Ulug‘bek tumani", "Olmazor tumani", "Sergeli tumani", "Shayxontohur tumani", "Uchtepa tumani", "Yakkasaroy tumani", "Yashnobod tumani", "Yunusobod tumani", "Yangihayot tumani"],
  "Toshkent viloyati": ["Angren shahri", "Olmaliq shahri", "Chirchiq shahri", "Bekobod shahri", "Ohangaron shahri", "Nurafshon shahri", "Bekobod tumani", "Bo‘stonliq tumani", "Bo‘ka tumani", "Chinoz tumani", "Qibray tumani", "Ohangaron tumani", "Oqqo‘rg‘on tumani", "Parkent tumani", "Piskent tumani", "Quyi Chirchiq tumani", "O‘rta Chirchiq tumani", "Yangiyo‘l tumani", "Yuqori Chirchiq tumani", "Zangiota tumani"],
  "Andijon": ["Andijon shahri", "Xonobod shahri", "Andijon tumani", "Asaka tumani", "Baliqchi tumani", "Bo‘ston tumani", "Buloqboshi tumani", "Izboskan tumani", "Jalaquduq tumani", "Marhamat tumani", "Oltinköl tumani", "Paxtaobod tumani", "Qo‘rg‘ontepa tumani", "Shahrixon tumani", "Ulug‘nor tumani", "Xo‘jaobod tumani"],
  "Buxoro": ["Buxoro shahri", "Kogon shahri", "Buxoro tumani", "G‘ijduvon tumani", "Jondor tumani", "Kogon tumani", "Qorako‘l tumani", "Qoravulbozor tumani", "Olot tumani", "Peshku tumani", "Romitan tumani", "Shofirkon tumani", "Vobkent tumani"],
  "Farg'ona": ["Farg‘ona shahri", "Marg‘ilon shahri", "Qo‘qon shahri", "Quva shahri", "Oltiariq tumani", "Bag‘dod tumani", "Beshariq tumani", "Buvayda tumani", "Dang‘ara tumani", "Farg‘ona tumani", "Furqat tumani", "Qo‘shtepa tumani", "Quva tumani", "Rishton tumani", "So‘x tumani", "Toshloq tumani", "Uchko‘prik tumani", "O‘zbekiston tumani", "Yozyovon tumani"],
  "Jizzax": ["Jizzax shahri", "Arnasoy tumani", "Baxtamal tumani", "Do‘stlik tumani", "Forish tumani", "G‘allaorol tumani", "Sharof Rashidov tumani", "Mirzachöl tumani", "Paxtakor tumani", "Yangiobod tumani", "Zamin tumani", "Zafarobod tumani", "Zarbdor tumani"],
  "Xorazm": ["Urganch shahri", "Xiva shahri", "Bog‘ot tumani", "Gurlan tumani", "Xonqa tumani", "Hazorasp tumani", "Qushko‘pir tumani", "Shovot tumani", "Tuproqqal‘a tumani", "Urganch tumani", "Xiva tumani", "Yangiariq tumani", "Yangibozor tumani"],
  "Namangan": ["Namangan shahri", "Chortoq tumani", "Chust tumani", "Kosonsoy tumani", "Mingbuloq tumani", "Namangan tumani", "Norin tumani", "Pop tumani", "To‘raqo‘rg‘on tumani", "Uychi tumani", "Uchko‘prik tumani", "Yangiqo‘rg‘on tumani", "Davlatobod tumani", "Yangi Namangan tumani"],
  "Navoiy": ["Navoiy shahri", "Zarafshon shahri", "G‘ozg‘on shahri", "Karmana tumani", "Konimex tumani", "Qiziltepa tumani", "Xatirchi tumani", "Navbahor tumani", "Nurota tumani", "Tomdi tumani", "Uchquduq tumani"],
  "Qashqadaryo": ["Qarshi shahri", "Shahrisabz shahri", "Chiroqchi tumani", "Dehqonobod tumani", "G‘uzor tumani", "Kasbi tumani", "Kitob tumani", "Koson tumani", "Ko‘kdala tumani", "Mirishkor tumani", "Muborak tumani", "Nishan tumani", "Qarshi tumani", "Shahrisabz tumani", "Yakkabog‘ tumani", "Kamashi tumani"],
  "Samarqand": ["Samarqand shahri", "Kattaqo‘rg‘on shahri", "Bulung‘ur tumani", "Ishtixon tumani", "Jomboy tumani", "Kattaqo‘rg‘on tumani", "Narpay tumani", "Nurobod tumani", "Oqdaryo tumani", "Paxtachi tumani", "Payariq tumani", "Pastdarg‘om tumani", "Samarqand tumani", "Toyloq tumani", "Urgut tumani", "Qo‘shrabot tumani"],
  "Sirdaryo": ["Guliston shahri", "Shirin shahri", "Yangiyer shahri", "Boyovut tumani", "Guliston tumani", "Xovos tumani", "Mirzaobod tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani", "Sirdaryo tumani"],
  "Surxondaryo": ["Termiz shahri", "Angor tumani", "Boysun tumani", "Denov tumani", "Jarqo‘rg‘on tumani", "Qiziriq tumani", "Qumqo‘rg‘on tumani", "Muzrabot tumani", "Oltinsoy tumani", "Sariosiyo tumani", "Sherobod tumani", "Sho‘rchi tumani", "Termiz tumani", "Uzun tumani"],
  "Qoraqalpog'iston Respublikasi": ["Nukus shahri", "Amudaryo tumani", "Beruniy tumani", "Chimboy tumani", "Ellikqal‘a tumani", "Kegeyli tumani", "Mo‘ynoq tumani", "Nukus tumani", "Qonliko‘l tumani", "Qo‘ng‘irot tumani", "Qorao‘zak tumani", "Shumanay tumani", "Taxtako‘pir tumani", "To‘rtko‘l tumani", "Xo‘jayli tumani", "Taxiatosh tumani", "Bo‘zatov tumani"]
};

const KASBLAR_DATA = [
  "Santexnik", "Elektrik", "Malyar / Suvoqchi", "Kafelchi (Plitkar)", 
  "Gvipsokarton ustasi", "Armaturchi / Svarshik", "Alyumin profil ustasi (Akfa)", 
  "Mebelchi", "Duradgor (Yog'och ustasi)", "Boshqa"
];

export default function Register() {
  const [step, setStep] = useState(1); 
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 "); // Telefon raqam inputi qo'shildi
  const [password, setPassword] = useState(""); // Parol inputi qo'shildi
  const [birthDate, setBirthDate] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState(""); 
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);

  const [regionOpen, setRegionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);

  const regionRef = useRef(null);
  const districtRef = useRef(null);
  const jobRef = useRef(null);
  const navigate = useNavigate();

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand(); 
    }

    function handleClickOutside(event) {
      if (regionRef.current && !regionRef.current.contains(event.target)) setRegionOpen(false);
      if (districtRef.current && !districtRef.current.contains(event.target)) setDistrictOpen(false);
      if (jobRef.current && !jobRef.current.contains(event.target)) setJobOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tg]);

  // Telefon raqamini chiroyli formatlash funksiyasi
  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith("+998")) {
      input = "+998 " + input.replace(/\D/g, "");
    }
    const rawNumbers = input.slice(4).replace(/\D/g, "");
    const limitedNumbers = rawNumbers.slice(0, 9);

    let formatted = "+998 ";
    if (limitedNumbers.length > 0) formatted += limitedNumbers.slice(0, 2);
    if (limitedNumbers.length > 2) formatted += " " + limitedNumbers.slice(2, 5);
    if (limitedNumbers.length > 5) formatted += " " + limitedNumbers.slice(5, 7);
    if (limitedNumbers.length > 7) formatted += " " + limitedNumbers.slice(7, 9);

    setPhone(formatted);
  };

  const handleStepOneNext = () => {
    const cleanPhone = phone.replace(/\s/g, "");

    if (fullName.trim().length < 3) {
      return toast.error("Ism kamida 3 ta harf bo‘lishi kerak!");
    }
    if (cleanPhone.length !== 13) {
      return toast.error("Telefon raqami to‘liq kiritilmagan!");
    }
    if (password.trim().length < 4) {
      return toast.error("Parol kamida 4 ta belgidan iborat bo‘lishi kerak!");
    }
    setStep(2);
  };

  const handleStepTwoNext = () => {
    if (!birthDate) {
      return toast.error("Tug‘ilgan kuningizni kiriting!");
    }
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!region || !district || !job) {
      return toast.error("Viloyat, tuman va kasbingizni tanlang!");
    }

    const cleanPhone = phone.replace(/\s/g, "");
    // Agar Telegram ichida bo'lsa, Telegram ID sini aniqlaymiz, aks holda null yoki mock id beramiz
    const telegramId = tg?.initDataUnsafe?.user?.id || null;

    await saveUserToSupabase(cleanPhone, telegramId);
  };

  const saveUserToSupabase = async (rawPhone, telegramId) => {
    if (loading) return;
    setLoading(true);
    try {
      // 1. Avval bu telefon raqami ro'yxatdan o'tganmi yoki yo'qmi tekshiramiz
      const { data: existing, error: checkError } = await supabase
        .from("profiles")
        .select("*") 
        .eq("phone", rawPhone)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        toast.error("Bu telefon raqami allaqachon ro‘yxatdan o‘tgan! Iltimos tizimga kiring.");
        setLoading(false);
        return;
      }

      // 2. Yangi foydalanuvchi obyekti
      const newUser = {
        full_name: fullName.trim(),
        phone: rawPhone,
        telegram_id: telegramId,
        birth_date: birthDate,
        region,
        district, 
        job,
        password: password, 
        role: "user"
      };

      const { data: insertedData, error: insertError } = await supabase
        .from("profiles")
        .insert([newUser])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Mahalliy xotiraga yozish va dashboardga yo'naltirish
      localStorage.setItem("user", JSON.stringify(insertedData));
      toast.success("Ro‘yxatdan muvaffaqiyatli o‘tdingiz!");
      
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 150);

    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="stepper-wrapper">
        <div className={`step-circle ${step >= 1 ? "active" : ""}`}>1</div>
        <div className="step-line"></div>
        <div className={`step-circle ${step >= 2 ? "active" : ""}`}>2</div>
        <div className="step-line"></div>
        <div className={`step-circle ${step >= 3 ? "active" : ""}`}>3</div>
      </div>

      <div className="auth">
        <h2>Ro'yxatdan o'tish</h2>

        {step === 1 && (
          <div className="step-container">
            <div className="input-group">
              <input
                type="text"
                placeholder="Ismingizni kiriting"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={handlePhoneChange}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Parol yarating"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn-submit" onClick={handleStepOneNext}>
              Keyingi
            </button>
            <p className="login-link" onClick={() => navigate("/login")} style={{textAlign: "center", marginTop: "15px", cursor: "pointer", color: "#007bff"}}>
              Sizda allaqachon akkaunt bormi? Kirish
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="step-container">
            <div className="input-group">
              <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "5px" }}>Tug'ilgan kuningiz</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="btn-group" style={{ display: "flex", gap: "10px" }}>
              <button className="btn-back" onClick={() => setStep(1)} style={{ background: "#ccc", width: "100%" }}>
                Orqaga
              </button>
              <button className="btn-submit" onClick={handleStepTwoNext} style={{ width: "100%" }}>
                Keyingi
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-container">
            <div className="input-group" ref={regionRef}>
              <div 
                className={`custom-select-trigger ${!region ? "is-placeholder" : ""}`}
                onClick={() => setRegionOpen(!regionOpen)}
              >
                {region || "Viloyatni tanlang"}
              </div>
              {regionOpen && (
                <div className="custom-options-box">
                  {Object.keys(UZBEKISTAN_DATA).map((reg) => (
                    <div 
                      key={reg} 
                      className={`custom-option ${region === reg ? "selected" : ""}`}
                      onClick={() => {
                        setRegion(reg);
                        setDistrict("");
                        setRegionOpen(false);
                      }}
                    >
                      {reg}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {region && (
              <div className="input-group" ref={districtRef}>
                <div 
                  className={`custom-select-trigger ${!district ? "is-placeholder" : ""}`}
                  onClick={() => setDistrictOpen(!districtOpen)}
                >
                  {district || "Shahar tumanni tanlang"}
                </div>
                {districtOpen && (
                  <div className="custom-options-box">
                    {UZBEKISTAN_DATA[region].map((dist) => (
                      <div 
                        key={dist} 
                        className={`custom-option ${district === dist ? "selected" : ""}`}
                        onClick={() => {
                          setDistrict(dist);
                          setDistrictOpen(false);
                        }}
                      >
                        {dist}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="input-group" ref={jobRef}>
              <div 
                className={`custom-select-trigger ${!job ? "is-placeholder" : ""}`}
                onClick={() => setJobOpen(!jobOpen)}
              >
                {job || "Kasbingizni tanlang"}
              </div>
              {jobOpen && (
                <div className="custom-options-box">
                  {KASBLAR_DATA.map((j) => (
                    <div 
                      key={j} 
                      className={`custom-option ${job === j ? "selected" : ""}`}
                      onClick={() => {
                        setJob(j);
                        setJobOpen(false);
                      }}
                    >
                      {j}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="btn-group" style={{ display: "flex", gap: "10px" }}>
              <button className="btn-back" onClick={() => setStep(2)} style={{ background: "#ccc", width: "100%" }} disabled={loading}>
                Orqaga
              </button>
              <button className="btn-submit" onClick={handleFinalSubmit} style={{ width: "100%" }} disabled={loading}>
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}