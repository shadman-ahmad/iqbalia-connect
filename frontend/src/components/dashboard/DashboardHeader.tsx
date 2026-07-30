import { MdNotificationsNone, MdAccessTime } from "react-icons/md";

export default function DashboardHeader() {
  const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");

  const today = new Date();

  const date = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const time = today.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
  background: "linear-gradient(135deg,#ff7a00,#ff9f43)",
  borderRadius: "20px",
  padding: window.innerWidth < 768 ? "20px" : "22px 30px",
  color: "white",
  display: "flex",
  flexDirection: window.innerWidth < 768 ? "column" : "row",
  justifyContent: "space-between",
  alignItems: window.innerWidth < 768 ? "flex-start" : "center",
  gap: window.innerWidth < 768 ? "20px" : "0px",
  boxShadow: "0 10px 30px rgba(255,122,0,.25)",
}}
    >
      {/* Left Side */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 700,
          }}
        >
          Welcome Back 👋
        </h1>

        <p
          style={{
            marginTop: "6px",
            fontSize: "17px",
            opacity: 0.95,
          }}
        >
          {teacher.username === "admin"
            ? "Administrator Dashboard"
            : "Teacher Dashboard"}
        </p>

        <div
          style={{
  display: "flex",
  flexDirection: window.innerWidth < 768 ? "column" : "row",
  gap: "10px",
  marginTop: "15px",
  alignItems: "flex-start",
  fontSize: "15px",
}}
        >
          <span>📅 {date}</span>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <MdAccessTime />
            {time}
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div
        style={{
  display: "flex",
  alignItems: "center",
  gap: "20px",
  width: window.innerWidth < 768 ? "100%" : "auto",
  justifyContent:
    window.innerWidth < 768 ? "space-between" : "flex-end",
}}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "rgba(255,255,255,.25)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <MdNotificationsNone size={28} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "28px",
            }}
          >
            👨‍💼
          </div>

          <div>
            <h3
              style={{
                margin: 0,
              }}
            >
              {teacher.name}
            </h3>

            <p
              style={{
                margin: 0,
                opacity: 0.9,
                fontSize: "14px",
              }}
            >
              {teacher.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}