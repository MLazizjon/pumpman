// import { Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase/client";

// export default function ProtectedRoute({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data } = await supabase.auth.getSession();
//       setUser(data.session);
//       setLoading(false);
//     };

//     checkUser();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return user ? children : <Navigate to="/login" />;
// }
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  // LocalStorage-dan ma'lumotni matn (string) ko'rinishida olamiz
  const userString = localStorage.getItem("user");

  // 1. Agar foydalanuvchi tizimga umuman kirmagan bo'lsa -> Login sahifasiga otib yuborish
  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  // Matnni JSON obyektga o'giramiz (ichidan rolni o'qish uchun)
  const user = JSON.parse(userString);

  // 2. Agar sahifaga kirish uchun ma'lum rollar talab qilinsa (allowedRoles berilgan bo'lsa)
  // va foydalanuvchining roli bu ro'yxatda bo'lmasa -> /home sahifasiga qaytarish
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  // 3. Hamma tekshiruvlardan o'tsa -> Sahifani ko'rsatish
  return children;
}