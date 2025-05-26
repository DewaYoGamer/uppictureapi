const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const drive = require('./gdrive');
require('dotenv').config();

const app = express();
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
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
  const filePath = req.file.path;
  const customName = `file_${Date.now()}`;

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
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
