import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Student = {
  roll: number;
  name: string;
  class: string;
  section: string;
  photo: string;
  descriptor: number[];
  descriptors: number[][];
};

type AttendanceRecord = {
  roll: number;
  name: string;
  class: string;
  date: string;
  time: string;
  status: string;
};

const FACE_THRESHOLD = 0.60;

export default function Attendance() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const studentsRef = useRef<Student[]>([]);
  const markedStudentsRef = useRef<number[]>([]);
  const lastRecognizedRollRef = useRef<number | null>(null);
  const noFaceCounterRef = useRef(0);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>([]);

  const [markedStudents, setMarkedStudents] = useState<number[]>([]);

  const [cameraStarted, setCameraStarted] = useState(false);

  const [recognizedStudent, setRecognizedStudent] =
    useState<Student | null>(null);

  const [recognitionStatus, setRecognitionStatus] =
    useState("Camera Stopped");

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

  const [search, setSearch] = useState("");
  const [attendanceStartTime, setAttendanceStartTime] = useState("09:00");
const [attendanceCloseTime, setAttendanceCloseTime] = useState("09:20");
const [attendanceClosed, setAttendanceClosed] = useState(false);

  useEffect(() => {
    initialize();

    return () => {
      stopCamera();
    };
  }, []);

  async function initialize() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

      await loadStudents();
      await loadAttendance();
      await loadSetting();

      console.log("Face Models Loaded");
    } catch (err: any) {
  console.error("MODEL ERROR:", err);
  console.error(err?.message);
  console.error(err?.stack);
}
    
  }

  async function loadStudents() {
    const teacher = JSON.parse(
      localStorage.getItem("teacher") || "{}"
    );

    const res = await fetch(
      `http://localhost:5000/students?username=${teacher.username}`
    );

    const data = await res.json();

    setStudents(data);
    studentsRef.current = data;
  }

  async function loadAttendance() {
    const res = await fetch(
      "http://localhost:5000/attendance"
    );

    const data = await res.json();

    setAttendanceRecords(data);

    const today = new Date().toLocaleDateString();

    const marked = data
      .filter((x: AttendanceRecord) => x.date === today)
      .map((x: AttendanceRecord) => x.roll);

    markedStudentsRef.current = marked;

    setMarkedStudents(marked);
  }

  async function loadSetting() {
  const res = await fetch("http://localhost:5000/settings");
  const settings = await res.json();

  setAttendanceStartTime(settings.attendanceStartTime);
  setAttendanceCloseTime(settings.attendanceCloseTime);
}

useEffect(() => {
  const timer = setInterval(async () => {
    const now = new Date();

    const current =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const closed = current >= attendanceCloseTime;

    setAttendanceClosed(closed);

    if (closed) {
      clearInterval(timer);

      const today = new Date().toLocaleDateString();

      await fetch("http://localhost:5000/attendance/mark-absent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: today,
        }),
      });

      await loadAttendance();

      stopCamera();

      alert("Attendance closed. Absent students marked automatically.");
    }
  }, 1000);

  return () => clearInterval(timer);
}, [attendanceCloseTime]);

  async function startCamera() {
    if (cameraStarted) return;
    

    try {
      const stream =
      
        await navigator.mediaDevices.getUserMedia({
          video: {
  facingMode: "user",
},
        });

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        detectFaces();
      };

      setCameraStarted(true);
      setRecognitionStatus("Searching...");
    } catch (err: any) {
  console.error(err);

  alert(
    `${err.name}\n${err.message}`
  );
}
  }

  function stopCamera() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const tracks = (
        videoRef.current.srcObject as MediaStream
      ).getTracks();

      tracks.forEach((track) => track.stop());

      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx =
        canvasRef.current.getContext("2d");

      ctx?.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }

    setCameraStarted(false);

    setRecognitionStatus("Camera Stopped");

    setRecognizedStudent(null);

    lastRecognizedRollRef.current = null;

    noFaceCounterRef.current = 0;
  }

  function findBestMatch(
    descriptor: Float32Array
  ): Student | null {

    let bestStudent: Student | null = null;

    let bestDistance = 999;

    for (const student of studentsRef.current) {

      // Backward compatibility
const savedDescriptors =
  student.descriptors && student.descriptors.length > 0
    ? student.descriptors
    : student.descriptor
      ? [student.descriptor]
      : [];

if (savedDescriptors.length === 0) continue;

for (const saved of savedDescriptors) {
  const distance = faceapi.euclideanDistance(
    descriptor,
    new Float32Array(saved)
  );

  if (distance < bestDistance) {
    bestDistance = distance;
    bestStudent = student;
  }
}
    }

    if (
      bestStudent &&
      bestDistance <= FACE_THRESHOLD
    ) {
      return bestStudent;
    }

    return null;
  }
  async function detectFaces() {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      const canvas = canvasRef.current;

      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!detection) {
        noFaceCounterRef.current++;

        if (noFaceCounterRef.current > 5) {
          lastRecognizedRollRef.current = null;
          setRecognizedStudent(null);
          setRecognitionStatus("Searching...");
        }

        return;
      }

      noFaceCounterRef.current = 0;

      const resizedDetection = faceapi.resizeResults(
        detection,
        displaySize
      );

      faceapi.draw.drawDetections(
        canvas,
        resizedDetection
      );

      setRecognitionStatus("Face Detected");

      const matchedStudent = findBestMatch(
        detection.descriptor
      );

      if (!matchedStudent) {
        setRecognitionStatus("Unknown Face");
        return;
      }

      if (
        lastRecognizedRollRef.current ===
        matchedStudent.roll
      ) {
        return;
      }

      lastRecognizedRollRef.current =
        matchedStudent.roll;

      setRecognizedStudent(matchedStudent);

      setRecognitionStatus("Recognized");

      if (
        markedStudentsRef.current.includes(
          matchedStudent.roll
        )
      ) {
        setRecognitionStatus(
          "Attendance Already Marked"
        );

        setTimeout(() => {
          setRecognitionStatus("Searching...");
          lastRecognizedRollRef.current = null;
        }, 2500);

        return;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      try {
        if (attendanceClosed) {
   alert("Attendance is closed.");
   stopCamera();
   return;
}
        const response = await fetch(
          "http://localhost:5000/attendance",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              roll: matchedStudent.roll,
              name: matchedStudent.name,
              class: matchedStudent.class,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              status: "Present",
            }),
          }
        );

        const result = await response.json();

        if (
          result.message ===
          "Attendance Saved"
        ) {
          setRecognitionStatus(
            "Attendance Saved"
          );

          markedStudentsRef.current = [
            ...markedStudentsRef.current,
            matchedStudent.roll,
          ];

          setMarkedStudents([
            ...markedStudentsRef.current,
          ]);

          await loadAttendance();
        } else {
          setRecognitionStatus(
            "Attendance Already Marked"
          );
        }
      } catch (err) {
        console.log(err);

        setRecognitionStatus(
          "Failed To Save"
        );
      }

      setTimeout(() => {
        lastRecognizedRollRef.current = null;
        setRecognizedStudent(null);
        setRecognitionStatus("Searching...");

        detectFaces();
      }, 3000);
    }, 350);
  }
  const filteredAttendance = attendanceRecords.filter((record) => {
    return (
      record.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      record.roll
        .toString()
        .includes(search)
    );
  });

  async function exportToExcel() {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredAttendance
      );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Attendance"
      );

      const excelBuffer = XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

      const file = new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      saveAs(
        file,
        `Attendance_${new Date().toLocaleDateString()}.xlsx`
      );
    } catch (err) {
      console.log(err);
      alert("Export Failed");
    }
  }

  const today = new Date().toLocaleDateString();

  const todayAttendance =
    attendanceRecords.filter(
      (item) => item.date === today
    );

  const presentToday =
    todayAttendance.filter(
      (item) => item.status === "Present"
    ).length;

  const absentToday =
    students.length - presentToday;

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
      {/* ================= HEADER ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: "22px",
          padding: "25px 30px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: "20px",
          boxShadow:
          "0 10px 30px rgba(0,0,0,.05)",
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
            Face Attendance
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748B",
            }}
          >
            AI Powered Face Recognition
            Attendance System
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
          {!cameraStarted ? (
            <button
              onClick={startCamera}
              style={{
                background: "#FB923C",
                color: "#fff",
                border: "none",
                padding: "14px 24px",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow:
                  "0 8px 20px rgba(251,146,60,.25)",
                  width: isMobile ? "100%" : "auto",
              }}
            >
              📷 Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              style={{
                background: "#DC2626",
                color: "#fff",
                border: "none",
                padding: "14px 24px",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: 600,
                width: isMobile ? "100%" : "auto",
              }}
            >
              ⏹ Stop Camera
            </button>
          )}

          <button
            onClick={exportToExcel}
            style={{
              background: "#16A34A",
              color: "#fff",
              border: "none",
              padding: "14px 24px",
              borderRadius: "14px",
              cursor: "pointer",
              fontWeight: 600,
              width: isMobile ? "100%" : "auto",
            }}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* Registered Students */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748B", marginBottom: "10px" }}>
            Registered Students
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

        {/* Present Today */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748B", marginBottom: "10px" }}>
            Present Today
          </div>

          <h2
            style={{
              margin: 0,
              color: "#16A34A",
              fontSize: "34px",
            }}
          >
            {presentToday}
          </h2>
        </div>

        {/* Absent Today */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748B", marginBottom: "10px" }}>
            Absent Today
          </div>

          <h2
            style={{
              margin: 0,
              color: "#DC2626",
              fontSize: "34px",
            }}
          >
            {absentToday < 0 ? 0 : absentToday}
          </h2>
        </div>

        {/* Camera Status */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748B", marginBottom: "10px" }}>
            Camera Status
          </div>

          <h2
            style={{
              margin: 0,
              color: cameraStarted ? "#16A34A" : "#DC2626",
              fontSize: "24px",
            }}
          >
            {cameraStarted ? "🟢 Running" : "🔴 Stopped"}
          </h2>
        </div>
      </div>

      {/* Camera & Recognition */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
          gap: "25px",
          marginBottom: "25px",
        }}
      >
        {/* Camera Card */}

        <div
          style={{
            background: "#fff",
            borderRadius: "22px",
            padding: "20px",
            boxShadow: "0 8px 25px rgba(0,0,0,.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#1E293B",
            }}
          >
            Live Camera
          </h2>

          <div
            style={{
              position: "relative",
              borderRadius: "18px",
              overflow: "hidden",
              border: "4px solid #FB923C",
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width="100%"
              height={isMobile ? 300 :500}
              style={{
                width: "100%",
                display: "block",
              }}
            />

            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>

        {/* Recognition Panel */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Status */}

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0,0,0,.05)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#1E293B",
              }}
            >
              Recognition Status
            </h3>

            <div
              style={{
                marginTop: "15px",
                fontWeight: 700,
                color: "#2563EB",
                fontSize: "20px",
              }}
            >
              {recognitionStatus}
            </div>
          </div>
          {/* Recognized Student */}

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0,0,0,.05)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#1E293B",
              }}
            >
              Last Recognition
            </h3>

            {recognizedStudent ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  {recognizedStudent.photo ? (
                    <img
                      src={recognizedStudent.photo}
                      alt={recognizedStudent.name}
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid #FB923C",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: "#E2E8F0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "40px",
                        fontWeight: 700,
                        color: "#475569",
                      }}
                    >
                      {recognizedStudent.name.charAt(0)}
                    </div>
                  )}

                  <h2
                    style={{
                      marginTop: "20px",
                      marginBottom: "8px",
                      color: "#1E293B",
                    }}
                  >
                    {recognizedStudent.name}
                  </h2>

                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#15803D",
                      padding: "8px 18px",
                      borderRadius: "20px",
                      fontWeight: 600,
                    }}
                  >
                    Attendance Marked
                  </span>

                  <div
                    style={{
                      width: "100%",
                      marginTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#64748B",
                        }}
                      >
                        Roll
                      </span>

                      <strong>
                        {recognizedStudent.roll}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#64748B",
                        }}
                      >
                        Class
                      </span>

                      <strong>
                        {recognizedStudent.class}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          color: "#64748B",
                        }}
                      >
                        Time
                      </span>

                      <strong>
                        {new Date().toLocaleTimeString()}
                      </strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  height: "280px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#94A3B8",
                  fontSize: "18px",
                }}
              >
                Waiting for face...
              </div>
            )}
          </div>

          {/* Today's Summary */}

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0,0,0,.05)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#1E293B",
              }}
            >
              Today's Summary
            </h3>

            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <span>Total Students</span>
                <strong>{students.length}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <span>Present</span>
                <strong style={{ color: "#16A34A" }}>
                  {presentToday}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Absent</span>
                <strong style={{ color: "#DC2626" }}>
                  {absentToday < 0 ? 0 : absentToday}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,.05)",
          marginBottom: "25px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search Attendance..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            outline: "none",
            fontSize: "15px",
          }}
        />
      </div>
      {/* Attendance Table */}

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,.05)",
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
              <th style={{ padding: "18px" }}>Roll</th>
              <th>Name</th>
              <th>Class</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredAttendance.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94A3B8",
                    fontSize: "18px",
                  }}
                >
                  No attendance records found.
                </td>
              </tr>
            ) : (
              filteredAttendance.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    transition: ".25s",
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.background = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.background = "#fff";
                  }}
                >
                  <td
                    style={{
                      padding: "18px",
                      fontWeight: 600,
                      color: "#1E293B",
                    }}
                  >
                    {item.roll}
                  </td>

                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#1E293B",
                      }}
                    >
                      {item.name}
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        background: "#EFF6FF",
                        color: "#2563EB",
                        padding: "6px 14px",
                        borderRadius: "18px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {item.class}
                    </span>
                  </td>

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
                            : "#DC2626",
                        padding: "7px 15px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      ● {item.status}
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