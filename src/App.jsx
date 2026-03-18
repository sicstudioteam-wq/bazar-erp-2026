import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, MapPin, Calendar, ArrowUpRight, 
  ArrowDownRight, LayoutDashboard, Wallet, Receipt, Calculator, 
  ChevronDown, ChevronUp, Smartphone, Banknote, History, Package, 
  Layers, Clock, Box, Plus, Save, FileText, Printer, Trash2, Edit3, 
  DollarSign, CheckCircle2, X, Tag, AlertTriangle, Download,
  FileSpreadsheet, Presentation, Database, Upload, RefreshCcw, Building2
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

// --- DATA AWAL ---
const INITIAL_PRICES = [
  { id: 'p_ayam10', item: 'Ayam XL (10pcs)', price: 47.00 },
  { id: 'p_ayam14', item: 'Ayam XL (14pcs)', price: 47.00 },
  { id: 'p_sosej', item: 'Sosej Saudi', price: 18.00 },
  { id: 'p_sosej_chz', item: 'Sosej Cheese', price: 26.00 },
  { id: 'p_pepper', item: 'Pepper Salt', price: 25.00 },
  { id: 'p_chili', item: 'Chili Powder', price: 25.00 },
  { id: 'p_paprika', item: 'Paprika', price: 17.00 }
];

const INITIAL_SALES = [
  { id: 'init-sale-1', date: '2026-02-19', kgBelah2Cash: 0, kgBelah2QR: 0, evokeCash: 439.00, evokeQR: 288.00 },
  { id: 'init-sale-2', date: '2026-02-20', kgBelah2Cash: 0, kgBelah2QR: 0, evokeCash: 443.00, evokeQR: 494.00 },
  { id: 'init-sale-3', date: '2026-02-21', kgBelah2Cash: 120.00, kgBelah2QR: 109.00, evokeCash: 256.00, evokeQR: 318.00 }
];

const INITIAL_STOCK_RECORDS = [
  { id: 'stk-e-1', date: '2026-02-19', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 6, total: 282.00 }
];

const INITIAL_EXPENSE_RECORDS = [
  { id: 'init-exp-k1', date: '2026-02-19', location: 'Kg Belah 2', item: 'Duit Tapak', amount: 550, isAdvanced: false }
];

const INITIAL_STAFF_RECORDS = [
  { id: 'init-stf-1', date: '2026-02-19', staffId: 'hadi', hours: 4.0, bonus: 0 }
];

const INITIAL_STAFF_PROFILES = [
  { id: 'hadi', name: 'Hadi', rate: 8.20 },
  { id: 'arhami', name: 'Arhami', rate: 8.20 },
  { id: 'yusof', name: 'Yusof', rate: 8.20 }
];

// --- HELPER COMPONENTS ---

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

const DetailRow = ({ label, value, detailData, id, colorClass, expanded, toggleExpand }) => {
  const isExpanded = expanded[id];
  return (
    <div className="border-b border-slate-100 last:border-0 group">
      <button 
        onClick={() => toggleExpand(id)}
        className="w-full flex justify-between items-center py-4 px-2 rounded-2xl hover:bg-slate-50 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
          <span className="text-slate-700 font-bold text-sm tracking-tight">{label}</span>
        </div>
        <span className={`font-black ${colorClass}`}>RM {typeof value === 'number' ? value.toFixed(2) : '0.00'}</span>
      </button>
      {isExpanded ? (
        <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200 border-l-2 border-indigo-100 ml-6">
          {detailData && detailData.length > 0 ? detailData.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs items-center py-0.5">
              <span className="text-slate-500 font-medium">{item.item}</span>
              <span className="text-slate-900 font-black tracking-tight">RM {typeof item.amount === 'number' ? item.amount.toFixed(2) : '0.00'}</span>
            </div>
          )) : <div className="text-[10px] text-slate-400 italic">Tiada butiran direkodkan.</div>}
        </div>
      ) : null}
    </div>
  );
};

const mergeInitialAndFetched = (initial, fetched) => {
  const combined = [...initial];
  fetched.forEach(f => {
    const idx = combined.findIndex(c => c.id === f.id);
    if (idx >= 0) {
      if (f.deleted) combined.splice(idx, 1);
      else combined[idx] = { ...combined[idx], ...f };
    } else {
      if (!f.deleted) combined.push(f);
    }
  });
  return combined.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
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
    let totalAllowance = 0;
    let totalBonus = 0;
    let totalAdvance = 0;
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

    let totalRegularHours = 0;
    let totalOTHours = 0;
    const weeklyBreakdown = [];

    Object.values(weeklyHours).sort((a,b) => {
        const aParts = a.startDate.split('/');
        const bParts = b.startDate.split('/');
        if(aParts.length===3 && bParts.length===3) {
          const aStr = `${aParts[2]}${aParts[1]}${aParts[0]}`;
          const bStr = `${bParts[2]}${bParts[1]}${bParts[0]}`;
          return aStr.localeCompare(bStr);
        }
        return 0;
    }).forEach(week => {
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

    return { 
        totalRegularHours, 
        totalOTHours, 
        basicPay, 
        otRate,
        otPay, 
        totalAllowance, 
        totalBonus, 
        totalAdvance,
        grossPay,
        netPay,
        weeklyBreakdown 
    };
};

// --- APP COMPONENT ---

const App = () => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState('overview');
  const [subTab, setSubTab] = useState('sales'); 
  const [expanded, setExpanded] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingStaffProfile, setEditingStaffProfile] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isReportSlide, setIsReportSlide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [logoError, setLogoError] = useState(false);
  
  const todayStr = useMemo(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  }, []);

  const [fetchedSales, setFetchedSales] = useState([]);
  const [fetchedStock, setFetchedStock] = useState([]);
  const [fetchedExpenses, setFetchedExpenses] = useState([]);
  const [fetchedStaffWork, setFetchedStaffWork] = useState([]);
  const [fetchedStaffProfiles, setFetchedStaffProfiles] = useState([]);
  const [fetchedPrices, setFetchedPrices] = useState([]);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('');
  const [staffHours, setStaffHours] = useState('');
  const [staffMinutes, setStaffMinutes] = useState('');

  // Firebase Init
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { setAuthError(error.message); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    const salesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sales');
    const stockRef = collection(db, 'artifacts', appId, 'public', 'data', 'stock');
    const expenseRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
    const staffRef = collection(db, 'artifacts', appId, 'public', 'data', 'staff_work');
    const staffProfileRef = collection(db, 'artifacts', appId, 'public', 'data', 'staff_profiles');
    const priceRef = collection(db, 'artifacts', appId, 'public', 'data', 'stock_prices');

    const unsubSales = onSnapshot(salesRef, snap => setFetchedSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStock = onSnapshot(stockRef, snap => setFetchedStock(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExpense = onSnapshot(expenseRef, snap => setFetchedExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(staffRef, snap => setFetchedStaffWork(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaffProfile = onSnapshot(staffProfileRef, snap => setFetchedStaffProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubPrices = onSnapshot(priceRef, snap => setFetchedPrices(snap.docs.map(d => ({ id: d.id, dbId: d.id, ...d.data() }))));

    return () => { unsubSales(); unsubStock(); unsubExpense(); unsubStaff(); unsubStaffProfile(); unsubPrices(); };
  }, [user]);

  // Derived States
  const salesRecords = useMemo(() => mergeInitialAndFetched(INITIAL_SALES, fetchedSales), [fetchedSales]);
  const stockRecords = useMemo(() => mergeInitialAndFetched(INITIAL_STOCK_RECORDS, fetchedStock), [fetchedStock]);
  const expenseRecords = useMemo(() => mergeInitialAndFetched(INITIAL_EXPENSE_RECORDS, fetchedExpenses), [fetchedExpenses]);
  const staffWorkRecords = useMemo(() => mergeInitialAndFetched(INITIAL_STAFF_RECORDS, fetchedStaffWork), [fetchedStaffWork]);
  
  const staffConfig = useMemo(() => {
    const combined = [...INITIAL_STAFF_PROFILES];
    fetchedStaffProfiles.forEach(fs => {
      const idx = combined.findIndex(c => c.id === fs.id);
      if (idx >= 0) {
        if (fs.deleted) combined.splice(idx, 1);
        else combined[idx] = { ...combined[idx], ...fs };
      } else {
        if (!fs.deleted) combined.push(fs);
      }
    });
    return combined;
  }, [fetchedStaffProfiles]);

  const stockPrices = useMemo(() => {
    const combined = [...INITIAL_PRICES];
    fetchedPrices.forEach(fp => {
      const idx = combined.findIndex(c => c.id === fp.id);
      if (idx >= 0) {
        if (fp.deleted) combined.splice(idx, 1);
        else combined[idx] = { ...combined[idx], ...fp };
      } else {
        if (!fp.deleted) combined.push(fp);
      }
    });
    return combined;
  }, [fetchedPrices]);

  const totals = useMemo(() => {
    const totalSales = salesRecords.reduce((acc, curr) => acc + Number(curr.kgBelah2Cash ?? curr.suteraCash ?? 0) + Number(curr.kgBelah2QR ?? curr.suteraQR ?? 0) + Number(curr.evokeCash || 0) + Number(curr.evokeQR || 0), 0);
    const totalCogs = stockRecords.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    const totalExpenses = expenseRecords.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const uniqueStaffIds = [...new Set(staffWorkRecords.map(r => r.staffId))];
    const totalWages = uniqueStaffIds.reduce((acc, staffId) => {
      const staff = staffConfig.find(s => s.id === staffId) || { rate: 8.20 };
      const records = staffWorkRecords.filter(r => r.staffId === staffId);
      const payInfo = calculatePayroll(records, staff.rate);
      return acc + Number(payInfo.grossPay || 0);
    }, 0);
    return { totalSales, totalCogs, totalExpenses, totalWages, netProfit: totalSales - totalCogs - totalExpenses - totalWages };
  }, [salesRecords, stockRecords, expenseRecords, staffWorkRecords, staffConfig]);

  const salesChartData = useMemo(() => {
    const groups = {};
    salesRecords.forEach(r => {
      if (!groups[r.date]) groups[r.date] = { date: r.date, evoke: 0, kgBelah2: 0 };
      groups[r.date].evoke += (Number(r.evokeCash || 0) + Number(r.evokeQR || 0));
      groups[r.date].kgBelah2 += (Number(r.kgBelah2Cash ?? r.suteraCash ?? 0) + Number(r.kgBelah2QR ?? r.suteraQR ?? 0));
    });
    return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [salesRecords]);

  // Event Handlers
  const saveToFirestore = async (collectionName, id, data) => {
    const path = `artifacts/${appId}/public/data/${collectionName}`;
    if (id && id.startsWith('init-')) {
        await setDoc(doc(db, path, id), data, { merge: true });
    } else if (id) {
        await updateDoc(doc(db, path, id), data);
    } else {
        await addDoc(collection(db, path), data);
    }
  };

  const handleDownloadExcel = () => {
    let csv = "Tarikh,KB2 Cash,KB2 QR,Evoke Cash,Evoke QR,Total\n";
    salesRecords.forEach(s => {
      const total = (Number(s.kgBelah2Cash??s.suteraCash??0) + Number(s.kgBelah2QR??s.suteraQR??0) + Number(s.evokeCash||0) + Number(s.evokeQR||0));
      csv += `${s.date},${s.kgBelah2Cash??s.suteraCash??0},${s.kgBelah2QR??s.suteraQR??0},${s.evokeCash||0},${s.evokeQR||0},${total.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bazar_2026_Sales_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleBackupData = () => {
    const data = { sales: salesRecords, stock: stockRecords, expenses: expenseRecords, staff: staffWorkRecords };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Bazar_2026.json`;
    a.click();
  };

  const startEdit = (record, tab) => {
    setEditingRecord(record);
    setSubTab(tab);
    setDuplicateAlert(null);
  };

  const deleteRecord = async (col, id) => {
    if (id.startsWith('init-') || col === 'staff_profiles') {
        await setDoc(doc(db, `artifacts/${appId}/public/data/${col}`, id), { deleted: true }, { merge: true });
    } else {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/${col}`, id));
    }
  };

  const handleAddSales = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const date = fd.get('date');
    if (!editingRecord) {
      const existing = salesRecords.find(r => r.date === date);
      if (existing) { setDuplicateAlert({ type: 'sales', record: existing, label: `Tarikh ${date}` }); return; }
    }
    await saveToFirestore('sales', editingRecord?.id, {
      date, kgBelah2Cash: parseFloat(fd.get('sc') || 0), kgBelah2QR: parseFloat(fd.get('sq') || 0), evokeCash: parseFloat(fd.get('ec') || 0), evokeQR: parseFloat(fd.get('eq') || 0)
    });
    setEditingRecord(null); setDuplicateAlert(null); e.target.reset();
  };

  // --- HALAMAN PREVIEW SLIP GAJI ---
  if (selectedPayslip) {
    return (
      <div className="min-h-screen bg-slate-200 p-4 md:p-8 print:p-0 print:bg-white flex justify-center items-center font-sans">
        {/* Kontena A5 Fit Area */}
        <div className="bg-white border-[2px] border-slate-900 text-slate-900 shadow-2xl relative flex flex-col mx-auto print-modal-content w-full max-w-[210mm] min-h-[148mm]">
          
          <div className="flex justify-between items-center border-b-[4px] border-slate-900 pb-4 mb-5 px-8 pt-8">
             <div className="w-1/4 flex justify-start items-center">
                {!logoError ? (
                  <img 
                      src="/logo.png" 
                      alt="Logo" 
                      className="w-20 h-auto max-h-20 object-contain print:filter-none"
                      style={{ filter: 'grayscale(100%) contrast(150%)', mixBlendMode: 'multiply' }}
                      onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200">
                    <Building2 className="w-10 h-10 text-slate-400" />
                  </div>
                )}
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
             <div>
               <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Nama Kakitangan</div>
               <div className="text-lg font-black uppercase">{selectedPayslip.name}</div>
             </div>
             <div className="text-right">
               <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Kategori Jawatan</div>
               <div className="text-sm font-bold uppercase text-slate-700">Operasi Bazar</div>
             </div>
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
               <div className="flex justify-between text-[10px] font-bold opacity-70">
                 <span>Jumlah Pendapatan:</span>
                 <span>RM {selectedPayslip.payInfo.grossPay.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold opacity-70 border-b border-slate-700 pb-2">
                 <span>Potongan (Advance):</span>
                 <span className="text-rose-400">-RM {selectedPayslip.payInfo.totalAdvance.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pt-1">
                  <span className="uppercase text-[10px] font-black tracking-widest">Gaji Bersih</span>
                  <span className="text-xl font-black">RM {selectedPayslip.payInfo.netPay.toFixed(2)}</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mt-4 mb-8 px-8 text-[9px] font-black text-slate-400 print:text-slate-900 uppercase tracking-[0.2em]">
             <div className="text-center">
               <div className="w-full border-b-[1px] border-slate-900 mb-2 h-12"></div>
               <p>Pengurus Operasi</p>
             </div>
             <div className="text-center">
               <div className="w-full border-b-[1px] border-slate-900 mb-2 h-12"></div>
               <p>Tandatangan Pekerja</p>
             </div>
          </div>

          {/* Butang Aksi Preview */}
          <div className="absolute -right-20 top-0 flex flex-col gap-4 print-hide">
            <button onClick={() => window.print()} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-4 border-white"><Printer className="w-6 h-6" /></button>
            <button onClick={() => setSelectedPayslip(null)} className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-200 hover:scale-110 transition-all"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Global Print Styles for A5 Landscape */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
              @page { 
                size: A5 landscape; 
                margin: 0mm; 
              }
              body, html { 
                margin: 0 !important; 
                padding: 0 !important; 
                width: 210mm !important; 
                height: 148mm !important; 
                overflow: hidden !important;
                background-color: white !important;
              }
              .print-hide { display: none !important; }
              .print-modal-content { 
                width: 210mm !important; 
                height: 148mm !important; 
                padding: 10mm 15mm !important; 
                border: none !important; 
                box-shadow: none !important; 
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                page-break-after: always;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              * { box-sizing: border-box !important; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-[90vh]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Box className="w-7 h-7" /></div>
             Bazar 2026 <span className="text-indigo-600">ERP</span>
          </h1>
          <nav className="flex p-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-x-auto no-scrollbar gap-1">
            {[
              { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'input', label: 'Input Data', icon: Edit3 },
              { id: 'staff_view', label: 'Payroll', icon: Users }
            ].map((tab) => (
              <button 
                key={tab.id} onClick={() => {setActiveTab(tab.id); setEditingRecord(null); setDuplicateAlert(null);}}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1">
          {!user ? <div className="py-40 text-center"><Clock className="w-12 h-12 animate-spin mx-auto text-indigo-500 mb-4" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memulakan Sistem...</p></div> : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Jumlah Jualan" value={totals.totalSales} icon={ShoppingBag} color="bg-indigo-600" />
                    <StatCard title="Kos Gaji" value={totals.totalWages} icon={Users} color="bg-blue-600" />
                    <StatCard title="Kos Stok" value={totals.totalCogs} icon={Package} color="bg-amber-600" />
                    <StatCard title="Belanja Operasi" value={totals.totalExpenses} icon={Receipt} color="bg-rose-600" />
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-b-8 border-b-emerald-500">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Anggaran Untung Bersih</div>
                    <div className="text-5xl font-black text-slate-900 tracking-tighter">RM {totals.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              )}

              {activeTab === 'input' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 h-fit sticky top-8">
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                      {['sales', 'stock', 'expenses', 'staff'].map(t => (
                        <button key={t} onClick={() => {setSubTab(t); setEditingRecord(null);}} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${subTab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                      ))}
                    </div>
                    {duplicateAlert && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-600 font-bold mb-4">
                        Data {duplicateAlert.label} sudah wujud! <button onClick={() => startEdit(duplicateAlert.record, duplicateAlert.type)} className="underline ml-1">Klik untuk kemaskini.</button>
                      </div>
                    )}
                    {subTab === 'sales' && (
                      <form onSubmit={handleAddSales} className="space-y-4">
                        <input name="date" type="date" required defaultValue={editingRecord?.date || todayStr} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" />
                        <div className="grid grid-cols-2 gap-2">
                          <input name="sc" placeholder="KB2 Tunai" type="number" step="0.01" defaultValue={editingRecord?.kgBelah2Cash} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs" />
                          <input name="sq" placeholder="KB2 QR" type="number" step="0.01" defaultValue={editingRecord?.kgBelah2QR} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase">{editingRecord ? 'Kemaskini' : 'Simpan'}</button>
                      </form>
                    )}
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm h-full min-h-[500px]">
                    <div className="p-6 border-b bg-slate-50 flex justify-between items-center text-[10px] font-black uppercase text-slate-500">Pangkalan Data Rekod</div>
                    <div className="overflow-x-auto">
                      {subTab === 'sales' && (
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase">
                            <tr><th className="p-4">Tarikh</th><th className="p-4">KB2</th><th className="p-4 text-right">Aksi</th></tr>
                          </thead>
                          <tbody className="divide-y text-xs">
                            {salesRecords.map(s => (
                              <tr key={s.id} className="hover:bg-slate-50">
                                <td className="p-4 font-bold">{s.date}</td>
                                <td className="p-4">RM {(Number(s.kgBelah2Cash??s.suteraCash??0) + Number(s.kgBelah2QR??s.suteraQR??0)).toFixed(2)}</td>
                                <td className="p-4 text-right"><button onClick={() => startEdit(s, 'sales')} className="p-2 text-indigo-600"><Edit3 className="w-3.5 h-3.5"/></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'staff_view' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {staffConfig.map(staff => {
                    const records = staffWorkRecords.filter(r => r.staffId === staff.id);
                    const payInfo = calculatePayroll(records, staff.rate);
                    return (
                      <div key={staff.id} className="bg-white rounded-[2.5rem] border p-8 hover:shadow-xl transition-all">
                        <div className="flex justify-between mb-6">
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">{staff.name[0]}</div>
                          <div className="text-right">
                             <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Net Pay</div>
                             <div className="text-lg font-black text-emerald-600">RM {payInfo.netPay.toFixed(2)}</div>
                          </div>
                        </div>
                        <h4 className="text-lg font-black uppercase mb-4">{staff.name}</h4>
                        <button onClick={() => setSelectedPayslip({ ...staff, payInfo })} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Generate Payslip</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {user && (
          <footer className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap justify-center gap-4">
             <button onClick={() => setIsReportSlide(true)} className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-md"><Presentation className="w-4 h-4" /> Report Slide</button>
             <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-md"><FileSpreadsheet className="w-4 h-4" /> Download Excel</button>
             <button onClick={handleBackupData} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase shadow-md"><Database className="w-4 h-4" /> Backup Data</button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;