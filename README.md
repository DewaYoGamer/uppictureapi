# uppictureapigoogle

A simple Node.js Express API for uploading, serving, and deleting images using Google Drive as storage.

## Features

- Upload images to a specified Google Drive folder
- Serve images via public URLs
- Delete images from Google Drive
- File mapping is persisted in `fileMap.json`

## Requirements

- Node.js (v14+ recommended)
- Google Cloud project with Drive API enabled
- `credentials.json` for Google API authentication

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Google Drive Setup:**
   - Create a Google Cloud project and enable the Drive API.
   - Download `credentials.json` and place it in the project root.
   - Set up OAuth consent and get your refresh token (see Google Drive API docs).
   - Create a folder in Google Drive for uploads. Get its folder ID.
4. **Environment Variables:**
   Create a `.env` file in the root directory with:
   ```env
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
   ```

## Usage

### Start the server

```bash
node src/server.js
```

Server runs at http://localhost:3000

### Endpoints

#### POST `/upload`

- Upload an image file (form field: `profilePicture`).
- Returns: `{ success, name, url }`

#### GET `/uploads/:name`

- Retrieve and display the image by its custom name.

#### DELETE `/uploads/:name`

- Delete the image from Google Drive and remove its mapping.

## Notes

- Only image files are allowed (jpeg, jpg, png, gif, webp).
- File mappings are stored in `fileMap.json` for persistence.
- Uploaded files are deleted from local storage after upload.

## License

MIT
