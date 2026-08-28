const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname)); // отдаёт index.html, alexb612.html и прочее

// --- Хранилище ---
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
for (const d of [DATA_DIR, UPLOADS_DIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

function load(f) {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch { return []; }
}
function save(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// --- Загрузка файлов ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.zip')) return cb(new Error('Only .zip allowed'));
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50 МБ
});

// --- Аккаунты ---
app.post('/api/accounts', (req, res) => {
  const { name, surname, pass, user } = req.body;
  if (!name || !surname || !pass || !user)
    return res.status(400).json({ error: 'Заполни все поля' });

  const accounts = load(ACCOUNTS_FILE);
  const cleanUser = String(user).trim();
  if (accounts.some(a => a.user === cleanUser))
    return res.status(409).json({ error: 'Такой юзернейм уже есть' });

  const acc = {
    id: Date.now().toString(),
    name: String(name).trim(),
    surname: String(surname).trim(),
    pass,
    user: cleanUser,
    fulluser: '&' + cleanUser
  };
  accounts.push(acc);
  save(ACCOUNTS_FILE, accounts);
  res.json(acc);
});

app.get('/api/accounts', (req, res) => {
  let accs = load(ACCOUNTS_FILE);
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase();
    accs = accs.filter(a =>
      a.fulluser.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  }
  res.json(accs.map(a => ({ ...a, pass: undefined })));
});

// --- Проекты ---
app.post('/api/projects', upload.single('file'), (req, res) => {
  const { name, author } = req.body;
  if (!name || !req.file)
    return res.status(400).json({ error: 'Укажи название и .zip файл' });

  const projects = load(PROJECTS_FILE);
  const p = {
    id: Date.now().toString(),
    name: String(name).trim(),
    author: author || '&anon',
    filename: req.file.filename,
    original: req.file.originalname
  };
  projects.unshift(p);
  save(PROJECTS_FILE, projects);
  res.json(p);
});

app.get('/api/projects', (req, res) => {
  let ps = load(PROJECTS_FILE);
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase();
    ps = ps.filter(p => p.name.toLowerCase().includes(q));
  }
  res.json(ps);
});

app.get('/api/projects/:id/download', (req, res) => {
  const ps = load(PROJECTS_FILE);
  const p = ps.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  res.download(path.join(UPLOADS_DIR, p.filename), p.original || 'project.zip');
});

app.listen(PORT, () => console.log('Engyls server запущен на http://localhost:' + PORT));
