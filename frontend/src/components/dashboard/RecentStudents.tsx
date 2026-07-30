import { useEffect, useState } from "react";

type Student = {
  name: string;
  roll: string;
  class: string;
  photo?: string;
};

export default function RecentStudents() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch("https://iqbalia-connect.onrender.com/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.slice(-5).reverse());
      });
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "25px",
        boxShadow: "0 8px 25px rgba(0,0,0,.08)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "20px",
          color: "#1e293b",
        }}
      >
        Recent Students
      </h2>

      {students.map((student, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "18px",
            paddingBottom: "12px",
            borderBottom: "1px solid #eee",
          }}
        >
          <img
            src={student.photo || "https://via.placeholder.com/50"}
            alt=""
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div>
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              {student.name}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Roll: {student.roll} • {student.class}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}