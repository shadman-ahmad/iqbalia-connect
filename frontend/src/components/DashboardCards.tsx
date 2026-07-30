import RecentStudents from "./dashboard/RecentStudents";
import { useEffect, useState } from "react";
import {
  MdPeople,
  MdSchool,
  MdCheckCircle,
  MdCancel,
  MdPayments,
} from "react-icons/md";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import type { ChartData } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function DashboardCards() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/students")
      .then((res) => res.json())
      .then(setStudents);

    fetch("http://localhost:5000/teachers")
      .then((res) => res.json())
      .then(setTeachers);

    fetch("http://localhost:5000/attendance")
      .then((res) => res.json())
      .then(setAttendance);
  }, []);

  const today = new Date().toLocaleDateString();

  const todayAttendance = attendance.filter(
    (a) => a.date === today
  );

  const present = todayAttendance.filter(
    (a) => a.status === "Present"
  ).length;

  const absent = todayAttendance.filter(
    (a) => a.status === "Absent"
  ).length;

  const chartData: ChartData<"bar"> = {
    labels: ["Students", "Teachers", "Present", "Absent"],
    datasets: [
      {
        label: "Overview",
        data: [
          students.length,
          teachers.length,
          present,
          absent,
        ],
        backgroundColor: [
          "#ff7a00",
          "#3b82f6",
          "#22c55e",
          "#ef4444",
        ],
      },
    ],
  };

  return (
    <>
    <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginTop: "25px",
        }}
      >
        <Card
          title="Students"
          value={students.length}
          icon={<MdPeople size={34} />}
        />

        <Card
          title="Teachers"
          value={teachers.length}
          icon={<MdSchool size={34} />}
        />

        <Card
          title="Present Today"
          value={present}
          icon={<MdCheckCircle size={34} />}
        />

        <Card
          title="Absent Today"
          value={absent}
          icon={<MdCancel size={34} />}
        />

        <Card
          title="Fees"
          value="Coming Soon"
          icon={<MdPayments size={34} />}
        />
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "white",
          borderRadius: "20px",
          padding: "25px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        <div
  style={{
    display: "grid",
    gridTemplateColumns:
      window.innerWidth < 768 ? "1fr" : "2fr 1fr",
    gap: "25px",
    alignItems: "start",
  }}
>
  <div
  style={{
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 8px 25px rgba(0,0,0,.08)",
    width: "100%",
    overflowX: "auto",
    boxSizing: "border-box",
  }}
>
    <h2 style={{ marginTop: 0 }}>
      College Overview
    </h2>

    <Bar data={chartData} />
  </div>

  <RecentStudents />
</div>
      </div>
      <div
        style={{
          marginTop: "35px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#1e293b",
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "18px",
          }}
        >
          <QuickButton icon="🎓" text="Add Student" />

          <QuickButton icon="👩‍🏫" text="Add Teacher" />

          <QuickButton icon="📋" text="Take Attendance" />

          <QuickButton icon="📊" text="Attendance Reports" />
        </div>
      </div>

    </>
  );
}
function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "25px",
        minHeight: "210px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 25px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "18px",
          background: "#fff7ed",
          color: "#ff7a00",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: "15px 0 5px",
          color: "#334155",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          margin: 0,
          color: "#ff7a00",
          fontSize:
            typeof value === "string" ? "28px" : "46px",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

function QuickButton({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "22px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        cursor: "pointer",
        boxShadow: "0 8px 25px rgba(0,0,0,.08)",
        transition: "0.3s",
      }}
    >
      <div
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "14px",
          background: "#fff7ed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "26px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: 0,
          color: "#334155",
        }}
      >
        {text}
      </h3>
    </div>
  );
}