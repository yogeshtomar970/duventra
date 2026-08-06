import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { FaBriefcase, FaMapMarkerPin, FaClock, FaPlus, FaTrash, FaArrowLeft, FaXmark, FaEllipsisVertical, FaMagnifyingGlass, FaFilter, FaCalendarDays, FaArrowDownWideShort, FaArrowUpShortWide } from "react-icons/fa6";
import { FaMapMarkerAlt, FaRegClock } from "react-icons/fa";
import API_BASE_URL from "../config/api.js";
import BottomNav from "../component/BottomNav";
import Navbar from "../component/Navbar";
import Sidebar from "../component/sidebar";
import JobDetailModal, { SocAvatar, timeAgo, TYPE_COLORS } from "./JobDetailModal";
import ExternalJobDetailModal from "./ExternalJobDetailModal";
import useDebounce from "../hooks/useDebounce";
import "../styles/PlacementCell.css";

// Ek hi type ke liye backend par kitne jobs ek call me maangne hain —
// pehla load jaldi aaye isliye chhota rakha hai, "Load More" isi size
// ke agle pages fetch karta rehta hai.
const EXTERNAL_PAGE_LIMIT = 15;

// ─── Skeleton / shimmer card (initial load ke liye) ─────
function SkeletonCard() {
  return (
    <div className="pc-job-card pc-skeleton-card">
      <div className="pc-job-card-header">
        <div className="pc-skeleton pc-skeleton-avatar" />
        <div className="pc-job-card-info" style={{ width: "100%" }}>
          <div className="pc-skeleton pc-skeleton-line" style={{ width: "60%" }} />
          <div className="pc-skeleton pc-skeleton-line" style={{ width: "40%" }} />
          <div className="pc-skeleton pc-skeleton-line" style={{ width: "80%" }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonList({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Freelance", "Contract"];

// Date Posted filter — dono tabs (College + External) me common use hota
// hai, isliye ek hi jagah define kiya taaki dono jagah sync rahe.
const DATE_FILTERS = [
  { key: "any", label: "Any time" },
  { key: "24h", label: "Last 24 hours" },
  { key: "week", label: "Last 7 days" },
  { key: "month", label: "Last 30 days" },
];

// Diya gaya date "dateFilter" window ke andar aata hai ya nahi — date
// missing/invalid ho to safe default true (job ko hide nahi karte).
const matchesDateFilter = (dateStr, dateFilter) => {
  if (dateFilter === "any") return true;
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (dateFilter === "24h") return diffDays <= 1;
  if (dateFilter === "week") return diffDays <= 7;
  if (dateFilter === "month") return diffDays <= 30;
  return true;
};

// Sort helper — missing date wale items list ke end me chale jaate hain
const sortByDate = (list, dateKey, order) => {
  return [...list].sort((a, b) => {
    const da = a[dateKey] ? new Date(a[dateKey]).getTime() : 0;
    const db = b[dateKey] ? new Date(b[dateKey]).getTime() : 0;
    return order === "oldest" ? da - db : db - da;
  });
};

// Agar user "forms.gle/xxx" jaisa bina protocol ka link daale, to browser use
// current domain ka relative path samajh leta hai. Ye helper protocol ensure
// karta hai taaki link hamesha sahi jagah (external site) khule.
const normalizeUrl = (url) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

// ─── Infinite Scroll Sentinel ───────────────────────────
// Ye ek invisible div hai list ke bottom par — jaise hi ye viewport me
// aata hai (user scroll karte karte neeche pahunchta hai), onVisible()
// call hoti hai jo aur items reveal karta hai. Real API call nahi,
// sirf already-fetched data me se aur items dikhata hai (client-side
// pagination) — taaki page load par ek saath sab render na ho.
function InfiniteScrollSentinel({ onVisible, hasMore }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onVisible();
      },
      { rootMargin: "300px" } // thoda pehle hi trigger ho jaaye, taaki scroll smooth lage
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, hasMore]);

  if (!hasMore) return null;
  return (
    <div ref={ref} className="pc-scroll-sentinel">
      <div className="pc-loader pc-loader-sm">
        <div /><div /><div />
      </div>
    </div>
  );
}

// ─── Job Card ──────────────────────────────────────────
// React.memo — parent re-render hone par bhi ye card sirf tab dobara
// render hota hai jab iske apne props (job/isAdmin/onView/onDelete)
// badalte hain. Job list bade hone par ye kaafi re-renders bacha leta hai.
const JobCard = React.memo(function JobCard({ job, isAdmin, onView, onDelete }) {
  const typeColor = TYPE_COLORS[job.jobType] || "#4f46e5";
  return (
    <div className="pc-job-card" onClick={() => onView(job)}>
      <div className="pc-job-card-header">
        <SocAvatar name={job.societyName} pic={job.societyPic} />
        <div className="pc-job-card-info">
          <h3 className="pc-job-title">{job.title}</h3>
          <span className="pc-job-society" style={{ color: typeColor }}>{job.societyName}</span>
          <div className="pc-job-meta">
            <span><FaMapMarkerAlt /> {job.location || "Delhi, India"}</span>
            <span><FaRegClock /> {job.jobType}</span>
          </div>
          <p className="pc-job-date">Posted on {timeAgo(job.createdAt)}</p>
        </div>
        {isAdmin && (
          <button className="pc-dot-menu" onClick={(e) => { e.stopPropagation(); onDelete(job._id); }}>
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
});

// ─── External Job Card (JSearch data) ───────────────────
const ExternalJobCard = React.memo(function ExternalJobCard({ job, onView }) {
  return (
    <div className="pc-job-card" onClick={() => onView(job)}>
      <div className="pc-job-card-header">
        {job.companyLogo ? (
          <img src={job.companyLogo} alt={job.company} className="pc-avatar" />
        ) : (
          <SocAvatar name={job.company || "Company"} />
        )}
        <div className="pc-job-card-info">
          <h3 className="pc-job-title">{job.title}</h3>
          <span className="pc-job-society" style={{ color: "#4f46e5" }}>{job.company}</span>
          <div className="pc-job-meta">
            <span><FaMapMarkerAlt /> {job.isRemote ? "Remote" : job.location}</span>
            <span><FaRegClock /> {job.employmentType}</span>
          </div>
          {job.postedAt && <p className="pc-job-date">Posted on {timeAgo(job.postedAt)}</p>}
        </div>
      </div>
    </div>
  );
});

// ─── Source Tabs (College vs External) ──────────────────
const SourceTabs = React.memo(function SourceTabs({ source, setSource }) {
  return (
    <div className="pc-filter-bar">
      <button className={`pc-filter-btn ${source === "college" ? "active" : ""}`}
        onClick={() => setSource("college")}>College</button>
      <button className={`pc-filter-btn ${source === "external" ? "active" : ""}`}
        onClick={() => setSource("external")}>External</button>
    </div>
  );
});

// ─── Date + Sort Filter Panel (College + External dono par) ────
// Search bar ke neeche collapsible panel — filter icon click par khulta
// hai. "Date Posted" dono tabs par kaam karta hai (college -> createdAt,
// external -> postedAt). Sort aur "Remote only" (sirf External tab par
// dikhta hai, kyunki college jobs me remote flag hi nahi hota) bhi yahin.
const FilterPanel = React.memo(function FilterPanel({
  open, dateFilter, setDateFilter, sortOrder, setSortOrder,
  showRemoteOption, remoteOnly, setRemoteOnly, onClear, activeCount,
}) {
  if (!open) return null;
  return (
    <div className="pc-filter-panel">
      <div className="pc-filter-panel-section">
        <p className="pc-filter-panel-label"><FaCalendarDays /> Date Posted</p>
        <div className="pc-filter-panel-pills">
          {DATE_FILTERS.map(opt => (
            <button
              key={opt.key}
              className={`pc-filter-btn ${dateFilter === opt.key ? "active" : ""}`}
              onClick={() => setDateFilter(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pc-filter-panel-section">
        <p className="pc-filter-panel-label">Sort By</p>
        <div className="pc-filter-panel-pills">
          <button
            className={`pc-filter-btn ${sortOrder === "newest" ? "active" : ""}`}
            onClick={() => setSortOrder("newest")}
          >
            <FaArrowDownWideShort /> Newest first
          </button>
          <button
            className={`pc-filter-btn ${sortOrder === "oldest" ? "active" : ""}`}
            onClick={() => setSortOrder("oldest")}
          >
            <FaArrowUpShortWide /> Oldest first
          </button>
        </div>
      </div>

      {showRemoteOption && (
        <div className="pc-filter-panel-section">
          <label className="pc-filter-checkbox">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
            />
            Remote jobs only
          </label>
        </div>
      )}

      {activeCount > 0 && (
        <button className="pc-filter-panel-clear" onClick={onClear}>
          Clear Filters ({activeCount})
        </button>
      )}
    </div>
  );
});

// ─── Apply Modal ────────────────────────────────────────
function ApplyModal({ job, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({});

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    // Check required custom fields
    for (const f of (job.customFields || [])) {
      if (!form[f.fieldTitle]?.trim()) {
        alert(`Please fill: ${f.fieldTitle}`);
        return;
      }
    }
    onSubmit(form);
  };

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal pc-apply-modal" onClick={e => e.stopPropagation()}>
        <div className="pc-modal-header">
          <button className="pc-back-btn" onClick={onClose}><FaArrowLeft /></button>
          <h2 className="pc-modal-title">Apply for {job.title}</h2>
          <div style={{ width: 32 }} />
        </div>
        <div className="pc-modal-body">
          {job.customFields?.length === 0 || !job.customFields ? (
            <p style={{ color: "#888", textAlign: "center", padding: "2rem 0" }}>
              No extra info needed. Just click Submit!
            </p>
          ) : (
            job.customFields.map((f, i) => (
              <div className="pc-form-group" key={i}>
                <label className="pc-label">{f.fieldTitle} *</label>
                {f.fieldDescription && <p className="pc-field-hint">{f.fieldDescription}</p>}
                <input
                  className="pc-input"
                  placeholder={f.fieldDescription || f.fieldTitle}
                  value={form[f.fieldTitle] || ""}
                  onChange={e => handleChange(f.fieldTitle, e.target.value)}
                />
              </div>
            ))
          )}
        </div>
        <div className="pc-modal-footer">
          <button className="pc-apply-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Job Modal ───────────────────────────────────
function CreateJobModal({ onClose, onSave, societyName, societyPic, societyId }) {
  const [step, setStep] = useState(1); // 1=basic info, 2=custom fields
  const [form, setForm] = useState({ title: "", jobType: "", location: "", Salary: "", description: "", formLink: "", societyId, societyName, societyPic });
  const [customFields, setCustomFields] = useState([]);
  const [saving, setSaving] = useState(false);

  const addField = () => setCustomFields(prev => [...prev, { fieldTitle: "", fieldDescription: "" }]);
  const removeField = (i) => setCustomFields(prev => prev.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setCustomFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const handleNext = () => {
    if (!form.title.trim()) return alert("Job Title zaroori hai");
    if (!form.jobType) return alert("Job Type select karo");
    if (!form.description.trim()) return alert("Job Description zaroori hai");
    setStep(2);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, formLink: normalizeUrl(form.formLink), customFields });
    setSaving(false);
  };

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal pc-create-modal" onClick={e => e.stopPropagation()}>
        <div className="pc-modal-header">
          <button className="pc-back-btn" onClick={step === 1 ? onClose : () => setStep(1)}>
            <FaArrowLeft />
          </button>
          <h2 className="pc-modal-title">{step === 1 ? "Create New Job" : "Custom Fields"}</h2>
          <div style={{ width: 32 }} />
        </div>

        {step === 1 && (
          <>
            <div className="pc-modal-body">
              <p className="pc-section-title">Basic Information</p>

              <div className="pc-form-group">
                <label className="pc-label">Job Title *</label>
                <input className="pc-input" placeholder="e.g. Frontend Developer"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Job Type *</label>
                <select className="pc-input pc-select" value={form.jobType}
                  onChange={e => setForm(p => ({ ...p, jobType: e.target.value }))}>
                  <option value="">Select Job Type</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Location</label>
                <input className="pc-input" placeholder="e.g. Delhi, India"
                  value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Salary</label>
                <input className="pc-input" placeholder="e.g. 50,000"
                  value={form.Salary} onChange={e => setForm(p => ({ ...p, Salary: e.target.value }))} />
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Job Description *</label>
                <textarea className="pc-input pc-textarea" placeholder="Write job description..."
                  value={form.description} maxLength={500}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                <p className="pc-char-count">{form.description.length}/500</p>
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Application Form Link</label>
                <input className="pc-input" type="text" placeholder="e.g. https://forms.gle/xxxxx"
                  value={form.formLink} onChange={e => setForm(p => ({ ...p, formLink: e.target.value }))} />
                <p className="pc-field-hint">Agar diya to "Apply Now" par click karte hi student seedha is link par jayega (Google Form waghera).</p>
              </div>

              {/* Action cards */}
              <div className="pc-action-cards">
                <div className="pc-action-card" onClick={() => { handleNext(); }}>
                  <FaPlus className="pc-action-icon" />
                  <p className="pc-action-label">Add Custom Fields</p>
                  <p className="pc-action-sub">Add extra fields for this job</p>
                </div>
                <div className="pc-action-card" onClick={handleNext}>
                  <span className="pc-action-icon">👁</span>
                  <p className="pc-action-label">Preview Job Card</p>
                  <p className="pc-action-sub">See how it will appear</p>
                </div>
              </div>
            </div>
            <div className="pc-modal-footer">
              <button className="pc-apply-btn" onClick={handleNext}>Next</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="pc-modal-body">
              <div className="pc-info-banner">
                ℹ️ Add custom fields that applicants need to fill for this job.
              </div>

              {customFields.map((f, i) => (
                <div className="pc-custom-field-builder" key={i}>
                  <div className="pc-cf-row">
                    <div className="pc-cf-drag">⠿</div>
                    <div className="pc-cf-inputs">
                      <input className="pc-input" placeholder="Field Title"
                        value={f.fieldTitle} onChange={e => updateField(i, "fieldTitle", e.target.value)} />
                      <input className="pc-input" placeholder="Field Description (Optional)"
                        value={f.fieldDescription} onChange={e => updateField(i, "fieldDescription", e.target.value)} />
                    </div>
                    <button className="pc-remove-field" onClick={() => removeField(i)}><FaTrash /></button>
                  </div>
                </div>
              ))}

              <button className="pc-add-field-btn" onClick={addField}>
                <FaPlus /> Add New Field
              </button>
            </div>
            <div className="pc-modal-footer">
              <button className="pc-apply-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Fields"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Filter Bar ─────────────────────────────────────────
const FilterBar = React.memo(function FilterBar({ filter, setFilter }) {
  const filters = ["All", ...JOB_TYPES];
  return (
    <div className="pc-filter-bar">
      {filters.map(f => (
        <button key={f} className={`pc-filter-btn ${filter === f ? "active" : ""}`}
          onClick={() => setFilter(f)}>{f}</button>
      ))}
    </div>
  );
});

// ─── Main PlacementCell Page ────────────────────────────
export default function PlacementCell() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Infinite scroll (College tab) — college jobs ek hi chhote call se
  // aa jaate hain, isliye unke liye client-side reveal kaafi hai
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ✅ External (JSearch) tab — TRUE server-side pagination. Har "page"
  // backend se alag call se aata hai (EXTERNAL_PAGE_LIMIT jobs/page),
  // isliye pehla paint bahut jaldi hota hai aur poora dataset kabhi
  // ek saath download nahi hota.
  const [externalPage, setExternalPage] = useState(1);
  const [externalHasMore, setExternalHasMore] = useState(true);

  // College vs External toggle
  const [source, setSource] = useState("college"); // "college" | "external"
  const [externalJobs, setExternalJobs] = useState([]);
  const [externalLoading, setExternalLoading] = useState(false); // pehla load (skeleton)
  const [externalLoadingMore, setExternalLoadingMore] = useState(false); // "load more" spinner
  const [externalType, setExternalType] = useState("fresher"); // fresher | graduate | internship
  const [viewExternalJob, setViewExternalJob] = useState(null);
  const [externalError, setExternalError] = useState("");

  // In-flight external request ko track karta hai taaki fast tab-switch /
  // filter-change par purani request ka result naye state ko overwrite na
  // kar de, aur duplicate parallel calls bhi na jaayein.
  const externalRequestId = useRef(0);

  // ✅ Search bar — title/company/society/location par match karta hai.
  // `searchQuery` turant input value hai (UI me instantly dikhta hai),
  // `debouncedSearchQuery` 400ms ke baad update hoti hai — isi se
  // filtering hoti hai, taaki har keystroke par poori list re-filter na ho.
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // ✅ Date + Sort filters — dono tabs (College/External) par kaam karte
  // hain. Panel toggle karne ke liye showFilters, aur active count badge
  // ke liye dono values track karte hain.
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("any"); // any | 24h | week | month
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [remoteOnly, setRemoteOnly] = useState(false); // External tab only

  const activeFilterCount =
    (dateFilter !== "any" ? 1 : 0) +
    (sortOrder !== "newest" ? 1 : 0) +
    (source === "external" && remoteOnly ? 1 : 0);

  const clearFilters = useCallback(() => {
    setDateFilter("any");
    setSortOrder("newest");
    setRemoteOnly(false);
  }, []);

  // Modals
  const [viewJob, setViewJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [appliedIds, setAppliedIds] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "society"; // society account = admin

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
  }, [sidebarOpen]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/jobs`);
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Fetch my applied jobs
  const fetchApplied = async () => {
    if (!user?.id || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/applied/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAppliedIds(data.data.map(a => a.jobId));
    } catch (e) {}
  };

  useEffect(() => {
    fetchJobs();
    fetchApplied();
  }, []);

  // Filter badalte hi list top se dobara reveal ho (naya filter = nayi list)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, searchQuery, dateFilter, sortOrder]);

  // Fetch external (JSearch) jobs — sirf tab "External" ke liye.
  // `mode: "replace"` → naya type/tab select hua, page 1 se shuru karo.
  // `mode: "append"`  → "Load More" — agla page fetch karke list me jodo.
  const fetchExternalJobs = useCallback(async (type, page, mode) => {
    // Har call ko ek id do — agar iske aane se pehle koi naya request
    // (tab switch, type change) shuru ho gaya, to is purani response ko
    // ignore kar do. Isse race condition / stale data ka bug nahi aata
    // aur redundant re-renders bhi bachte hain.
    const requestId = ++externalRequestId.current;

    if (mode === "replace") {
      setExternalLoading(true);
      setExternalError("");
    } else {
      setExternalLoadingMore(true);
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/placement/external-jobs?type=${type}&location=India&page=${page}&limit=${EXTERNAL_PAGE_LIMIT}`
      );
      const data = await res.json();

      if (requestId !== externalRequestId.current) return; // stale response, drop it

      if (data.success) {
        setExternalJobs(prev => (mode === "append" ? [...prev, ...data.data] : data.data));
        setExternalPage(page);
        setExternalHasMore(!!data.hasMore);
        if (mode === "replace" && (!data.data || data.data.length === 0)) {
          setExternalError("No external jobs found right now for this category.");
        }
      } else {
        if (mode === "replace") setExternalJobs([]);
        // ✅ FIX: ab backend ka asal error message UI par dikhta hai
        // (e.g. missing RAPIDAPI_KEY, JSearch down, etc.) — pehle ye
        // silently generic "load nahi ho payi" state me chhup jaata tha
        setExternalError(data.message || "Something went wrong fetching external jobs.");
        console.error("External jobs fetch failed:", data.message);
      }
    } catch (e) {
      if (requestId !== externalRequestId.current) return;
      console.error("External jobs fetch error:", e);
      if (mode === "replace") setExternalJobs([]);
      setExternalError("Could not reach the server. Check your connection or try again.");
    } finally {
      if (requestId === externalRequestId.current) {
        setExternalLoading(false);
        setExternalLoadingMore(false);
      }
    }
  }, []);

  // Source tab "External" khulte hi, ya category (fresher/graduate/
  // internship) badalte hi — pehla page fresh fetch karo
  useEffect(() => {
    if (source === "external") {
      fetchExternalJobs(externalType, 1, "replace");
    }
  }, [source, externalType, fetchExternalJobs]);

  const loadMoreExternal = useCallback(() => {
    if (externalLoadingMore || !externalHasMore) return;
    fetchExternalJobs(externalType, externalPage + 1, "append");
  }, [externalLoadingMore, externalHasMore, externalType, externalPage, fetchExternalJobs]);

  // Create job
  const handleCreateJob = async (jobData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
      const data = await res.json();
      if (data.success) {
        setJobs(prev => [data.data, ...prev]);
        setShowCreate(false);
      } else {
        alert(data.message || "Error creating job");
      }
    } catch (e) { alert("Error creating job"); }
  };

  // Delete job — useCallback taaki JobCard (React.memo) ko stable prop mile
  // aur delete button add hone se poori list re-render na ho
  const handleDelete = useCallback(async (jobId) => {
  if (!window.confirm("Want to Delete this job?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/placement/jobs/${jobId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setJobs(prev => prev.filter(j => j._id !== jobId));
    else alert(data.message);
  } catch (e) { alert("Error deleting job"); }
  }, [token]);

  // Record an application in the backend (used by both the form-link flow and the custom-fields modal flow)
  const recordApplication = async (job, formData = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: job._id,
          responses: formData,
        }),
      });
      const data = await res.json();
      if (data.success) setAppliedIds(prev => [...prev, job._id]);
      return data.success;
    } catch (e) {
      return false;
    }
  };

  // Apply (custom-fields modal path)
  const handleApply = async (formData) => {
    setApplyLoading(true);
    const ok = await recordApplication(applyJob, formData);
    if (ok) {
      setApplyJob(null);
      setViewJob(null);
      alert("Application submitted! ✅");
    } else {
      alert("Error applying");
    }
    setApplyLoading(false);
  };

  // ✅ useMemo — ye filtering sirf tab dobara chalti hai jab jobs/filter/
  // debouncedSearchQuery me se koi badle, har render par nahi (aur
  // debounce ki wajah se har keystroke par bhi nahi chalti).
  const filtered = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    const base = (filter === "All" ? jobs : jobs.filter(j => j.jobType === filter))
      .filter(j => {
        if (!q) return true;
        return (
          j.title?.toLowerCase().includes(q) ||
          j.societyName?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.jobType?.toLowerCase().includes(q)
        );
      })
      .filter(j => matchesDateFilter(j.createdAt, dateFilter));
    return sortByDate(base, "createdAt", sortOrder);
  }, [jobs, filter, debouncedSearchQuery, dateFilter, sortOrder]);

  // External tab search: sirf ab tak fetched/loaded jobs par filter hota
  // hai (backend-side search abhi implement nahi hai) — is se pagination
  // ke saath koi conflict nahi hota.
  const filteredExternalJobs = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    const base = externalJobs
      .filter(j => {
        if (!q) return true;
        return (
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.employmentType?.toLowerCase().includes(q)
        );
      })
      .filter(j => matchesDateFilter(j.postedAt, dateFilter))
      .filter(j => (remoteOnly ? !!j.isRemote : true));
    return sortByDate(base, "postedAt", sortOrder);
  }, [externalJobs, debouncedSearchQuery, dateFilter, sortOrder, remoteOnly]);

  // ✅ Infinite scroll "load more" handler (College tab) — top-level par
  // define kiya hai (React hook rules ke hisaab se; conditionally JSX ke
  // andar useCallback call nahi kar sakte)
  const loadMoreCollege = useCallback(() => {
    setVisibleCount(v => Math.min(v + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  return (
    <>
      {/* <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
      <BottomNav />

      <div className="pc-page">
        {/* Top bar */}
        <div className="pc-top-bar">
          <FaBriefcase className="pc-top-icon" />
          <span className="pc-top-title">Placement Cell</span>
        </div>

        {/* College vs External */}
        <SourceTabs source={source} setSource={setSource} />

        {/* Search bar — dono tabs (College/External) par kaam karta hai,
            title / company / location / type se match karta hai */}
        <div className="pc-search-bar">
          <FaMagnifyingGlass className="pc-search-icon" />
          <input
            type="text"
            className="pc-search-input"
            placeholder={
              source === "college"
                ? "Search jobs by title, society, location..."
                : "Search jobs by title, company, location..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="pc-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <FaXmark />
            </button>
          )}
          <button
            className={`pc-filter-toggle-btn ${activeFilterCount > 0 ? "has-active" : ""} ${showFilters ? "open" : ""}`}
            onClick={() => setShowFilters(v => !v)}
            aria-label="Filters"
          >
            <FaFilter />
            {activeFilterCount > 0 && <span className="pc-filter-badge">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Date / Sort / Remote filter panel — dono tabs (College +
            External) par same panel use hota hai, sirf "Remote only"
            option External tab par hi dikhta hai */}
        <FilterPanel
          open={showFilters}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showRemoteOption={source === "external"}
          remoteOnly={remoteOnly}
          setRemoteOnly={setRemoteOnly}
          onClear={clearFilters}
          activeCount={activeFilterCount}
        />

        {source === "college" ? (
          <>
            {/* Filter */}
            <FilterBar filter={filter} setFilter={setFilter} />

            {/* New Job button — only admin */}
            {isAdmin && (
              <div className="pc-new-job-wrap">
                <button className="pc-new-job-btn" onClick={() => setShowCreate(true)}>
                  <FaPlus /> New Job
                </button>
              </div>
            )}

            {/* College job list */}
            <div className="pc-job-list">
              {loading ? (
                <SkeletonList count={6} />
              ) : filtered.length === 0 ? (
                <div className="pc-state-center">
                  <FaBriefcase style={{ fontSize: 40, color: "#ccc" }} />
                  <p style={{ color: "#888" }}>
                    {searchQuery ? `No jobs found for "${searchQuery}"` : "No jobs available right now"}
                  </p>
                </div>
              ) : (
                <>
                  {filtered.slice(0, visibleCount).map(job => (
                    <JobCard
                      key={job._id}
                      job={job}
                      isAdmin={isAdmin}
                      onView={setViewJob}
                      onDelete={handleDelete}
                    />
                  ))}
                  <InfiniteScrollSentinel
                    hasMore={visibleCount < filtered.length}
                    onVisible={loadMoreCollege}
                  />
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* External type filter — fresher / graduate / internship.
                Sirf setExternalType() call karte hain; fetch khud useEffect
                se trigger hota hai (single source of truth) — isse click
                + effect dono se duplicate calls jaane ka risk nahi rehta. */}
            <div className="pc-filter-bar">
              {["fresher", "graduate", "internship"].map(t => (
                <button
                  key={t}
                  className={`pc-filter-btn ${externalType === t ? "active" : ""}`}
                  disabled={externalLoading && externalType === t}
                  onClick={() => setExternalType(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* External job list */}
            <div className="pc-job-list">
              {externalLoading ? (
                // ✅ Shimmer skeleton — sirf pehla load ke liye. Data ka
                // "shape" pehle hi dikhta hai jabki JSearch call background
                // me chal rahi hoti hai, isse page "slow" nahi lagta.
                <SkeletonList count={6} />
              ) : externalJobs.length === 0 ? (
                <div className="pc-state-center">
                  <FaBriefcase style={{ fontSize: 40, color: "#ccc" }} />
                  <p style={{ color: "#888" }}>
                    {externalError || "Abhi external jobs load nahi ho payi"}
                  </p>
                  <button
                    className="pc-apply-btn"
                    style={{ marginTop: 12 }}
                    onClick={() => fetchExternalJobs(externalType, 1, "replace")}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredExternalJobs.length === 0 ? (
                <div className="pc-state-center">
                  <FaBriefcase style={{ fontSize: 40, color: "#ccc" }} />
                  <p style={{ color: "#888" }}>No jobs found for "{searchQuery}"</p>
                </div>
              ) : (
                <>
                  {filteredExternalJobs.map(job => (
                    <ExternalJobCard key={job.id} job={job} onView={setViewExternalJob} />
                  ))}
                  {/* Search active hone par backend pagination se aage
                      badhna bhramit karega (search sirf loaded jobs par
                      hai), isliye tabhi "load more" dikhao jab search khaali ho */}
                  {!debouncedSearchQuery && (
                    externalLoadingMore ? (
                      <div className="pc-loader pc-loader-sm" style={{ margin: "16px auto" }}>
                        <div /><div /><div />
                      </div>
                    ) : (
                      <InfiniteScrollSentinel
                        hasMore={externalHasMore}
                        onVisible={loadMoreExternal}
                      />
                    )
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Job Detail Modal */}
      {viewJob && !applyJob && (
        <JobDetailModal
          job={viewJob}
          onClose={() => setViewJob(null)}
          alreadyApplied={appliedIds.includes(viewJob._id)}
          onApply={() => {
            if (isAdmin) return alert("Admin does not apply ");
            if (viewJob.formLink) {
              // Sirf form kholo — abhi applied mark mat karo, modal bhi
              // khula rahega taaki user baad me aakar confirm kar sake
              window.open(normalizeUrl(viewJob.formLink), "_blank", "noopener,noreferrer");
            } else {
              setApplyJob(viewJob);
            }
          }}
          onConfirmApplied={() => {
            // User ne form fill/submit karke khud confirm kiya — ab record karo
            recordApplication(viewJob, {});
          }}
        />
      )}

      {/* External Job Detail Modal — poora JSearch data card click par yahan dikhta hai */}
      {viewExternalJob && (
        <ExternalJobDetailModal
          job={viewExternalJob}
          onClose={() => setViewExternalJob(null)}
        />
      )}

      {/* Apply Modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSubmit={handleApply}
          loading={applyLoading}
        />
      )}

      {/* Create Job Modal */}
      {showCreate && (
        <CreateJobModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreateJob}
          societyName={user.societyName || user.name}
          societyPic={user.profilePic || ""}
          societyId={user.societyId}
        />
      )}
    </>
  );
}