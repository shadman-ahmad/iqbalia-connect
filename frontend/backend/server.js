require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const sendSMS = require("./sms");
console.log("Calling WhatsApp function...");
const sendWhatsApp = require("./whatsapp");
const multer = require("multer");
const path = require("path");
 

const app = express();

 app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.23:5173",
      "https://iqbalia-connect-frontend.onrender.com",
    ],
    credentials: true,
  })
);

 
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("Database Name:", mongoose.connection.name);
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Iqbalia Connect Backend is Running 🚀");
});

app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded",
    });
  }

  res.json({
    photo: `https://iqbalia-connect.onrender.com/uploads/${req.file.filename}`,
  });
});

const studentSchema = new mongoose.Schema({
  roll: {
    type: Number,
    required: true,
    unique: true,
  },
  name: String,
  father: String,
  mother: String,
  class: String,
  section: String,
  teacher: String,
  phone: String,
  parentPhone: String,
  address: String,
  photo: String,

// Old descriptor (keep for existing students)
descriptor: {
  type: [Number],
  default: [],
},

// New multiple descriptors
descriptors: {
  type: [[Number]],
  default: [],
},
});

const Student = mongoose.model("Student", studentSchema);

const attendanceSchema = new mongoose.Schema({
  roll: Number,
  name: String,
  class: String,
  date: String,
  time: String,
  status: String,
});

const notificationSchema = new mongoose.Schema({
  roll: Number,
  studentName: String,
  parentPhone: String,
  type: String,       // SMS / WhatsApp
  message: String,
  status: String,     // Pending, Sent, Failed
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

const settingsSchema = new mongoose.Schema({
  collegeName: String,
  address: String,
  phone: String,
  email: String,
  website: String,

  adminName: String,
  username: String,
  password: String,

  academicYear: String,
  collegeTiming: String,

  // Attendance Settings
attendanceStartTime: {
  type: String,
  default: "09:00",
},

attendanceCloseTime: {
  type: String,
  default: "09:20",
},

gracePeriod: {
  type: Number,
  default: 5,
},

autoCloseAttendance: {
  type: Boolean,
  default: true,
},

// Notification Settings
notificationMode: {
  type: String,
  default: "afterAttendance",
},

notificationDelay: {
  type: Number,
  default: 10,
},

notificationFixedTime: {
  type: String,
  default: "09:30",
},

  smsEnabled: {
    type: Boolean,
    default: true,
  },

  manualSmsMode: {
    type: Boolean,
    default: false,
  },

  smsProvider: String,
  smsApiKey: String,
  smsSenderId: String,
  smsTemplate: String,

  emailNotification: Boolean,
  parentNotification: Boolean,
});

const Settings = mongoose.model("Settings", settingsSchema);
// Holiday Schema
const holidaySchema = new mongoose.Schema({
  holidayName: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },
holidayType: {
  type: String,
  default: "Government",
},

  description: String,

  smsDisabled: {
    type: Boolean,
    default: true,
  },

  whatsappDisabled: {
    type: Boolean,
    default: true,
  },
});

const Holiday = mongoose.model("Holiday", holidaySchema);

const teacherSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true,
  },
  password: String,
  phone: String,
  subject: String,
  class: String,
  section: String,
  active: {
    type: Boolean,
    default: true,
  },
});

const Teacher = mongoose.model("Teacher", teacherSchema);
// ====================== STUDENT APIs ======================

// Add Student
app.post("/students", async (req, res) => {
  try {
    console.log("Descriptors received:", req.body.descriptors?.length);
    console.log("BODY RECEIVED:");
console.log(req.body);
    const student = new Student(req.body);
    const savedStudent = await student.save();
    console.log("Saved Student:");
console.log(savedStudent);
    console.log(
  "Saved descriptors:",
  savedStudent.descriptors?.length
);
    res.json(savedStudent);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Get Students
app.get("/students", async (req, res) => {
  try {
    const { username } = req.query;

    // Admin gets all students
    if (!username || username === "admin") {
      const students = await Student.find().sort({ roll: 1 });
      return res.json(students);
    }

    // Teacher login
    const teacher = await Teacher.findOne({
      username,
      active: true,
    });

    if (!teacher) {
      return res.json([]);
    }

    // Only students assigned to this teacher
    const students = await Student.find({
      teacher: teacher.username,
    }).sort({ roll: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Update Student
app.put("/students/:roll", async (req, res) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      {
        roll: req.params.roll,
      },
      req.body,
      {
        new: true,
      }
    );

    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Delete Student
app.delete("/students/:roll", async (req, res) => {
  try {
    await Student.findOneAndDelete({
      roll: req.params.roll,
    });

    res.json({
      message: "Student deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// ====================== ATTENDANCE APIs ======================

// Mark Attendance
app.post("/attendance", async (req, res) => {
  try {
    const { roll, date } = req.body;

    const alreadyMarked = await Attendance.findOne({
      roll,
      date,
    });

    if (alreadyMarked) {
      return res.json({
        message: "Attendance already marked today",
        attendance: alreadyMarked,
      });
    }

    const attendance = new Attendance(req.body);
    await attendance.save();

    res.json({
      message: "Attendance Saved",
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Get Attendance
app.get("/attendance", async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({
      _id: -1,
    });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
app.get("/attendance/:roll", async (req, res) => {
  try {
    const attendance = await Attendance.find({
      roll: req.params.roll,
    });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// Manual Attendance
app.post("/manual-attendance", async (req, res) => {
  try {
    const records = req.body;

    for (const record of records) {

      const already = await Attendance.findOne({
        roll: record.roll,
        date: record.date,
      });

      if (!already) {
        await Attendance.create(record);
      }

    }

    res.json({
      message: "Manual Attendance Saved",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ===================== NOTIFICATION APIs =====================

// Create Notification
app.post("/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Get Notifications
app.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ====================== TEACHER APIs ======================

// Teacher Login
app.post("/teacher/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const teacher = await Teacher.findOne({
      username,
      password,
      active: true,
    });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password",
      });
    }

    res.json({
      success: true,
      teacher,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Add Teacher
app.post("/teachers", async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.json(teacher);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Get All Teachers
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({
      name: 1,
    });
      res.json(teachers);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
  collegeName: "IQBALIA Junior College",
  address: "",
  phone: "",
  email: "",
  website: "",

  adminName: "Administrator",
  username: "admin",
  password: "",

  academicYear: "2026-27",
  collegeTiming: "9:00 AM - 4:00 PM",

  attendanceStartTime: "09:00",
attendanceCloseTime: "09:20",

gracePeriod: 5,

autoCloseAttendance: true,

notificationMode: "afterAttendance",

notificationDelay: 10,

notificationFixedTime: "09:30",

  smsEnabled: true,
  manualSmsMode: false,

  smsProvider: "",
  smsApiKey: "",
  smsSenderId: "",
  smsTemplate:
    "Dear Parent, your child {name} is absent today at IQBALIA Junior College.",

  emailNotification: false,
  parentNotification: true,
});
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
    }
    });



// Update Teacher
app.put("/teachers/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(teacher);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.put("/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json(settings);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/holidays", async (req, res) => {
  try {
    const holiday = await Holiday.create(req.body);
    res.json(holiday);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/holidays", async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/holidays/:id", async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(holiday);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.delete("/holidays/:id", async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: "Holiday Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Teacher
app.delete("/teachers/:id", async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({
      message: "Teacher deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.post("/attendance/mark-absent", async (req, res) => {
  try {
    const { date } = req.body;

    const students = await Student.find();

    const presentStudents = await Attendance.find({
      date,
      status: "Present",
    });

    const presentRolls = presentStudents.map((s) => s.roll);

    for (const student of students) {
      if (!presentRolls.includes(student.roll)) {
        if (!presentRolls.includes(student.roll)) {

  const alreadyExists = await Attendance.findOne({
    roll: student.roll,
    date,
  });

  if (!alreadyExists) {

    await Attendance.create({
      roll: student.roll,
      name: student.name,
      class: student.class,
      date,
      time: "-",
      status: "Absent",
    });

    // Send SMS to parent
    if (student.parentPhone) {

      const message =
        `Dear Parent,\n` +
        `${student.name} is absent today from IQBALIA Junior College.\n` +
        `Please contact the college if required.`;

      console.log("Student:", student.name);
      console.log("Parent Phone:", student.parentPhone);
      console.log("Sending SMS...");

      await sendSMS(student.parentPhone, message);
      await sendWhatsApp(student.parentPhone, student.name);
    }
  }
}
      }
    }

    res.json({
      success: true,
      message: "Absent students marked.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
    });
  }
});