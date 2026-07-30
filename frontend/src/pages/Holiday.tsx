import { useEffect, useState } from "react";

type Holiday = {
  _id?: string;
  holidayName: string;
  date: string;
  holidayType: string;
  description: string;
  smsDisabled: boolean;
  whatsappDisabled: boolean;
};

export default function Holidays() {
  // ==========================
  // States
  // ==========================
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");

  const [holidayName, setHolidayName] = useState("");
  const [date, setDate] = useState("");
  const [holidayType, setHolidayType] = useState("Government");
  const [description, setDescription] = useState("");

  const [smsDisabled, setSmsDisabled] = useState(true);
  const [whatsappDisabled, setWhatsappDisabled] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // ==========================
  // Load Holidays
  // ==========================
  const loadHolidays = async () => {
    try {
      const res = await fetch("https://iqbalia-connect.onrender.com/holidays");
      const data = await res.json();

      setHolidays(data);
      setFilteredHolidays(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  // ==========================
  // Search
  // ==========================
  useEffect(() => {
    const filtered = holidays.filter((holiday) =>
      holiday.holidayName.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredHolidays(filtered);
  }, [search, holidays]);

  // ==========================
  // Clear Form
  // ==========================
  const clearForm = () => {
    setHolidayName("");
    setDate("");
    setHolidayType("Government");
    setDescription("");

    setSmsDisabled(true);
    setWhatsappDisabled(true);

    setIsEditing(false);
    setEditingId("");
  };

  // ==========================
  // Save Holiday
  // ==========================
  const saveHoliday = async () => {
    if (!holidayName || !date) {
      alert("Please enter Holiday Name and Date.");
      return;
    }

    const holiday = {
      holidayName,
      date,
      holidayType,
      description,
      smsDisabled,
      whatsappDisabled,
    };

    const url = isEditing
      ? `https://iqbalia-connect.onrender.com/holidays/${editingId}`
      : "https://iqbalia-connect.onrender.com/holidays";

    const method = isEditing ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(holiday),
      });

      clearForm();
      setShowForm(false);

      loadHolidays();
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // Edit Holiday
  // ==========================
  const editHoliday = (holiday: Holiday) => {
    setHolidayName(holiday.holidayName);
    setDate(holiday.date);
    setHolidayType(holiday.holidayType);
    setDescription(holiday.description);

    setSmsDisabled(holiday.smsDisabled);
    setWhatsappDisabled(holiday.whatsappDisabled);

    setEditingId(holiday._id || "");
    setIsEditing(true);
    setShowForm(true);
  };

  // ==========================
  // Delete Holiday
  // ==========================
  const deleteHoliday = async (id: string) => {
    if (!window.confirm("Delete this holiday?")) return;

    try {
      await fetch(`https://iqbalia-connect.onrender.com/holidays/${id}`, {
        method: "DELETE",
      });

      loadHolidays();
    } catch (err) {
      console.log(err);
    }
  };
  // ==========================
  // UI
  // ==========================
  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: isMobile ? "16px" : "30px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "25px 30px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          boxShadow: "0 10px 30px rgba(0,0,0,.05)",
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
            Holiday Management
          </h1>

          <p
            style={{
              color: "#64748B",
              marginTop: "8px",
            }}
          >
            Manage holidays and automatically stop attendance notifications.
          </p>
        </div>

        <button
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
          style={{
            background: "#FB923C",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "15px",
            boxShadow: "0 10px 25px rgba(251,146,60,.25)",
            width: isMobile ? "100%" : "auto",
          }}
        >
          + Add Holiday
        </button>
      </div>

      {/* Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              color: "#64748B",
              marginBottom: "10px",
            }}
          >
            Total Holidays
          </div>

          <h2
            style={{
              margin: 0,
              color: "#FB923C",
              fontSize: "34px",
            }}
          >
            {holidays.length}
          </h2>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              color: "#64748B",
              marginBottom: "10px",
            }}
          >
            SMS Disabled
          </div>

          <h2
            style={{
              margin: 0,
              color: "#DC2626",
              fontSize: "34px",
            }}
          >
            {holidays.filter((h) => h.smsDisabled).length}
          </h2>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              color: "#64748B",
              marginBottom: "10px",
            }}
          >
            WhatsApp Disabled
          </div>

          <h2
            style={{
              margin: 0,
              color: "#16A34A",
              fontSize: "34px",
            }}
          >
            {holidays.filter((h) => h.whatsappDisabled).length}
          </h2>
        </div>
      </div>

      {/* Search */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <input
          placeholder="Search Holiday..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: isMobile ? "100%" : "300px",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            outline: "none",
            fontSize: "15px",
            width:"100%"
          }}
        />
      </div>
      {/* Add / Edit Holiday Modal */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "95%",
              maxWidth: "750px",
              borderRadius: "22px",
              padding: "30px",
              boxShadow: "0 25px 60px rgba(0,0,0,.18)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#1E293B",
                }}
              >
                {isEditing ? "Edit Holiday" : "Add Holiday"}
              </h2>

              <button
                onClick={() => {
                  clearForm();
                  setShowForm(false);
                }}
                style={{
                  border: "none",
                  background: "#F1F5F9",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(300px,1fr))",
                gap: "18px",
              }}
            >
              <input
                placeholder="Holiday Name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  outline: "none",
                }}
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                }}
              />

              <select
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value)}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <option>Weekly Off</option>
                <option>Government</option>
                <option>Festival</option>
                <option>College Event</option>
                <option>Emergency</option>
              </select>

              <input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
gap: isMobile ? "16px" : "40px",
                marginTop: "30px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <input
                  type="checkbox"
                  checked={smsDisabled}
                  onChange={(e) =>
                    setSmsDisabled(e.target.checked)
                  }
                />
                Disable SMS
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <input
                  type="checkbox"
                  checked={whatsappDisabled}
                  onChange={(e) =>
                    setWhatsappDisabled(e.target.checked)
                  }
                />
                Disable WhatsApp
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: isMobile ? "stretch" : "flex-end",
flexDirection: isMobile ? "column" : "row",
                gap: "15px",
                marginTop: "35px",
              }}
            >
              <button
                onClick={() => {
                  clearForm();
                  setShowForm(false);
                }}
                style={{
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#E2E8F0",
                  cursor: "pointer",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Cancel
              </button>

              <button
                onClick={saveHoliday}
                style={{
                  padding: "14px 30px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#FB923C",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    "0 10px 25px rgba(251,146,60,.30)",
                    width: isMobile ? "100%" : "auto",
                }}
              >
                {isEditing
                  ? "Update Holiday"
                  : "Save Holiday"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Holiday Table */}

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,.05)",
          overflow: "auto",
          marginTop: "25px",
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
                background: "#FFF7ED",
                color: "#EA580C",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "18px" }}>Holiday</th>
              <th>Date</th>
              <th>Type</th>
              <th>SMS</th>
              <th>WhatsApp</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredHolidays.map((holiday) => (
              <tr
                key={holiday._id}
                style={{
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <td style={{ padding: "18px" }}>
                  <div style={{ fontWeight: 700, color: "#1E293B" }}>
                    {holiday.holidayName}
                  </div>

                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "13px",
                      marginTop: "5px",
                    }}
                  >
                    {holiday.description}
                  </div>
                </td>

                <td>{holiday.date}</td>

                <td>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "13px",
                      background:
                        holiday.holidayType === "Government"
                          ? "#DBEAFE"
                          : holiday.holidayType === "Festival"
                          ? "#DCFCE7"
                          : holiday.holidayType === "Emergency"
                          ? "#FEE2E2"
                          : "#FEF3C7",
                      color:
                        holiday.holidayType === "Government"
                          ? "#2563EB"
                          : holiday.holidayType === "Festival"
                          ? "#15803D"
                          : holiday.holidayType === "Emergency"
                          ? "#DC2626"
                          : "#B45309",
                    }}
                  >
                    {holiday.holidayType}
                  </span>
                </td>

                <td>
                  {holiday.smsDisabled ? (
                    <span
                      style={{
                        background: "#DCFCE7",
                        color: "#15803D",
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Disabled
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "#DBEAFE",
                        color: "#2563EB",
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Enabled
                    </span>
                  )}
                </td>

                <td>
                  {holiday.whatsappDisabled ? (
                    <span
                      style={{
                        background: "#DCFCE7",
                        color: "#15803D",
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Disabled
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "#DBEAFE",
                        color: "#2563EB",
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Enabled
                    </span>
                  )}
                </td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => editHoliday(holiday)}
                      style={{
                        background: "#FFF7ED",
                        color: "#EA580C",
                        border: "none",
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        deleteHoliday(holiday._id || "")
                      }
                      style={{
                        background: "#FEE2E2",
                        color: "#DC2626",
                        border: "none",
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}