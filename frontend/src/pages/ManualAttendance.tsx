import { useEffect, useMemo, useState } from "react";

type Student = {
  roll: number;
  name: string;
  father: string;
  class: string;
  section: string;
  photo: string;
};

export default function ManualAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [key: number]: string }>({});
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

  useEffect(() => {
    const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");

    fetch(
      `https://iqbalia-connect.onrender.com/students?username=${teacher.username}`
    )
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(console.error);
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.roll.toString().includes(search);

      const matchClass =
        classFilter === "All" || student.class === classFilter;

      const matchSection =
        sectionFilter === "All" || student.section === sectionFilter;

      return matchSearch && matchClass && matchSection;
    });
  }, [students, search, classFilter, sectionFilter]);

  const presentCount = Object.values(attendance).filter(
    (x) => x === "Present"
  ).length;

  const absentCount = Object.values(attendance).filter(
    (x) => x === "Absent"
  ).length;

  const markAttendance = (roll: number, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [roll]: status,
    }));
  };

  const markAllPresent = () => {
    const updated: { [key: number]: string } = {};

    students.forEach((s) => {
      updated[s.roll] = "Present";
    });

    setAttendance(updated);
  };

  const markAllAbsent = () => {
    const updated: { [key: number]: string } = {};

    students.forEach((s) => {
      updated[s.roll] = "Absent";
    });

    setAttendance(updated);
  };

  const resetAttendance = () => {
    if (!window.confirm("Reset attendance?")) return;
    setAttendance({});
  };

  const saveAttendance = async () => {
    const records = students.map((student) => ({
      roll: student.roll,
      name: student.name,
      class: student.class,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: attendance[student.roll] || "Absent",
    }));

    try {
      await fetch("https://iqbalia-connect.onrender.com/manual-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(records),
      });

      alert("✅ Attendance Saved Successfully");
    } catch (err) {
      console.log(err);
      alert("❌ Error Saving Attendance");
    }
  };

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: isMobile ? "16px" : "30px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#1E293B",
              fontSize: "34px",
            }}
          >
            📝 Manual Attendance
          </h1>

          <p
            style={{
              color: "#64748B",
              marginTop: "8px",
            }}
          >
            Mark attendance manually for today's class.
          </p>
        </div>

        <div
        style={{
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  gap: "12px",
  width: isMobile ? "100%" : "auto",
}}
        >
          <button
            onClick={markAllPresent}
            style={{
              background: "#16A34A",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              width: isMobile ? "100%" : "auto",
            }}
          >
            ✓ Mark All Present
          </button>

          <button
            onClick={markAllAbsent}
            style={{
              background: "#DC2626",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              width: isMobile ? "100%" : "auto",
            }}
          >
            ✕ Mark All Absent
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
      {[
          {
            title: "Total Students",
            value: students.length,
            color: "#2563EB",
            icon: "👨‍🎓",
          },
          {
            title: "Present",
            value: presentCount,
            color: "#16A34A",
            icon: "✅",
          },
          {
            title: "Absent",
            value: absentCount,
            color: "#DC2626",
            icon: "❌",
          },
          {
            title: "Today's Date",
            value: new Date().toLocaleDateString(),
            color: "#F97316",
            icon: "📅",
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "22px",
              boxShadow: "0 8px 20px rgba(0,0,0,.05)",
            }}
          >
            <div style={{ fontSize: "30px" }}>{card.icon}</div>

            <div
              style={{
                marginTop: "12px",
                color: "#64748B",
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: card.color,
                marginTop: "8px",
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="🔍 Search Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #CBD5E1",
          }}
        />

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
          }}
        >
          <option>All</option>
          {[...new Set(students.map((s) => s.class))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
          }}
        >
          <option>All</option>
          {[...new Set(students.map((s) => s.section))].map((sec) => (
            <option key={sec}>{sec}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "auto",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#FF7A00",
                color: "#fff",
              }}
            >
              <th style={{ padding: "15px" }}>Roll</th>
              <th>Name</th>
              <th>Class</th>
              <th>Status</th>
              <th>Attendance</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.roll}
                style={{
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  {student.roll}
                </td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={student.photo}
                      alt=""
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {student.name}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                        }}
                      >
                        {student.father}
                      </div>
                    </div>
                  </div>
                </td>

                <td>{student.class}</td>

                <td>
                  <span
                    style={{
                      background:
                        attendance[student.roll]
                          ? "#DCFCE7"
                          : "#F1F5F9",
                      color:
                        attendance[student.roll]
                          ? "#15803D"
                          : "#64748B",
                      padding: "6px 12px",
                      borderRadius: "30px",
                      fontWeight: 600,
                    }}
                  >
                    {attendance[student.roll] || "Pending"}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() =>
                      markAttendance(student.roll, "Present")
                    }
                    style={{
                      background:
                        attendance[student.roll] === "Present"
                          ? "#16A34A"
                          : "#E2E8F0",
                      color:
                        attendance[student.roll] === "Present"
                          ? "#fff"
                          : "#000",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Present
                  </button>

                  <button
                    onClick={() =>
                      markAttendance(student.roll, "Absent")
                    }
                    style={{
                      background:
                        attendance[student.roll] === "Absent"
                          ? "#DC2626"
                          : "#E2E8F0",
                      color:
                        attendance[student.roll] === "Absent"
                          ? "#fff"
                          : "#000",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Absent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "25px",
          display: "flex",
          justifyContent:isMobile ? "stretch" : "flex-end",
flexDirection:isMobile ? "column" : "row",
          gap: "15px",
          width:isMobile ? "100%" : "auto",
        }}
      >
        <button
          onClick={resetAttendance}
          style={{
            background: "#64748B",
            color: "#fff",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>

        <button
          onClick={saveAttendance}
          style={{
            background: "#FF7A00",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          💾 Save Attendance
        </button>
      </div>
    </div>
  );
}