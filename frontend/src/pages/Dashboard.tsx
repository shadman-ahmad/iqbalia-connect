import Settings from "./Settings";
import Holidays from "../pages/Holiday";
import { useState, useEffect } from "react";
import Students from "./Students";
import Attendance from "./Attendance";
import DashboardCards from "../components/DashboardCards";
import Teachers from "./Teacher";
import ManualAttendance from "./ManualAttendance";
import AttendanceReport from "./AttendanceReport";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import {
  MdDashboard,
  MdPeople,
  MdOutlineSchool,
  MdOutlineFactCheck,
  MdOutlineAssessment,
  MdSettings,
  MdLogout,
  MdEvent,
  MdMenu,
} from "react-icons/md";

import { FaChalkboardTeacher } from "react-icons/fa";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { BsClipboardCheck } from "react-icons/bs";

export default function Dashboard() {
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
  if (window.innerWidth < 768) {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [menuOpen]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth <= 768;

    setIsMobile(mobile);

    if (!mobile) {
      setSidebarOpen(true);
    }
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
  const logout = () => {
  localStorage.removeItem("teacher");
  window.location.reload();
};

  const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");

  const isAdmin = teacher.username === "admin";
  const menuStyle = (active: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "12px 18px",
  marginBottom: "10px",
  borderRadius: "14px",
  cursor: "pointer",
  background: active ? "#ff7a00" : "transparent",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: active ? 700 : 500,
  transition: "all 0.3s ease",
  boxShadow: active
    ? "0 8px 20px rgba(255,122,0,0.35)"
    : "none",
});

  return (
    <div
  style={{
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial",
    position: "relative",
  }}
>
      <div
  style={{
    width: "290px",
    background: "#111827",
    color: "white",
    padding: "25px",
    boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
    overflowY: "auto",
    height: "100vh",

    position: isMobile ? "fixed" : "relative",
    left: sidebarOpen ? 0 : "-320px",
    top: 0,
    bottom: 0,
    zIndex: 1000,
    transition: "left 0.3s ease",
  }}
>
        <div
  style={{
    textAlign: "center",
    marginBottom: "50px",
  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: "30px",
      fontWeight: "bold",
      letterSpacing: "1px",
    }}
  >
    <span style={{ color: "#ff7a00" }}>IQ</span>
    <span style={{ color: "#16a34a" }}>BALIA</span>
  </h1>

  <p
    style={{
      marginTop: "8px",
      color: "#9ca3af",
      fontSize: "12px",
    }}
  >
    College Management System
  </p>
</div>

        <div
  onClick={() => {
  setPage("dashboard");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
  style={menuStyle(page === "dashboard")}
>
  <MdDashboard size={22} />
  Dashboard
</div>

        {isAdmin && (
  <div
    onClick={() => {
  setPage("students");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
    style={menuStyle(page === "students")}
  >
    <MdPeople size={22} />
    Students
  </div>
)}

        {isAdmin && (
  <div
    onClick={() => {
  setPage("teachers");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
    style={menuStyle(page === "teachers")}
  >
    <FaChalkboardTeacher size={20} />
    Teachers
  </div>
)}

        <div
  onClick={() => {
  setPage("attendance");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
  style={menuStyle(page === "attendance")}
>
  <BsClipboardCheck size={20} />
  Attendance
</div>
       
        {(
  <div
    onClick={() => {
  setPage("manualAttendance");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
    style={menuStyle(page === "manualAttendance")}
  >
    <MdOutlineFactCheck size={22} />
    Manual Attendance
  </div>
)}

        {isAdmin && (
  <div style={menuStyle(false)}>
    <HiOutlineCurrencyDollar size={22} />
    Fees
  </div>
)}
        {isAdmin && (
  <div
    onClick={() => {
  setPage("reports");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
    style={menuStyle(page === "reports")}
  >
    <MdOutlineAssessment size={22} />
    Reports
  </div>
)}
{isAdmin && (
  <div
    onClick={() => {
  setPage("holidays");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
    style={menuStyle(page === "holidays")}
  >
    <MdEvent size={22} />
    Holiday Management
  </div>
)}
        {isAdmin && (
  <div
    onClick={() => {
  setPage("settings");

  if (window.innerWidth < 768) {
    setSidebarOpen(false);
  }
}}
    style={menuStyle(page === "settings")}
  >
    <MdSettings size={22} />
    Settings
  </div>
)}
        <div
  onClick={logout}
  style={{
    ...menuStyle(false),
    marginTop: "35px",
    color: "#ff5c5c",
  }}
>
<div
  style={{
    height: "1px",
    background: "#374151",
    margin: "30px 0 20px",
  }}
/>
  <MdLogout size={22} />
  Logout
</div>
      </div>

      <div
  style={{
    flex: 1,
    background: "#f3f6fb",
    padding: window.innerWidth < 768 ? "16px" : "30px 35px",
    overflowY: "auto",
    width: "100%",
    boxSizing: "border-box",
  }}
>
  {isMobile && (
    <button
      onClick={() => setSidebarOpen(true)}
      style={{
        border: "none",
        background: "#ff7a00",
        color: "white",
        fontSize: "26px",
        borderRadius: "10px",
        padding: "8px 12px",
        cursor: "pointer",
        marginBottom: "20px",
      }}
    >
      <MdMenu />
    </button>
  )}
        {page === "dashboard" ? (
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  }}
>
  <DashboardHeader />
  <DashboardCards />
</div>

) : page === "students" ? (
  <Students />
) : page === "teachers" ? (
  <Teachers />
) : page === "attendance" ? (
  <Attendance />
) : page === "manualAttendance" ? (
  <ManualAttendance />
) : page === "reports" ? (
  <AttendanceReport />
) : page === "holidays" ? (
  <Holidays />
) : page === "settings" ? (
  <Settings />
) : (
  <DashboardCards />
)}
      </div>
    </div>
  );
}