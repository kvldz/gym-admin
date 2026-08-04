import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Ticket,
  UserCheck,
  Users,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
  Filter,
  Award,
  Phone,
  Mail,
  Sun,
  Moon,
  Package,
  ShieldCheck,
  Truck,
  FileText,
  Menu
} from "lucide-react";

const API_BASE = "http://localhost:5001";

// Preset product categories and subcategories strictly for PHYSICAL GEAR
const PRODUCT_CATEGORY_MAP = {
  "Weights & Strength Equipment": ["Dumbbells", "Barbells", "Weight Plates", "Kettlebells", "Benches"],
  "Gym Accessories": ["Resistance Bands", "Gym Bags", "Shaker Bottles", "Lifting Belts", "Straps"],
  "Cardio & Functional": ["Treadmills", "Exercise Bikes", "Jump Ropes", "Agility Ladders"]
};

// Initial Mock Data for Gym Passes & Memberships
const INITIAL_PASSES = [
  {
    id: "PASS-DAY",
    name: "Standard Day Pass",
    type: "Single Entry",
    price: 250,
    validity: "1 Day",
    perks: "Full Gym Equipment Access, Locker Access",
    status: "Active"
  },
  {
    id: "PASS-MONTHLY",
    name: "Monthly Unlimited Pass",
    type: "Recurring",
    price: 1800,
    validity: "30 Days",
    perks: "Unlimited Access, Free Water Station, 1 Free Coaching Session",
    status: "Active"
  },
  {
    id: "PASS-VIP",
    name: "VIP All-Access Pass",
    type: "Premium Tier",
    price: 3500,
    validity: "30 Days",
    perks: "24/7 Access, Sauna, Dedicated Locker, 4 Coaching Sessions",
    status: "Active"
  }
];

// Initial Mock Data for Trainers & Coaches
const INITIAL_TRAINERS = [
  {
    id: "TRN-01",
    name: "Coach Alex Rivera",
    specialty: "Bodybuilding & Hypertrophy",
    certifications: "NSCA-CPT, NASM Certified",
    email: "alex.rivera@gymhub.com",
    phone: "+63 917 555 0192",
    status: "Available",
    clientsCount: 14,
    avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400"
  },
  {
    id: "TRN-02",
    name: "Coach Sarah Chen",
    specialty: "HIIT & Functional Fitness",
    certifications: "ACE Personal Trainer, CrossFit L2",
    email: "sarah.chen@gymhub.com",
    phone: "+63 918 444 8821",
    status: "In Session",
    clientsCount: 19,
    avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
  },
  {
    id: "TRN-03",
    name: "Coach Marcus Vance",
    specialty: "Powerlifting & Strength",
    certifications: "USAPL Certified Coach",
    email: "marcus.vance@gymhub.com",
    phone: "+63 920 111 3490",
    status: "Available",
    clientsCount: 11,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
  }
];

export default function App() {
  // Theme State: false = Light Mode (Default), true = Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Mobile Menu Navigation Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation State: "dashboard" | "products" | "passes" | "trainers" | "users"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data States
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [passes, setPasses] = useState(INITIAL_PASSES);
  const [trainers, setTrainers] = useState(INITIAL_TRAINERS);

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State (For Products ADD and EDIT)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Physical Products
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Weights & Strength Equipment",
    subcategory: "Dumbbells",
    stock: "10",
    image_url: "",
    description: "",
    full_description: "",
    warranty: "1 Year Commercial Warranty",
    shipping_info: "Ships within 24-48 hours",
  });

  // Dynamic Specs
  const [specs, setSpecs] = useState([{ label: "", value: "" }]);

  // Fetch initial data from Backend
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resProd, resUsers] = await Promise.all([
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/users`)
      ]);

      if (resProd.ok) {
        const prodData = await resProd.json();
        setProducts(prodData.filter(p => p.category !== "Gym Services"));
      }
      if (resUsers.ok) {
        const userData = await resUsers.json();
        setUsers(userData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      showStatus("error", "Cannot connect to API server (Port 5001). Check connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
  };

  // Reset Product Form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "Weights & Strength Equipment",
      subcategory: "Dumbbells",
      stock: "10",
      image_url: "",
      description: "",
      full_description: "",
      warranty: "1 Year Commercial Warranty",
      shipping_info: "Ships within 24-48 hours",
    });
    setSpecs([{ label: "", value: "" }]);
    setIsEditMode(false);
    setEditingProductId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditMode(true);
    setEditingProductId(product.product_id);

    const initialCategory = PRODUCT_CATEGORY_MAP[product.category]
      ? product.category
      : "Weights & Strength Equipment";

    setFormData({
      name: product.name || "",
      price: product.price || "",
      category: initialCategory,
      subcategory: product.subcategory || PRODUCT_CATEGORY_MAP[initialCategory][0],
      stock: product.stock !== undefined ? String(product.stock) : "10",
      image_url: product.image_url || "",
      description: product.description || product.short_description || "",
      full_description: product.full_description || "",
      warranty: product.warranty_info || "1 Year Commercial Warranty",
      shipping_info: product.shipping_info || "Ships within 24-48 hours",
    });

    if (product.specs && Array.isArray(product.specs) && product.specs.length > 0) {
      setSpecs(product.specs.map(s => ({ label: s.spec_label || s.label, value: s.spec_value || s.value })));
    } else {
      setSpecs([{ label: "", value: "" }]);
    }

    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      const availableSubcats = PRODUCT_CATEGORY_MAP[value] || [];
      setFormData({
        ...formData,
        category: value,
        subcategory: availableSubcats[0] || ""
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecChange = (index, field, val) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addSpecRow = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };

  const removeSpecRow = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Local File Image Upload Handler (With Size Guard)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size limit (2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2 Megabytes
    if (file.size > MAX_SIZE) {
      showStatus("error", "Sobrang laki ng file! Pumili ng larawan na mas mababa sa 2MB.");
      e.target.value = "";
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showStatus("error", "Pumili lamang ng PNG o JPEG/JPG na larawan!");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save / Update Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validSpecs = specs.filter((s) => s.label.trim() !== "" && s.value.trim() !== "");

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      specs: validSpecs,
    };

    const url = isEditMode
      ? `${API_BASE}/api/products/${editingProductId}`
      : `${API_BASE}/api/products`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type");
      let data = {};

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        if (res.status === 413) {
          throw new Error("413 Payload Too Large: Sobrang laki ng image data! Dagdagan ang Express payload limit o liitan ang file.");
        } else {
          throw new Error(`Server returned error status ${res.status}`);
        }
      }

      if (res.ok) {
        showStatus("success", `Product "${formData.name}" ${isEditMode ? "updated" : "created"} successfully!`);
        setIsModalOpen(false);
        resetForm();
        fetchAllData();
      } else {
        showStatus("error", data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error("Save product error:", err);
      showStatus("error", err.message || "Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showStatus("success", `Product "${productName}" removed.`);
        fetchAllData();
      } else {
        const data = await res.json();
        showStatus("error", data.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error(err);
      showStatus("error", "Error contacting server for deletion.");
    }
  };

  // Switch Tab Helper (Closes mobile drawer upon click)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Computed Values
  const lowStockItems = products.filter((p) => p.stock < 5);
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamic Theme Styling Classes
  const themeClasses = {
    bgApp: darkMode ? "bg-zinc-950 text-zinc-100" : "bg-slate-100 text-slate-800",
    bgSidebar: darkMode ? "bg-zinc-900/95 border-zinc-800" : "bg-white border-slate-200 shadow-sm",
    bgHeader: darkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white/80 border-slate-200 shadow-sm",
    bgCard: darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-900 shadow-sm",
    bgCardSubtle: darkMode ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-50 border-slate-200",
    bgInput: darkMode ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400",
    tableHeader: darkMode ? "bg-zinc-950/90 border-zinc-800 text-zinc-400" : "bg-slate-50 border-slate-200 text-slate-500",
    tableRowHover: darkMode ? "hover:bg-zinc-800/40" : "hover:bg-slate-50/80",
    textMuted: darkMode ? "text-zinc-400" : "text-slate-500",
    textHeading: darkMode ? "text-white" : "text-slate-900",
    borderSubtle: darkMode ? "border-zinc-800" : "border-slate-200"
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${themeClasses.bgApp}`}>
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ─── SIDEBAR (Responsive Slide-in Drawer on Mobile) ─── */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r p-5 flex flex-col justify-between shrink-0 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } ${themeClasses.bgSidebar}`}>
        <div>
          {/* Logo & Branding */}
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20">
                <Dumbbell className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <h1 className={`font-black text-xl tracking-wider font-mono uppercase ${themeClasses.textHeading}`}>GYMHUB</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <p className={`text-[10px] font-extrabold tracking-widest uppercase ${themeClasses.textMuted}`}>Inventory Pro</p>
                </div>
              </div>
            </div>

            {/* Close Button on Mobile Drawer */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`md:hidden p-1.5 rounded-lg border ${darkMode ? "border-zinc-800 text-zinc-400" : "border-slate-200 text-slate-500"}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Section Label */}
          <div className={`px-3 mb-2 text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>
            Management Modules
          </div>

          {/* Navigation Buttons */}
          <nav className="space-y-1.5">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                  : `${themeClasses.textMuted} hover:bg-slate-200/50 dark:hover:bg-zinc-800/60`
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => handleTabChange("products")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "products"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                  : `${themeClasses.textMuted} hover:bg-slate-200/50 dark:hover:bg-zinc-800/60`
              }`}
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-4 h-4" /> Equipment & Gear
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${darkMode ? "bg-zinc-950 text-zinc-400" : "bg-slate-200 text-slate-700"}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange("passes")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "passes"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                  : `${themeClasses.textMuted} hover:bg-slate-200/50 dark:hover:bg-zinc-800/60`
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4" /> Gym Passes & Access
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${darkMode ? "bg-zinc-950 text-zinc-400" : "bg-slate-200 text-slate-700"}`}>
                {passes.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange("trainers")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "trainers"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                  : `${themeClasses.textMuted} hover:bg-slate-200/50 dark:hover:bg-zinc-800/60`
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" /> Trainers & Coaches
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${darkMode ? "bg-zinc-950 text-zinc-400" : "bg-slate-200 text-slate-700"}`}>
                {trainers.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange("users")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                  : `${themeClasses.textMuted} hover:bg-slate-200/50 dark:hover:bg-zinc-800/60`
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Members & Directory
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${darkMode ? "bg-zinc-950 text-zinc-400" : "bg-slate-200 text-slate-700"}`}>
                {users.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Footer info & server tag */}
        <div className={`pt-4 border-t ${themeClasses.borderSubtle} text-[11px] space-y-2 px-1`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.textMuted}`}>Backend Status</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Port 5001
            </span>
          </div>
          <p className={`text-[10px] ${themeClasses.textMuted}`}>GymHub Enterprise Control Center</p>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className={`px-4 sm:px-8 py-3.5 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 backdrop-blur-md z-20 ${themeClasses.bgHeader}`}>
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Toggle Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`md:hidden p-2 rounded-xl border transition ${
                  darkMode ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-slate-100 border-slate-300 text-slate-700"
                }`}
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className={`text-base sm:text-xl font-extrabold capitalize tracking-wide font-mono flex items-center gap-2 ${themeClasses.textHeading}`}>
                  {activeTab === "dashboard" && "Dashboard & Metrics"}
                  {activeTab === "products" && "Equipment Inventory"}
                  {activeTab === "passes" && "Gym Passes & Offers"}
                  {activeTab === "trainers" && "Coaches & Instructors"}
                  {activeTab === "users" && "Members Directory"}
                </h2>
                <p className={`text-[11px] sm:text-xs mt-0.5 hidden sm:block ${themeClasses.textMuted}`}>
                  {activeTab === "dashboard" && "Real-time stock counts, active memberships, and system statistics."}
                  {activeTab === "products" && "Add, update, and track physical weights, benches, and accessories."}
                  {activeTab === "passes" && "Configure daily passes, monthly access, and perks."}
                  {activeTab === "trainers" && "List of accredited personal trainers and gym coaches."}
                  {activeTab === "users" && "View registered customer accounts and member details."}
                </p>
              </div>
            </div>

            {/* Refresh Button on Mobile Quick Bar */}
            <button
              onClick={() => { setRefreshing(true); fetchAllData(); }}
              className={`sm:hidden p-2 rounded-xl border transition ${
                darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-slate-300 text-slate-700"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 justify-end w-full sm:w-auto">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 rounded-xl text-xs font-bold border transition ${
                darkMode
                  ? "bg-zinc-800 text-amber-400 border-zinc-700 hover:bg-zinc-700"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
              title="Toggle Light / Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{darkMode ? "Light Mode" : "Night Mode"}</span>
            </button>

            {/* Desktop Refresh Button */}
            <button
              onClick={() => { setRefreshing(true); fetchAllData(); }}
              className={`hidden sm:flex p-2.5 rounded-xl border transition ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
            </button>

            {/* Add Product Button */}
            {activeTab === "products" && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Equipment</span>
              </button>
            )}
          </div>
        </header>

        {/* Toast Alert Banner */}
        {statusMsg.text && (
          <div className={`mx-4 sm:mx-8 mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-3 ${
            statusMsg.type === "error" 
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          }`}>
            {statusMsg.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* View Content Body */}
        <div className="p-4 sm:p-8 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-mono text-center">Fetching latest inventory records from MySQL API...</p>
            </div>
          ) : (
            <>
              {/* ─── TAB 1: DASHBOARD OVERVIEW ─── */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 sm:space-y-3 ${themeClasses.bgCard}`}>
                      <div className={`flex items-center justify-between ${themeClasses.textMuted}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Gear Inventory</span>
                        <Dumbbell className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black font-mono">{products.length}</p>
                      <p className={`text-[11px] ${themeClasses.textMuted}`}>Physical equipment items</p>
                    </div>

                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 sm:space-y-3 ${themeClasses.bgCard}`}>
                      <div className={`flex items-center justify-between ${themeClasses.textMuted}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Passes</span>
                        <Ticket className="w-5 h-5 text-orange-500" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black font-mono text-orange-500">{passes.length}</p>
                      <p className={`text-[11px] ${themeClasses.textMuted}`}>Configured access tiers</p>
                    </div>

                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 sm:space-y-3 ${themeClasses.bgCard}`}>
                      <div className={`flex items-center justify-between ${themeClasses.textMuted}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Gym Coaches</span>
                        <UserCheck className="w-5 h-5 text-sky-500" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black font-mono text-sky-500">{trainers.length}</p>
                      <p className={`text-[11px] ${themeClasses.textMuted}`}>Accredited trainers</p>
                    </div>

                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 sm:space-y-3 ${themeClasses.bgCard}`}>
                      <div className={`flex items-center justify-between ${themeClasses.textMuted}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Registered Members</span>
                        <Users className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">{users.length}</p>
                      <p className={`text-[11px] ${themeClasses.textMuted}`}>User database records</p>
                    </div>
                  </div>

                  {/* Low Stock Warning Box */}
                  {lowStockItems.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                          <AlertTriangle className="w-4 h-4 shrink-0" /> Stock Warning ({lowStockItems.length})
                        </div>
                        <button 
                          onClick={() => setActiveTab("products")}
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          Manage Stock <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {lowStockItems.map((item) => (
                          <div key={item.product_id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${themeClasses.bgCard}`}>
                            <div className="flex items-center gap-3">
                              <img src={item.image_url || "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold truncate">{item.name}</p>
                                <p className={`text-[10px] ${themeClasses.textMuted}`}>{item.category}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-[10px] sm:text-[11px] border border-rose-500/20 shrink-0 ml-2">
                              {item.stock} in stock
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Feature Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Trainers Summary */}
                    <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${themeClasses.bgCard}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-amber-500" /> Staff Trainers Status
                        </h3>
                        <button onClick={() => setActiveTab("trainers")} className="text-xs text-amber-500 font-bold hover:underline">View All</button>
                      </div>
                      <div className="space-y-2">
                        {trainers.map((t) => (
                          <div key={t.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${themeClasses.bgCardSubtle}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/30 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold truncate">{t.name}</p>
                                <p className={`text-[10px] truncate ${themeClasses.textMuted}`}>{t.specialty}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 ${
                              t.status === "Available" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}>
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Passes Quick Overview */}
                    <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${themeClasses.bgCard}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-orange-500" /> Membership Offers
                        </h3>
                        <button onClick={() => setActiveTab("passes")} className="text-xs text-orange-500 font-bold hover:underline">Manage Tiers</button>
                      </div>
                      <div className="space-y-2">
                        {passes.map((p) => (
                          <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${themeClasses.bgCardSubtle}`}>
                            <div>
                              <p className="font-bold">{p.name}</p>
                              <p className={`text-[10px] ${themeClasses.textMuted}`}>{p.type} • {p.validity}</p>
                            </div>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                              ₱{p.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: PHYSICAL PRODUCTS INVENTORY ─── */}
              {activeTab === "products" && (
                <div className="space-y-5">
                  {/* Search and Filters */}
                  <div className={`flex flex-col sm:flex-row gap-3 justify-between p-3.5 sm:p-4 rounded-2xl border ${themeClasses.bgCard}`}>
                    <div className="relative flex-1 w-full">
                      <Search className={`w-4 h-4 absolute left-3.5 top-3 ${themeClasses.textMuted}`} />
                      <input
                        type="text"
                        placeholder="Search gear name, category, subcategory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 transition ${themeClasses.bgInput}`}
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-2">
                        <Filter className={`w-4 h-4 ${themeClasses.textMuted}`} />
                        <span className={`text-xs font-medium ${themeClasses.textMuted}`}>Category:</span>
                      </div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={`rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${themeClasses.bgInput}`}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Products Grid / Responsive Scrollable Table */}
                  <div className={`border rounded-2xl overflow-hidden shadow-sm ${themeClasses.bgCard}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className={`border-b uppercase font-bold text-[10px] tracking-widest font-mono ${themeClasses.tableHeader}`}>
                            <th className="p-3.5 sm:p-4 whitespace-nowrap">SKU / ID</th>
                            <th className="p-3.5 sm:p-4 whitespace-nowrap">Product Details</th>
                            <th className="p-3.5 sm:p-4 whitespace-nowrap">Category & Subcategory</th>
                            <th className="p-3.5 sm:p-4 whitespace-nowrap">Price</th>
                            <th className="p-3.5 sm:p-4 whitespace-nowrap">Stock Level</th>
                            <th className="p-3.5 sm:p-4 text-center whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${themeClasses.borderSubtle}`}>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className={`p-8 sm:p-12 text-center ${themeClasses.textMuted}`}>
                                No physical gym equipment found matching your criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p) => (
                              <tr key={p.product_id} className={`transition ${themeClasses.tableRowHover}`}>
                                <td className={`p-3.5 sm:p-4 font-mono ${themeClasses.textMuted} whitespace-nowrap`}>#{p.product_id}</td>
                                <td className="p-3.5 sm:p-4 min-w-[200px]">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.image_url || "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800"}
                                      alt={p.name}
                                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-300 dark:border-zinc-700"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-bold truncate">{p.name}</p>
                                      <p className={`text-[10px] line-clamp-1 ${themeClasses.textMuted}`}>
                                        {p.description || p.short_description || "No short description"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 sm:p-4 space-y-1 whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 inline-block rounded-md text-[10px] font-medium border ${darkMode ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-slate-100 border-slate-200 text-slate-700"}`}>
                                    {p.category}
                                  </span>
                                  {p.subcategory && (
                                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
                                      ↳ {p.subcategory}
                                    </p>
                                  )}
                                </td>
                                <td className="p-3.5 sm:p-4 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm whitespace-nowrap">
                                  ₱{parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold ${
                                    p.stock < 5 
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  }`}>
                                    {p.stock} pcs
                                  </span>
                                </td>
                                <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenEditModal(p)}
                                      className={`p-2 rounded-lg border transition ${darkMode ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"}`}
                                      title="Edit Equipment Details"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.product_id, p.name)}
                                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                                      title="Delete Equipment"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: GYM PASSES & SUBSCRIPTIONS ─── */}
              {activeTab === "passes" && (
                <div className="space-y-6">
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border ${themeClasses.bgCard}`}>
                    <div>
                      <h3 className="text-sm font-bold">Gym Passes Catalog</h3>
                      <p className={`text-xs ${themeClasses.textMuted}`}>Day passes, recurring memberships, and promo tiers.</p>
                    </div>
                    <button
                      onClick={() => alert("Gym Pass configuration form coming soon!")}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Create Pass Tier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {passes.map((pass) => (
                      <div key={pass.id} className={`p-5 sm:p-6 border rounded-2xl space-y-4 flex flex-col justify-between ${themeClasses.bgCard}`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                              {pass.type}
                            </span>
                            <span className={`text-xs font-mono ${themeClasses.textMuted}`}>{pass.id}</span>
                          </div>
                          <h4 className="text-lg font-black">{pass.name}</h4>
                          <div className="flex items-baseline gap-1 font-mono">
                            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">₱{pass.price.toLocaleString()}</span>
                            <span className={`text-xs ${themeClasses.textMuted}`}>/ {pass.validity}</span>
                          </div>
                        </div>

                        <div className={`pt-3 border-t ${themeClasses.borderSubtle} space-y-2`}>
                          <p className={`text-[10px] uppercase font-bold ${themeClasses.textMuted}`}>Included Perks:</p>
                          <p className={`text-xs p-3 rounded-xl border ${themeClasses.bgCardSubtle}`}>
                            {pass.perks}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 4: TRAINERS & COACHES DIRECTORY ─── */}
              {activeTab === "trainers" && (
                <div className="space-y-6">
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border ${themeClasses.bgCard}`}>
                    <div>
                      <h3 className="text-sm font-bold">Staff Coaches & Personal Trainers</h3>
                      <p className={`text-xs ${themeClasses.textMuted}`}>Directory of accredited personal trainers for gym client bookings.</p>
                    </div>
                    <button
                      onClick={() => alert("Trainer Profile Creation feature under development!")}
                      className="w-full sm:w-auto px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Trainer Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {trainers.map((trainer) => (
                      <div key={trainer.id} className={`border rounded-2xl p-5 sm:p-6 space-y-4 ${themeClasses.bgCard}`}>
                        <div className="flex items-center gap-4">
                          <img
                            src={trainer.avatar}
                            alt={trainer.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-sky-500/30"
                          />
                          <div>
                            <h4 className="font-bold text-base">{trainer.name}</h4>
                            <p className="text-xs text-sky-500 font-semibold">{trainer.specialty}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              trainer.status === "Available" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}>
                              ● {trainer.status}
                            </span>
                          </div>
                        </div>

                        <div className={`space-y-2 text-xs p-3 rounded-xl border ${themeClasses.bgCardSubtle}`}>
                          <p className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{trainer.certifications}</span>
                          </p>
                          <p className="flex items-center gap-2 truncate">
                            <Mail className={`w-3.5 h-3.5 ${themeClasses.textMuted} shrink-0`} />
                            <span className="truncate">{trainer.email}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className={`w-3.5 h-3.5 ${themeClasses.textMuted} shrink-0`} />
                            <span>{trainer.phone}</span>
                          </p>
                        </div>

                        <div className={`flex items-center justify-between text-xs pt-2 border-t ${themeClasses.borderSubtle}`}>
                          <span className={`font-mono ${themeClasses.textMuted}`}>Active Clients</span>
                          <span className={`font-bold font-mono px-2.5 py-1 rounded-lg border ${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-slate-100 border-slate-200"}`}>
                            {trainer.clientsCount} Clients
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 5: USERS DIRECTORY ─── */}
              {activeTab === "users" && (
                <div className={`border rounded-2xl overflow-hidden shadow-sm ${themeClasses.bgCard}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${themeClasses.tableHeader}`}>
                    <span className="text-xs font-bold uppercase font-mono">Registered Accounts</span>
                    <span className={`text-xs font-mono ${themeClasses.textMuted}`}>{users.length} Total Users</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`border-b uppercase font-bold text-[10px] tracking-widest font-mono ${themeClasses.tableHeader}`}>
                          <th className="p-3.5 sm:p-4 whitespace-nowrap">User ID</th>
                          <th className="p-3.5 sm:p-4 whitespace-nowrap">Full Name</th>
                          <th className="p-3.5 sm:p-4 whitespace-nowrap">Email</th>
                          <th className="p-3.5 sm:p-4 whitespace-nowrap">Phone</th>
                          <th className="p-3.5 sm:p-4 whitespace-nowrap">Gender</th>
                          <th className="p-3.5 sm:p-4 whitespace-nowrap">Address Details</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${themeClasses.borderSubtle}`}>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={6} className={`p-8 text-center ${themeClasses.textMuted}`}>
                              No user records found in MySQL database.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u.user_id} className={`transition ${themeClasses.tableRowHover}`}>
                              <td className={`p-3.5 sm:p-4 font-mono ${themeClasses.textMuted} whitespace-nowrap`}>#{u.user_id}</td>
                              <td className="p-3.5 sm:p-4 font-bold whitespace-nowrap">{u.full_name}</td>
                              <td className={`p-3.5 sm:p-4 ${themeClasses.textMuted} whitespace-nowrap`}>{u.email}</td>
                              <td className={`p-3.5 sm:p-4 font-mono ${themeClasses.textMuted} whitespace-nowrap`}>{u.phone || u.phone_number || "—"}</td>
                              <td className={`p-3.5 sm:p-4 ${themeClasses.textMuted} whitespace-nowrap`}>{u.gender || "—"}</td>
                              <td className={`p-3.5 sm:p-4 max-w-xs truncate ${themeClasses.textMuted}`}>{u.address || "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ─── RESPONSIVE FULL-PAGE ADD & EDIT PRODUCT MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className={`w-full max-w-5xl rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden ${
            darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            
            {/* Modal Header */}
            <div className={`px-4 sm:px-8 py-4 sm:py-5 border-b flex items-center justify-between shrink-0 ${
              darkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div>
                <h3 className="font-extrabold text-sm sm:text-lg flex items-center gap-2 font-mono uppercase tracking-wide">
                  {isEditMode ? <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
                  {isEditMode ? `Edit Item: #${editingProductId}` : "Add Equipment"}
                </h3>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${themeClasses.textMuted}`}>
                  Fill out technical details, stock counts, and warranty info below.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 sm:p-2 rounded-xl transition ${
                  darkMode ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                }`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-4 sm:p-8 space-y-6 flex-1">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                
                {/* Left Side Form Fields (7 Columns) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Product Title */}
                  <div>
                    <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>
                      Product Title / Gear Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Commercial Rubber Hex Dumbbell Pair (25kg)"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-semibold focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                    />
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 sm:p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold uppercase text-amber-600 dark:text-amber-400 mb-1.5">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                      >
                        {Object.keys(PRODUCT_CATEGORY_MAP).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold uppercase text-amber-600 dark:text-amber-400 mb-1.5">
                        Subcategory *
                      </label>
                      <select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                      >
                        {(PRODUCT_CATEGORY_MAP[formData.category] || []).map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price & Stock Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>
                        Price (PHP ₱) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        required
                        placeholder="4500.00"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>
                        Initial Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        required
                        placeholder="10"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                      />
                    </div>
                  </div>

                  {/* Warranty & Shipping Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${themeClasses.textMuted}`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Warranty Terms
                      </label>
                      <input
                        type="text"
                        name="warranty"
                        placeholder="e.g. 1 Year Commercial Warranty"
                        value={formData.warranty}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${themeClasses.textMuted}`}>
                        <Truck className="w-3.5 h-3.5 text-amber-500" /> Shipping Info
                      </label>
                      <input
                        type="text"
                        name="shipping_info"
                        placeholder="e.g. Ships within 24-48 hours"
                        value={formData.shipping_info}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>
                      Brief Overview Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      placeholder="High-grade heavy-duty rubber hex design with knurled steel grip."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                    />
                  </div>

                  {/* Full Detailed Description */}
                  <div>
                    <label className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${themeClasses.textMuted}`}>
                      <FileText className="w-3.5 h-3.5 text-amber-500" /> Complete Product Features
                    </label>
                    <textarea
                      name="full_description"
                      rows={3}
                      placeholder="Enter full technical summary, usage instructions, or safety guidelines..."
                      value={formData.full_description}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs focus:outline-none focus:border-amber-500 border resize-none ${themeClasses.bgInput}`}
                    />
                  </div>

                </div>

                {/* Right Side Form Fields (5 Columns) */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* Image Upload Box */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${themeClasses.bgCardSubtle}`}>
                    <label className="block text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      Product Image (PNG / JPEG - Max 2MB)
                    </label>
                    
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleImageUpload}
                      className={`w-full border rounded-xl p-2 text-xs 
                        file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 
                        file:text-[11px] file:font-bold file:bg-amber-500 file:text-slate-950 
                        hover:file:bg-amber-600 cursor-pointer ${themeClasses.bgInput}`}
                    />

                    {formData.image_url ? (
                      <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
                        darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-slate-300"
                      }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={formData.image_url}
                            alt="Selected Equipment Preview"
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-amber-500/40 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 shrink-0" /> Image Uploaded
                            </p>
                            <p className={`text-[10px] ${themeClasses.textMuted}`}>Ready to save.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                          className="text-xs text-rose-500 hover:underline font-bold px-2 py-1 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className={`p-4 text-center rounded-xl border border-dashed ${themeClasses.textMuted}`}>
                        <p className="text-[11px]">No image file selected yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Technical Specifications Builder */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${themeClasses.bgCardSubtle}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-amber-500" /> Specs Parameters
                      </label>
                      <button
                        type="button"
                        onClick={addSpecRow}
                        className="text-xs text-amber-500 hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Spec
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {specs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Label (e.g. Material)"
                            value={spec.label}
                            onChange={(e) => handleSpecChange(index, "label", e.target.value)}
                            className={`w-1/2 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. Cast Iron)"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                            className={`w-1/2 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-amber-500 border ${themeClasses.bgInput}`}
                          />
                          {specs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSpecRow(index)}
                              className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className={`pt-5 border-t flex flex-col-reverse sm:flex-row items-center justify-end gap-3 ${themeClasses.borderSubtle}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition ${
                    darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEditMode ? (
                    "Save & Update Equipment"
                  ) : (
                    "Add Equipment to Inventory"
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}