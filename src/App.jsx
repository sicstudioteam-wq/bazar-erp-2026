import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, MapPin, Calendar, ArrowUpRight, 
  ArrowDownRight, LayoutDashboard, Wallet, Receipt, Calculator, 
  ChevronDown, ChevronUp, Smartphone, Banknote, History, Package, 
  Layers, Clock, Box, Plus, Minus, Save, FileText, Printer, Trash2, Edit3, 
  DollarSign, CheckCircle2, X, Tag, AlertTriangle, Download,
  FileSpreadsheet, Presentation, Database, Upload, RefreshCcw, Building2,
  Store, ShoppingCart, ClipboardList, QrCode, Cloud, BarChart3, CalendarDays,
  Lock, User, UserCheck, Coins, FileJson, UploadCloud, Home, Unlock, Sparkles,
  Settings2, EyeOff, Smile, ShieldCheck
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// ============================================================================
// 🛑 CONFIG FIREBASE
// ============================================================================
const fallbackFirebaseConfig = {
  apiKey: "AIzaSyARefqToQb_DB-yLv97-FCqxPUzH4f_QVQ",
  authDomain: "erp-sales-bazar.firebaseapp.com",
  projectId: "erp-sales-bazar",
  storageBucket: "erp-sales-bazar.firebasestorage.app",
  messagingSenderId: "461503578983",
  appId: "1:461503578983:web:95e4adb1c6d04a8f0f25c2",
  measurementId: "G-0TEBRPQFQW"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : fallbackFirebaseConfig;

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "SILA_GANTI_DENGAN_API_KEY_ANDA";

let app, auth, db;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'stall-bazar-2026';

// --- DATA AWAL (INITIAL DATA) ---
const PRODUCTS = [
  { id: 'ayam_gunting', name: 'Ayam Gunting', price: 10, pieces: { ayam: 1, sosej: 0 } },
  { id: 'sosej_1', name: 'Sosej Jumbo (1pc)', price: 4, pieces: { ayam: 0, sosej: 1 } },
  { id: 'sosej_2', name: 'Sosej Jumbo (2pcs)', price: 7, pieces: { ayam: 0, sosej: 2 } },
  { id: 'combo', name: 'Combo Ayam + Sosej', price: 13, pieces: { ayam: 1, sosej: 1 } },
];

const INITIAL_STAFF_PROFILES = [
  { id: 'hadi', name: 'Hadi', rate: 8.20 },
  { id: 'arhami', name: 'Arhami', rate: 8.20 },
  { id: 'yusof', name: 'Yusof', rate: 8.20 }
];

// ============================================================================
// 🧩 HELPER FUNCTIONS & COMPONENTS
// ============================================================================

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 group hover:shadow-xl transition-all border-b-4 border-b-transparent hover:border-b-indigo-500">
    <div className={`p-3 ${color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</div>
    <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
      RM {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
    </div>
  </div>
);

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getWeekKey = (dateStr) => {
    if (!dateStr) return 'unknown';
    const [yyyy, mm, dd] = dateStr.split('-');
    const d = new Date(yyyy, mm - 1, dd);
    const day = d.getDay() || 7; 
    d.setDate(d.getDate() - day + 1); 
    const outY = d.getFullYear();
    const outM = String(d.getMonth() + 1).padStart(2, '0');
    const outD = String(d.getDate()).padStart(2, '0');
    return `${outD}/${outM}/${outY}`;
};

const calculatePayroll = (records, rate) => {
    let totalAllowance = 0, totalBonus = 0, totalAdvance = 0;
    const weeklyHours = {};
    
    records.forEach(r => {
        totalAllowance += Number(r.allowance || 0);
        totalBonus += Number(r.bonus || 0);
        totalAdvance += Number(r.advance || 0);
        if (!r.isAdjustment && r.date) {
            const weekKey = getWeekKey(r.date);
            if (!weeklyHours[weekKey]) weeklyHours[weekKey] = { hours: 0, startDate: weekKey };
            weeklyHours[weekKey].hours += Number(r.hours || 0);
        }
    });

    let totalRegularHours = 0, totalOTHours = 0;
    const weeklyBreakdown = [];

    Object.values(weeklyHours).sort((a,b) => a.startDate.localeCompare(b.startDate)).forEach(week => {
        let roundedHours = Math.round(week.hours * 10) / 10;
        let reg = roundedHours;
        let ot = 0;
        if (roundedHours > 45) {
            reg = 45;
            ot = Math.round((roundedHours - 45) * 10) / 10;
        }
        totalRegularHours += reg;
        totalOTHours += ot;
        weeklyBreakdown.push({ date: week.startDate, total: roundedHours, reg, ot });
    });

    totalRegularHours = Math.round(totalRegularHours * 10) / 10;
    totalOTHours = Math.round(totalOTHours * 10) / 10;

    const basicPay = totalRegularHours * rate;
    const otRate = rate * 1.5;
    const otPay = totalOTHours * otRate;
    const grossPay = basicPay + otPay + totalAllowance + totalBonus;
    const netPay = grossPay - totalAdvance;

    return { totalRegularHours, totalOTHours, basicPay, otRate, otPay, totalAllowance, totalBonus, totalAdvance, grossPay, netPay, weeklyBreakdown };
};

// ============================================================================
// 🚀 MAIN APP COMPONENT
// ============================================================================

const App = () => {
  // --- GLOBAL STATES ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainMode, setMainMode] = useState('landing'); // 'landing' | 'pos' | 'erp'
  
  // --- FIREBASE DATA STATES ---
  const [allSales, setAllSales] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allStock, setAllStock] = useState([]);
  const [staffWorkRecords, setStaffWorkRecords] = useState([]);
  const [staffConfig, setStaffConfig] = useState(INITIAL_STAFF_PROFILES);

  // --- POS STATES ---
  const [posView, setPosView] = useState('home');
  const [location, setLocation] = useState(() => localStorage.getItem('bazar_location') || '');
  const [localStaffName, setLocalStaffName] = useState(() => localStorage.getItem('bazar_staff_name') || '');
  const [posDate, setPosDate] = useState(getTodayDate());
  const [stockAwal, setStockAwal] = useState({ ayam: 0, ayamPcs: 0, sosej: 0, sosejPcs: 0 });
  const [pettyCash, setPettyCash] = useState('');
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [closeStaffName, setCloseStaffName] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [actualStockAyam, setActualStockAyam] = useState('');
  const [actualStockSosej, setActualStockSosej] = useState('');
  const [showClosingSuccess, setShowClosingSuccess] = useState(false);

  // --- ERP STATES ---
  const [erpTab, setErpTab] = useState('overview');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isReportSlide, setIsReportSlide] = useState(false);

  // --- MODALS & UTILS ---
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [saleToVoid, setSaleToVoid] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', confirmText: 'Teruskan', isDestructive: false, onConfirm: null });
  const sliderRefReport = useRef(null);

  // --- INIT FIREBASE ---
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth Error:", error); }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- SYNC DATA DARI FIRESTORE (REALTIME) ---
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    
    const unsubs = [];
    const dbPath = `artifacts/${appId}/public/data`;

    unsubs.push(onSnapshot(collection(db, dbPath, 'sales'), snap => setAllSales(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, dbPath, 'sessions'), snap => setAllSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, dbPath, 'expenses'), snap => setAllExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, dbPath, 'stock'), snap => setAllStock(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, dbPath, 'staff_work'), snap => setStaffWorkRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    
    unsubs.push(onSnapshot(collection(db, dbPath, 'staff_profiles'), snap => {
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const combined = [...INITIAL_STAFF_PROFILES];
        fetched.forEach(f => {
            const idx = combined.findIndex(c => c.id === f.id);
            if (idx >= 0) { if (f.deleted) combined.splice(idx, 1); else combined[idx] = { ...combined[idx], ...f }; } 
            else { if (!f.deleted) combined.push(f); }
        });
        setStaffConfig(combined);
    }));

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  // --- POS EFFECT LOGIC ---
  useEffect(() => {
    if (mainMode === 'pos' && location && posDate) {
      const currentSession = allSessions.find(s => s.location === location && s.date === posDate);
      if (currentSession && currentSession.isOpen) {
        setIsShiftOpen(true);
        setStockAwal(currentSession.stockAwal || { ayam: 0, ayamPcs: 0, sosej: 0, sosejPcs: 0 });
        setPettyCash(currentSession.pettyCash || '');
      } else {
        setIsShiftOpen(false);
      }
    }
  }, [mainMode, location, posDate, allSessions]);

  useEffect(() => {
    localStorage.setItem('bazar_location', location);
    localStorage.setItem('bazar_staff_name', localStaffName);
  }, [location, localStaffName]);

  // --- ERP CALCULATION ENGINE ---
  // Ini adalah teras yang menggabungkan data POS individu kepada keseluruhan ERP
  const erpTotals = useMemo(() => {
    let totalSales = 0, kgBelah2CashTotal = 0, kgBelah2QRTotal = 0, evokeCashTotal = 0, evokeQRTotal = 0;
    
    // Kira jualan. Menyokong format lama (manual ERP) dan format baru (dari POS)
    allSales.forEach(s => {
      // Jika dari POS (Format baru ada medan 'total' & 'paymentMethod')
      if (s.total !== undefined && s.paymentMethod) {
          totalSales += Number(s.total);
          if (s.location === 'Kg Belah 2') {
              if (s.paymentMethod === 'Cash') kgBelah2CashTotal += Number(s.total);
              if (s.paymentMethod === 'QR Pay') kgBelah2QRTotal += Number(s.total);
          } else if (s.location === 'Evoke') {
              if (s.paymentMethod === 'Cash') evokeCashTotal += Number(s.total);
              if (s.paymentMethod === 'QR Pay') evokeQRTotal += Number(s.total);
          }
      } else {
          // Format Lama (Jika masih ada rekod lama)
          const kbc = Number(s.kgBelah2Cash ?? s.suteraCash ?? 0);
          const kbq = Number(s.kgBelah2QR ?? s.suteraQR ?? 0);
          const ec = Number(s.evokeCash || 0);
          const eq = Number(s.evokeQR || 0);
          kgBelah2CashTotal += kbc; kgBelah2QRTotal += kbq;
          evokeCashTotal += ec; evokeQRTotal += eq;
          totalSales += (kbc + kbq + ec + eq);
      }
    });

    const totalKgBelah2Sales = kgBelah2CashTotal + kgBelah2QRTotal;
    const totalEvokeSales = evokeCashTotal + evokeQRTotal;

    // Kira Belanja (Menyatukan belian stok manual ERP & expense POS semasa tutup syif)
    const totalExpenses = allExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalCogs = allStock.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

    // Kira Gaji
    const uniqueStaffIds = [...new Set(staffWorkRecords.map(r => r.staffId))];
    const totalWages = uniqueStaffIds.reduce((acc, staffId) => {
      const staff = staffConfig.find(s => s.id === staffId) || { rate: 8.20 };
      const records = staffWorkRecords.filter(r => r.staffId === staffId);
      const payInfo = calculatePayroll(records, staff.rate);
      return acc + Number(payInfo.grossPay || 0);
    }, 0);

    const netProfit = totalSales - totalCogs - totalExpenses - totalWages;

    return { totalSales, totalKgBelah2Sales, totalEvokeSales, kgBelah2CashTotal, kgBelah2QRTotal, evokeCashTotal, evokeQRTotal, totalCogs, totalExpenses, totalWages, netProfit };
  }, [allSales, allExpenses, allStock, staffWorkRecords, staffConfig]);

  const erpSalesChartData = useMemo(() => {
    const groups = {};
    allSales.forEach(s => {
      const d = s.date;
      if (!groups[d]) groups[d] = { date: d, evoke: 0, kgBelah2: 0 };
      
      if (s.total !== undefined) {
          if (s.location === 'Evoke') groups[d].evoke += Number(s.total);
          if (s.location === 'Kg Belah 2') groups[d].kgBelah2 += Number(s.total);
      } else {
          groups[d].evoke += (Number(s.evokeCash || 0) + Number(s.evokeQR || 0));
          groups[d].kgBelah2 += (Number(s.kgBelah2Cash ?? s.suteraCash ?? 0) + Number(s.kgBelah2QR ?? s.suteraQR ?? 0));
      }
    });
    return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allSales]);


  // ============================================================================
  // 💾 FIREBASE ACTIONS (POS & ERP)
  // ============================================================================

  const updateSessionData = async (updates) => {
    if (!user) return;
    const sessionDocId = `${location}-${posDate}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionDocId), { 
      location, date: posDate, ...updates, updatedAt: Date.now() 
    }, { merge: true });
  };

  // --- POS ACTIONS ---
  const handleJoinShift = async () => {
    if (!localStaffName) return;
    const currentSession = allSessions.find(s => s.location === location && s.date === getTodayDate());
    const currentList = currentSession?.staffList || [];
    const newList = currentList.includes(localStaffName) ? currentList : [...currentList, localStaffName];
    
    if (!isShiftOpen) {
      await updateSessionData({ isOpen: true, stockAwal, pettyCash: parseFloat(pettyCash) || 0, staffList: newList, openedBy: localStaffName });
    } else {
      await updateSessionData({ staffList: newList });
    }
    setPosView('sales');
  };

  const handleMarkBranchClosed = () => {
    setConfirmDialog({
      isOpen: true, title: 'Tutup Cawangan?', message: `Adakah anda pasti cawangan ${location} cuti hari ini?`, confirmText: 'Ya, Cuti', isDestructive: true,
      onConfirm: async () => await updateSessionData({ isBranchClosed: true, openedBy: localStaffName, updatedAt: Date.now() })
    });
  };

  const finalizeSale = async (paymentMethod) => {
    if (cart.length === 0 || !user) return;
    const newSale = {
      location, date: getTodayDate(), items: cart, total: cart.reduce((sum, item) => sum + item.price, 0),
      paymentMethod, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(), createdBy: user.uid, staffName: localStaffName
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sales'), newSale);
    setCart([]);
  };

  const voidSaleInCloud = async (saleId) => {
    if (!user || !saleId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sales', saleId));
  };

  const handleAddExpensePOS = async () => {
    if (!expenseDesc || !expenseAmount || !user) return;
    // Tambah dalam koleksi expenses (supaya sinkroni terus dengan ERP)
    const newExp = {
      date: posDate, location, item: expenseDesc, amount: parseFloat(expenseAmount),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), staffName: localStaffName, isAdvanced: false
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), newExp);
    
    // Log juga di dalam sesi untuk rujukan penutup syif
    const currentSession = allSessions.find(s => s.location === location && s.date === posDate);
    const currentExpenses = currentSession?.expenses || [];
    await updateSessionData({ expenses: [...currentExpenses, { id: Date.now().toString(), desc: expenseDesc, amount: parseFloat(expenseAmount), staffName: localStaffName, time: newExp.time }] });
    setExpenseDesc(''); setExpenseAmount('');
  };

  const handleCloseShift = async (expectedCash) => {
    if (!closeStaffName || actualCash === '' || actualStockAyam === '' || actualStockSosej === '') return;
    const actual = parseFloat(actualCash) || 0;
    const diff = actual - expectedCash;
    
    // Kira log masa automatik untuk payroll! (Auto clock-out)
    const currentSession = allSessions.find(s => s.location === location && s.date === posDate);
    if (currentSession && currentSession.updatedAt) {
       const shiftStart = new Date(currentSession.updatedAt);
       const shiftEnd = new Date();
       const hoursDiff = (shiftEnd - shiftStart) / (1000 * 60 * 60);
       
       // Daftar kehadiran ke dalam payroll secara automatik (Bonus ERP integration!)
       const staffId = closeStaffName.toLowerCase().replace(/[^a-z0-9]/g, '_');
       await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'staff_work'), {
          date: posDate,
          staffId: staffId,
          hours: Math.max(0, parseFloat(hoursDiff.toFixed(1))),
          startTime: shiftStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: shiftEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          breakMinutes: 0,
          isAdjustment: false
       });
    }

    await updateSessionData({
      isClosed: true, closeStaffName, expectedCash, actualCash: actual, cashDifference: diff,
      actualStockAyam: parseInt(actualStockAyam) || 0, actualStockSosej: parseInt(actualStockSosej) || 0,
      closedAt: Date.now()
    });

    setShowClosingSuccess(true);
  };


  // ============================================================================
  // 🖥️ UI RENDERERS
  // ============================================================================

  // --- 1. LANDING PAGE (SISTEM INDUK) ---
  if (mainMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-100">
         <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-emerald-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>

         <div className="z-10 text-center mb-16 animate-in slide-in-from-top-10 duration-700">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] mx-auto mb-8">
               <ShieldCheck className="w-12 h-12 text-slate-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Sistem Induk Bersepadu</h1>
            <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">Raudhah Team Resources (Bazar 2026)</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10 animate-in zoom-in-95 duration-500 delay-150">
            {/* Butang POS */}
            <button onClick={() => setMainMode('pos')} className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-10 rounded-[2.5rem] hover:bg-blue-600 hover:border-blue-400 group transition-all text-left flex flex-col justify-between min-h-[250px] shadow-2xl">
               <div>
                  <div className="bg-slate-700/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all">
                     <Store className="w-8 h-8 text-blue-400 group-hover:text-white" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Mod POS (Kiosk)</h2>
                  <p className="text-sm text-slate-400 group-hover:text-blue-100 font-medium leading-relaxed">Antaramuka pantas untuk staf bazar merekod jualan, ambil pesanan, dan tutup syif harian.</p>
               </div>
               <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:text-white mt-8">
                  Log Masuk Staf <ArrowUpRight className="ml-2 w-4 h-4" />
               </div>
            </button>

            {/* Butang ERP */}
            <button onClick={() => { setPinAction('erp_login'); setShowPinModal(true); }} className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-10 rounded-[2.5rem] hover:bg-emerald-600 hover:border-emerald-400 group transition-all text-left flex flex-col justify-between min-h-[250px] shadow-2xl">
               <div>
                  <div className="bg-slate-700/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all">
                     <BarChart3 className="w-8 h-8 text-emerald-400 group-hover:text-white" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Mod ERP (Pengurusan)</h2>
                  <p className="text-sm text-slate-400 group-hover:text-emerald-100 font-medium leading-relaxed">Papan pemuka eksekutif untuk semak untung bersih, inventori pukal, gaji pekerja (payroll) dan analitik data.</p>
               </div>
               <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-white mt-8">
                  <Lock className="mr-2 w-3 h-3" /> Akses Pemilik Sahaja
               </div>
            </button>
         </div>

         {/* PIN MODAL (Untuk Masuk ERP) */}
         {showPinModal && pinAction === 'erp_login' && (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200 text-slate-900">
               <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm border border-slate-200 shadow-2xl transform transition-all">
                  <div className="flex justify-center mb-8"><div className="bg-emerald-50 p-5 rounded-2xl text-emerald-600 border border-emerald-100"><Lock size={36} /></div></div>
                  <div className="text-center mb-8">
                     <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter uppercase italic">Akses Pengurusan</h3>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sila Masukkan PIN Admin (8888)</p>
                  </div>
                  <input type="password" inputMode="numeric" maxLength="4" value={pinInput} onChange={e => { setPinInput(e.target.value); setPinError(false); }} className={`w-full text-center text-5xl tracking-[0.5em] font-black p-5 bg-slate-50 border-2 rounded-2xl focus:outline-none transition-all shadow-sm ${pinError ? 'border-rose-500 animate-shake' : 'border-slate-200 focus:border-emerald-500'}`} placeholder="****" autoFocus/>
                  {pinError && <p className="text-rose-500 text-[10px] font-bold uppercase text-center mt-4 tracking-widest animate-pulse">PIN Tidak Sah!</p>}
                  <div className="flex space-x-4 mt-10">
                     <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); setPinAction(null); }} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors active:scale-95">Batal</button>
                     <button onClick={() => { 
                        if (pinInput === '8888') { setMainMode('erp'); setShowPinModal(false); setPinInput(''); } 
                        else { setPinError(true); setPinInput(''); }
                     }} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-xl shadow-md text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors active:scale-95">Sahkan</button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  }

  // --- 2. MOD POS (KIOSK JUALAN BAZAR) ---
  if (mainMode === 'pos') {
    const posSalesFiltered = allSales.filter(s => s.location === location && s.date === posDate);
    posSalesFiltered.sort((a,b) => b.timestamp - a.timestamp);
    
    return (
      <div className="bg-slate-50 min-h-screen">
         {/* POS HOME */}
         {posView === 'home' && (
           <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-8 relative overflow-hidden">
             <button onClick={() => setMainMode('landing')} className="absolute top-6 left-6 p-3 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 z-20"><ChevronLeft size={20}/></button>
             <div className="text-center z-10 flex flex-col items-center mt-10">
               <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tight mb-2">POS Jualan Bazar</h1>
               <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{posDate}</p>
             </div>
             <div className="grid grid-cols-1 w-full gap-4 max-w-md z-10 mt-8">
               {['Evoke', 'Kg Belah 2'].map(loc => (
                  <button key={loc} onClick={() => { setLocation(loc); setPosDate(getTodayDate()); setPosView('setup'); }}
                    className="p-6 bg-white border border-slate-200 hover:border-blue-400 rounded-3xl shadow-md flex items-center justify-between transition-all group">
                    <span className="text-xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-wider">{loc}</span>
                    <ChevronLeft className="rotate-180 text-slate-400 group-hover:text-blue-600" />
                  </button>
               ))}
             </div>
           </div>
         )}

         {/* POS SETUP (Buka Syif) */}
         {posView === 'setup' && (
           <div className="p-6 max-w-md mx-auto space-y-6 pb-12 bg-slate-50 min-h-screen text-slate-800">
             <div className="flex justify-between items-center w-full">
               <button onClick={() => { setPosView('home'); setLocation(''); }} className="flex items-center text-blue-600 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm"><ChevronLeft size={18} className="mr-1" /> Kembali</button>
               <button onClick={() => setPosView('report')} className="flex items-center text-amber-700 font-bold text-[10px] uppercase tracking-widest bg-amber-100 px-4 py-2.5 rounded-full"><ClipboardList size={16} className="mr-1.5" /> Penutup Syif</button>
             </div>
             
             <div className="text-center mt-4">
               <h2 className="text-3xl font-black uppercase tracking-tight">Buka Syif <span className="text-blue-600">({location})</span></h2>
             </div>

             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-md space-y-5 mt-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={14} className="text-blue-600" /><span>Nama Anda</span></label>
                  <input type="text" value={localStaffName} onChange={e => setLocalStaffName(e.target.value)} placeholder="Cth: Ali" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold text-slate-800 focus:border-blue-500" />
                </div>
                
                {!isShiftOpen ? (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Coins size={14} className="text-blue-600" /><span>Modal Laci (RM)</span></label>
                    <input type="number" value={pettyCash} onChange={e => setPettyCash(e.target.value)} placeholder="0.00" className="w-full p-4 bg-slate-50 rounded-2xl border text-2xl font-black text-blue-700" />
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border shadow-sm"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Modal (Telah Diset)</span><span className="text-2xl font-black text-blue-700">RM {pettyCash}</span></div>
                )}
             </div>

             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-md">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs mb-4">Stok Permulaan (Fizikal)</h3>
                {!isShiftOpen ? (
                  <div className="space-y-4">
                    {['ayam', 'sosej'].map(type => (
                      <div key={type} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{type === 'ayam' ? 'Ayam Gunting' : 'Sosej Jumbo'}</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Pek (10s)', 'Pcs (Loose)'].map((unit, idx) => (
                            <div key={unit} className="bg-white p-2 rounded-xl border flex flex-col items-center">
                              <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">{unit}</span>
                              <div className="flex w-full items-center justify-between">
                                <button onClick={() => { const f = idx===0?type:type+'Pcs'; setStockAwal({...stockAwal, [f]: Math.max(0, stockAwal[f]-1)}); }} className="p-1.5 bg-slate-100 text-rose-500 rounded"><Minus size={14}/></button>
                                <span className="font-black text-lg">{stockAwal[idx === 0 ? type : type + 'Pcs'] || 0}</span>
                                <button onClick={() => { const f = idx===0?type:type+'Pcs'; setStockAwal({...stockAwal, [f]: stockAwal[f]+1}); }} className="p-1.5 bg-slate-100 text-blue-600 rounded"><Plus size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl text-center"><span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Ayam</span><div className="font-black">{stockAwal.ayam} P, {stockAwal.ayamPcs} Pcs</div></div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center"><span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Sosej</span><div className="font-black">{stockAwal.sosej} P, {stockAwal.sosejPcs} Pcs</div></div>
                  </div>
                )}
             </div>

             <button disabled={!localStaffName} onClick={handleJoinShift} className="w-full py-5 bg-blue-700 text-white rounded-[1.5rem] font-black uppercase shadow-lg hover:bg-blue-800 disabled:opacity-50">
               {isShiftOpen ? 'Teruskan Ke Jualan' : 'Sahkan & Buka Syif'}
             </button>
           </div>
         )}

         {/* POS JUALAN KIOSK */}
         {posView === 'sales' && (
           <div className="flex flex-col h-screen max-w-2xl mx-auto bg-slate-50">
             <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm sticky top-0 z-20">
               <div className="flex items-center gap-3">
                 <button onClick={() => setPosView('home')} className="p-2 bg-slate-100 rounded-xl text-slate-600"><Home size={20}/></button>
                 <div>
                   <h3 className="font-black text-slate-800 text-lg leading-none uppercase tracking-wider">{location}</h3>
                   <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{posDate}</div>
                 </div>
               </div>
               <button onClick={() => setPosView('report')} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-1"><ClipboardList size={16} /><span>Laporan</span></button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
               <div className="grid grid-cols-2 gap-4">
                 {PRODUCTS.map(p => (
                   <button key={p.id} onClick={() => setCart([...cart, p])} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 hover:border-blue-400 hover:shadow-md active:scale-95 transition-all">
                     <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingCart size={24}/></div>
                     <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">{p.name}</span>
                     <span className="text-blue-700 font-black text-xl">RM {p.price}</span>
                   </button>
                 ))}
               </div>

               <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                 <div className="bg-slate-50 p-4 border-b flex justify-between items-center"><span className="font-bold text-slate-600 text-xs uppercase tracking-widest">Troli Semasa</span><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-[10px] font-black">{cart.length} Item</span></div>
                 <div className="p-3 max-h-48 overflow-y-auto">
                   {cart.length === 0 ? <p className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pilih Produk</p> : cart.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 mb-2 rounded-xl">
                       <span className="text-xs font-bold text-slate-700 uppercase">{item.name}</span>
                       <div className="flex items-center gap-3">
                         <span className="text-blue-600 font-bold text-sm">RM {item.price}</span>
                         <button onClick={() => { const nc = [...cart]; nc.splice(idx, 1); setCart(nc); }} className="text-rose-500 bg-white p-2 rounded-lg border shadow-sm"><Trash2 size={14} /></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-3">
                 <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-[0.2em] ml-1">Jualan Live</h4>
                 {posSalesFiltered.slice(0, 3).map(s => (
                   <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                     <div>
                       <div className="text-sm font-black text-slate-800">RM {s.total} <span className="text-[10px] text-slate-500 font-normal">({s.items.length} item)</span></div>
                       <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1"><span className="text-blue-600">{s.staffName}</span> • {s.time} • <span className="text-amber-500">{s.paymentMethod}</span></div>
                     </div>
                     <CheckCircle2 className="text-blue-500" size={18} />
                   </div>
                 ))}
               </div>
             </div>

             <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
               <div className="flex justify-between items-end mb-4 px-2"><span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Jumlah Bil</span><span className="text-4xl font-black text-blue-700 tracking-tighter">RM {cart.reduce((sum, item) => sum + item.price, 0)}</span></div>
               <div className="grid gap-3 grid-cols-2">
                 <button disabled={cart.length===0} onClick={() => finalizeSale('Cash')} className="py-4 rounded-2xl bg-slate-800 text-white font-black uppercase text-xs tracking-widest shadow-md active:scale-95 disabled:opacity-50">CASH</button>
                 <button disabled={cart.length===0} onClick={() => finalizeSale('QR Pay')} className="py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest shadow-md active:scale-95 disabled:opacity-50">QR PAY</button>
               </div>
             </div>
           </div>
         )}

         {/* POS REPORT (Tutup Syif) */}
         {posView === 'report' && (() => {
            const currentSession = allSessions.find(s => s.location === location && s.date === posDate);
            const pcAmt = parseFloat(currentSession?.pettyCash || pettyCash) || 0;
            const expList = currentSession?.expenses || [];
            const expTot = expList.reduce((sum, e) => sum + parseFloat(e.amount||0), 0);
            
            const daySales = allSales.filter(s => s.location === location && s.date === posDate);
            const cashTot = daySales.filter(s => s.paymentMethod === 'Cash').reduce((sum, s) => sum + (s.total||0), 0);
            const expectedLaci = cashTot + pcAmt - expTot;
            const isClosed = currentSession?.isClosed;

            return (
              <div className="p-6 max-w-md mx-auto space-y-6 pb-12 bg-slate-50 min-h-screen">
                <div className="flex justify-between bg-white p-4 rounded-2xl shadow-sm items-center border">
                  <button onClick={() => setPosView('sales')} className="text-blue-700 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl"><ChevronLeft size={16} className="inline mr-1"/> Jualan</button>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penutup Syif</span>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border space-y-4">
                   <h3 className="font-black text-xs uppercase tracking-widest border-b pb-3 flex items-center gap-2"><Receipt size={16} className="text-rose-500"/> Ambilan / Belian</h3>
                   {!isClosed && (
                     <div className="flex gap-2">
                       <input type="text" value={expenseDesc} onChange={e=>setExpenseDesc(e.target.value)} placeholder="Beli Ais" className="flex-1 bg-slate-50 border p-3 rounded-xl text-xs" />
                       <input type="number" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} placeholder="RM" className="w-20 bg-slate-50 border p-3 rounded-xl text-xs text-center" />
                       <button onClick={handleAddExpensePOS} className="bg-rose-50 text-rose-600 p-3 rounded-xl"><Plus size={16}/></button>
                     </div>
                   )}
                   <div className="space-y-2 text-xs">
                     {expList.map(e => (
                       <div key={e.id} className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>{e.desc}</span><span className="text-rose-500 font-bold">-RM {e.amount}</span></div>
                     ))}
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest pt-2"><span className="text-slate-500">Jumlah Belanja</span><span className="text-rose-600">RM {expTot}</span></div>
                </div>

                <div className="bg-slate-800 p-6 rounded-[2rem] shadow-xl text-white space-y-5">
                   <h3 className="font-black text-xs uppercase tracking-widest border-b border-slate-700 pb-3 flex items-center gap-2 text-blue-400"><Lock size={16}/> Borang Penutup</h3>
                   
                   {!isClosed ? (
                     <>
                       <div className="space-y-3">
                         <input type="text" value={closeStaffName} onChange={e=>setCloseStaffName(e.target.value)} placeholder="NAMA PENGURUS SYIF" className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold uppercase focus:border-blue-400 outline-none" />
                         <input type="number" value={actualCash} onChange={e=>setActualCash(e.target.value)} placeholder="Tunai Fizikal (RM)" className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-2xl font-black text-emerald-400 text-center focus:border-blue-400 outline-none" />
                       </div>
                       <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                         <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest text-center block mb-3">Baki Stok Fizikal Akhir</span>
                         <div className="grid grid-cols-2 gap-3">
                           <input type="number" value={actualStockAyam} onChange={e=>setActualStockAyam(e.target.value)} placeholder="Ayam (Pcs)" className="bg-slate-700 p-3 rounded-lg text-center font-bold outline-none border border-slate-600 focus:border-blue-400" />
                           <input type="number" value={actualStockSosej} onChange={e=>setActualStockSosej(e.target.value)} placeholder="Sosej (Pcs)" className="bg-slate-700 p-3 rounded-lg text-center font-bold outline-none border border-slate-600 focus:border-blue-400" />
                         </div>
                       </div>
                       <button onClick={() => setConfirmDialog({isOpen:true, title:'Tutup Syif', message:'Sahkan kiraan fizikal dan hantar ke HQ (ERP)?', isDestructive:false, confirmText:'Ya, Hantar', onConfirm: () => handleCloseShift(expectedLaci)})} className="w-full bg-blue-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md">Hantar Ke ERP</button>
                     </>
                   ) : (
                     <div className="text-center space-y-4">
                       <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded-xl text-emerald-400">
                         <span className="block text-[10px] font-bold uppercase mb-1">Status Laci Tunai</span>
                         <span className="text-xl font-black">{currentSession.cashDifference === 0 ? 'TEPAT' : (currentSession.cashDifference > 0 ? `LEBIH RM ${currentSession.cashDifference}` : `KURANG RM ${Math.abs(currentSession.cashDifference)}`)}</span>
                       </div>
                       <div className="text-xs text-slate-400 italic">Syif telah ditutup dan dihantar ke Dashboard ERP.</div>
                     </div>
                   )}
                </div>
              </div>
            );
         })()}
         
         {showClosingSuccess && (
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in zoom-in">
             <div className="bg-white p-8 rounded-[2.5rem] text-center max-w-sm w-full">
               <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
               <h3 className="text-2xl font-black text-slate-800 mb-2">Terima Kasih!</h3>
               <p className="text-sm text-slate-500 mb-6">Laporan dihantar ke sistem ERP. Syif anda tamat.</p>
               <button onClick={() => {setShowClosingSuccess(false); setMainMode('landing');}} className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg">Log Keluar</button>
             </div>
           </div>
         )}
      </div>
    );
  }

  // --- 3. MOD ERP (PAPAN PEMUKA PENGURUSAN / BACK-OFFICE) ---
  if (mainMode === 'erp') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans pb-10">
        
        {/* HALAMAN PREVIEW SLIP GAJI (CETAKAN A5 LANDSCAPE) */}
        {selectedPayslip ? (
          <div className="min-h-screen bg-slate-200 p-4 md:p-8 print:p-0 print:bg-white flex justify-center items-center font-sans">
            <div className="bg-white border-[2px] border-slate-900 text-slate-900 shadow-2xl relative flex flex-col mx-auto print-modal-content w-full max-w-[210mm] min-h-[148mm]">
              <div className="flex justify-between items-center border-b-[4px] border-slate-900 pb-4 mb-5 px-8 pt-8">
                <div className="w-1/4 flex justify-start items-center">
                    <img src="/logo.png" alt="Logo" className="w-20 h-auto max-h-20 object-contain print:filter-none" style={{ filter: 'grayscale(100%) contrast(150%)', mixBlendMode: 'multiply' }} onError={(e) => {e.target.style.display='none';}} />
                </div>
                <div className="w-2/4 text-center">
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Raudhah Team Resources</h1>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Penyata Gaji Rasmi (002921662-A)</p>
                </div>
                <div className="w-1/4 text-right">
                    <h2 className="text-xl font-black uppercase text-indigo-800 print:text-black tracking-tight">SLIP GAJI</h2>
                    <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                        Tarikh: {new Date().toLocaleDateString('ms-MY')}<br/>
                        <span className="font-mono text-[9px]">ID: PAY-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 print:bg-transparent p-4 mx-8 rounded-xl border border-slate-200 print:border-none">
                <div><div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Nama Kakitangan</div><div className="text-lg font-black uppercase">{selectedPayslip.name}</div></div>
                <div className="text-right"><div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Kategori Jawatan</div><div className="text-sm font-bold uppercase text-slate-700">Operasi Bazar</div></div>
              </div>

              <div className="px-8 flex-1">
                <table className="w-full text-xs mb-6 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 print:bg-slate-100 text-white print:text-slate-900">
                        <th className="py-2 px-4 text-left font-black uppercase tracking-widest border-r border-slate-700">Keterangan</th>
                        <th className="py-2 px-4 text-center font-black uppercase tracking-widest border-r border-slate-700 w-28">Jam</th>
                        <th className="py-2 px-4 text-center font-black uppercase tracking-widest border-r border-slate-700 w-28">Kadar</th>
                        <th className="py-2 px-4 text-right font-black uppercase tracking-widest w-32">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                        <td className="py-3 px-4 font-bold border-r border-slate-200">Gaji Asas Harian</td>
                        <td className="py-3 px-4 text-center border-r border-slate-200">{selectedPayslip.payInfo.totalRegularHours.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center border-r border-slate-200">{selectedPayslip.rate.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-black">RM {selectedPayslip.payInfo.basicPay.toFixed(2)}</td>
                    </tr>
                    {selectedPayslip.payInfo.totalOTHours > 0 && (
                    <tr>
                        <td className="py-3 px-4 font-bold border-r border-slate-200">Gaji Lebih Masa (OT 1.5x)</td>
                        <td className="py-3 px-4 text-center border-r border-slate-200">{selectedPayslip.payInfo.totalOTHours.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center border-r border-slate-200">{selectedPayslip.payInfo.otRate.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-black">RM {selectedPayslip.payInfo.otPay.toFixed(2)}</td>
                    </tr>
                    )}
                    {(selectedPayslip.payInfo.totalAllowance > 0 || selectedPayslip.payInfo.totalBonus > 0) && (
                    <tr>
                        <td className="py-3 px-4 font-bold border-r border-slate-200">Elaun / Bonus</td>
                        <td className="py-3 px-4 text-center border-r border-slate-200">-</td>
                        <td className="py-3 px-4 text-center border-r border-slate-200">-</td>
                        <td className="py-3 px-4 text-right font-black">RM {(selectedPayslip.payInfo.totalAllowance + selectedPayslip.payInfo.totalBonus).toFixed(2)}</td>
                    </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 px-8 mt-auto">
                <div className="flex-1 w-full max-w-sm space-y-1">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b pb-1 mb-2">Log Kehadiran Mingguan</div>
                    <div className="grid grid-cols-1 gap-1">
                      {selectedPayslip.payInfo.weeklyBreakdown.map((wb, idx) => (
                          <div key={idx} className="flex justify-between text-[9px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
                            <span className="font-bold">{wb.date}</span>
                            <span>{wb.total.toFixed(1)}J (A:{wb.reg.toFixed(1)} | O:{wb.ot.toFixed(1)})</span>
                          </div>
                      ))}
                    </div>
                </div>
                <div className="w-full md:w-72 bg-slate-900 print:bg-slate-50 text-white print:text-slate-900 p-4 rounded-xl print:rounded-none border border-slate-800 print:border-slate-900 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold opacity-70"><span>Jumlah Pendapatan:</span><span>RM {selectedPayslip.payInfo.grossPay.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[10px] font-bold opacity-70 border-b border-slate-700 pb-2"><span>Potongan (Advance):</span><span className="text-rose-400">-RM {selectedPayslip.payInfo.totalAdvance.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center pt-1"><span className="uppercase text-[10px] font-black tracking-widest">Gaji Bersih</span><span className="text-xl font-black">RM {selectedPayslip.payInfo.netPay.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mt-4 mb-8 px-8 text-[9px] font-black text-slate-400 print:text-slate-900 uppercase tracking-[0.2em]">
                <div className="text-center"><div className="w-full border-b-[1px] border-slate-900 mb-2 h-12"></div><p>Pengurus Operasi</p></div>
                <div className="text-center"><div className="w-full border-b-[1px] border-slate-900 mb-2 h-12"></div><p>Tandatangan Pekerja</p></div>
              </div>

              <div className="absolute -right-20 top-0 flex flex-col gap-4 print-hide">
                <button onClick={() => window.print()} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 border-4 border-white"><Printer className="w-6 h-6" /></button>
                <button onClick={() => setSelectedPayslip(null)} className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-200 hover:scale-110"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                  @page { size: A5 landscape; margin: 0mm; }
                  body, html { margin: 0 !important; padding: 0 !important; width: 210mm !important; height: 148mm !important; overflow: hidden !important; background-color: white !important; }
                  .print-hide { display: none !important; }
                  .print-modal-content { width: 210mm !important; height: 148mm !important; padding: 10mm 15mm !important; border: none !important; box-shadow: none !important; box-sizing: border-box !important; display: flex !important; flex-direction: column !important; page-break-after: always; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  * { box-sizing: border-box !important; }
              }
            `}} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-[90vh]">
            {/* Header ERP */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setMainMode('landing')} className="p-3 bg-white border rounded-xl shadow-sm text-slate-500 hover:text-emerald-600"><ChevronLeft className="w-6 h-6"/></button>
                <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-800">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BarChart3 className="w-6 h-6" /></div>
                  Pusat ERP <span className="text-emerald-600 font-black hidden sm:inline">Pengurusan</span>
                </h1>
              </div>
              <nav className="flex p-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-x-auto no-scrollbar gap-1">
                {[{ id: 'overview', label: 'Ringkasan', icon: LayoutDashboard }, { id: 'staff_view', label: 'Payroll Staf', icon: Users }].map((tab) => (
                  <button key={tab.id} onClick={() => setErpTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${erpTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </nav>
            </header>

            <main className="flex-1">
              {!user ? <div className="py-40 text-center"><Clock className="w-12 h-12 animate-spin mx-auto text-emerald-500 mb-4" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Pengkalan Data...</p></div> : (
                <>
                  {erpTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      {/* STATS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Jumlah Jualan (POS)" value={erpTotals.totalSales} icon={ShoppingBag} color="bg-emerald-600" />
                        <StatCard title="Kos Operasi/Belian" value={erpTotals.totalExpenses} icon={Receipt} color="bg-rose-600" />
                        <StatCard title="Unjuran Gaji Staf" value={erpTotals.totalWages} icon={Users} color="bg-blue-600" />
                        <StatCard title="Jumlah Transaksi" value={allSales.length} icon={ShoppingCart} color="bg-amber-500" />
                      </div>

                      {/* UNTUNG BERSIH & GRAF */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-b-8 border-b-emerald-500 lg:col-span-1 flex flex-col justify-center">
                          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Anggaran Untung Bersih</div>
                          <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter break-words">RM {erpTotals.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="mt-8 space-y-2 text-xs font-bold text-slate-500">
                            <div className="flex justify-between"><span className="text-emerald-600">Jualan Kasar</span><span>+RM {erpTotals.totalSales.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-rose-500">Tolak Operasi</span><span>-RM {erpTotals.totalExpenses.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-blue-500">Tolak Gaji Staf</span><span>-RM {erpTotals.totalWages.toFixed(2)}</span></div>
                          </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm lg:col-span-2">
                          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Trend Jualan Lokasi (Sync dari POS)</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={erpSalesChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={v => v ? v.split('-').slice(1).join('/') : ''} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="evoke" name="Evoke" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} />
                                <Area type="monotone" dataKey="kgBelah2" name="Kg Belah 2" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {erpTab === 'staff_view' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="bg-emerald-700 p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center shadow-xl">
                        <Users className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10" />
                        <div className="relative z-10 space-y-2">
                          <h2 className="text-4xl font-black tracking-tighter uppercase">Payroll Kakitangan (Sync)</h2>
                          <p className="text-emerald-100 font-medium opacity-90 text-sm">Data kehadiran direkod automatik setiap kali staf tutup syif di POS.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {staffConfig.map(staff => {
                          const records = staffWorkRecords.filter(r => r.staffId === staff.id);
                          const payInfo = calculatePayroll(records, staff.rate);
                          return (
                            <div key={staff.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-xl transition-all border-b-4 border-b-emerald-600">
                                <div className="flex justify-between mb-6">
                                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl uppercase shadow-sm">{staff.name[0]}</div>
                                  <div className="text-right">
                                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Net Pay</div>
                                    <div className="text-xl font-black text-emerald-600">RM {payInfo.netPay.toFixed(2)}</div>
                                  </div>
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-800">{staff.name}</h4>
                                <div className="space-y-3 text-xs mb-8">
                                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500 font-bold uppercase">Jam Asas</span><span className="font-black">{payInfo.totalRegularHours}j</span></div>
                                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500 font-bold uppercase">Jam OT (1.5x)</span><span className="font-black text-rose-500">{payInfo.totalOTHours}j</span></div>
                                </div>
                                <button onClick={() => setSelectedPayslip({ ...staff, payInfo })} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg flex justify-center items-center gap-2"><FileText size={16}/> Generate Payslip</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
            
            {user && (
              <footer className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap justify-center gap-4">
                <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-900 transition-all"><FileSpreadsheet className="w-4 h-4" /> Download Laporan Excel</button>
              </footer>
            )}
          </div>
        )}
      </div>
    );
  }

  // Jika tiada yang sepadan, render home sahaja
  return null;
};

export default App;