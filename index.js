const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const OpenAI = require("openai");

const app = express();
const db = new sqlite3.Database("./db.sqlite");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

// ================= DATABASE =================

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS bots (
  id INTEGER PRIMARY KEY,
  name TEXT,
  type TEXT,
  description TEXT,
  owner_id INTEGER,
  status TEXT,
  score INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  bot_id INTEGER,
  content TEXT
)`);

// ================= AI =================

async function verifyBot(name, description, type) {
  const prompt = `
Check this bot:
Name: ${name}
Type: ${type}
Description: ${description}

Reply JSON:
{"status":"approved|flagged|rejected","score":1-10}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(res.choices[0].message.content);
}

async function moderateReview(content) {
  const prompt = `
Moderate:
"${content}"

Reply JSON:
{"status":"approved|flagged|rejected"}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(res.choices[0].message.content);
}

// ================= FRONTEND (INLINE HTML) =================

function page(content) {
  return `
  <html>
  <head>
    <title>Bot Hub</title>
    <style>
      body { font-family: Arial; background:#0f172a; color:white; text-align:center; }
      input, select, button { margin:5px; padding:10px; border-radius:8px; border:none; }
      button { background:#6366f1; color:white; cursor:pointer; }
      .card { background:#1e293b; padding:15px; margin:10px; border-radius:10px; }
    </style>
  </head>
  <body>
  <h1>🤖 Bot Hub</h1>
  ${content}
  </body>
  </html>
  `;
}

// ================= ROUTES =================

// HOME
app.get("/", (req, res) => {
  res.send(page(`
    <a href="/login">Login</a>
    <a href="/signup">Signup</a>
  `));
});

// SIGNUP PAGE
app.get("/signup", (req, res) => {
  res.send(page(`
    <h2>Signup</h2>
    <input id="u" placeholder="Username"><br>
    <input id="p" type="password" placeholder="Password"><br>
    <button onclick="go()">Create</button>

    <script>
    async function go(){
      await fetch("/signup",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username:u.value,password:p.value})});
      location="/dashboard";
    }
    </script>
  `));
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.send(page(`
    <h2>Login</h2>
    <input id="u"><br>
    <input id="p" type="password"><br>
    <button onclick="go()">Login</button>

    <script>
    async function go(){
      let r = await fetch("/login",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username:u.value,password:p.value})});
      let d = await r.json();
      if(d.success) location="/dashboard";
    }
    </script>
  `));
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.send(page(`
    <h2>Dashboard</h2>

    <button onclick="logout()">Logout</button>
    <button onclick="del()">Delete Account</button>

    <h3>Add Bot</h3>
    <input id="name" placeholder="Bot name">
    <select id="type">
      <option>Discord</option>
      <option>Twitch</option>
      <option>Telegram</option>
      <option>WhatsApp</option>
    </select>
    <input id="desc" placeholder="Description">
    <button onclick="add()">Submit</button>

    <h3>All Bots</h3>
    <div id="bots"></div>

    <script>
    async function add(){
      await fetch("/add-bot",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:name.value,type:type.value,description:desc.value})});
      load();
    }

    async function load(){
      let r = await fetch("/bots");
      let data = await r.json();
      bots.innerHTML = data.map(b => 
        "<div class='card'>"+b.name+" ("+b.type+") - "+b.status+
        "<br><input id='r"+b.id+"' placeholder='Review'>" +
        "<button onclick='rev("+b.id+")'>Send</button></div>"
      ).join("");
    }

    async function rev(id){
      let val = document.getElementById("r"+id).value;
      await fetch("/add-review",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({botId:id,content:val})});
    }

    function logout(){ location="/logout"; }
    async function del(){ await fetch("/delete-account",{method:"POST"}); location="/"; }

    load();
    </script>
  `));
});

// ================= AUTH =================

app.post("/signup", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  db.run("INSERT INTO users (username,password) VALUES (?,?)",
    [req.body.username, hash],
    function () {
      req.session.user = { id: this.lastID };
      res.json({ success: true });
    });
});

app.post("/login", (req, res) => {
  db.get("SELECT * FROM users WHERE username=?",
    [req.body.username],
    async (err, user) => {
      if (!user) return res.json({ success: false });
      const ok = await bcrypt.compare(req.body.password, user.password);
      if (!ok) return res.json({ success: false });

      req.session.user = user;
      res.json({ success: true });
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.post("/delete-account", (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  db.run("DELETE FROM users WHERE id=?", [req.session.user.id]);
  req.session.destroy();
  res.json({ success: true });
});

// ================= BOTS =================

app.post("/add-bot", async (req, res) => {
  if (!req.session.user) return res.sendStatus(401);

  const ai = await verifyBot(req.body.name, req.body.description, req.body.type);

  if (ai.status === "rejected") return res.json({ success: false });

  db.run(`INSERT INTO bots (name,type,description,owner_id,status,score)
    VALUES (?,?,?,?,?,?)`,
    [req.body.name, req.body.type, req.body.description, req.session.user.id, ai.status, ai.score]);

  res.json({ success: true });
});

app.get("/bots", (req, res) => {
  db.all("SELECT * FROM bots", [], (err, rows) => res.json(rows));
});

// ================= REVIEWS =================

app.post("/add-review", async (req, res) => {
  if (!req.session.user) return res.sendStatus(401);

  const ai = await moderateReview(req.body.content);
  if (ai.status === "rejected") return res.json({ success: false });

  db.run("INSERT INTO reviews (bot_id,content) VALUES (?,?)",
    [req.body.botId, req.body.content]);

  res.json({ success: true });
});

// ================= START =================

app.listen(3000, () => console.log("Running on port 3000"));
