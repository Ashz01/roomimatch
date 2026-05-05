/* eslint-disable */
import { useState } from "react";
import { auth, db } from "./firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const mockUsers = [
  { id: "m1", name: "Rahul Sharma", age: 24, locality: "Noida Sector 62", budget: 8000, score: 87, photo: "RS", diet: "Veg", sleep: "Night Owl", smoking: false, drinking: false, cleanliness: 4, work: "Software Engineer", color: "#FF6B6B" },
  { id: "m2", name: "Priya Mehta", age: 23, locality: "Gurugram Sec 49", budget: 9500, score: 79, photo: "PM", diet: "Non-Veg", sleep: "Early Bird", smoking: false, drinking: true, cleanliness: 5, work: "UX Designer", color: "#4ECDC4" },
  { id: "m3", name: "Arjun Nair", age: 26, locality: "Dwarka Sec 21", budget: 7000, score: 72, photo: "AN", diet: "Veg", sleep: "Night Owl", smoking: false, drinking: false, cleanliness: 3, work: "Data Analyst", color: "#FFE66D" },
  { id: "m4", name: "Sneha Gupta", age: 25, locality: "Laxmi Nagar", budget: 6500, score: 65, photo: "SG", diet: "Veg", sleep: "Early Bird", smoking: false, drinking: false, cleanliness: 4, work: "CA Student", color: "#6BCB77" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0A0A1A; font-family: 'DM Sans', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .phone { width: 390px; height: 844px; background: #1A1A2E; border-radius: 50px; overflow: hidden; position: relative; box-shadow: 0 0 0 12px #111, 0 0 0 14px #333, 0 40px 80px rgba(0,0,0,0.8); }
  .screen { width: 100%; height: 100%; position: absolute; top: 0; left: 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; }
  .screen::-webkit-scrollbar { display: none; }
  .splash { background: linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px 32px; position: relative; overflow: hidden; }
  .splash::before { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%); top: -100px; left: -100px; border-radius: 50%; }
  .logo-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 50px; }
  .logo-icon { width: 90px; height: 90px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); border-radius: 28px; display: flex; align-items: center; justify-content: center; font-size: 42px; margin-bottom: 20px; box-shadow: 0 20px 40px rgba(255,107,107,0.4); }
  .logo-title { font-family: 'Clash Display', sans-serif; font-size: 36px; font-weight: 700; color: #EAEAEA; letter-spacing: -1px; }
  .logo-title span { color: #FF6B6B; }
  .logo-sub { font-size: 14px; color: #8892A4; margin-top: 6px; }
  .feature-pills { display: flex; flex-direction: column; gap: 12px; width: 100%; margin-bottom: 40px; }
  .pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; }
  .pill-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .pill-text { font-size: 13px; color: #EAEAEA; line-height: 1.4; }
  .pill-text strong { display: block; font-weight: 500; margin-bottom: 2px; }
  .pill-text span { color: #8892A4; font-size: 12px; }
  .btn-primary { width: 100%; padding: 18px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); border: none; border-radius: 18px; color: white; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 10px 30px rgba(255,107,107,0.4); transition: all 0.2s; }
  .btn-primary:hover { transform: translateY(-2px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.15); border-radius: 18px; padding: 16px; color: #8892A4; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; width: 100%; margin-top: 12px; transition: all 0.2s; }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.3); color: #EAEAEA; }
  .otp-screen { background: #1A1A2E; display: flex; flex-direction: column; padding: 60px 32px 40px; height: 100%; }
  .otp-back { font-size: 24px; cursor: pointer; margin-bottom: 40px; color: #EAEAEA; background: none; border: none; text-align: left; }
  .otp-title { font-family: 'Clash Display', sans-serif; font-size: 30px; font-weight: 700; color: #EAEAEA; margin-bottom: 8px; }
  .otp-sub { font-size: 14px; color: #8892A4; margin-bottom: 40px; line-height: 1.5; }
  .phone-input-row { display: flex; gap: 12px; margin-bottom: 16px; }
  .country-code { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; color: #EAEAEA; font-size: 16px; width: 80px; text-align: center; font-family: 'DM Sans', sans-serif; }
  .input-field { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; color: #EAEAEA; font-family: 'DM Sans', sans-serif; font-size: 16px; outline: none; width: 100%; transition: all 0.2s; }
  .input-field:focus { border-color: #FF6B6B; background: rgba(255,107,107,0.05); }
  .otp-boxes { display: flex; gap: 12px; justify-content: center; margin-bottom: 32px; }
  .otp-box { width: 52px; height: 60px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; text-align: center; font-size: 24px; font-weight: 700; color: #EAEAEA; font-family: 'Clash Display', sans-serif; outline: none; transition: all 0.2s; }
  .otp-box:focus { border-color: #FF6B6B; background: rgba(255,107,107,0.08); }
  .error-msg { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); border-radius: 12px; padding: 12px 16px; font-size: 13px; color: #FF6B6B; margin-bottom: 16px; }
  .success-msg { background: rgba(107,203,119,0.1); border: 1px solid rgba(107,203,119,0.3); border-radius: 12px; padding: 12px 16px; font-size: 13px; color: #6BCB77; margin-bottom: 16px; }
  .setup-screen { background: #1A1A2E; padding: 0 0 100px; min-height: 100%; }
  .setup-header { padding: 20px 28px 24px; position: sticky; top: 0; background: #1A1A2E; z-index: 10; }
  .progress-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #FF6B6B, #FF8E53); border-radius: 2px; transition: width 0.5s ease; }
  .setup-title { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 600; color: #EAEAEA; line-height: 1.2; }
  .setup-subtitle { font-size: 13px; color: #8892A4; margin-top: 6px; }
  .setup-body { padding: 8px 28px; }
  .input-group { margin-bottom: 18px; }
  .input-label { font-size: 12px; color: #8892A4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
  .toggle-group { display: flex; gap: 10px; flex-wrap: wrap; }
  .toggle-btn { padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #8892A4; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .toggle-btn.active { background: rgba(255,107,107,0.15); border-color: #FF6B6B; color: #FF6B6B; }
  .lifestyle-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 18px; margin-bottom: 14px; }
  .lifestyle-row { display: flex; justify-content: space-between; align-items: center; }
  .lifestyle-label { font-size: 14px; color: #EAEAEA; display: flex; align-items: center; gap: 8px; }
  .star { font-size: 18px; cursor: pointer; transition: transform 0.1s; }
  .star:hover { transform: scale(1.2); }
  .range-slider { width: 100%; accent-color: #FF6B6B; margin-top: 8px; }
  .range-labels { display: flex; justify-content: space-between; font-size: 12px; color: #8892A4; margin-top: 4px; }
  .locality-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .chip { padding: 8px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #8892A4; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .chip.active { background: rgba(78,205,196,0.15); border-color: #4ECDC4; color: #4ECDC4; }
  .bottom-nav-fixed { position: fixed; bottom: 0; width: 390px; padding: 16px 28px 28px; background: linear-gradient(to top, #1A1A2E 70%, transparent); }
  .feed-screen { background: #1A1A2E; min-height: 100%; padding-bottom: 90px; }
  .feed-header { padding: 20px 24px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #1A1A2E; z-index: 10; }
  .feed-title { font-family: 'Clash Display', sans-serif; font-size: 28px; font-weight: 700; color: #EAEAEA; }
  .feed-title span { color: #FF6B6B; }
  .notif-btn { width: 42px; height: 42px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; }
  .filter-row { padding: 0 24px 16px; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
  .filter-row::-webkit-scrollbar { display: none; }
  .filter-chip { padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #8892A4; font-size: 12px; cursor: pointer; white-space: nowrap; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .filter-chip.active { background: #FF6B6B; border-color: #FF6B6B; color: white; }
  .match-card { margin: 0 20px 16px; background: linear-gradient(160deg, #0F3460 0%, #16213E 100%); border-radius: 28px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
  .match-card:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
  .card-photo { height: 200px; display: flex; align-items: center; justify-content: center; font-family: 'Clash Display', sans-serif; font-size: 64px; font-weight: 700; color: white; position: relative; }
  .score-badge { position: absolute; top: 14px; right: 14px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border-radius: 12px; padding: 6px 12px; font-size: 13px; font-weight: 600; color: #6BCB77; border: 1px solid rgba(107,203,119,0.3); }
  .locality-tag { position: absolute; bottom: 14px; left: 14px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border-radius: 10px; padding: 5px 10px; font-size: 11px; color: #EAEAEA; }
  .card-body { padding: 18px 20px; }
  .card-name { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 600; color: #EAEAEA; margin-bottom: 4px; }
  .card-meta { font-size: 13px; color: #8892A4; margin-bottom: 14px; }
  .trait-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .trait { padding: 6px 12px; border-radius: 8px; background: rgba(255,255,255,0.06); font-size: 11px; color: #EAEAEA; display: flex; align-items: center; gap: 4px; }
  .budget-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 16px; border-top: 1px solid rgba(255,255,255,0.06); }
  .budget-amount { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 600; color: #EAEAEA; }
  .budget-label { font-size: 11px; color: #8892A4; }
  .action-row { display: flex; gap: 12px; }
  .btn-pass { flex: 1; padding: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #8892A4; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .btn-pass:hover { border-color: rgba(255,100,100,0.4); color: #FF6B6B; }
  .btn-like { flex: 1; padding: 14px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); border: none; border-radius: 16px; color: white; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 8px 20px rgba(255,107,107,0.3); }
  .btn-like:hover { transform: translateY(-1px); }
  .bottom-nav { position: fixed; bottom: 0; width: 390px; background: rgba(26,26,46,0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.06); padding: 12px 20px 24px; display: flex; justify-content: space-around; z-index: 100; }
  .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 8px 16px; border-radius: 14px; transition: all 0.2s; border: none; background: transparent; }
  .nav-item.active { background: rgba(255,107,107,0.1); }
  .nav-icon { font-size: 22px; }
  .nav-label { font-size: 10px; color: #8892A4; font-family: 'DM Sans', sans-serif; }
  .nav-item.active .nav-label { color: #FF6B6B; }
  .match-popup { position: absolute; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; padding: 40px 32px; }
  .match-popup-title { font-family: 'Clash Display', sans-serif; font-size: 40px; font-weight: 700; color: #FF6B6B; text-align: center; margin-bottom: 8px; }
  .match-popup-sub { font-size: 14px; color: #8892A4; text-align: center; margin-bottom: 40px; }
  .match-avatars { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
  .match-avatar { width: 90px; height: 90px; border-radius: 28px; display: flex; align-items: center; justify-content: center; font-family: 'Clash Display', sans-serif; font-size: 32px; font-weight: 700; color: white; border: 3px solid rgba(255,255,255,0.2); }
  .chat-screen { background: #1A1A2E; min-height: 100%; padding-bottom: 90px; }
  .chat-header { padding: 20px 24px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #1A1A2E; z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .chat-title { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 700; color: #EAEAEA; }
  .chat-list { padding: 16px 20px; }
  .chat-item { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 18px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; }
  .chat-item:hover { background: rgba(255,255,255,0.04); }
  .chat-avatar { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: white; flex-shrink: 0; position: relative; }
  .online-dot { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #6BCB77; border-radius: 50%; border: 2px solid #1A1A2E; }
  .chat-info { flex: 1; min-width: 0; }
  .chat-name { font-size: 15px; font-weight: 500; color: #EAEAEA; margin-bottom: 4px; }
  .chat-preview { font-size: 12px; color: #8892A4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chat-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .chat-time { font-size: 11px; color: #8892A4; }
  .unread-badge { width: 20px; height: 20px; background: #FF6B6B; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: white; }
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #1A1A2E; gap: 16px; }
  .spinner { width: 48px; height: 48px; border: 3px solid rgba(255,107,107,0.2); border-top-color: #FF6B6B; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
  .match-heart { font-size: 32px; animation: pulse 1s infinite; }
`;

function calculateCompatibility(userA, userB) {
  let score = 0;
  const overlap = userA.budgetMax >= userB.budgetMin && userB.budgetMax >= userA.budgetMin;
  if (overlap) score += 20;
  const localityMatch = (userA.localities || []).some(loc => (userB.localities || []).includes(loc));
  if (localityMatch) score += 20;
  if (userA.diet === userB.diet) score += 15;
  else if (userA.diet !== "Veg" && userB.diet !== "Veg") score += 8;
  if (userA.sleep === userB.sleep) score += 10;
  if (userA.smoking === userB.smoking) score += 10;
  if (userA.drinking === userB.drinking) score += 5;
  const cleanDiff = Math.abs((userA.cleanliness || 3) - (userB.cleanliness || 3));
  if (cleanDiff === 0) score += 10;
  else if (cleanDiff === 1) score += 6;
  else if (cleanDiff === 2) score += 2;
  if (userA.social === userB.social) score += 5;
  const genderOk = !userA.genderPref || userA.genderPref === "Any" || userA.genderPref === userB.gender;
  if (genderOk) score += 5;
  return score;
}

export default function RoomiMatch() {
  const [screen, setScreen] = useState("splash");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmResult, setConfirmResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", age: "", gender: "Male", lookingFor: "Room + Roommate", work: "" });
  const [lifestyle, setLifestyle] = useState({ diet: "Veg", sleep: "Night Owl", smoking: false, drinking: false, cleanliness: 4, social: "Moderate" });
  const [localities, setLocalities] = useState(["Noida"]);
  const [genderPref, setGenderPref] = useState("Any");
  const [budget, setBudget] = useState(8000);
  const [users, setUsers] = useState(mockUsers);
  const [likedUser, setLikedUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [savingProfile, setSavingProfile] = useState(false);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    }
  };

  const sendOTP = async () => {
    if (phone.length !== 10) { setError("Enter a valid 10-digit number"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier);
      setConfirmResult(result);
      setSuccess("OTP sent successfully!");
      setScreen("otp");
    } catch (e) {
      setError("Failed to send OTP. Try again.");
      if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      const result = await confirmResult.confirm(code);
      const user = result.user;
      setCurrentUser(user);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setScreen("feed");
        loadRealUsers(userDoc.data());
      } else {
        setScreen("setup1");
      }
    } catch (e) {
      setError("Wrong OTP. Please try again.");
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!profile.name || !profile.age) { setError("Please fill in your name and age"); return; }
    setSavingProfile(true);
    try {
      const userData = {
        uid: currentUser.uid,
        phone: currentUser.phoneNumber,
        ...profile,
        ...lifestyle,
        localities,
        genderPref,
        budgetMin: Math.max(3000, budget - 3000),
        budgetMax: budget + 3000,
        budget,
        status: "active",
        city: "Delhi/NCR",
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      };
      await setDoc(doc(db, "users", currentUser.uid), userData);
      setScreen("feed");
      loadRealUsers(userData);
    } catch (e) {
      setError("Failed to save profile. Try again.");
    }
    setSavingProfile(false);
  };

  const loadRealUsers = async (myData) => {
    try {
      const q = query(collection(db, "users"), where("city", "==", "Delhi/NCR"), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      const realUsers = snapshot.docs
        .filter(d => d.id !== currentUser?.uid)
        .map(d => {
          const data = d.data();
          const score = calculateCompatibility(myData, data);
          const initials = data.name ? data.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "??";
          const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6BCB77", "#A78BFA"];
          return { id: d.id, ...data, score, photo: initials, color: colors[Math.floor(Math.random() * colors.length)] };
        })
        .filter(u => u.score >= 30)
        .sort((a, b) => b.score - a.score);
      if (realUsers.length > 0) setUsers(realUsers);
      else setUsers(mockUsers);
    } catch (e) {
      setUsers(mockUsers);
    }
  };

  const handleLike = async (user) => {
    setLikedUser(user);
    if (currentUser) {
      try {
        await addDoc(collection(db, "matches"), {
          user1: currentUser.uid, user2: user.id,
          user1Liked: true, isMatch: false,
          matchedAt: serverTimestamp()
        });
      } catch (e) {}
    }
    setTimeout(() => {
      setLikedUser(null);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }, 2500);
  };

  const handlePass = (userId) => setUsers(prev => prev.filter(u => u.id !== userId));

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const NavBar = ({ active }) => (
    <div className="bottom-nav">
      {[{ icon: "🏠", label: "Home", s: "feed" }, { icon: "🔍", label: "Browse", s: "feed" }, { icon: "💬", label: "Chats", s: "chat" }, { icon: "👤", label: "Profile", s: "setup1" }].map(n => (
        <button key={n.label} className={`nav-item ${active === n.label ? "active" : ""}`} onClick={() => setScreen(n.s)}>
          <span className="nav-icon">{n.icon}</span>
          <span className="nav-label">{n.label}</span>
        </button>
      ))}
    </div>
  );

  const localityOptions = ["Noida", "Gurugram", "Dwarka", "Laxmi Nagar", "Rohini", "Vasant Kunj"];

  return (
    <>
      <style>{styles}</style>
      <div id="recaptcha-container" />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0A0A1A", padding: "20px" }}>
        <div className="phone">

          {/* SPLASH */}
          {screen === "splash" && (
            <div className="screen splash">
              <div className="logo-container">
                <div className="logo-icon">🏠</div>
                <div className="logo-title">Roomi<span>Match</span></div>
                <div className="logo-sub">Find your perfect roommate in Delhi/NCR</div>
              </div>
              <div className="feature-pills">
                {[
                  { icon: "🎯", bg: "rgba(255,107,107,0.15)", title: "Smart Matching", desc: "87% compatibility scores based on lifestyle" },
                  { icon: "🔒", bg: "rgba(78,205,196,0.15)", title: "Verified Profiles", desc: "OTP verification for safety" },
                  { icon: "💬", bg: "rgba(255,230,109,0.15)", title: "Safe Chat", desc: "Connect only after mutual interest" },
                ].map((f, i) => (
                  <div className="pill" key={i}>
                    <div className="pill-icon" style={{ background: f.bg }}>{f.icon}</div>
                    <div className="pill-text"><strong>{f.title}</strong><span>{f.desc}</span></div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setScreen("login")}>📱 Continue with Phone</button>
              <button className="btn-secondary" onClick={() => setScreen("feed")}>Browse as Guest</button>
            </div>
          )}

          {/* LOGIN */}
          {screen === "login" && (
            <div className="screen otp-screen">
              <button className="otp-back" onClick={() => setScreen("splash")}>←</button>
              <div className="otp-title">Enter your phone number</div>
              <div className="otp-sub">We'll send you a one-time password to verify your number</div>
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}
              <div className="phone-input-row">
                <div className="country-code">🇮🇳 +91</div>
                <input className="input-field" placeholder="10-digit number" type="tel" maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} />
              </div>
              <button className="btn-primary" onClick={sendOTP} disabled={loading}>
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            </div>
          )}

          {/* OTP VERIFY */}
          {screen === "otp" && (
            <div className="screen otp-screen">
              <button className="otp-back" onClick={() => setScreen("login")}>←</button>
              <div className="otp-title">Verify OTP</div>
              <div className="otp-sub">Enter the 6-digit code sent to +91 {phone}</div>
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}
              <div className="otp-boxes">
                {otp.map((val, idx) => (
                  <input key={idx} id={`otp-${idx}`} className="otp-box" type="tel" maxLength={1}
                    value={val} onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => e.key === "Backspace" && !val && idx > 0 && document.getElementById(`otp-${idx - 1}`)?.focus()} />
                ))}
              </div>
              <button className="btn-primary" onClick={verifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
              <button className="btn-secondary" onClick={() => { setOtp(["","","","","",""]); sendOTP(); }}>Resend OTP</button>
            </div>
          )}

          {/* SETUP 1 */}
          {screen === "setup1" && (
            <div className="screen setup-screen">
              <div className="setup-header">
                <div className="progress-bar"><div className="progress-fill" style={{ width: "33%" }} /></div>
                <div style={{ fontSize: "12px", color: "#8892A4", marginBottom: "6px" }}>Step 1 of 3</div>
                <div className="setup-title">Tell us about you</div>
                <div className="setup-subtitle">This helps us find your perfect match</div>
              </div>
              <div className="setup-body">
                {error && <div className="error-msg">{error}</div>}
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input-field" placeholder="Your name" value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Age</label>
                  <input className="input-field" placeholder="e.g. 24" type="number" value={profile.age}
                    onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Gender</label>
                  <div className="toggle-group">
                    {["Male", "Female", "Other"].map(g => (
                      <button key={g} className={`toggle-btn ${profile.gender === g ? "active" : ""}`}
                        onClick={() => setProfile(p => ({ ...p, gender: g }))}>{g}</button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">I am looking for</label>
                  <div className="toggle-group">
                    {["Room + Roommate", "I Have a Room"].map(opt => (
                      <button key={opt} className={`toggle-btn ${profile.lookingFor === opt ? "active" : ""}`}
                        onClick={() => setProfile(p => ({ ...p, lookingFor: opt }))}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Profession</label>
                  <input className="input-field" placeholder="e.g. Software Engineer" value={profile.work}
                    onChange={e => setProfile(p => ({ ...p, work: e.target.value }))} />
                </div>
              </div>
              <div className="bottom-nav-fixed">
                <button className="btn-primary" onClick={() => { setError(""); setScreen("setup2"); }}>Next →</button>
              </div>
            </div>
          )}

          {/* SETUP 2 */}
          {screen === "setup2" && (
            <div className="screen setup-screen">
              <div className="setup-header">
                <div className="progress-bar"><div className="progress-fill" style={{ width: "66%" }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#8892A4" }}>Step 2 of 3</span>
                  <button onClick={() => setScreen("setup1")} style={{ background: "none", border: "none", color: "#8892A4", cursor: "pointer", fontSize: "13px" }}>← Back</button>
                </div>
                <div className="setup-title">Your lifestyle</div>
                <div className="setup-subtitle">Honest answers lead to better matches</div>
              </div>
              <div className="setup-body">
                {[{ label: "🕐 Sleep Schedule", options: ["Early Bird", "Night Owl"], key: "sleep" }, { label: "🍽️ Diet", options: ["Veg", "Non-Veg", "Vegan"], key: "diet" }].map(item => (
                  <div className="lifestyle-card" key={item.key}>
                    <div className="lifestyle-row">
                      <div className="lifestyle-label">{item.label}</div>
                      <div className="toggle-group">
                        {item.options.map(opt => (
                          <button key={opt} className={`toggle-btn ${lifestyle[item.key] === opt ? "active" : ""}`}
                            onClick={() => setLifestyle(p => ({ ...p, [item.key]: opt }))}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {[{ label: "🚬 Smoking", key: "smoking" }, { label: "🍺 Drinking", key: "drinking" }].map(item => (
                  <div className="lifestyle-card" key={item.key}>
                    <div className="lifestyle-row">
                      <div className="lifestyle-label">{item.label}</div>
                      <div className="toggle-group">
                        {["Yes", "No"].map(opt => (
                          <button key={opt} className={`toggle-btn ${(lifestyle[item.key] ? "Yes" : "No") === opt ? "active" : ""}`}
                            onClick={() => setLifestyle(p => ({ ...p, [item.key]: opt === "Yes" }))}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="lifestyle-card">
                  <div className="lifestyle-row">
                    <div className="lifestyle-label">🧹 Cleanliness Level</div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className="star" onClick={() => setLifestyle(p => ({ ...p, cleanliness: s }))}>
                          {s <= lifestyle.cleanliness ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="lifestyle-card">
                  <div className="lifestyle-label" style={{ marginBottom: "10px" }}>🎉 Social Level</div>
                  <div className="toggle-group">
                    {["Introvert", "Moderate", "Social"].map(s => (
                      <button key={s} className={`toggle-btn ${lifestyle.social === s ? "active" : ""}`}
                        onClick={() => setLifestyle(p => ({ ...p, social: s }))}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bottom-nav-fixed">
                <button className="btn-primary" onClick={() => setScreen("setup3")}>Next →</button>
              </div>
            </div>
          )}

          {/* SETUP 3 */}
          {screen === "setup3" && (
            <div className="screen setup-screen">
              <div className="setup-header">
                <div className="progress-bar"><div className="progress-fill" style={{ width: "100%" }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#8892A4" }}>Step 3 of 3 — Almost done!</span>
                  <button onClick={() => setScreen("setup2")} style={{ background: "none", border: "none", color: "#8892A4", cursor: "pointer", fontSize: "13px" }}>← Back</button>
                </div>
                <div className="setup-title">Your preferences</div>
                <div className="setup-subtitle">What are you looking for?</div>
              </div>
              <div className="setup-body">
                <div className="lifestyle-card">
                  <div className="lifestyle-label" style={{ marginBottom: "12px" }}>💰 Monthly Budget</div>
                  <input type="range" className="range-slider" min={3000} max={25000} step={500}
                    value={budget} onChange={e => setBudget(Number(e.target.value))} />
                  <div className="range-labels">
                    <span>₹3,000</span>
                    <span style={{ color: "#FF6B6B", fontWeight: 600 }}>₹{budget.toLocaleString()}/mo</span>
                    <span>₹25,000</span>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Preferred Localities</label>
                  <div className="locality-chips">
                    {localityOptions.map(loc => (
                      <button key={loc} className={`chip ${localities.includes(loc) ? "active" : ""}`}
                        onClick={() => setLocalities(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])}>
                        {localities.includes(loc) ? "✓ " : ""}{loc}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Roommate Gender Preference</label>
                  <div className="toggle-group">
                    {["Any", "Male", "Female"].map(g => (
                      <button key={g} className={`toggle-btn ${genderPref === g ? "active" : ""}`}
                        onClick={() => setGenderPref(g)}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bottom-nav-fixed">
                <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "🎉 Find My Matches"}
                </button>
              </div>
            </div>
          )}

          {/* FEED */}
          {screen === "feed" && (
            <div className="screen feed-screen">
              <div className="feed-header">
                <div className="feed-title">Roomi<span>Match</span></div>
                <div className="notif-btn">🔔</div>
              </div>
              <div className="filter-row">
                {["All", "Noida", "Gurugram", "Dwarka", "Laxmi Nagar"].map(f => (
                  <button key={f} className={`filter-chip ${activeFilter === f ? "active" : ""}`}
                    onClick={() => setActiveFilter(f)}>{f}</button>
                ))}
              </div>
              {users.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 32px", color: "#8892A4" }}>
                  <div style={{ fontSize: "56px", marginBottom: "16px" }}>🏠</div>
                  <div style={{ fontFamily: "Clash Display", fontSize: "20px", color: "#EAEAEA", marginBottom: "8px" }}>All caught up!</div>
                  <div style={{ fontSize: "14px" }}>Check back later for more matches</div>
                  <button className="btn-primary" style={{ marginTop: "28px" }} onClick={() => setUsers(mockUsers)}>Refresh</button>
                </div>
              ) : (
                users.filter(u => activeFilter === "All" || u.locality?.includes(activeFilter)).map(user => (
                  <div className="match-card" key={user.id}>
                    <div className="card-photo" style={{ background: `linear-gradient(135deg, ${user.color}33, ${user.color}66)` }}>
                      <span style={{ color: user.color }}>{user.photo}</span>
                      <div className="score-badge">✓ {user.score}% match</div>
                      <div className="locality-tag">📍 {user.locality}</div>
                    </div>
                    <div className="card-body">
                      <div className="card-name">{user.name}, {user.age}</div>
                      <div className="card-meta">💼 {user.work}</div>
                      <div className="trait-row">
                        <div className="trait">🍽️ {user.diet}</div>
                        <div className="trait">🌙 {user.sleep}</div>
                        <div className="trait">{user.smoking ? "🚬 Smoker" : "🚭 Non-smoker"}</div>
                        <div className="trait">{user.drinking ? "🍺 Drinks" : "🧃 Non-drinker"}</div>
                      </div>
                      <div className="budget-row">
                        <div>
                          <div className="budget-amount">₹{(user.budget || 0).toLocaleString()}</div>
                          <div className="budget-label">per month budget</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "22px", fontFamily: "Clash Display", color: "#6BCB77" }}>{user.score}%</div>
                          <div className="budget-label">compatibility</div>
                        </div>
                      </div>
                      <div className="action-row">
                        <button className="btn-pass" onClick={() => handlePass(user.id)}>✗ Pass</button>
                        <button className="btn-like" onClick={() => handleLike(user)}>♥ Like</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {likedUser && (
                <div className="match-popup">
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
                  <div className="match-popup-title">It's a Match!</div>
                  <div className="match-popup-sub">You liked {likedUser.name}!<br />Start a conversation!</div>
                  <div className="match-avatars">
                    <div className="match-avatar" style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)" }}>You</div>
                    <div className="match-heart">❤️</div>
                    <div className="match-avatar" style={{ background: `linear-gradient(135deg, ${likedUser.color}88, ${likedUser.color})` }}>{likedUser.photo}</div>
                  </div>
                  <button className="btn-primary" onClick={() => { setLikedUser(null); setScreen("chat"); }}>💬 Send a Message</button>
                  <button className="btn-secondary" onClick={() => setLikedUser(null)}>Continue Browsing</button>
                </div>
              )}
              <NavBar active="Home" />
            </div>
          )}

          {/* CHAT */}
          {screen === "chat" && (
            <div className="screen chat-screen">
              <div className="chat-header">
                <div className="chat-title">Messages</div>
                <div className="notif-btn">✏️</div>
              </div>
              <div style={{ padding: "16px 24px 8px" }}>
                <input className="input-field" placeholder="🔍  Search conversations..." style={{ fontSize: "14px" }} />
              </div>
              <div className="chat-list">
                {[
                  { name: "Rahul Sharma", preview: "Hey! Is the room still available?", time: "2m ago", unread: 2, color: "#FF6B6B", initials: "RS", online: true },
                  { name: "Priya Mehta", preview: "Sure, we can meet this Sunday 👍", time: "1h ago", unread: 0, color: "#4ECDC4", initials: "PM", online: true },
                  { name: "Arjun Nair", preview: "What's the deposit amount?", time: "3h ago", unread: 1, color: "#FFE66D", initials: "AN", online: false },
                ].map((chat, i) => (
                  <div className="chat-item" key={i}>
                    <div className="chat-avatar" style={{ background: `linear-gradient(135deg, ${chat.color}88, ${chat.color})` }}>
                      {chat.initials}
                      {chat.online && <div className="online-dot" />}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">{chat.name}</div>
                      <div className="chat-preview">{chat.preview}</div>
                    </div>
                    <div className="chat-meta">
                      <div className="chat-time">{chat.time}</div>
                      {chat.unread > 0 && <div className="unread-badge">{chat.unread}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <NavBar active="Chats" />
            </div>
          )}

        </div>
      </div>
    </>
  );
}