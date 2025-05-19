# Profile Picture Upload API

A simple Express.js API for uploading profile pictures.

## Features

- Upload profile pictures with size validation (max 5MB)
- File type validation (accepts only images: jpeg, jpg, png, gif, webp)
- Generates unique filenames to prevent conflicts
- Returns a URL to access the uploaded image

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. The API endpoint is available at http://localhost:3000/api/upload

## API Endpoints

### `POST /api/upload`

Uploads a profile picture.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `profilePicture`: The image file to upload

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "profile-1621234567890-123456789.jpg",
    "mimetype": "image/jpeg",
    "size": 102400,
    "url": "http://localhost:3000/uploads/profile-1621234567890-123456789.jpg"
  }
}
```

### Error Responses

**Invalid file type:**

```json
{
  "success": false,
  "message": "Only image files are allowed!",
  "error": "Error: Only image files are allowed!"
}
```

**File too large:**

```json
{
  "success": false,
  "message": "File too large",
  "error": "Error: File too large"
}
```

**No file uploaded:**

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

### `DELETE /api/upload/:filename`

Deletes a profile picture by filename.

**Request:**

- Method: DELETE
- URL Parameter: `filename` - The name of the file to delete (must start with "profile-")

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "filename": "profile-1621234567890-123456789.jpg"
  }
}
```

### Error Responses for Delete

**File not found:**

```json
{
  "success": false,
  "message": "File not found"
}
```

**Invalid filename format:**

```json
{
  "success": false,
  "message": "Invalid filename format"
}
```

## Testing

You can test the API using tools like cURL, Postman, or any API testing tool.

### Example using cURL:

```bash
curl -X POST -F "profilePicture=@/path/to/your/image.jpg" http://localhost:3000/api/upload
```

### Example using Postman:

1. Set request type to POST
2. URL: http://localhost:3000/api/upload
3. In the "Body" tab, select "form-data"
4. Add a key "profilePicture" and select "File" as the type
5. Upload your image file
6. Send the request

### Example using cURL to delete a file:

```bash
curl -X DELETE http://localhost:3000/api/upload/profile-1621234567890-123456789.jpg
```

### Example using Postman to delete a file:

1. Set request type to DELETE
2. URL: http://localhost:3000/api/upload/profile-1621234567890-123456789.jpg
3. Send the request

## Technologies Used

- Express.js
- Multer (for file handling)
- Morgan (logging)
- CORS
