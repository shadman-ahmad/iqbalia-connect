import { useEffect, useMemo, useState } from "react";

export default function AttendanceReport() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("https://iqbalia-connect.onrender.com/attendance");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.roll?.toString().includes(search);

      const matchesClass =
        selectedClass === "All" ||
        item.class === selectedClass;

      const matchesDate =
  selectedDate === "" ||
  item.date ===
    new Date(selectedDate).toLocaleDateString("en-US");

      return (
        matchesSearch &&
        matchesClass &&
        matchesDate
      );
    });
  }, [
    records,
    search,
    selectedClass,
    selectedDate,
  ]);

  const presentCount = filteredRecords.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = filteredRecords.filter(
    (item) => item.status === "Absent"
  ).length;

  const percentage =
    filteredRecords.length === 0
      ? 0
      : (
          (presentCount /
            filteredRecords.length) *
          100
        ).toFixed(1);

        const exportExcel = () => {
  const csv = [
    ["Roll", "Name", "Class", "Date", "Time", "Status"],
    ...filteredRecords.map((r) => [
      r.roll,
      r.name,
      r.class,
      r.date,
      r.time,
      r.status,
    ]),
  ]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Attendance_Report.csv";
  a.click();
};

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: isMobile ? "16px" : "30px",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px 30px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent:
            "space-between",
          alignItems: isMobile ? "stretch" : "center",
          boxShadow:
            "0 10px 25px rgba(0,0,0,.05)",
          marginBottom: "25px",
          gap: "20px",
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
            📊 Attendance Reports
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748B",
            }}
          >
            View, filter and print attendance
            records.
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
            onClick={() => window.print()}
            style={{
              background: "#FF7A00",
              color: "#fff",
              border: "none",
              padding: "12px 22px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🖨 Print Report
          </button>

          <button
            onClick={exportExcel}
            style={{
              background: "#2563EB",
              color: "#fff",
              border: "none",
              padding: "12px 22px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            📤 Export Excel
          </button>
        </div>
      </div>

      {/* Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {[
          {
            title: "Total Records",
            value: filteredRecords.length,
            color: "#2563EB",
            icon: "📚",
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
            title: "Attendance %",
            value: `${percentage}%`,
            color: "#F97316",
            icon: "📈",
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

      {/* Filters */}

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="🔍 Search by Name or Roll"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "230px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #CBD5E1",
          }}
        />

        <select
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(e.target.value)
          }
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #CBD5E1",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <option value="All">All Classes</option>
          <option value="MPC">MPC</option>
          <option value="BIPC">BIPC</option>
          <option value="CEC">CEC</option>
          <option value="HEC">HEC</option>
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(e.target.value)
          }
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #CBD5E1",
            width: isMobile ? "100%" : "auto",
          }}
        />
      </div>

      {/* Table */}

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
          <thead
            style={{
              background: "#FF7A00",
              color: "#fff",
            }}
          >
            <tr>
              <th style={{ padding: "15px" }}>
                Roll
              </th>
              <th>Name</th>
              <th>Class</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
  {filteredRecords.length === 0 ? (
    <tr>
      <td
        colSpan={6}
        style={{
          textAlign: "center",
          padding: "30px",
          color: "#666",
        }}
      >
        No attendance records found.
      </td>
    </tr>
  ) : (
    filteredRecords.map((item:any)=>(
              <tr
                key={item._id}
                style={{
                  borderBottom:
                    "1px solid #E2E8F0",
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  {item.roll}
                </td>

                <td style={{ fontWeight: 600 }}>
                  {item.name}
                </td>

                <td>{item.class}</td>

                <td>{item.date}</td>

                <td>{item.time}</td>

                <td>
                  <span
                    style={{
                      background:
                        item.status === "Present"
                          ? "#DCFCE7"
                          : "#FEE2E2",
                      color:
                        item.status === "Present"
                          ? "#15803D"
                          : "#B91C1C",
                      padding: "6px 14px",
                      borderRadius: "30px",
                      fontWeight: 600,
                    }}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}