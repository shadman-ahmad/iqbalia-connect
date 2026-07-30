import React, { useEffect, useState } from "react";

type Student = {
  roll: number;
  name: string;
  father: string;
  mother: string;
  class: string;
  section: string;
  teacher: string;
  phone: string;
  parentPhone: string;
  address: string;
  photo: string;
};

type Props = {
  student: Student;
  goBack: () => void;
  editStudent: () => void;
};

export default function StudentProfile({
    student,
  goBack,
  editStudent,
}: Props) {

  const [presentDays, setPresentDays] = useState(0);
const [absentDays, setAbsentDays] = useState(0);
const [attendancePercent, setAttendancePercent] = useState(0);

useEffect(() => {
  loadAttendance();
}, []);

const loadAttendance = async () => {
  try {
    const res = await fetch(
      `https://iqbalia-connect.onrender.com//attendance/${student.roll}`
    );

    const data = await res.json();

    const present = data.filter(
      (item: any) => item.status === "Present"
    ).length;

    const absent = data.filter(
      (item: any) => item.status === "Absent"
    ).length;

    setPresentDays(present);
    setAbsentDays(absent);

    const total = present + absent;

    if (total > 0) {
      setAttendancePercent(
        Math.round((present / total) * 100)
      );
    }
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        background: "white",
        borderRadius: "15px",
        padding: "30px",
        boxShadow: "0 5px 20px rgba(0,0,0,.15)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#ff7a00",
        }}
      >
        Student Profile
      </h1>
      <button
  onClick={goBack}
  style={{
    background: "#ff7a00",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
    fontWeight: "bold",
  }}
>
  ← Back to Students
</button>
      <div
  style={{
    display: "flex",
    gap: "30px",
    marginTop: "30px",
    alignItems: "center",
  }}
>
  <img
    src={student.photo}
    alt="Student"
    style={{
      width: "180px",
      height: "180px",
      borderRadius: "15px",
      objectFit: "cover",
      border: "4px solid #ff7a00",
    }}
  />

  <div style={{ flex: 1 }}>

    <h2>{student.name}</h2>

    <p><b>Roll No:</b> {student.roll}</p>

    <p><b>Father:</b> {student.father}</p>

    <p><b>Mother:</b> {student.mother}</p>

    <p><b>Class:</b> {student.class}</p>

    <p><b>Section:</b> {student.section}</p>

    <p><b>Assigned Teacher:</b> {student.teacher}</p>

    <p><b>Student Phone:</b> {student.phone}</p>

    <p><b>Parent Phone:</b> {student.parentPhone}</p>

    <p><b>Address:</b> {student.address}</p>
    <div
  style={{
    marginTop: "25px",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "2px solid #ff7a00",
  }}
>
  <h3 style={{ color: "#ff7a00" }}>
    📊 Attendance Summary
  </h3>

  <p>
    <b>Attendance Percentage:</b> {attendancePercent}%
  </p>

  <p>
    ✅ <b>Present Days:</b> {presentDays}
  </p>

  <p>
    ❌ <b>Absent Days:</b> {absentDays}
  </p>

  <p>
    <b>Status:</b>{" "}
    {attendancePercent >= 90
      ? "🟢 Excellent"
      : attendancePercent >= 75
      ? "🟡 Good"
      : "🔴 Needs Improvement"}
  </p>
</div>
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "35px",
    flexWrap: "wrap",
  }}
>
  <button
    onClick={editStudent}
    style={{
      background: "#ff7a00",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    ✏️ Edit Student
  </button>

  <button
  onClick={() => {
  if (!window.confirm("Delete this student?")) return;

  fetch(`https://iqbalia-connect.onrender.com//students/${student.roll}`, {
    method: "DELETE",
  }).then(() => {
    alert("Student deleted successfully");
    goBack();
  });
}} 
    style={{
      background: "#dc2626",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    🗑 Delete Student
  </button>

  <button
    style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    📄 Print ID Card
  </button>

  <button
    style={{
      background: "#16a34a",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    📊 View Attendance
  </button>
</div>

  </div>
</div>
</div>
);
}