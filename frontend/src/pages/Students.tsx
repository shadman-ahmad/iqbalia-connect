import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import StudentProfile from "./StudentProfile";

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

  // Old descriptor (for existing students)
  descriptor: number[];

  // New descriptors (for new students)
  descriptors: number[][];
};

export default function Students() {
  // -------------------------------
  // Students
  // -------------------------------
  const [students, setStudents] = useState<Student[]>([]);

  // -------------------------------
  // Navigation
  // -------------------------------
  const [page, setPage] = useState<"list" | "profile">("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // -------------------------------
  // Modal
  // -------------------------------
  const [showForm, setShowForm] = useState(false);

  // -------------------------------
  // Search & Filters
  // -------------------------------
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");

  // -------------------------------
  // Edit Mode
  // -------------------------------
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoll, setEditingRoll] = useState<number | null>(null);

  // -------------------------------
  // Form
  // -------------------------------
  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [teacher, setTeacher] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");

  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [cameraStarted, setCameraStarted] = useState(false);

const videoRef = useRef<HTMLVideoElement>(null);

const streamRef = useRef<MediaStream | null>(null);
const captureIntervalRef = useRef<number | null>(null);
const [descriptors, setDescriptors] = useState<number[][]>([]);


// -------------------------------
  // Load Face Recognition Models
  // -------------------------------
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

      console.log("✅ Face Recognition Models Loaded");
    } catch (err) {
      console.log(err);
    }
  };

 async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
      },
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        startCapturing();
      };
    }

    setDescriptors([]);
    
    setCameraStarted(true);

  } catch (err) {
    console.log(err);
    alert("Unable to access camera.");
  }
}


function stopCamera() {
  if (captureIntervalRef.current) {
    clearInterval(captureIntervalRef.current);
    captureIntervalRef.current = null;
  }

  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  setCameraStarted(false);
}

async function startCapturing() {
  if (captureIntervalRef.current) {
    clearInterval(captureIntervalRef.current);
  }

  captureIntervalRef.current = window.setInterval(async () => {
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return;

    setDescriptors((prev) => {
      // Stop after collecting 10 descriptors
      if (prev.length >= 10) {
        stopCamera();

        setTimeout(() => {
          alert("✅ Face Registration Completed");
        }, 200);

        return prev;
      }

      // Prevent duplicate captures
      const newDescriptor = Array.from(detection.descriptor);

      const isDuplicate = prev.some((d) => {
        const distance = faceapi.euclideanDistance(
          new Float32Array(d),
          new Float32Array(newDescriptor)
        );

        return distance < 0.15;
      });

      if (isDuplicate) return prev;

      const updated = [...prev, newDescriptor];
      console.log("Descriptors:", updated.length);
      return updated;
    });

  }, 500);
}

  // -------------------------------
  // Load Students
  // -------------------------------
  useEffect(() => {
    loadModels();

    const teacherData = JSON.parse(localStorage.getItem("teacher") || "{}");

    fetch(
      `http://localhost:5000/students?username=${teacherData.username}`
    )
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.log(err));
  }, []);

  // -------------------------------
  // Clear Form
  // -------------------------------
  const clearForm = () => {
    setRoll("");
    setName("");
    setFather("");
    setMother("");
    setStudentClass("");
    setSection("");
    setTeacher("");
    setPhone("");
    setParentPhone("");
    setAddress("");
    setPhoto("");
    setPhotoFile(null);

    setIsEditing(false);
    setEditingRoll(null);
  };

  // -------------------------------
  // Filter Students
  // -------------------------------
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.roll.toString().includes(search);

    const matchesClass =
      classFilter === "All" || student.class === classFilter;

    const matchesSection =
      sectionFilter === "All" || student.section === sectionFilter;

    return matchesSearch && matchesClass && matchesSection;
  })
  // -------------------------------
// Save Student
// -------------------------------
const saveStudent = async () => {
  let uploadedPhoto = photo;
  let descriptor: number[] = [];

if (descriptors.length > 0) {
  descriptor = descriptors[0];
}

  if (photoFile) {
    const formData = new FormData();
    formData.append("photo", photoFile);

    const uploadRes = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    uploadedPhoto = uploadData.photo;

  }

  const student: Student = {
    roll: Number(roll),
    name,
    father,
    mother,
    class: studentClass,
    section,
    teacher,
    phone,
    parentPhone,
    address,
    photo: uploadedPhoto,

descriptor,      // Old system compatibility
descriptors,     // New system 
  };

  const url = isEditing
    ? `http://localhost:5000/${editingRoll}`
    : "http://localhost:5000/students";

  const method = isEditing ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  })
    .then((res) => res.json())
    .then((savedStudent) => {
      if (isEditing) {
        setStudents((prev) =>
          prev.map((s) =>
            s.roll === editingRoll ? savedStudent : s
          )
        );
      } else {
        setStudents((prev) => [...prev, savedStudent]);
      }

      clearForm();
      setShowForm(false);
    })
    .catch(console.log);
};

// -------------------------------
// Edit Student
// -------------------------------
const editStudent = (student: Student) => {
  setRoll(student.roll.toString());
  setName(student.name);
  setFather(student.father);
  setMother(student.mother);
  setStudentClass(student.class);
  setSection(student.section);
  setTeacher(student.teacher);
  setPhone(student.phone);
  setParentPhone(student.parentPhone);
  setAddress(student.address);
  setPhoto(student.photo);

  setEditingRoll(student.roll);
  setIsEditing(true);
  setShowForm(true);
};

// -------------------------------
// Delete Student
// -------------------------------
const deleteStudent = (roll: number) => {
  if (!window.confirm("Delete this student?")) return;

  fetch(`http://localhost:5000/students/${roll}`, {
    method: "DELETE",
  })
    .then(() => {
      setStudents((prev) =>
        prev.filter((s) => s.roll !== roll)
      );
    })
    .catch(console.log);
};

// -------------------------------
// Student Profile
// -------------------------------
if (page === "profile" && selectedStudent) {
  return (
    <StudentProfile
      student={selectedStudent}
      goBack={() => setPage("list")}
      editStudent={() => {
        editStudent(selectedStudent);
        setPage("list");
      }}
    />
  );
}
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
        borderRadius: "20px",
        padding: "25px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,.05)",
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
          Students
        </h1>

        <p
          style={{
            color: "#64748B",
            marginTop: "8px",
          }}
        >
          Manage all students of IQBALIA Junior College
        </p>
      </div>

      <button
        onClick={() => {
          clearForm();
          setShowForm(true);
        }}
        style={{
          background: "#FB923C",
          color: "white",
          border: "none",
          padding: "14px 28px",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "15px",
          boxShadow: "0 10px 25px rgba(251,146,60,.25)",
        }}
      >
        + Add Student
      </button>
    </div>

    {/* Stats */}

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
          Total Students
        </div>

        <h2
          style={{
            margin: 0,
            color: "#FB923C",
            fontSize: "34px",
          }}
        >
          {students.length}
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
          Active Students
        </div>

        <h2
          style={{
            margin: 0,
            color: "#16A34A",
            fontSize: "34px",
          }}
        >
          {students.length}
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
          Classes
        </div>

        <h2
          style={{
            margin: 0,
            color: "#2563EB",
            fontSize: "34px",
          }}
        >
          4
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
        placeholder="Search Student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          flex: 1,
          minWidth: "280px",
          padding: "15px",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          outline: "none",
          fontSize: "15px",
        }}
      />

      <select
        value={classFilter}
        onChange={(e) => setClassFilter(e.target.value)}
        style={{
          padding: "15px",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
        }}
      >
        <option value="All">All Classes</option>
        <option>MPC</option>
        <option>BIPC</option>
        <option>CEC</option>
        <option>MEC</option>
      </select>

      <select
        value={sectionFilter}
        onChange={(e) => setSectionFilter(e.target.value)}
        style={{
          padding: "15px",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
        }}
      >
        <option value="All">All Sections</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
      </select>
    </div>
    {/* Add / Edit Student Modal */}

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
        maxWidth: "900px",
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
          {isEditing ? "Edit Student" : "Add Student"}
        </h2>

        <button
          onClick={() => {
            clearForm();
            setShowForm(false);
          }}
          style={{
            border: "none",
            background: "#F1F5F9",
            width: "40px",
            height: "40px",
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
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "18px",
        }}
      >
        <input placeholder="Roll Number" value={roll} onChange={(e)=>setRoll(e.target.value)} />

        <input placeholder="Student Name" value={name} onChange={(e)=>setName(e.target.value)} />

        <input placeholder="Father Name" value={father} onChange={(e)=>setFather(e.target.value)} />

        <input placeholder="Mother Name" value={mother} onChange={(e)=>setMother(e.target.value)} />

        <input placeholder="Class" value={studentClass} onChange={(e)=>setStudentClass(e.target.value)} />

        <input placeholder="Section" value={section} onChange={(e)=>setSection(e.target.value)} />

        <input placeholder="Assigned Teacher" value={teacher} onChange={(e)=>setTeacher(e.target.value)} />

        <input placeholder="Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)} />

        <input placeholder="Parent Phone" value={parentPhone} onChange={(e)=>setParentPhone(e.target.value)} />

        <input placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} />
      </div>

      <div style={{ marginTop: "25px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          Student Photo
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setPhotoFile(file);
              setPhoto(URL.createObjectURL(file));
            }
          }}
        />

        {photo && (
          <img
            src={photo}
            alt="Preview"
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "18px",
              objectFit: "cover",
              marginTop: "20px",
              border: "3px solid #FB923C",
            }}
          />
        )}
      </div>

<div style={{ marginTop: "25px" }}>
  <h3>Face Registration</h3>

  {!cameraStarted ? (
    <button onClick={startCamera}>
      📷 Start Camera
    </button>
  ) : (
    <button onClick={stopCamera}>
      ⏹ Stop Camera
    </button>
  )}

  <div style={{ marginTop: "15px" }}>
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      width={350}
      style={{
        borderRadius: "12px",
        border: "3px solid #FB923C",
      }}
    />
<div
  style={{
    marginTop: "15px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#EA580C",
    textAlign: "center",
  }}
>
  {cameraStarted
    ? `Capturing Faces... ${descriptors.length}/10`
    : "Click Start Camera"}
</div>

  </div>
</div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "15px",
          marginTop: "35px",
        }}
      >
        <button
          onClick={()=>{
            clearForm();
            setShowForm(false);
          }}
          style={{
            padding: "14px 24px",
            borderRadius: "12px",
            border: "none",
            background: "#E2E8F0",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          onClick={saveStudent}
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            border: "none",
            background: "#FB923C",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(251,146,60,.25)",
          }}
        >
          {isEditing ? "Update Student" : "Save Student"}
        </button>
      </div>
    </div>
  </div>
)}
{/* Students Table */}

<div
  style={{
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,.05)",
    overflow: "hidden",
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
        <th style={{ padding: "18px" }}>Photo</th>
        <th>Student</th>
        <th>Roll</th>
        <th>Class</th>
        <th>Phone</th>
        <th>Status</th>
        <th style={{ textAlign: "center" }}>Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredStudents.map((student) => (
        <tr
          key={student.roll}
          style={{
            borderBottom: "1px solid #F1F5F9",
            transition: ".25s",
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedStudent(student);
            setPage("profile");
          }}
        >
          <td style={{ padding: "15px 18px" }}>
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #FED7AA",
                }}
              />
            ) : (
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  background: "#E2E8F0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "#64748B",
                }}
              >
                {student.name.charAt(0)}
              </div>
            )}
          </td>

          <td>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#1E293B",
                }}
              >
                {student.name}
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {student.father}
              </div>
            </div>
          </td>

          <td>{student.roll}</td>

          <td>
            <span
              style={{
                background: "#EFF6FF",
                color: "#2563EB",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {student.class}
            </span>
          </td>

          <td>{student.phone}</td>

          <td>
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
              ● Active
            </span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStudent(student);
                  setPage("profile");
                }}
                style={{
                  background: "#DBEAFE",
                  color: "#2563EB",
                  border: "none",
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                👁️
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editStudent(student);
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  deleteStudent(student.roll);
                }}
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