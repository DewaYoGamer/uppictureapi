const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const drive = require('./gdrive');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD || null;
const app = express();
const upload = multer({
  dest: 'uploads/',
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|octet-stream/;
    const isValid = allowed.test(file.mimetype);

    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});


const FILEMAP_PATH = path.join(__dirname, '../fileMap.json');
app.use(cors());
app.set('trust proxy', true);
// === Helper: Baca dan Tulis fileMap.json ===
function loadFileMap() {
  if (!fs.existsSync(FILEMAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(FILEMAP_PATH));
}

function saveFileMap(data) {
  fs.writeFileSync(FILEMAP_PATH, JSON.stringify(data, null, 2));
}

// === Upload File ===
app.post('/api/upload', upload.single('profilePicture'), async (req, res) => {
  if (PASSWORD && req.headers.authorization !== PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const customName = `file_${Date.now()}.${req.file.originalname.split('.').pop()}`;

  try {
    const response = await drive.files.create({
      requestBody: {
        name: customName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      },
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    fs.unlinkSync(filePath);

    const fileMap = loadFileMap();
    fileMap[customName] = response.data.id;
    saveFileMap(fileMap);

    res.json({
      success: true,
      name: customName,
      data: {
        url: `${req.protocol}://${req.get('host')}/uploads/${customName}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// === Tampilkan Gambar ===
app.get('/uploads/:name', async (req, res) => {
  if (!req.params.name) {
    return res.status(400).send('File name is required');
  }

  const name = req.params.name;
  const fileMap = loadFileMap();
  const fileId = fileMap[name];

  if (!fileId) {
    return res.status(404).send('File not found');
  }

  try {
    const driveResponse = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    driveResponse.data.pipe(res);
  } catch (error) {
    res.status(500).send('Error retrieving image');
  }
});

// === Hapus File ===
app.delete('/api/upload/:name', async (req, res) => {
  if (PASSWORD && req.headers.authorization !== PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  if (!req.params.name) {
    return res.status(400).json({ success: false, message: 'File name is required' });
  }
  
  const name = req.params.name;
  const fileMap = loadFileMap();
  const fileId = fileMap[name];

  if (!fileId) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  try {
    await drive.files.delete({ fileId });

    // Hapus dari fileMap
    delete fileMap[name];
    saveFileMap(fileMap);

    res.json({ success: true, message: `File '${name}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
});

// === Start Server ===
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
