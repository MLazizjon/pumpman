import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Sahifalarni import qilish
import Login from "./pages/login/Login";
import Register from "./pages/registrer/Register";
import UserDash from "./pages/user/userDash/UserDash"; 
import AdminDashboard from "./pages/admin/admindash/AdminDash"; 
import MasterDetail from "./pages/admin/userdetals/UserDestals";

// Himoyalangan marshrut komponenti
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

function App() {
  return (
    <>
      {/* ✅ ToastContainer-dan xunuk bo'shliq yaratayotgan inline style olib tashlandi.
        Endi u dashboard elementlarini to'sib qo'ymaydi va o'ng burchakda chiroyli chiqadi.
      */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Ochiq sahifalar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER DASHBOARD */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDash />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* YANGI MARSHRUT: Ustaning ID raqami bo'yicha profiliga kirish */}
        <Route
          path="/admin/master/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MasterDetail />
            </ProtectedRoute>
          }
        />

        {/* Tizimda mavjud bo'lmagan sahifalarga kirganda avtomat yo'naltirish */}
        <Route
          path="*"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <RoleBasedRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// Rollarga qarab avtomat yo'naltiruvchi yordamchi komponent
function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }
  return <Navigate to="/user-dashboard" replace />;
}

export default App;