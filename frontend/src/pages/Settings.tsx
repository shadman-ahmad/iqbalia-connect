import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type SettingsData = {
  collegeName: string;
  address: string;
  phone: string;
  email: string;
  website: string;

  adminName: string;
  username: string;
  password: string;

  academicYear: string;
  collegeTiming: string;
  attendanceStartTime: string;
attendanceCloseTime: string;
gracePeriod: number;

  smsNotification: boolean;
  emailNotification: boolean;
  parentNotification: boolean;
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    collegeName: "",
    address: "",
    phone: "",
    email: "",
    website: "",

    adminName: "",
    username: "",
    password: "",

    academicYear: "",
    collegeTiming: "",
    attendanceStartTime: "09:00",
attendanceCloseTime: "09:20",
gracePeriod: 5,

    smsNotification: true,
    emailNotification: false,
    parentNotification: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("http://localhost:5000/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch("http://localhost:5000/settings", { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleChange = (
    field: keyof SettingsData,
    value: string | boolean | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box" as const,
};

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px 30px",
          boxShadow: "0 10px 25px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#1E293B",
            fontSize: "34px",
          }}
        >
          ⚙️ Settings
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748B",
          }}
        >
          Manage your college information and system preferences.
        </p>
      </div>

      {/* College Information */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1E293B",
          }}
        >
          🏫 College Information
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "18px",
          }}
        >
          <input
            placeholder="College Name"
            value={settings.collegeName}
            onChange={(e) =>
              handleChange("collegeName", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Phone Number"
            value={settings.phone}
            onChange={(e) =>
              handleChange("phone", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Email Address"
            value={settings.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Website"
            value={settings.website}
            onChange={(e) =>
              handleChange("website", e.target.value)
            }
            style={inputStyle}
          />

          <textarea
            placeholder="College Address"
            value={settings.address}
            onChange={(e) =>
              handleChange("address", e.target.value)
            }
            rows={3}
            style={{
              ...inputStyle,
              gridColumn: "1 / -1",
              resize: "none",
            }}
          />
        </div>
      </div>
      {/* Administrator */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1E293B",
          }}
        >
          👤 Administrator
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "18px",
          }}
        >
          <input
            placeholder="Administrator Name"
            value={settings.adminName}
            onChange={(e) =>
              handleChange("adminName", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Username"
            value={settings.username}
            onChange={(e) =>
              handleChange("username", e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={settings.password}
            onChange={(e) =>
              handleChange("password", e.target.value)
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* Academic Settings */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1E293B",
          }}
        >
          🎓 Academic Settings
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "18px",
          }}
        >
          <input
            placeholder="Academic Year"
            value={settings.academicYear}
            onChange={(e) =>
              handleChange("academicYear", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="College Timing"
            value={settings.collegeTiming}
            onChange={(e) =>
              handleChange("collegeTiming", e.target.value)
            }
            style={inputStyle}
          />

          <input
  type="time"
  value={settings.attendanceStartTime}
  onChange={(e) =>
    handleChange("attendanceStartTime", e.target.value)
  }
  style={inputStyle}
/>

<input
  type="time"
  value={settings.attendanceCloseTime}
  onChange={(e) =>
    handleChange("attendanceCloseTime", e.target.value)
  }
  style={inputStyle}
/>

<input
  type="number"
  placeholder="Grace Period (Minutes)"
  value={settings.gracePeriod}
  onChange={(e) =>
    handleChange("gracePeriod", Number(e.target.value))
  }
  style={inputStyle}
/>
        </div>
      </div>

      {/* Notification Settings */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "25px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#1E293B",
          }}
        >
          🔔 Notification Settings
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            SMS Notifications

            <input
              type="checkbox"
              checked={settings.smsNotification}
              onChange={(e) =>
                handleChange(
                  "smsNotification",
                  e.target.checked
                )
              }
            />
          </label>

          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            Email Notifications

            <input
              type="checkbox"
              checked={settings.emailNotification}
              onChange={(e) =>
                handleChange(
                  "emailNotification",
                  e.target.checked
                )
              }
            />
          </label>

          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            Parent Notifications

            <input
              type="checkbox"
              checked={settings.parentNotification}
              onChange={(e) =>
                handleChange(
                  "parentNotification",
                  e.target.checked
                )
              }
            />
          </label>
        </div>
      </div>
      {/* Save Button */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={saveSettings}
          style={{
            background: "#FF7A00",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 600,
            boxShadow: "0 8px 20px rgba(255,122,0,.25)",
          }}
        >
          💾 Save Changes
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}