import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import HoraCreate from "./pages/hora-create";
import CreateCapsule from "./pages/CreateCapsule";
import LovaNote from "./pages/LovaNote";
import LovaCreate from "./pages/lova-create";
import VermissSandglass from "./pages/VermissSandglass";
import VermissCreate from "./pages/VermissCreate";
import EtereaMoment from "./pages/EtereaMoment";
import EtereaCreate from "./pages/eterea-create";
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerify from "./pages/OTPVerify";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />       {/* หน้าแรก */}
      <Route path="/home" element={<Home />} />      {/* หลัง login */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create" element={<CreateCapsule />} />
      <Route path="/feature/hora" element={<HoraCreate />} />
      <Route path="/feature/lova" element={<LovaNote />} />
      <Route path="/feature/lova/create" element={<LovaCreate />} />
      <Route path="/feature/vermis" element={<VermissSandglass />} />
      <Route path="/feature/vermiss/new" element={<VermissCreate />} />
      <Route path="/feature/eterea" element={<EtereaMoment />} />
      <Route path="/feature/eterea/create" element={<EtereaCreate />}/>
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/otp" element={<OTPVerify />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

