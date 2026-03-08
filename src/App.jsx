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
  FileSpreadsheet, Presentation, Database, Upload, RefreshCcw
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

// --- DATA AWAL (MIGRASI EXCEL) - DIKEKALKAN SEPENUHNYA ---
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
  { id: 'init-sale-3', date: '2026-02-21', kgBelah2Cash: 120.00, kgBelah2QR: 109.00, evokeCash: 256.00, evokeQR: 318.00 },
  { id: 'init-sale-4', date: '2026-02-22', kgBelah2Cash: 107.00, kgBelah2QR: 103.00, evokeCash: 434.00, evokeQR: 441.00 },
  { id: 'init-sale-5', date: '2026-02-23', kgBelah2Cash: 218.00, kgBelah2QR: 42.00, evokeCash: 325.00, evokeQR: 265.00 },
  { id: 'init-sale-6', date: '2026-02-24', kgBelah2Cash: 229.00, kgBelah2QR: 128.00, evokeCash: 362.00, evokeQR: 294.00 },
  { id: 'init-sale-7', date: '2026-02-25', kgBelah2Cash: 129.00, kgBelah2QR: 228.00, evokeCash: 290.00, evokeQR: 548.00 },
  { id: 'init-sale-8', date: '2026-02-26', kgBelah2Cash: 228.00, kgBelah2QR: 201.00, evokeCash: 180.00, evokeQR: 498.00 },
  { id: 'init-sale-9', date: '2026-02-27', kgBelah2Cash: 250.00, kgBelah2QR: 169.00, evokeCash: 316.00, evokeQR: 354.00 },
  { id: 'init-sale-10', date: '2026-02-28', kgBelah2Cash: 208.00, kgBelah2QR: 200.00, evokeCash: 465.00, evokeQR: 400.00 },
  { id: 'init-sale-11', date: '2026-03-01', kgBelah2Cash: 327.00, kgBelah2QR: 200.00, evokeCash: 363.00, evokeQR: 400.00 },
  { id: 'init-sale-12', date: '2026-03-02', kgBelah2Cash: 137.00, kgBelah2QR: 43.00, evokeCash: 251.00, evokeQR: 490.00 },
  { id: 'init-sale-13', date: '2026-03-03', kgBelah2Cash: 110.00, kgBelah2QR: 104.00, evokeCash: 412.00, evokeQR: 345.00 },
  { id: 'init-sale-14', date: '2026-03-04', kgBelah2Cash: 181.00, kgBelah2QR: 58.00, evokeCash: 535.00, evokeQR: 260.00 }
];

const INITIAL_STOCK_RECORDS = [
  // EVOKE
  { id: 'stk-e-1', date: '2026-02-19', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 6, total: 282.00 },
  { id: 'stk-e-2', date: '2026-02-19', location: 'Evoke', item: 'Sosej Saudi', qty: 5, total: 90.00 },
  { id: 'stk-e-3', date: '2026-02-19', location: 'Evoke', item: 'Sosej Cheese', qty: 1, total: 26.00 },
  { id: 'stk-e-4', date: '2026-02-19', location: 'Evoke', item: 'Pepper Salt', qty: 1, total: 25.00 },
  { id: 'stk-e-5', date: '2026-02-20', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 7, total: 329.00 },
  { id: 'stk-e-6', date: '2026-02-20', location: 'Evoke', item: 'Sosej Saudi', qty: 6, total: 108.00 },
  { id: 'stk-e-7', date: '2026-02-21', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 6, total: 282.00 },
  { id: 'stk-e-8', date: '2026-02-21', location: 'Evoke', item: 'Sosej Saudi', qty: 5, total: 90.00 },
  { id: 'stk-e-9', date: '2026-02-22', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 7, total: 329.00 },
  { id: 'stk-e-10', date: '2026-02-22', location: 'Evoke', item: 'Sosej Saudi', qty: 5, total: 90.00 },
  { id: 'stk-e-11', date: '2026-02-23', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 5, total: 235.00 },
  { id: 'stk-e-12', date: '2026-02-23', location: 'Evoke', item: 'Sosej Saudi', qty: 5, total: 90.00 },
  { id: 'stk-e-13', date: '2026-02-24', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 5, total: 235.00 },
  { id: 'stk-e-14', date: '2026-02-24', location: 'Evoke', item: 'Sosej Saudi', qty: 5, total: 90.00 },
  { id: 'stk-e-15', date: '2026-02-25', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 6, total: 282.00 },
  { id: 'stk-e-16', date: '2026-02-25', location: 'Evoke', item: 'Sosej Saudi', qty: 6, total: 108.00 },
  { id: 'stk-e-17', date: '2026-02-26', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 5, total: 235.00 },
  { id: 'stk-e-18', date: '2026-02-26', location: 'Evoke', item: 'Sosej Saudi', qty: 6, total: 108.00 },
  { id: 'stk-e-19', date: '2026-02-27', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 7, total: 329.00 },
  { id: 'stk-e-20', date: '2026-02-27', location: 'Evoke', item: 'Sosej Saudi', qty: 6, total: 108.00 },
  { id: 'stk-e-21', date: '2026-02-28', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 6, total: 282.00 },
  { id: 'stk-e-22', date: '2026-02-28', location: 'Evoke', item: 'Sosej Saudi', qty: 6, total: 108.00 },
  { id: 'stk-e-23', date: '2026-03-01', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 5, total: 235.00 },
  { id: 'stk-e-24', date: '2026-03-01', location: 'Evoke', item: 'Sosej Saudi', qty: 7, total: 126.00 },
  { id: 'stk-e-25', date: '2026-03-02', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 3, total: 141.00 },
  { id: 'stk-e-26', date: '2026-03-02', location: 'Evoke', item: 'Sosej Saudi', qty: 4, total: 72.00 },
  { id: 'stk-e-27', date: '2026-03-03', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 2, total: 94.00 },
  { id: 'stk-e-28', date: '2026-03-03', location: 'Evoke', item: 'Sosej Saudi', qty: 3, total: 54.00 },
  { id: 'stk-e-29', date: '2026-03-04', location: 'Evoke', item: 'Ayam XL (10pcs)', qty: 6, total: 282.00 },
  { id: 'stk-e-30', date: '2026-03-04', location: 'Evoke', item: 'Sosej Saudi', qty: 4, total: 72.00 },

  // KG BELAH 2
  { id: 'init-stk-k-1', date: '2026-02-21', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 2, total: 94.00 },
  { id: 'init-stk-k-2', date: '2026-02-21', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 2, total: 36.00 },
  { id: 'init-stk-k-3', date: '2026-02-21', location: 'Kg Belah 2', item: 'Sosej Cheese', qty: 1, total: 26.00 },
  { id: 'init-stk-k-4', date: '2026-02-21', location: 'Kg Belah 2', item: 'Pepper Salt', qty: 1, total: 25.00 },
  { id: 'init-stk-k-5', date: '2026-02-22', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 2, total: 94.00 },
  { id: 'init-stk-k-6', date: '2026-02-22', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 2, total: 36.00 },
  { id: 'init-stk-k-7', date: '2026-02-23', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 2, total: 94.00 },
  { id: 'init-stk-k-8', date: '2026-02-23', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 3, total: 54.00 },
  { id: 'init-stk-k-9', date: '2026-02-24', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 3, total: 141.00 },
  { id: 'init-stk-k-10', date: '2026-02-24', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 3, total: 54.00 },
  { id: 'init-stk-k-11', date: '2026-02-25', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 3, total: 141.00 },
  { id: 'init-stk-k-12', date: '2026-02-25', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 4, total: 72.00 },
  { id: 'init-stk-k-13', date: '2026-02-26', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 3, total: 141.00 },
  { id: 'init-stk-k-14', date: '2026-02-26', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 4, total: 72.00 },
  { id: 'init-stk-k-15', date: '2026-02-27', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 4, total: 188.00 },
  { id: 'init-stk-k-16', date: '2026-02-27', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 6, total: 108.00 },
  { id: 'init-stk-k-17', date: '2026-02-28', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 3, total: 141.00 },
  { id: 'init-stk-k-18', date: '2026-02-28', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 3, total: 54.00 },
  { id: 'init-stk-k-19', date: '2026-03-01', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 4, total: 188.00 },
  { id: 'init-stk-k-20', date: '2026-03-01', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 4, total: 72.00 },
  { id: 'init-stk-k-21', date: '2026-03-02', location: 'Kg Belah 2', item: 'Ayam XL (10pcs)', qty: 1, total: 47.00 },
  { id: 'init-stk-k-22', date: '2026-03-02', location: 'Kg Belah 2', item: 'Ayam XL (14pcs)', qty: 1, total: 47.00 },
  { id: 'init-stk-k-23', date: '2026-03-02', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 2, total: 36.00 },
  { id: 'init-stk-k-24', date: '2026-03-03', location: 'Kg Belah 2', item: 'Ayam XL (14pcs)', qty: 2, total: 94.00 },
  { id: 'init-stk-k-25', date: '2026-03-03', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 2, total: 36.00 },
  { id: 'init-stk-k-26', date: '2026-03-04', location: 'Kg Belah 2', item: 'Ayam XL (14pcs)', qty: 3, total: 141.00 },
  { id: 'init-stk-k-27', date: '2026-03-04', location: 'Kg Belah 2', item: 'Sosej Saudi', qty: 3, total: 54.00 }
];

const INITIAL_EXPENSE_RECORDS = [
  { id: 'init-exp-k1', date: '2026-02-19', location: 'Kg Belah 2', item: 'Duit Tapak', amount: 550, isAdvanced: false },
  { id: 'init-exp-k2', date: '2026-02-21', location: 'Kg Belah 2', item: 'Ais', amount: 7, isAdvanced: false },
  { id: 'init-exp-k3', date: '2026-02-22', location: 'Kg Belah 2', item: 'Ais', amount: 3.5, isAdvanced: false },
  { id: 'init-exp-k4', date: '2026-02-23', location: 'Kg Belah 2', item: 'Ais', amount: 3.5, isAdvanced: false },
  { id: 'init-exp-k5', date: '2026-02-25', location: 'Kg Belah 2', item: 'Ais', amount: 3.5, isAdvanced: false },
  { id: 'init-exp-k6', date: '2026-02-27', location: 'Kg Belah 2', item: 'Ais', amount: 3.5, isAdvanced: false },
  { id: 'init-exp-k7', date: '2026-02-28', location: 'Kg Belah 2', item: 'Ais', amount: 3.5, isAdvanced: false },
  { id: 'init-exp-k8', date: '2026-03-01', location: 'Kg Belah 2', item: 'Ais', amount: 3.5, isAdvanced: false },
  { id: 'init-exp-e1', date: '2026-02-19', location: 'Evoke', item: 'Duit Tapak', amount: 800, isAdvanced: false },
  { id: 'init-exp-e2', date: '2026-02-19', location: 'Evoke', item: 'Ais', amount: 6, isAdvanced: false },
  { id: 'init-exp-e3', date: '2026-02-21', location: 'Evoke', item: 'Ais', amount: 6, isAdvanced: false },
  { id: 'init-exp-e4', date: '2026-02-22', location: 'Evoke', item: 'Ais', amount: 3, isAdvanced: false },
  { id: 'init-exp-e5', date: '2026-02-23', location: 'Evoke', item: 'Ais', amount: 3, isAdvanced: false },
  { id: 'init-exp-e6', date: '2026-02-24', location: 'Evoke', item: 'Ais', amount: 6, isAdvanced: false },
  { id: 'init-exp-e7', date: '2026-02-25', location: 'Evoke', item: 'Ais', amount: 3, isAdvanced: false },
  { id: 'init-exp-e8', date: '2026-02-26', location: 'Evoke', item: 'Hutang Belanjawan (Ais)', amount: 9, isAdvanced: true },
  { id: 'init-exp-e9', date: '2026-02-27', location: 'Evoke', item: 'Ais', amount: 3, isAdvanced: false },
  { id: 'init-exp-e10', date: '2026-02-28', location: 'Evoke', item: 'Ais', amount: 3, isAdvanced: false },
  { id: 'init-exp-e11', date: '2026-03-01', location: 'Evoke', item: 'Ais', amount: 3, isAdvanced: false }
];

const INITIAL_STAFF_RECORDS = [
  { id: 'init-stf-1', date: '2026-02-19', staffId: 'hadi', hours: 4.0, bonus: 0 },
  { id: 'init-stf-2', date: '2026-02-20', staffId: 'hadi', hours: 4.1, bonus: 0 },
  { id: 'init-stf-3', date: '2026-02-21', staffId: 'hadi', hours: 4.5, bonus: 0 },
  { id: 'init-stf-4', date: '2026-02-22', staffId: 'hadi', hours: 4.1, bonus: 0 },
  { id: 'init-stf-5', date: '2026-02-23', staffId: 'hadi', hours: 4.5, bonus: 0 }
];

const INITIAL_STAFF_PROFILES = [
  { id: 'hadi', name: 'Hadi', rate: 8.20 },
  { id: 'arhami', name: 'Arhami', rate: 8.20 },
  { id: 'yusof', name: 'Yusof', rate: 8.20 }
];

// --- HELPER COMPONENTS & FUNCTIONS ---

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
  
  // State baru untuk amaran pertindanan data
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isReportSlide, setIsReportSlide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
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

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let startTotalMins = startH * 60 + startM;
      let endTotalMins = endH * 60 + endM;
      if (endTotalMins < startTotalMins) endTotalMins += 24 * 60; 
      let diffMins = endTotalMins - startTotalMins;
      const breakM = parseInt(breakMinutes) || 0;
      diffMins = Math.max(0, diffMins - breakM);
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      setStaffHours(h.toString());
      setStaffMinutes(m.toString());
    }
  }, [startTime, endTime, breakMinutes]);

  const calculatedDecimalHours = useMemo(() => {
    const h = parseInt(staffHours) || 0;
    const m = parseInt(staffMinutes) || 0;
    const decimal = Math.round((h + (m / 60)) * 10) / 10;
    return decimal > 0 ? decimal.toFixed(1) : '';
  }, [staffHours, staffMinutes]);

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

  const sortedSalesRecords = useMemo(() => {
    return [...salesRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [salesRecords]);

  const salesChartData = useMemo(() => {
    const groups = {};
    const records = salesRecords.length > 0 ? salesRecords : INITIAL_SALES;
    records.forEach(r => {
      if (!groups[r.date]) groups[r.date] = { date: r.date, evoke: 0, kgBelah2: 0 };
      groups[r.date].evoke += (Number(r.evokeCash || 0) + Number(r.evokeQR || 0));
      groups[r.date].kgBelah2 += (Number(r.kgBelah2Cash ?? r.suteraCash ?? 0) + Number(r.kgBelah2QR ?? r.suteraQR ?? 0));
    });
    return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [salesRecords]);

  const groupedStockByBranch = useMemo(() => {
     const groups = {};
     stockRecords.forEach(r => {
         const locationGroup = r.location === 'Sutera' ? 'Kg Belah 2' : r.location;
         const key = `${r.date}-${locationGroup}`;
         if (!groups[key]) groups[key] = { date: r.date, location: locationGroup, items: [], total: 0 };
         groups[key].items.push(r);
         groups[key].total += Number(r.total || 0);
     });
     return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [stockRecords]);

  const groupedExpensesByBranch = useMemo(() => {
      const groups = {};
      expenseRecords.forEach(r => {
          const locationGroup = r.location === 'Sutera' ? 'Kg Belah 2' : r.location; 
          const key = `${r.date}-${locationGroup}`;
          if (!groups[key]) groups[key] = { date: r.date, location: locationGroup, items: [], total: 0 };
          groups[key].items.push(r);
          groups[key].total += Number(r.amount || 0);
      });
      return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenseRecords]);

  const groupedStaff = useMemo(() => {
      const groups = {};
      staffWorkRecords.forEach(r => {
          const key = r.staffId;
          if (!groups[key]) groups[key] = { staffId: r.staffId, items: [], totalHours: 0, totalAdvance: 0, totalAllowance: 0 };
          groups[key].items.push(r);
          groups[key].totalHours += Number(r.hours || 0);
          groups[key].totalAdvance += Number(r.advance || 0);
          groups[key].totalAllowance += Number(r.allowance || 0) + Number(r.bonus || 0);
      });
      const sortedGroups = Object.values(groups).sort((a,b) => a.staffId.localeCompare(b.staffId));
      sortedGroups.forEach(g => {
          g.totalHours = Math.round(g.totalHours * 10) / 10;
          g.items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      });
      return sortedGroups;
  }, [staffWorkRecords]);


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

  const totals = useMemo(() => {
    const totalSales = salesRecords.reduce((acc, curr) => acc + Number(curr.kgBelah2Cash ?? curr.suteraCash ?? 0) + Number(curr.kgBelah2QR ?? curr.suteraQR ?? 0) + Number(curr.evokeCash || 0) + Number(curr.evokeQR || 0), 0);
    const kgBelah2CashTotal = salesRecords.reduce((acc, curr) => acc + Number(curr.kgBelah2Cash ?? curr.suteraCash ?? 0), 0);
    const kgBelah2QRTotal = salesRecords.reduce((acc, curr) => acc + Number(curr.kgBelah2QR ?? curr.suteraQR ?? 0), 0);
    const totalKgBelah2Sales = kgBelah2CashTotal + kgBelah2QRTotal;

    const evokeCashTotal = salesRecords.reduce((acc, curr) => acc + Number(curr.evokeCash || 0), 0);
    const evokeQRTotal = salesRecords.reduce((acc, curr) => acc + Number(curr.evokeQR || 0), 0);
    const totalEvokeSales = evokeCashTotal + evokeQRTotal;
    
    const totalCogs = stockRecords.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    const totalKgBelah2Cogs = stockRecords.filter(r => r.location === 'Kg Belah 2' || r.location === 'Sutera').reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    const totalEvokeCogs = stockRecords.filter(r => r.location === 'Evoke').reduce((acc, curr) => acc + Number(curr.total || 0), 0);

    const totalExpenses = expenseRecords.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalKgBelah2Exp = expenseRecords.filter(r => r.location === 'Kg Belah 2' || r.location === 'Sutera').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalEvokeExp = expenseRecords.filter(r => r.location === 'Evoke').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const uniqueStaffIds = [...new Set(staffWorkRecords.map(r => r.staffId))];
    const totalWages = uniqueStaffIds.reduce((acc, staffId) => {
      const staff = staffConfig.find(s => s.id === staffId) || { rate: 8.20 };
      const records = staffWorkRecords.filter(r => r.staffId === staffId);
      const payInfo = calculatePayroll(records, staff.rate);
      return acc + Number(payInfo.grossPay || 0);
    }, 0);

    const netProfit = totalSales - totalCogs - totalExpenses - totalWages;

    return {
      totalSales, totalKgBelah2Sales, totalEvokeSales,
      kgBelah2CashTotal, kgBelah2QRTotal, evokeCashTotal, evokeQRTotal,
      totalCogs, totalKgBelah2Cogs, totalEvokeCogs,
      totalExpenses, totalKgBelah2Exp, totalEvokeExp,
      totalWages,
      netProfit
    };
  }, [salesRecords, stockRecords, expenseRecords, staffWorkRecords, staffConfig]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const saveToFirestore = async (collectionName, id, data) => {
    if (id && id.startsWith('init-')) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), data, { merge: true });
    } else if (id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), data);
    } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), data);
    }
  };

  const handleAddSales = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const date = fd.get('date');
    
    // Semakan Double Entry (hanya jika mod tambah baru)
    if (!editingRecord) {
      const existing = salesRecords.find(r => r.date === date);
      if (existing) {
        setDuplicateAlert({ type: 'sales', record: existing, label: `Tarikh ${date}` });
        return;
      }
    }

    await saveToFirestore('sales', editingRecord?.id, {
      date: date,
      kgBelah2Cash: parseFloat(fd.get('sc') || 0),
      kgBelah2QR: parseFloat(fd.get('sq') || 0),
      evokeCash: parseFloat(fd.get('ec') || 0),
      evokeQR: parseFloat(fd.get('eq') || 0)
    });
    setEditingRecord(null);
    setDuplicateAlert(null);
    e.target.reset();
  };

  const handleAddMultiStock = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const date = fd.get('date');
    const location = fd.get('location');

    // Semakan Double Entry (hanya jika mod tambah baru)
    if (!editingRecord) {
      const existingGroup = groupedStockByBranch.find(g => g.date === date && g.location === location);
      if (existingGroup) {
        setDuplicateAlert({ type: 'stock', record: existingGroup, label: `${location} - ${date}` });
        return;
      }
    }

    if (editingRecord && editingRecord.items) {
        for (const p of stockPrices) {
            const qty = parseInt(fd.get(`qty_${p.id}`) || 0);
            const oldItem = editingRecord.items.find(i => i.item === p.item);

            if (oldItem) {
                if (qty > 0) {
                    await saveToFirestore('stock', oldItem.id, {
                        date, location, item: p.item, qty, total: qty * p.price
                    });
                } else {
                    await deleteRecord('stock', oldItem.id);
                }
            } else {
                if (qty > 0) {
                    await saveToFirestore('stock', null, {
                        date, location, item: p.item, qty, total: qty * p.price
                    });
                }
            }
        }
    } else {
        for (const p of stockPrices) {
            const qty = parseInt(fd.get(`qty_${p.id}`) || 0);
            if (qty > 0) {
                await saveToFirestore('stock', null, {
                    date, location, item: p.item, qty, total: qty * p.price
                });
            }
        }
    }
    setEditingRecord(null);
    setDuplicateAlert(null);
    e.target.reset();
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const date = fd.get('date');
    const location = fd.get('location');
    const item = fd.get('item');

    // Semakan Double Entry Per Item/Tarikh (hanya jika mod tambah baru)
    if (!editingRecord) {
      const existing = expenseRecords.find(r => r.date === date && r.location === location && r.item === item);
      if (existing) {
        setDuplicateAlert({ type: 'expenses', record: existing, label: `${item} (${location} - ${date})` });
        return;
      }
    }

    await saveToFirestore('expenses', editingRecord?.id, {
      date: date,
      location: location,
      item: item,
      amount: parseFloat(fd.get('amount') || 0),
      isAdvanced: fd.get('advanced') === 'on'
    });
    setEditingRecord(null);
    setDuplicateAlert(null);
    e.target.reset();
  };

  const handleAddStaffWork = async (e) => {
    e.preventDefault();
    const hours = parseFloat(calculatedDecimalHours || 0);
    if (hours <= 0) return;

    const fd = new FormData(e.target);
    const date = fd.get('date');
    const staffId = fd.get('staffId');

    // Semakan Kehadiran (hanya jika mod tambah baru)
    if (!editingRecord) {
      const existing = staffWorkRecords.find(r => r.date === date && r.staffId === staffId && !r.isAdjustment);
      if (existing) {
        setDuplicateAlert({ type: 'staff', record: existing, label: `${staffId} pada ${date}` });
        return;
      }
    }

    await saveToFirestore('staff_work', editingRecord?.id, {
      date: date,
      staffId: staffId,
      hours: hours,
      startTime: startTime,
      endTime: endTime,
      breakMinutes: parseInt(breakMinutes) || 0,
      isAdjustment: false
    });
    
    setEditingRecord(null);
    setDuplicateAlert(null);
    setStaffHours(''); setStaffMinutes(''); setStartTime(''); setEndTime(''); setBreakMinutes('');
    e.target.reset();
  };

  const handleAddFinance = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const type = fd.get('type');
    const amount = parseFloat(fd.get('amount') || 0);
    
    await saveToFirestore('staff_work', editingRecord?.isAdjustment ? editingRecord.id : null, {
      date: editingRecord?.date || todayStr,
      staffId: fd.get('staffId'),
      hours: 0,
      allowance: type === 'allowance' ? amount : 0,
      bonus: type === 'bonus' ? amount : 0,
      advance: type === 'advance' ? amount : 0,
      isAdjustment: true,
      desc: fd.get('desc') || ''
    });

    setEditingRecord(null);
    setDuplicateAlert(null);
    e.target.reset();
  };

  const handleStaffProfileSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const rate = parseFloat(fd.get('rate') || 8.20);
    
    if (editingStaffProfile) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff_profiles', editingStaffProfile.id), { name, rate }, { merge: true });
        setEditingStaffProfile(null);
    } else {
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff_profiles', id), { id, name, rate }, { merge: true });
    }
    e.target.reset();
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = fd.get('item');
    const price = parseFloat(fd.get('price') || 0);

    if (editingPrice) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stock_prices', editingPrice.id), { item, price }, { merge: true });
      setEditingPrice(null);
    } else {
      const id = 'p_' + item.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stock_prices', id), { id, item, price }, { merge: true });
    }
    e.target.reset();
  };

  const deleteRecord = async (col, id) => {
    if (id.startsWith('init-') || id.startsWith('stk-') || id.startsWith('p_') || col === 'staff_profiles') {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), { deleted: true }, { merge: true });
    } else {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id));
    }
  };

  const startEdit = (record, tab) => {
    setEditingRecord(record);
    setSubTab(tab);
    setDuplicateAlert(null); // Tutup amaran jika masuk mod edit

    if (tab === 'staff' && !record.isAdjustment && record.hours) {
      setStartTime(record.startTime || '');
      setEndTime(record.endTime || '');
      setBreakMinutes(record.breakMinutes ? record.breakMinutes.toString() : '');
      const h = Math.floor(record.hours);
      const m = Math.round((record.hours - h) * 60);
      setStaffHours(h.toString());
      setStaffMinutes(m.toString());
    } else {
      setStaffHours('');
      setStaffMinutes('');
      setStartTime('');
      setEndTime('');
      setBreakMinutes('');
    }
  };

  const handleDownloadExcel = () => {
    let csvContent = "LAPORAN JUALAN & KEWANGAN BAZAR 2026\n\n";
    csvContent += "Tarikh,Kg Belah 2 Tunai (RM),Kg Belah 2 QR (RM),Evoke Tunai (RM),Evoke QR (RM),Jumlah Jualan Harian (RM)\n";

    sortedSalesRecords.forEach(item => {
       const kbc = Number(item?.kgBelah2Cash ?? item?.suteraCash ?? 0);
       const kbq = Number(item?.kgBelah2QR ?? item?.suteraQR ?? 0);
       const evc = Number(item?.evokeCash || 0);
       const evq = Number(item?.evokeQR || 0);
       const total = kbc + kbq + evc + evq;
       csvContent += `${item.date},${kbc.toFixed(2)},${kbq.toFixed(2)},${evc.toFixed(2)},${evq.toFixed(2)},${total.toFixed(2)}\n`;
    });

    csvContent += `\n\nRINGKASAN KESELURUHAN\n`;
    csvContent += `Jumlah Jualan Keseluruhan,RM ${totals.totalSales.toFixed(2)}\n`;
    csvContent += `Jumlah Kos Stok,RM ${totals.totalCogs.toFixed(2)}\n`;
    csvContent += `Jumlah Belanja Operasi,RM ${totals.totalExpenses.toFixed(2)}\n`;
    csvContent += `Jumlah Kos Gaji Pekerja,RM ${totals.totalWages.toFixed(2)}\n`;
    csvContent += `ANGGARAN UNTUNG BERSIH,RM ${totals.netProfit.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Bazar2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupData = () => {
    const backupData = {
      sales: salesRecords,
      stock: stockRecords,
      expenses: expenseRecords,
      staffWork: staffWorkRecords,
      prices: stockPrices,
      staffProfiles: staffConfig,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Bazar2026_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl space-y-4 text-center border border-slate-200">
           <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertTriangle className="w-8 h-8" />
           </div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Tindakan Diperlukan!</h1>
           <p className="text-sm font-medium text-slate-500 pb-4">Aplikasi anda menjadi <strong className="text-rose-600">Blank Screen</strong> (atau tersekat di sini) kerana Konfigurasi Firebase belum dimasukkan dengan betul.</p>
        </div>
      </div>
    );
  }

  // === HALAMAN PREVIEW REPORT SLIDE (A4 LANDSCAPE) ===
  if (isReportSlide) {
    return (
      <div className="min-h-screen bg-slate-300 p-8 print:p-0 print:bg-white flex justify-center items-center font-sans">
        <div className="w-[297mm] min-h-[210mm] bg-white border-2 border-slate-200 p-12 text-slate-900 shadow-2xl relative flex flex-col mx-auto print-modal-content-slide">
          
          <div className="flex justify-between items-center border-b-4 border-indigo-600 pb-6 mb-8">
             <div className="flex items-center gap-6">
                 <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain print:filter-none" style={{ filter: 'invert(1) grayscale(100%) contrast(200%)', mixBlendMode: 'multiply' }} onError={(e) => e.target.style.display = 'none'} />
                 <div>
                   <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Laporan Eksekutif</h1>
                   <p className="text-lg font-bold text-slate-500 mt-1 uppercase tracking-widest">Raudhah Team Resources (Bazar 2026)</p>
                 </div>
             </div>
             <div className="text-right">
                 <h2 className="text-2xl font-black uppercase text-indigo-600">Ringkasan Kewangan</h2>
                 <p className="text-sm font-bold text-slate-400 mt-1">Selesai pada: {new Date().toLocaleDateString('ms-MY')}</p>
             </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-10">
             <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                <div className="text-xs font-black uppercase text-indigo-500 tracking-widest mb-2">Jumlah Jualan</div>
                <div className="text-3xl font-black text-slate-900">RM {totals.totalSales.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
             </div>
             <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
                <div className="text-xs font-black uppercase text-rose-500 tracking-widest mb-2">Kos Stok/Bahan</div>
                <div className="text-3xl font-black text-rose-700">RM {totals.totalCogs.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
             </div>
             <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                <div className="text-xs font-black uppercase text-amber-600 tracking-widest mb-2">Belanja Operasi</div>
                <div className="text-3xl font-black text-amber-700">RM {totals.totalExpenses.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
             </div>
             <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                <div className="text-xs font-black uppercase text-blue-600 tracking-widest mb-2">Kos Gaji Pekerja</div>
                <div className="text-3xl font-black text-blue-700">RM {totals.totalWages.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
             </div>
          </div>

          <div className="flex-1 bg-slate-900 text-white p-8 rounded-3xl mb-8 flex flex-col justify-center items-center shadow-xl print:border print:border-black print:bg-white print:text-black print:shadow-none">
             <div className="text-sm font-black uppercase tracking-[0.3em] opacity-70 mb-4 print:text-slate-500">Anggaran Untung Bersih</div>
             <div className="text-7xl font-black tracking-tighter text-emerald-400 print:text-slate-900">RM {totals.netProfit.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
             
             <div className="flex gap-12 mt-12 w-full justify-center opacity-90">
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 print:text-slate-500">Prestasi Evoke</div>
                  <div className="text-2xl font-black">RM {totals.totalEvokeSales.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                </div>
                <div className="w-px bg-slate-700 print:bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 print:text-slate-500">Prestasi Kg Belah 2</div>
                  <div className="text-2xl font-black">RM {totals.totalKgBelah2Sales.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                </div>
             </div>
          </div>

          <div className="text-center text-xs font-bold text-slate-400 mt-auto uppercase tracking-widest print:text-black">
             Jana Secara Automatik Menggunakan Sistem ERP Bazar 2026
          </div>

          {/* Butang Tindakan */}
          <div className="absolute -right-24 top-0 flex flex-col gap-4 print-hide">
            <button onClick={() => window.print()} className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all border-4 border-white" title="Cetak/Save PDF">
              <Printer className="w-6 h-6" />
            </button>
            <button onClick={() => setIsReportSlide(false)} className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-300 hover:scale-105 transition-all" title="Batal">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
              @page { size: A4 landscape; margin: 0; }
              body, html { background-color: white !important; margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; }
              .print-hide { display: none !important; }
              .print-modal-content-slide { width: 297mm !important; height: 210mm !important; max-width: none !important; padding: 15mm !important; margin: 0 !important; border: none !important; box-shadow: none !important; box-sizing: border-box !important; overflow: hidden !important; page-break-after: always; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}} />
      </div>
    );
  }

  // === HALAMAN PREVIEW SLIP GAJI (EKSKLUSIF A5 LANDSCAPE KORPORAT) ===
  if (selectedPayslip) {
    return (
      <div className="min-h-screen bg-slate-300 p-8 print:p-0 print:bg-white flex justify-center items-center font-sans">
        
        {/* Kontena Utama Slip Gaji (Saiz Ditetapkan Kepada A5) */}
        <div className="bg-white border-2 border-black text-slate-900 shadow-2xl relative flex flex-col mx-auto print-modal-content">
          
          <div className="flex justify-between items-center border-b-[3px] border-slate-800 pb-4 mb-6">
             {/* Kiri: Logo (Ditukar kepada logo.png asal dengan efek grayscale) */}
             <div className="w-1/4 flex justify-start">
                 <img 
                     src="/logo.png" 
                     alt="Logo Syarikat" 
                     className="w-20 h-20 object-contain print:filter-none"
                     style={{ filter: 'invert(1) grayscale(100%) contrast(200%)', mixBlendMode: 'multiply' }}
                 />
             </div>
             
             {/* Tengah: Nama Syarikat & Maklumat */}
             <div className="w-2/4 text-center flex flex-col justify-center pt-2">
                 <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-900">
                    Raudhah Team Resources
                 </h1>
                 <p className="text-sm font-bold text-slate-700 mt-1">
                    (002921662-A)
                 </p>
             </div>
             
             {/* Kanan: Info Slip Gaji */}
             <div className="w-1/4 text-right pt-2">
                 <h2 className="text-xl font-black uppercase text-indigo-700 tracking-widest print:text-black">Penyata Gaji</h2>
                 <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase">Tarikh: {new Date().toLocaleDateString('ms-MY')}</p>
                 <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: PAY-{new Date().getTime().toString().slice(-6)}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 print:bg-transparent p-4 print:p-0 rounded-xl print:rounded-none border border-slate-200 print:border-none">
             <div className="space-y-1">
               <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Nama Kakitangan</div>
               <div className="text-lg font-black uppercase text-slate-800 print:text-black">{selectedPayslip.name}</div>
             </div>
             <div className="space-y-1 text-right">
               <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Kategori Jawatan</div>
               <div className="text-sm font-black uppercase text-slate-700 print:text-black">Kakitangan Operasi (Bazar)</div>
             </div>
          </div>

          <table className="w-full text-sm mb-6 flex-1 border border-slate-300">
             <thead>
               <tr className="bg-slate-800 print:bg-slate-200 text-white print:text-slate-900">
                  <th className="py-2 px-4 text-left font-bold uppercase text-[10px] tracking-widest border-r border-slate-700 print:border-slate-300">Keterangan Pendapatan</th>
                  <th className="py-2 px-4 text-center font-bold uppercase text-[10px] tracking-widest border-r border-slate-700 print:border-slate-300 w-28">Kuantiti (Jam)</th>
                  <th className="py-2 px-4 text-center font-bold uppercase text-[10px] tracking-widest border-r border-slate-700 print:border-slate-300 w-28">Kadar (RM)</th>
                  <th className="py-2 px-4 text-right font-bold uppercase text-[10px] tracking-widest w-36">Jumlah (RM)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 bg-white">
               <tr>
                  <td className="py-3 px-4 font-bold text-slate-700 print:text-black border-r border-slate-300 uppercase text-xs">Gaji Asas (Mak: 45 Jam)</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 print:text-black">{selectedPayslip.payInfo.totalRegularHours.toFixed(1)}</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 print:text-black">{selectedPayslip.rate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 print:text-black">{selectedPayslip.payInfo.basicPay.toFixed(2)}</td>
               </tr>
               {selectedPayslip.payInfo.totalOTHours > 0 && (
               <tr>
                  <td className="py-3 px-4 font-bold text-slate-700 print:text-black border-r border-slate-300 flex items-center gap-2 uppercase text-xs"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-black"></div> Gaji Lebih Masa (OT 1.5x)</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 text-slate-700 print:text-black">{selectedPayslip.payInfo.totalOTHours.toFixed(1)}</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 text-slate-700 print:text-black">{selectedPayslip.payInfo.otRate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 print:text-black">{selectedPayslip.payInfo.otPay.toFixed(2)}</td>
               </tr>
               )}
               {selectedPayslip.payInfo.totalAllowance > 0 && (
               <tr>
                  <td className="py-3 px-4 font-bold text-slate-700 print:text-black border-r border-slate-300 flex items-center gap-2 uppercase text-xs"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-black"></div> Elaun Khas</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 text-slate-400 print:text-black">-</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 text-slate-400 print:text-black">-</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 print:text-black">{selectedPayslip.payInfo.totalAllowance.toFixed(2)}</td>
               </tr>
               )}
               {selectedPayslip.payInfo.totalBonus > 0 && (
               <tr>
                  <td className="py-3 px-4 font-bold text-slate-700 print:text-black border-r border-slate-300 flex items-center gap-2 uppercase text-xs"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-black"></div> Bonus Prestasi</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 text-slate-400 print:text-black">-</td>
                  <td className="py-3 px-4 text-center font-medium border-r border-slate-300 text-slate-400 print:text-black">-</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 print:text-black">{selectedPayslip.payInfo.totalBonus.toFixed(2)}</td>
               </tr>
               )}
             </tbody>
          </table>

          <div className="flex justify-between items-end mb-6">
             <div className="text-[9px] text-slate-500 print:text-black max-w-sm space-y-1 font-mono uppercase">
               {selectedPayslip.payInfo.weeklyBreakdown.length > 0 && (
                 <>
                   <div className="font-bold underline underline-offset-2 mb-1 text-slate-600 print:text-black">Log Kerja Mingguan:</div>
                   {selectedPayslip.payInfo.weeklyBreakdown.map((wb, idx) => (
                      <div key={idx} className="flex justify-between gap-4">
                        <span>{wb.date}:</span>
                        <span>{wb.total.toFixed(1)}J (ASAS:{wb.reg.toFixed(1)}|OT:{wb.ot.toFixed(1)})</span>
                      </div>
                   ))}
                 </>
               )}
             </div>

             <div className="w-72 bg-slate-800 print:bg-slate-100 text-white print:text-black p-4 rounded-xl print:rounded-none border border-slate-700 print:border-black shadow-lg print:shadow-none space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-300 print:text-slate-700">
                 <span>Pendapatan Kasar:</span>
                 <span>RM {selectedPayslip.payInfo.grossPay.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-slate-300 print:text-slate-700 border-b border-slate-600 print:border-slate-300 pb-2">
                 <span>Potongan (Advance):</span>
                 <span className="text-rose-400 print:text-black">RM {selectedPayslip.payInfo.totalAdvance.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-lg font-black pt-1">
                  <span className="uppercase tracking-widest text-[10px]">Gaji Bersih</span>
                  <span className="text-xl">RM {selectedPayslip.payInfo.netPay.toFixed(2)}</span>
               </div>
             </div>
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-500 print:text-black mt-auto pt-6">
             <div className="text-center">
               <div className="w-40 border-b-2 border-slate-400 print:border-black mb-2 h-10"></div>
               <p className="uppercase tracking-widest">Pengurus Operasi</p>
             </div>
             <div className="text-center">
               <div className="w-40 border-b-2 border-slate-400 print:border-black mb-2 h-10"></div>
               <p className="uppercase tracking-widest">Tandatangan Pekerja</p>
             </div>
          </div>

          <div className="absolute -right-24 top-0 flex flex-col gap-4 print-hide">
            <button onClick={() => window.print()} className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all border-4 border-white" title="Cetak Slip">
              <Printer className="w-6 h-6" />
            </button>
            <button onClick={() => setSelectedPayslip(null)} className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-300 hover:scale-105 transition-all" title="Batal">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CSS CETAKAN A5 YANG DIPERBAIKI (FIT TO PRINT AREA) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
              @page { 
                  size: A5 landscape; 
                  margin: 0mm; 
              }
              body, html { 
                  background-color: white !important; 
                  margin: 0 !important; 
                  padding: 0 !important; 
                  width: 210mm !important;
                  height: 148mm !important;
              }
              .print-hide { display: none !important; }
              .print-modal-content { 
                  width: 210mm !important; 
                  height: 148mm !important;
                  max-width: none !important; 
                  padding: 10mm 15mm !important; 
                  margin: 0 !important; 
                  border: none !important; 
                  box-shadow: none !important; 
                  box-sizing: border-box !important;
                  overflow: hidden !important;
                  page-break-after: always;
                  page-break-inside: avoid;
              }
              * { 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important; 
              }
          }
        `}} />
      </div>
    );
  }

  // --- KANDUNGAN APLIKASI UTAMA ---
  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jumlah Jualan" value={totals.totalSales} icon={ShoppingBag} color="bg-indigo-600" />
        <StatCard title="Kos Pembayaran (Staff)" value={totals.totalWages} icon={Users} color="bg-blue-600" />
        <StatCard title="Total Kos Stok" value={totals.totalCogs} icon={Package} color="bg-amber-600" />
        <StatCard title="Belanja Operasi" value={totals.totalExpenses} icon={Receipt} color="bg-rose-600" />
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all border-b-8 border-b-emerald-500">
         <div className="flex justify-between items-center">
            <div>
               <div className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-2">Anggaran Untung Bersih</div>
               <div className="text-5xl font-black text-slate-900 tracking-tighter">RM {totals.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="hidden sm:block text-right text-xs font-bold text-slate-400 space-y-1">
               <div><span className="text-indigo-600">Jualan:</span> +RM {totals.totalSales.toFixed(2)}</div>
               <div><span className="text-rose-500">Tolak Stok:</span> -RM {totals.totalCogs.toFixed(2)}</div>
               <div><span className="text-rose-500">Tolak Belanja:</span> -RM {totals.totalExpenses.toFixed(2)}</div>
               <div><span className="text-rose-500">Tolak Gaji:</span> -RM {totals.totalWages.toFixed(2)}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-tighter">Trend Jualan Lokasi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={v => v ? v.split('-').slice(1).join('/') : ''} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="evoke" name="Evoke" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} />
                <Area type="monotone" dataKey="kgBelah2" name="Kg Belah 2" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="font-black text-slate-800 mb-6 text-center uppercase tracking-tighter">Pecahan Jualan Keseluruhan</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Evoke', value: totals.totalEvokeSales },
                    { name: 'Kg Belah 2', value: totals.totalKgBelah2Sales }
                  ]}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EVOKE CARD */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-8 border-b-indigo-600">
          <div className="bg-indigo-600 p-8 text-white relative">
            <MapPin className="absolute right-6 top-6 w-12 h-12 opacity-10" />
            <h3 className="text-2xl font-black flex items-center gap-2 tracking-tight uppercase">EVOKE</h3>
            <div className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Cawangan Prestasi Tinggi</div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah Jualan</div>
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">RM {totals.totalEvokeSales.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs">
                    <TrendingUp className="w-4 h-4" /> 
                    {((totals.totalEvokeSales / (totals.totalSales || 1)) * 100).toFixed(1)}% Saham
                  </div>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${(totals.evokeCashTotal / (totals.totalEvokeSales || 1)) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-indigo-300 transition-all duration-1000" 
                  style={{ width: `${(totals.evokeQRTotal / (totals.totalEvokeSales || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className="flex items-center gap-1.5 text-indigo-600"><Banknote className="w-3.5 h-3.5"/> Tunai: RM {totals.evokeCashTotal.toFixed(2)}</span>
                <span className="flex items-center gap-1.5 text-indigo-400"><Smartphone className="w-3.5 h-3.5"/> QR: RM {totals.evokeQRTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-px bg-slate-100"></div>
            <div className="space-y-1">
              <DetailRow 
                id="ev-cogs" label="Kos Inventori (Stok)" value={totals.totalEvokeCogs} 
                detailData={stockRecords.filter(d => d.location === 'Evoke').map(d => ({ item: `${d.date} - ${d.item} (x${d.qty})`, amount: d.total }))} 
                colorClass="text-rose-500" expanded={expanded} toggleExpand={toggleExpand}
              />
              <DetailRow 
                id="ev-exp" label="Belanja Operasi" value={totals.totalEvokeExp} 
                detailData={expenseRecords.filter(d => d.location === 'Evoke').map(d => ({ item: d.item, amount: d.amount }))} 
                colorClass="text-rose-500" expanded={expanded} toggleExpand={toggleExpand}
              />
            </div>
            <div className="pt-6 px-2 flex justify-between items-center border-t border-slate-100">
              <div className="text-slate-500 font-black text-xs uppercase tracking-widest">Untung Kasar Lokasi</div>
              <div className="text-2xl font-black text-emerald-600">RM {(totals.totalEvokeSales - totals.totalEvokeCogs - totals.totalEvokeExp).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* KG BELAH 2 CARD */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-8 border-b-rose-500">
          <div className="bg-rose-500 p-8 text-white relative">
            <MapPin className="absolute right-6 top-6 w-12 h-12 opacity-10" />
            <h3 className="text-2xl font-black flex items-center gap-2 tracking-tight uppercase text-white">KG BELAH 2</h3>
            <div className="text-rose-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Cawangan Utama</div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah Jualan</div>
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">RM {totals.totalKgBelah2Sales.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-rose-500 font-black text-xs">
                    <TrendingUp className="w-4 h-4" /> 
                    {((totals.totalKgBelah2Sales / (totals.totalSales || 1)) * 100).toFixed(1)}% Saham
                  </div>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="h-full bg-rose-500 transition-all duration-1000" 
                  style={{ width: `${(totals.kgBelah2CashTotal / (totals.totalKgBelah2Sales || 1)) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-rose-300 transition-all duration-1000" 
                  style={{ width: `${(totals.kgBelah2QRTotal / (totals.totalKgBelah2Sales || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className="flex items-center gap-1.5 text-rose-600"><Banknote className="w-3.5 h-3.5"/> Tunai: RM {totals.kgBelah2CashTotal.toFixed(2)}</span>
                <span className="flex items-center gap-1.5 text-rose-400"><Smartphone className="w-3.5 h-3.5"/> QR: RM {totals.kgBelah2QRTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-px bg-slate-100"></div>
            <div className="space-y-1">
              <DetailRow 
                id="kb2-cogs" label="Kos Inventori (Stok)" value={totals.totalKgBelah2Cogs} 
                detailData={stockRecords.filter(d => d.location === 'Kg Belah 2' || d.location === 'Sutera').map(d => ({ item: `${d.date} - ${d.item} (x${d.qty})`, amount: d.total }))} 
                colorClass="text-rose-500" expanded={expanded} toggleExpand={toggleExpand}
              />
              <DetailRow 
                id="kb2-exp" label="Belanja Operasi" value={totals.totalKgBelah2Exp} 
                detailData={expenseRecords.filter(d => d.location === 'Kg Belah 2' || d.location === 'Sutera').map(d => ({ item: d.item, amount: d.amount }))} 
                colorClass="text-rose-500" expanded={expanded} toggleExpand={toggleExpand}
              />
            </div>
            <div className="pt-6 px-2 flex justify-between items-center border-t border-slate-100">
              <div className="text-slate-500 font-black text-xs uppercase tracking-widest">Untung Kasar Lokasi</div>
              <div className="text-2xl font-black text-emerald-600">RM {(totals.totalKgBelah2Sales - totals.totalKgBelah2Cogs - totals.totalKgBelah2Exp).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInputData = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-lg shadow-indigo-200 relative overflow-hidden">
          <MapPin className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Sales Evoke</div>
            <div className="text-3xl font-black tracking-tighter">RM {totals.totalEvokeSales.toLocaleString()}</div>
          </div>
          <div className="text-right space-y-1 opacity-80 relative z-10">
            <div className="text-[10px] font-bold">QR: RM {totals.evokeQRTotal.toLocaleString()}</div>
            <div className="text-[10px] font-bold">CASH: RM {totals.evokeCashTotal.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-lg shadow-rose-200 relative overflow-hidden">
          <MapPin className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Sales Kg Belah 2</div>
            <div className="text-3xl font-black tracking-tighter">RM {totals.totalKgBelah2Sales.toLocaleString()}</div>
          </div>
          <div className="text-right space-y-1 opacity-80 relative z-10">
            <div className="text-[10px] font-bold">QR: RM {totals.kgBelah2QRTotal.toLocaleString()}</div>
            <div className="text-[10px] font-bold">CASH: RM {totals.kgBelah2CashTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          {id:'sales', label:'Update Jualan', icon:DollarSign}, 
          {id:'stock', label:'Update Stok', icon:Package},
          {id:'expenses', label:'Update Belanja', icon:Receipt},
          {id:'staff', label:'Update Staff', icon:Users},
          {id:'prices', label:'Indeks Harga', icon:Tag}
        ].map(t => (
          <button 
            key={t.id} onClick={() => {
              setSubTab(t.id); 
              setEditingRecord(null); 
              setEditingStaffProfile(null); 
              setEditingPrice(null); 
              setDuplicateAlert(null);
              setStartTime(''); 
              setEndTime(''); 
              setStaffHours(''); 
              setStaffMinutes('');
              setBreakMinutes('');
            }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${subTab === t.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT PANEL: INPUT FORM */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 h-fit sticky top-8">
          
          {/* AMARAN PERTINDANAN DATA (DUPLICATE ALERT) */}
          {duplicateAlert && (
            <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-[1.5rem] space-y-4 animate-in zoom-in duration-300">
              <div className="flex items-start gap-3">
                <div className="bg-rose-500 p-2 rounded-xl text-white">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase text-rose-700 tracking-tight">Data Sudah Wujud!</h5>
                  <p className="text-[10px] font-bold text-rose-500 mt-1">Sistem mengesan rekod sedia ada untuk <span className="underline">{duplicateAlert.label}</span>. Elakkan rekod bertindih.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(duplicateAlert.record, duplicateAlert.type)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Kemaskini Rekod Tersebut
                </button>
                <button 
                  onClick={() => setDuplicateAlert(null)}
                  className="px-3 bg-white border border-rose-200 text-rose-400 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {editingRecord && !editingRecord.isAdjustment && subTab !== 'stock' ? (
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-2xl border border-amber-200">
               <div className="flex items-center gap-2">
                 <Edit3 className="w-4 h-4 text-amber-600" />
                 <span className="text-[10px] font-black uppercase text-amber-700">Sedang Mengedit Rekod</span>
               </div>
               <button onClick={() => {
                 setEditingRecord(null); 
                 setStartTime(''); 
                 setEndTime(''); 
                 setStaffHours(''); 
                 setStaffMinutes('');
                 setBreakMinutes('');
               }} className="p-1 hover:bg-amber-100 rounded-full"><X className="w-3 h-3 text-amber-700"/></button>
            </div>
          ) : null}

          {subTab === 'sales' ? (
            <form key={editingRecord?.id || 'new-sales'} onSubmit={handleAddSales} className="space-y-4">
              <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2 text-indigo-600"><Plus className="w-4 h-4"/> Input Jualan Harian</h4>
              <div className="space-y-4">
                <input name="date" type="date" required defaultValue={editingRecord?.date || todayStr} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-500 ml-2">Kg Belah 2 Tunai</label>
                    <input name="sc" placeholder="0.00" type="number" step="0.01" defaultValue={editingRecord?.kgBelah2Cash ?? editingRecord?.suteraCash} className="w-full p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-500 ml-2">Kg Belah 2 QR</label>
                    <input name="sq" placeholder="0.00" type="number" step="0.01" defaultValue={editingRecord?.kgBelah2QR ?? editingRecord?.suteraQR} className="w-full p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-500 ml-2">Evoke Tunai</label>
                    <input name="ec" placeholder="0.00" type="number" step="0.01" defaultValue={editingRecord?.evokeCash} className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-500 ml-2">Evoke QR</label>
                    <input name="eq" placeholder="0.00" type="number" step="0.01" defaultValue={editingRecord?.evokeQR} className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-sm" />
                  </div>
                </div>
                <button type="submit" className={`w-full ${editingRecord ? 'bg-amber-600 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'} text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all`}>
                   {editingRecord ? 'Kemaskini Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          ) : null}

          {subTab === 'stock' ? (
            <form key={editingRecord ? `edit-stock-${editingRecord.date}-${editingRecord.location}` : 'new-stock'} onSubmit={handleAddMultiStock} className="space-y-4">
              <div className="flex justify-between items-center">
                 <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2 text-amber-600">
                    <Package className="w-4 h-4"/> {editingRecord ? 'Edit Pukal Stok' : 'Log Stok Baharu'}
                 </h4>
                 {editingRecord && (
                    <button type="button" onClick={() => setEditingRecord(null)} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold hover:bg-amber-200">
                       Batal Edit
                    </button>
                 )}
              </div>
              
              <div className="space-y-4">
                <input name="date" type="date" required defaultValue={editingRecord?.date || todayStr} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                <select name="location" defaultValue={editingRecord?.location === 'Sutera' ? 'Kg Belah 2' : (editingRecord?.location || 'Evoke')} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black uppercase text-slate-800">
                  <option>Evoke</option>
                  <option>Kg Belah 2</option>
                </select>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                   <div className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Masukkan Kuantiti (Qty):</div>
                   {stockPrices.map(p => {
                      const existingItem = editingRecord?.items?.find(i => i.item === p.item);
                      return (
                         <div key={p.id} className="flex justify-between items-center gap-4">
                            <label className="text-xs font-bold text-slate-700 flex-1 truncate">{p.item}</label>
                            <input 
                               name={`qty_${p.id}`} 
                               type="number" 
                               min="0" 
                               defaultValue={existingItem ? existingItem.qty : ''} 
                               placeholder="0" 
                               className="w-20 p-2 rounded-xl bg-white border border-slate-300 text-sm text-center font-black" 
                            />
                         </div>
                      );
                   })}
                </div>

                <button type="submit" className={`w-full ${editingRecord ? 'bg-amber-600 shadow-amber-200' : 'bg-amber-500 shadow-amber-200'} text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all`}>
                   {editingRecord ? 'Kemaskini Semua Stok' : 'Simpan Semua Stok'}
                </button>
              </div>
            </form>
          ) : null}

          {subTab === 'expenses' ? (
            <form key={editingRecord?.id || 'new-exp'} onSubmit={handleAddExpense} className="space-y-4">
              <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2 text-rose-600"><Plus className="w-4 h-4"/> Tambah Belanjawan</h4>
              <div className="space-y-4">
                <input name="date" type="date" required defaultValue={editingRecord?.date || todayStr} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                <select name="location" defaultValue={editingRecord?.location === 'Sutera' ? 'Kg Belah 2' : (editingRecord?.location || 'Evoke')} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black uppercase text-slate-800">
                  <option>Evoke</option>
                  <option>Kg Belah 2</option>
                  <option>HQ</option>
                </select>
                <input name="item" placeholder="Perkara (cth: Ais, Tapak)" required defaultValue={editingRecord?.item} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800" />
                <input name="amount" placeholder="Jumlah (RM)" type="number" step="0.01" required defaultValue={editingRecord?.amount} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input type="checkbox" name="advanced" id="adv" defaultChecked={editingRecord?.isAdvanced} className="w-4 h-4 accent-indigo-600" />
                  <label htmlFor="adv" className="text-[10px] font-black uppercase text-slate-500">Hutang Belanjawan (Advanced)</label>
                </div>
                <button type="submit" className={`w-full ${editingRecord ? 'bg-amber-600 shadow-amber-200' : 'bg-rose-500 shadow-rose-200'} text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all`}>
                   {editingRecord ? 'Kemaskini Belanja' : 'Simpan Belanja'}
                </button>
              </div>
            </form>
          ) : null}

          {subTab === 'staff' ? (
            <div className="space-y-8">
               
               {(!editingRecord || !editingRecord.isAdjustment) && (
               <form key={editingRecord?.id || 'new-staff'} onSubmit={handleAddStaffWork} className="space-y-4">
                 <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2 text-emerald-600"><Plus className="w-4 h-4"/> Log Kehadiran Staff</h4>
                 <div className="space-y-4">
                   <div className="flex gap-2">
                     <div className="space-y-1 flex-1">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Tarikh</label>
                       <input name="date" type="date" required defaultValue={editingRecord?.date || todayStr} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                     </div>
                     <div className="space-y-1 flex-1">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Pekerja</label>
                       <select name="staffId" defaultValue={editingRecord?.staffId || staffConfig[0]?.id} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black uppercase text-slate-800">
                         {staffConfig.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-3 gap-3 border-t border-b border-slate-100 py-4 my-2">
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Masuk</label>
                       <input 
                         type="time" 
                         value={startTime}
                         onChange={(e) => setStartTime(e.target.value)}
                         className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Keluar</label>
                       <input 
                         type="time" 
                         value={endTime}
                         onChange={(e) => setEndTime(e.target.value)}
                         className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-rose-500 ml-2">Rehat (Minit)</label>
                       <input 
                         type="number" 
                         min="0"
                         placeholder="Cth: 30"
                         value={breakMinutes}
                         onChange={(e) => setBreakMinutes(e.target.value)}
                         className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" 
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Durasi (Jam)</label>
                       <input 
                         name="raw_hours" 
                         type="number" 
                         min="0"
                         placeholder="Cth: 4" 
                         value={staffHours}
                         onChange={(e) => setStaffHours(e.target.value)}
                         className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Durasi (Minit)</label>
                       <input 
                         name="raw_minutes" 
                         type="number" 
                         min="0"
                         max="59"
                         placeholder="Cth: 30" 
                         value={staffMinutes}
                         onChange={(e) => setStaffMinutes(e.target.value)}
                         className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" 
                       />
                     </div>
                   </div>
                   
                   {calculatedDecimalHours && (
                     <div className="text-right text-[10px] font-black text-emerald-600 px-2 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                       Jumlah Masa Bersih: {calculatedDecimalHours} Jam
                     </div>
                   )}
                   <button type="submit" className={`w-full ${editingRecord ? 'bg-amber-600 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'} text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all`}>
                      {editingRecord ? 'Kemaskini Kehadiran' : 'Rekod Kehadiran'}
                   </button>
                 </div>
               </form>
               )}

               {(!editingRecord || editingRecord.isAdjustment) && (
               <form onSubmit={handleAddFinance} className={`space-y-4 pt-6 border-t border-slate-200 mt-6 ${editingRecord ? 'bg-amber-50 p-4 rounded-2xl' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                     <h4 className={`font-black text-sm uppercase tracking-tight flex items-center gap-2 ${editingRecord ? 'text-amber-600' : 'text-blue-600'}`}><Banknote className="w-4 h-4"/> {editingRecord ? 'Kemaskini Kewangan' : 'Rekod Kewangan Staff'}</h4>
                     {editingRecord && <button type="button" onClick={() => setEditingRecord(null)} className="text-[10px] bg-amber-200 text-amber-800 px-2 py-1 rounded font-bold">Batal Edit</button>}
                  </div>
                  <select name="staffId" defaultValue={editingRecord?.staffId || staffConfig[0]?.id} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black uppercase text-slate-800" required>
                      {staffConfig.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                     <select name="type" defaultValue={editingRecord ? (editingRecord.allowance > 0 ? 'allowance' : editingRecord.bonus > 0 ? 'bonus' : 'advance') : 'allowance'} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" required>
                         <option value="allowance">Elaun Khas</option>
                         <option value="bonus">Bonus Tambahan</option>
                         <option value="advance">Advance (Pinjam)</option>
                     </select>
                     <input name="amount" type="number" step="0.01" min="0.01" defaultValue={editingRecord ? (editingRecord.allowance || editingRecord.bonus || editingRecord.advance) : ''} placeholder="RM 0.00" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" required />
                  </div>
                  <input name="desc" type="text" defaultValue={editingRecord?.desc || ''} placeholder="Catatan Tambahan (Pilihan)" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800" />
                  <button type="submit" className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${editingRecord ? 'bg-amber-600 text-white shadow-amber-200' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}>
                     {editingRecord ? 'Kemaskini' : 'Simpan Rekod Kewangan'}
                  </button>
               </form>
               )}

               {!editingRecord ? (
                 <div className="pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2 text-indigo-500"><Users className="w-4 h-4"/> Urus Kakitangan</h4>
                       {editingStaffProfile ? <button onClick={() => setEditingStaffProfile(null)} className="text-[10px] bg-slate-200 px-2 py-1 rounded font-bold hover:bg-slate-300 text-slate-700">Batal Edit</button> : null}
                    </div>
                    <form key={editingStaffProfile?.id || 'new-profile'} onSubmit={handleStaffProfileSubmit} className="space-y-3 mb-4">
                       <div className="flex gap-2">
                         <input name="name" required defaultValue={editingStaffProfile?.name} placeholder="Nama" className="flex-1 min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                         <input name="rate" required type="number" step="0.01" defaultValue={editingStaffProfile?.rate || 8.20} placeholder="Kadar/Jam" className="w-24 shrink-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800" />
                       </div>
                       <button type="submit" className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${editingStaffProfile ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
                         {editingStaffProfile ? 'Kemaskini Kakitangan' : '+ Tambah Kakitangan Baru'}
                       </button>
                    </form>
                    <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-2">
                       {staffConfig.map(s => (
                          <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs gap-2">
                             <div className="font-bold text-slate-800 uppercase truncate flex-1 min-w-0">{s.name}</div>
                             <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-slate-700 font-black bg-white px-2 py-1 rounded-md whitespace-nowrap border border-slate-200 shadow-sm min-w-[70px] text-center">RM {s.rate.toFixed(2)}</span>
                                <button type="button" onClick={() => setEditingStaffProfile(s)} className="text-slate-400 hover:text-indigo-600 p-1.5 bg-white border border-slate-200 shadow-sm rounded-md shrink-0 transition-all"><Edit3 className="w-3.5 h-3.5"/></button>
                                <button type="button" onClick={() => deleteRecord('staff_profiles', s.id)} className="text-rose-500 hover:text-rose-700 p-1.5 bg-white border border-slate-200 shadow-sm rounded-md shrink-0 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               ) : null}
            </div>
          ) : null}

          {subTab === 'prices' ? (
            <div className="space-y-8">
               <div className="flex justify-between items-center mb-4">
                 <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2 text-blue-500"><Tag className="w-4 h-4"/> Indeks Harga Stok</h4>
                 {editingPrice ? <button onClick={() => setEditingPrice(null)} className="text-[10px] bg-slate-200 px-2 py-1 rounded font-bold hover:bg-slate-300 text-slate-700">Batal Edit</button> : null}
               </div>
               <form key={editingPrice?.id || 'new-price'} onSubmit={handlePriceSubmit} className="space-y-3 mb-4">
                 <div className="flex gap-2">
                   <input name="item" required defaultValue={editingPrice?.item} placeholder="Nama Barang Mentah" className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold min-w-0 text-slate-800" />
                   <input name="price" required type="number" step="0.01" defaultValue={editingPrice?.price} placeholder="Harga RM" className="w-28 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold shrink-0 text-slate-800" />
                 </div>
                 <button type="submit" className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${editingPrice ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'}`}>
                   {editingPrice ? 'Kemaskini Harga' : '+ Tambah Item Baru'}
                 </button>
               </form>
               <div className="p-4 bg-blue-50 rounded-2xl text-[10px] text-blue-700 font-bold border border-blue-200 mb-4">
                 Sila lihat senarai item di ruang pangkalan data di sebelah kanan. Harga yang ditetapkan di sini akan digunakan secara automatik semasa mengisi Log Stok Harian.
               </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT PANEL: LIST RECORDS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pangkalan Data Rekod</div>
              <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Live Cloud Sync</span>
            </div>
            
            <div className="overflow-x-auto no-scrollbar h-full min-h-[500px]">
               {subTab === 'sales' ? (
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100/50 text-slate-500 font-black uppercase text-[9px] tracking-widest">
                       <tr>
                          <th className="py-4 px-6">Tarikh</th>
                          <th className="py-4 px-6">Kg Belah 2 (C/Q)</th>
                          <th className="py-4 px-6">Evoke (C/Q)</th>
                          <th className="py-4 px-6 text-right">Jumlah (RM)</th>
                          <th className="py-4 px-6 text-right w-24">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {sortedSalesRecords.map(item => (
                         <tr key={item.id} className="hover:bg-slate-50 transition-colors text-xs">
                            <td className="py-4 px-6 font-bold text-slate-800">{item.date}</td>
                            <td className="py-4 px-6">
                               <div className="text-rose-500 font-black">RM {(Number(item.kgBelah2Cash ?? item.suteraCash ?? 0) + Number(item.kgBelah2QR ?? item.suteraQR ?? 0)).toFixed(2)}</div>
                               <div className="text-[9px] opacity-50 text-slate-600">C:{(item.kgBelah2Cash ?? item.suteraCash ?? 0)} Q:{(item.kgBelah2QR ?? item.suteraQR ?? 0)}</div>
                            </td>
                            <td className="py-4 px-6">
                               <div className="text-indigo-600 font-black">RM {(Number(item.evokeCash||0)+Number(item.evokeQR||0)).toFixed(2)}</div>
                               <div className="text-[9px] opacity-50 text-slate-600">C:{item.evokeCash||0} Q:{item.evokeQR||0}</div>
                            </td>
                            <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                               {(Number(item.kgBelah2Cash ?? item.suteraCash ?? 0) + Number(item.kgBelah2QR ?? item.suteraQR ?? 0) + Number(item.evokeCash||0) + Number(item.evokeQR||0)).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => startEdit(item, 'sales')} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => deleteRecord('sales', item.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               ) : null}

               {subTab === 'stock' ? (() => {
                 const evokeStock = groupedStockByBranch.filter(g => g.location === 'Evoke');
                 const kgStock = groupedStockByBranch.filter(g => g.location === 'Kg Belah 2' || g.location === 'Sutera');
                 
                 const renderStockGroup = (groups, colorTheme) => (
                    <div className="divide-y divide-slate-100 flex-1">
                       {groups.length > 0 ? groups.map((group) => {
                         const isGroupExp = expanded[`input-stock-${group.date}-${group.location}`];
                         return (
                           <div key={`${group.date}-${group.location}`} className="bg-white transition-all">
                              <button 
                               onClick={() => toggleExpand(`input-stock-${group.date}-${group.location}`)}
                               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left group"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isGroupExp ? (colorTheme === 'evoke' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white') : `bg-slate-100 text-slate-500 group-hover:${colorTheme === 'evoke' ? 'text-indigo-600 bg-indigo-50' : 'text-rose-600 bg-rose-50'}`}`}>
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <div>
                                       <div className="text-xs font-black uppercase text-slate-800">{group.date}</div>
                                       <div className="text-[9px] text-slate-500 font-bold uppercase">{group.items.length} Entri Direkodkan</div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="text-right">
                                       <div className="text-[8px] font-black text-slate-400 uppercase">Kos</div>
                                       <div className={`text-xs font-black ${colorTheme === 'evoke' ? 'text-indigo-600' : 'text-rose-600'}`}>RM {group.total.toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); startEdit(group, 'stock'); }} 
                                          className={`p-1.5 rounded-lg transition-all ${colorTheme === 'evoke' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
                                          title="Edit Keseluruhan Hari Ini"
                                       >
                                          <Edit3 className="w-3.5 h-3.5" />
                                       </button>
                                       <div className={`p-1.5 rounded-lg ${isGroupExp ? 'bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                                          {isGroupExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                       </div>
                                    </div>
                                 </div>
                              </button>
                              
                              {isGroupExp ? (
                                <div className="bg-slate-50/80 px-4 pb-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                                   <div className="space-y-2 border-t border-slate-200 pt-3">
                                      {group.items.map((item) => (
                                         <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <div>
                                               <div className="text-[10px] font-bold text-slate-800">{item.item}</div>
                                               <div className="text-[9px] text-slate-500 font-medium mt-0.5">Kuantiti: x{item.qty}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                               <div className="text-right font-black text-[10px] mr-1 text-slate-900">RM {Number(item.total||0).toFixed(2)}</div>
                                               <div className="flex gap-1.5">
                                                  <button onClick={(e) => { e.stopPropagation(); deleteRecord('stock', item.id); }} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-all" title="Padam Item Ini"><Trash2 className="w-3.5 h-3.5"/></button>
                                               </div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                              ) : null}
                           </div>
                         );
                       }) : (
                         <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Tiada rekod stok ditemui</div>
                       )}
                    </div>
                 );

                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-full divide-y md:divide-y-0 md:divide-x divide-slate-200">
                       <div className="flex flex-col bg-white">
                          <div className="bg-indigo-50/50 p-4 text-center border-b border-slate-100 flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Evoke</span>
                             <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">{evokeStock.length} Rekod Hari</span>
                          </div>
                          {renderStockGroup(evokeStock, 'evoke')}
                       </div>
                       <div className="flex flex-col bg-white">
                          <div className="bg-rose-50/50 p-4 text-center border-b border-slate-100 flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Kg Belah 2</span>
                             <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">{kgStock.length} Rekod Hari</span>
                          </div>
                          {renderStockGroup(kgStock, 'kg')}
                       </div>
                    </div>
                 );
               })() : null}

               {subTab === 'expenses' ? (
                 <div className="divide-y divide-slate-100">
                    {groupedExpensesByBranch.length > 0 ? groupedExpensesByBranch.map((group) => {
                      const isGroupExp = expanded[`input-exp-${group.date}-${group.location}`];
                      return (
                        <div key={`${group.date}-${group.location}`} className="bg-white transition-all">
                           <button 
                            onClick={() => toggleExpand(`input-exp-${group.date}-${group.location}`)}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 text-left group"
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`p-2 rounded-xl ${isGroupExp ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-rose-600 group-hover:bg-rose-50'}`}>
                                    <Receipt className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="text-xs font-black uppercase text-slate-800">{group.date}</span>
                                       <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${group.location === 'Kg Belah 2' || group.location === 'Sutera' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>{group.location}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{group.items.length} Entri Belanja</div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-right">
                                    <div className="text-[9px] font-black text-slate-400 uppercase">Jumlah Belanja</div>
                                    <div className="text-sm font-black text-rose-600">RM {group.total.toFixed(2)}</div>
                                 </div>
                                 <div className={`p-1.5 rounded-lg ${isGroupExp ? 'bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {isGroupExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                 </div>
                              </div>
                           </button>
                           
                           {isGroupExp ? (
                             <div className="bg-slate-50/80 px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2 border-t border-slate-200 pt-4">
                                   {group.items.map((item) => (
                                     <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                       <div>
                                          <div className="flex items-center gap-2">
                                             <span className="text-xs font-bold text-slate-800">{item.item}</span>
                                             {item.isAdvanced ? <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-black">Hutang/Adv</span> : null}
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <div className="text-right font-black text-xs mr-2 text-rose-500">RM {Number(item.amount||0).toFixed(2)}</div>
                                          <div className="flex gap-2">
                                             <button onClick={() => startEdit(item, 'expenses')} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5"/></button>
                                             <button onClick={() => deleteRecord('expenses', item.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                                          </div>
                                       </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           ) : null}
                        </div>
                      );
                    }) : (
                      <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Tiada rekod belanja ditemui</div>
                    )}
                 </div>
               ) : null}

               {subTab === 'staff' ? (
                 <div className="divide-y divide-slate-100">
                    {groupedStaff.length > 0 ? groupedStaff.map((group) => {
                      const isGroupExp = expanded[`input-staff-${group.staffId}`];
                      const staffProfile = staffConfig.find(s => s.id === group.staffId);
                      return (
                        <div key={group.staffId} className="bg-white transition-all">
                           <button 
                            onClick={() => toggleExpand(`input-staff-${group.staffId}`)}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 text-left group"
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`p-2 rounded-xl ${isGroupExp ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50'}`}>
                                    <Users className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <div className="text-sm font-black uppercase text-slate-800">{staffProfile ? staffProfile.name : group.staffId}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{group.items.length} Rekod Pekerja</div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-right">
                                    <div className="text-[9px] font-black text-slate-400 uppercase">Jumlah Jam</div>
                                    <div className="text-sm font-black text-emerald-600">{group.totalHours.toFixed(1)} j</div>
                                 </div>
                                 <div className={`p-1.5 rounded-lg ${isGroupExp ? 'bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {isGroupExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                 </div>
                              </div>
                           </button>
                           
                           {isGroupExp ? (
                             <div className="bg-slate-50/80 px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2 border-t border-slate-200 pt-4">
                                   {group.items.map((item) => (
                                     <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                       
                                        {/* Rekod Kewangan vs Rekod Kehadiran */}
                                        {item.isAdjustment ? (
                                           <div>
                                             <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Kewangan</span> 
                                                {item.date}
                                             </div>
                                             {item.allowance > 0 && <div className="text-xs font-bold text-blue-600">Elaun Khas: +RM {item.allowance}</div>}
                                             {item.bonus > 0 && <div className="text-xs font-bold text-indigo-600">Bonus: +RM {item.bonus}</div>}
                                             {item.advance > 0 && <div className="text-xs font-bold text-rose-600">Advance/Pinjam: -RM {item.advance}</div>}
                                             {item.desc && <div className="text-[9px] text-slate-400 mt-1 uppercase">Nota: {item.desc}</div>}
                                           </div>
                                        ) : (
                                           <div>
                                              <div className="flex items-center gap-2 mb-1">
                                                 <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Kehadiran</span>
                                                 <span className="text-[10px] font-black text-slate-800 uppercase">{item.date}</span>
                                              </div>
                                              {item.startTime && item.endTime ? (
                                                 <div className="text-[10px] text-slate-500 font-bold">Waktu: {item.startTime} - {item.endTime} {item.breakMinutes > 0 ? `(-${item.breakMinutes}m)` : ''}</div>
                                              ) : (
                                                 item.breakMinutes > 0 ? <div className="text-[9px] text-rose-500 font-bold">Tolak Rehat: {item.breakMinutes}m</div> : null
                                              )}
                                           </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                           {!item.isAdjustment && <div className="text-right font-black text-xs mr-2 text-emerald-600">{Number(item.hours).toFixed(1)} Jam</div>}
                                           <div className="flex gap-2">
                                              <button onClick={() => startEdit(item, 'staff')} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5"/></button>
                                              <button onClick={() => deleteRecord('staff_work', item.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                                           </div>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           ) : null}
                        </div>
                      );
                    }) : (
                      <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Tiada rekod kehadiran ditemui</div>
                    )}
                 </div>
               ) : null}

               {subTab === 'prices' ? (
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100/50 text-slate-500 font-black uppercase text-[9px] tracking-widest">
                       <tr>
                          <th className="py-4 px-6">Keterangan / Nama Item</th>
                          <th className="py-4 px-6 text-right">Harga Unit (RM)</th>
                          <th className="py-4 px-6 text-right w-24">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {stockPrices.map(p => (
                         <tr key={p.id} className="hover:bg-slate-50 transition-colors text-xs">
                            <td className="py-4 px-6 font-bold text-slate-800">{p.item}</td>
                            <td className="py-4 px-6 text-right font-black text-blue-600">{p.price.toFixed(2)}</td>
                            <td className="py-4 px-6 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => startEdit(p, 'prices')} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => deleteRecord('stock_prices', p.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaffView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-indigo-200 mb-10">
         <Users className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10" />
         <div className="relative z-10 space-y-2 text-center md:text-left">
           <h2 className="text-4xl font-black tracking-tighter uppercase">Sistem Payroll</h2>
           <div className="text-indigo-100 font-bold opacity-80 max-w-md">Ringkasan gaji automatik. Kiraan lebih masa (OT 1.5x) melebihi 45 jam seminggu.</div>
         </div>
         <div className="relative z-10 mt-8 md:mt-0 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
               <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Payout</div>
               <div className="text-2xl font-black">RM {totals.totalWages.toFixed(2)}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staffConfig.map(staff => {
          const records = staffWorkRecords.filter(r => r.staffId === staff.id);
          const payInfo = calculatePayroll(records, staff.rate);

          return (
            <div key={staff.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col justify-between hover:shadow-xl transition-all border-b-4 border-b-indigo-500">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-2xl uppercase">
                    {staff.name[0]}
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gaji Bersih</div>
                     <div className="text-xl font-black text-emerald-600">RM {payInfo.netPay.toFixed(2)}</div>
                  </div>
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-2 text-slate-900">{staff.name}</h4>
                <div className="space-y-3">
                   <div className="flex justify-between text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                     <span className="text-slate-500 font-bold uppercase">Jam Asas (Max 45)</span>
                     <span className="font-black text-slate-900">{payInfo.totalRegularHours.toFixed(1)}j</span>
                   </div>
                   <div className="flex justify-between text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                     <span className="text-slate-500 font-bold uppercase">Overtime (1.5x)</span>
                     <span className="font-black text-rose-600">{payInfo.totalOTHours.toFixed(1)}j</span>
                   </div>
                   <div className="flex justify-between text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                     <span className="text-slate-500 font-bold uppercase">Kadar Sejam</span>
                     <span className="font-black text-slate-900">RM {staff.rate.toFixed(2)}</span>
                   </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPayslip({ ...staff, payInfo, records: records.sort((a,b)=> new Date(a.date || 0) - new Date(b.date || 0)) })}
                className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors cursor-pointer shadow-lg"
              >
                <FileText className="w-4 h-4" /> Generate Payslip
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10 relative">
      {/* === APLIKASI UTAMA (DIPAPARKAN HANYA JIKA TIADA PREVIEW SLIP/REPORT) === */}
      {!selectedPayslip && !isReportSlide && (
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-[90vh]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-900">
              <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 text-white">
                <Box className="w-8 h-8" />
              </div>
              Bazar 2026 <span className="text-indigo-600 font-black">ERP</span>
            </h1>
            <div className="text-slate-500 font-black text-[10px] mt-2 uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full inline-block ${!isFirebaseConfigured ? 'bg-rose-500 animate-pulse' : (user ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')}`}></span>
              {!isFirebaseConfigured ? 'PERLUKAN SETUP FIREBASE' : (user ? 'CLOUD SYNC ACTIVE' : 'CONNECTING...')}
            </div>
          </div>
          <nav className="flex p-2 bg-white rounded-3xl shadow-xl border border-slate-200 self-start overflow-x-auto max-w-full no-scrollbar gap-1">
            {[
              { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'locations', label: 'Lokasi', icon: MapPin },
              { id: 'input', label: 'Input Data', icon: Edit3 },
              { id: 'staff_view', label: 'Payroll', icon: Users }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id); 
                  setEditingRecord(null); 
                  setEditingStaffProfile(null); 
                  setEditingPrice(null); 
                  setDuplicateAlert(null);
                  setStartTime(''); 
                  setEndTime(''); 
                  setStaffHours(''); 
                  setStaffMinutes('');
                  setBreakMinutes('');
                }}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1">
          {!user ? (
            <div className="flex flex-col items-center justify-center py-40 text-slate-500">
              <Clock className="w-16 h-16 animate-spin mb-6 text-indigo-500" />
              <div className="font-black uppercase tracking-[0.4em] text-xs">Initializing ERP...</div>
              {authError && <div className="text-rose-500 text-[10px] font-bold mt-4 bg-rose-50 p-2 rounded-lg border border-rose-200">Ralat Auth: Pastikan "Anonymous SignIn" diaktifkan di Firebase Console.</div>}
            </div>
          ) : (
            <>
              {activeTab === 'overview' ? renderOverview() : null}
              {activeTab === 'locations' ? renderLocations() : null}
              {activeTab === 'input' ? renderInputData() : null}
              {activeTab === 'staff_view' ? renderStaffView() : null}
            </>
          )}
        </main>

        {/* --- FOOTER KESELAMATAN & EKSPORT --- */}
        {user && (
          <footer className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap justify-center gap-4 pb-8 animate-in fade-in duration-500">
             <button 
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
                onClick={handleDownloadExcel}
             >
                <FileSpreadsheet className="w-4 h-4" /> Download Excel
             </button>
             <button 
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-md hover:shadow-lg"
                onClick={() => setIsReportSlide(true)}
             >
                <Presentation className="w-4 h-4" /> Report Slide
             </button>
             <button 
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 transition-all shadow-md hover:shadow-lg"
                onClick={handleBackupData}
             >
                <Database className="w-4 h-4" /> Backup Data
             </button>
             <button 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                onClick={() => alert("Sila serahkan fail .json (Backup Data) kepada pentadbir sistem untuk memuat naik secara manual melalui Firebase Console bagi mengelakkan pertindanan data utama.")}
             >
                <Upload className="w-4 h-4" /> Restore Data
             </button>
          </footer>
        )}

        {/* Butang PWA Install (Terapung) */}
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group z-50 animate-bounce"
            title="Install App ke Home Screen"
          >
            <Download className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-black text-xs uppercase tracking-widest group-hover:ml-3">
              Install App
            </span>
          </button>
        )}
      </div>
      )}
    </div>
  );
};

export default App;