import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useMemo, useState } from "react";

type Teacher = {
  _id?: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  subject: string;
  class: string;
  section: string;
  active?: boolean;
};

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Form Fields
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherClass, setTeacherClass] = useState("");
  const [section, setSection] = useState("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Modal
  const [showForm, setShowForm] = useState(false);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await fetch("https://iqbalia-connect.onrender.com//teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setPhone("");
    setSubject("");
    setTeacherClass("");
    setSection("");

    setIsEditing(false);
    setEditingId("");
  };

  const saveTeacher = async () => {
    if (
      !name ||
      !username ||
      !password ||
      !phone ||
      !subject ||
      !teacherClass ||
      !section
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const url = isEditing
      ? `https://iqbalia-connect.onrender.com//${editingId}`
      : "https://iqbalia-connect.onrender.com//teachers";

    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        password,
        phone,
        subject,
        class: teacherClass,
        section,
        active: true,
      }),
    });

    if (res.ok) {
      await loadTeachers();

      clearForm();
      setShowForm(false);

      toast.success(
  isEditing
    ? "Teacher updated successfully!"
    : "Teacher added successfully!"
);
    }
  };

  const editTeacher = (teacher: Teacher) => {
    setName(teacher.name);
    setUsername(teacher.username);
    setPassword(teacher.password);
    setPhone(teacher.phone);
    setSubject(teacher.subject);
    setTeacherClass(teacher.class);
    setSection(teacher.section);

    setEditingId(teacher._id || "");
    setIsEditing(true);
    setShowForm(true);
  };

  const deleteTeacher = async (id: string) => {
    if (!window.confirm("Delete this teacher?")) return;

    await fetch(`https://iqbalia-connect.onrender.com//teachers/${id}`, {
      method: "DELETE",
    });

    loadTeachers();

    toast.success("Teacher deleted successfully!");
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(search.toLowerCase()) ||
        teacher.username.toLowerCase().includes(search.toLowerCase());

      const matchesSubject =
        subjectFilter === "" ||
        teacher.subject === subjectFilter;

      const matchesClass =
        classFilter === "" ||
        teacher.class === classFilter;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesClass
      );
    });
  }, [
    teachers,
    search,
    subjectFilter,
    classFilter,
  ]);

  const totalTeachers = teachers.length;

  const totalSubjects = new Set(
    teachers.map((t) => t.subject)
  ).size;

  const totalClasses = new Set(
    teachers.map((t) => t.class)
  ).size;

  const activeTeachers = teachers.filter(
    (t) => t.active !== false
  ).length;

  const subjects = [
    ...new Set(teachers.map((t) => t.subject)),
  ];

  const classes = [
    ...new Set(teachers.map((t) => t.class)),
  ];

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: window.innerWidth < 768 ? "16px" : "30px",
        fontFamily: "Inter, Arial, sans-serif",
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
  justifyContent: "space-between",
  alignItems: isMobile ? "stretch" : "center",
  gap: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,.05)",
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
            👨‍🏫 Teacher Management
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748B",
            }}
          >
            Manage faculty members and class assignments.
          </p>
        </div>

        <button
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        style={{
  background: "#FF7A00",
  color: "#fff",
  border: "none",
  padding: "14px 22px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
  width: isMobile ? "100%" : "auto",
  alignSelf: isMobile ? "stretch" : "flex-end",
}}
        >
          + Add Teacher
        </button>
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
            title: "Total Teachers",
            value: totalTeachers,
            color: "#2563EB",
            icon: "👨‍🏫",
          },
          {
            title: "Subjects",
            value: totalSubjects,
            color: "#16A34A",
            icon: "📚",
          },
          {
            title: "Classes",
            value: totalClasses,
            color: "#F97316",
            icon: "🏫",
          },
          {
            title: "Active",
            value: activeTeachers,
            color: "#DC2626",
            icon: "🟢",
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
                marginTop: "8px",
                fontSize: "28px",
                fontWeight: 700,
                color: card.color,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,.05)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="🔍 Search Teacher..."
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
            value={subjectFilter}
            onChange={(e) =>
              setSubjectFilter(e.target.value)
            }
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              minWidth: "170px",
            }}
          >
            <option value="">All Subjects</option>

            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value)
            }
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              minWidth: "170px",
            }}
          >
            <option value="">All Classes</option>

            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Teacher Modal */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: window.innerWidth < 768 ? "90%" : "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "18px",
              padding: "25px",
            }}
          >
            <h2>
              {isEditing
                ? "Edit Teacher"
                : "Add Teacher"}
            </h2>

            {[
              ["Teacher Name", name, setName],
              ["Username", username, setUsername],
              ["Password", password, setPassword],
              ["Phone", phone, setPhone],
              ["Subject", subject, setSubject],
              ["Class", teacherClass, setTeacherClass],
              ["Section", section, setSection],
            ].map(([label, value, setter]: any) => (
              <input
                key={label}
                placeholder={label}
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                }}
              />
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "15px",
              }}
            >
              <button
                onClick={() => {
                  clearForm();
                  setShowForm(false);
                }}
                style={{
                  background: "#64748B",
                  color: "#fff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={saveTeacher}
                style={{
                  background: "#FF7A00",
                  color: "#fff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {isEditing
                  ? "Update Teacher"
                  : "Save Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Teachers Table */}

      <div
  style={{
    background: "#fff",
    borderRadius: "16px",
    overflowX: "auto",
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
              <th style={{ padding: "15px" }}>Teacher</th>
              <th>Username</th>
              <th>Subject</th>
              <th>Phone</th>
              <th>Class</th>
              <th>Section</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "35px",
                    color: "#64748B",
                  }}
                >
                  No teachers found.
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher._id}
                  style={{
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  {/* Teacher */}

                  <td style={{ padding: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: "#FF7A00",
                          color: "#fff",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: 700,
                          fontSize: "15px",
                        }}
                      >
                        {teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          {teacher.name}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748B",
                          }}
                        >
                          {teacher.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Username */}

                  <td>{teacher.username}</td>

                  {/* Subject */}

                  <td>{teacher.subject}</td>

                  {/* Phone */}

                  <td>{teacher.phone}</td>

                  {/* Class */}

                  <td>{teacher.class}</td>

                  {/* Section */}

                  <td>{teacher.section}</td>

                  {/* Status */}

                  <td>
                    <span
                      style={{
                        background: teacher.active !== false
                          ? "#DCFCE7"
                          : "#FEE2E2",
                        color: teacher.active !== false
                          ? "#15803D"
                          : "#B91C1C",
                        padding: "6px 14px",
                        borderRadius: "30px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {teacher.active !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}

                  <td>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() =>
                          editTeacher(teacher)
                        }
                        style={{
                          background: "#2563EB",
                          color: "#fff",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteTeacher(
                            teacher._id || ""
                          )
                        }
                        style={{
                          background: "#DC2626",
                          color: "#fff",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  theme="colored"
/>
      </div>
  );
}