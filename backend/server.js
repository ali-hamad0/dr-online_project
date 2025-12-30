const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 1) Folders + Static
// ===============================// Railway Volume mount path (persistent storage)
const basePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;

const uploadsDir = path.join(basePath, "uploads");
const doctorsDir = path.join(uploadsDir, "doctors");

fs.mkdirSync(doctorsDir, { recursive: true });

// Serve uploads
app.use("/uploads", express.static(uploadsDir));

// ===============================
// 2) MySQL Connection (Render -> Railway MySQL)
// ===============================
const db = mysql.createConnection({
  host: "switchyard.proxy.rlwy.net",
  port: Number(49959), // 49959
  user: root,               // root
  password: jYnhHWErfJRNWmcTTIMItHDoZIfVtagT,       // your password
  database: railway,           // railway
});


db.connect((err) => {
  if (err) console.log("MySQL connection failed:", err);
  else console.log("MySQL connected successfully");
});

// ===============================
// 3) Multer
// ===============================
const doctorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, doctorsDir),
  filename: (req, file, cb) =>
    cb(
      null,
      file.originalname + "_" + Date.now() + path.extname(file.originalname)
    ),
});

const uploadDoctorImage = multer({
  storage: doctorStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

// generic upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(
      null,
      file.originalname + "_" + Date.now() + path.extname(file.originalname)
    ),
});
const upload = multer({ storage });

// ===============================
// 4) Simple Guard (Admin/Doctor)
// ===============================
function requireAdmin(req, res, next) {
  const role = String(req.headers["x-user-role"] || "").toLowerCase();
  if (role === "admin" || role === "doctor") return next();
  return res.status(403).json({ ok: false, message: "Access denied" });
}

// ===============================
// 5) Health
// ===============================
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ===============================
// 6) Doctors
// ===============================
app.get("/api/doctors", (req, res) => {
  const q = "SELECT * FROM doctors ORDER BY id DESC";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.json(data);
  });
});

app.post("/api/doctors", uploadDoctorImage.single("image"), (req, res) => {
  const { name, specialty, bio } = req.body;

  if (!name || !specialty) {
    return res
      .status(400)
      .json({ ok: false, message: "name and specialty are required" });
  }

  const imagePath = req.file ? `/uploads/doctors/${req.file.filename}` : null;

  const q =
    "INSERT INTO doctors (name, specialty, bio, image) VALUES (?, ?, ?, ?)";
  const values = [name, specialty, bio || "", imagePath];

  db.query(q, values, (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });

    return res.status(201).json({
      ok: true,
      id: result.insertId,
      image: imagePath,
    });
  });
});

app.delete("/api/doctors/:id", (req, res) => {
  const id = req.params.id;

  // 1) get doctor first (to know image)
  const q1 = "SELECT * FROM doctors WHERE id = ? LIMIT 1";
  db.query(q1, [id], (err1, rows) => {
    if (err1) return res.status(500).json({ ok: false, error: err1.message });
    if (rows.length === 0)
      return res.status(404).json({ ok: false, message: "Doctor not found" });

    const doctor = rows[0];

    // 2) delete doctor row
    const q2 = "DELETE FROM doctors WHERE id = ?";
    db.query(q2, [id], (err2) => {
      if (err2) return res.status(500).json({ ok: false, error: err2.message });

      // 3) delete image file if exists
      if (doctor.image) {
        const localPath = path.join(
          __dirname,
          doctor.image.replace("/uploads/", "uploads/")
        );
        fs.unlink(localPath, () => {}); // ignore file errors
      }

      return res.json({ ok: true, deleted: true });
    });
  });
});

// ===============================
// 7) Posts
// ===============================
app.get("/api/posts", (req, res) => {
  const q = "SELECT * FROM posts ORDER BY id DESC";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.json(data);
  });
});

app.post("/api/posts", (req, res) => {
  const { author, role, text } = req.body;

  if (!author || !role || !text) {
    return res
      .status(400)
      .json({ ok: false, message: "author, role, text are required" });
  }

  const date = new Date().toLocaleString();

  const q = "INSERT INTO posts (author, role, text, date) VALUES (?, ?, ?, ?)";
  const values = [author, role, text, date];

  db.query(q, values, (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.status(201).json({ ok: true, id: result.insertId });
  });
});

// EDIT post (admin/doctor)
app.put("/api/posts/:id", requireAdmin, (req, res) => {
  const id = req.params.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ ok: false, message: "text is required" });
  }

  const q = "UPDATE posts SET text = ? WHERE id = ?";
  db.query(q, [text, id], (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.json({ ok: true, updated: true });
  });
});

// DELETE post (admin/doctor) + delete its comments/likes
app.delete("/api/posts/:id", requireAdmin, (req, res) => {
  const id = req.params.id;

  const q1 = "DELETE FROM comments WHERE post_id = ?";
  db.query(q1, [id], (err1) => {
    if (err1) return res.status(500).json({ ok: false, error: err1.message });

    const q2 = "DELETE FROM post_likes WHERE post_id = ?";
    db.query(q2, [id], (err2) => {
      if (err2) return res.status(500).json({ ok: false, error: err2.message });

      const q3 = "DELETE FROM posts WHERE id = ?";
      db.query(q3, [id], (err3) => {
        if (err3)
          return res.status(500).json({ ok: false, error: err3.message });

        return res.json({ ok: true, deleted: true });
      });
    });
  });
});

// ===============================
// 8) Comments
// ===============================
app.get("/api/posts/:postId/comments", (req, res) => {
  const postId = req.params.postId;

  const q = "SELECT * FROM comments WHERE post_id = ? ORDER BY id DESC";
  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.json(data);
  });
});

app.post("/api/posts/:postId/comments", (req, res) => {
  const postId = req.params.postId;
  const { author, text } = req.body;

  if (!author || !text) {
    return res
      .status(400)
      .json({ ok: false, message: "author and text are required" });
  }

  const q = "INSERT INTO comments (post_id, author, text) VALUES (?, ?, ?)";
  db.query(q, [postId, author, text], (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.status(201).json({ ok: true, id: result.insertId });
  });
});

// ===============================
// 9) Likes (simple: check then insert)
// ===============================
app.post("/api/posts/:postId/like", (req, res) => {
  const postId = req.params.postId;
  const { user_name } = req.body;

  if (!user_name)
    return res
      .status(400)
      .json({ ok: false, message: "user_name is required" });

  // check if already liked
  const q1 =
    "SELECT id FROM post_likes WHERE post_id = ? AND user_name = ? LIMIT 1";
  db.query(q1, [postId, user_name], (err1, rows) => {
    if (err1) return res.status(500).json({ ok: false, error: err1.message });
    if (rows.length > 0)
      return res.json({ ok: true, liked: false, message: "Already liked" });

    const q2 = "INSERT INTO post_likes (post_id, user_name) VALUES (?, ?)";
    db.query(q2, [postId, user_name], (err2) => {
      if (err2) return res.status(500).json({ ok: false, error: err2.message });
      return res.json({ ok: true, liked: true });
    });
  });
});

app.delete("/api/posts/:postId/like/:userName", (req, res) => {
  const { postId, userName } = req.params;

  const q = "DELETE FROM post_likes WHERE post_id = ? AND user_name = ?";
  db.query(q, [postId, userName], (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.json({ ok: true, unliked: true });
  });
});

app.get("/api/posts/:postId/likes/count", (req, res) => {
  const postId = req.params.postId;

  const q = "SELECT COUNT(*) AS cnt FROM post_likes WHERE post_id = ?";
  db.query(q, [postId], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.json({ ok: true, count: rows[0].cnt });
  });
});

// ===============================
// 10) Contact
// ===============================
app.post("/api/contact", (req, res) => {
  const { full_name, email, subject, message } = req.body;

  if (!full_name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ ok: false, message: "all fields are required" });
  }

  const q =
    "INSERT INTO contact_messages (full_name, email, subject, message) VALUES (?, ?, ?, ?)";
  db.query(q, [full_name, email, subject, message], (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.status(201).json({ ok: true, id: result.insertId });
  });
});

// ===============================
// 11) Simple Auth
// ===============================
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ ok: false, message: "name, email, password, role are required" });
  }

  const q =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(q, [name, email, password, role], (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    return res.status(201).json({ ok: true, id: result.insertId });
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const q = "SELECT * FROM users WHERE email = ? LIMIT 1";
  db.query(q, [email], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email/password" });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email/password" });
    }

    return res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  });
});

// ===============================
// 12) Optional Upload Endpoint
// ===============================
app.post("/api/upload", upload.single("file"), (req, res) => {
  return res.json({ ok: true, file: req.file });
});

// ===============================
// 13) 404
// ===============================
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===============================
// 14) Run Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
