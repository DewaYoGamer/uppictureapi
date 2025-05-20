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

3. Create a `.env` file in the root directory with the following variables (optional):

```
PORT=3000        # The port on which the server will run (default: 3000)
PASSWORD=secret  # Optional authorization password for upload API
```

4. Start the development server:

```bash
npm run dev
```

5. The API endpoint is available at http://localhost:3000/api/upload (or the port you specified)

## Environment Variables

This API supports the following environment variables:

| Variable | Description                                                                                                                          | Default |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| PORT     | The port on which the server will run                                                                                                | 3000    |
| PASSWORD | Optional password for API authorization. If set, clients must include this password in the Authorization header when uploading files | null    |

## API Endpoints

### `POST /api/upload`

Uploads a profile picture.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Headers:
  - `Authorization`: The password defined in the environment variable (required only if PASSWORD is set)
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

**Unauthorized (when PASSWORD is set):**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

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
- Headers:
  - `Authorization`: The password defined in the environment variable (required only if PASSWORD is set)

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

**Unauthorized (when PASSWORD is set):**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

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
# Without password
curl -X POST -F "profilePicture=@/path/to/your/image.jpg" http://localhost:3000/api/upload

# With password (if PASSWORD environment variable is set)
curl -X POST -H "Authorization: your_password_here" -F "profilePicture=@/path/to/your/image.jpg" http://localhost:3000/api/upload
```

### Example using Postman:

1. Set request type to POST
2. URL: http://localhost:3000/api/upload
3. In the "Headers" tab (if PASSWORD is set), add a key "Authorization" with the value of your password
4. In the "Body" tab, select "form-data"
5. Add a key "profilePicture" and select "File" as the type
6. Upload your image file
7. Send the request

### Example using cURL to delete a file:

```bash
# Without password
curl -X DELETE http://localhost:3000/api/upload/profile-1621234567890-123456789.jpg

# With password (if PASSWORD environment variable is set)
curl -X DELETE -H "Authorization: your_password_here" http://localhost:3000/api/upload/profile-1621234567890-123456789.jpg
```

### Example using Postman to delete a file:

1. Set request type to DELETE
2. URL: http://localhost:3000/api/upload/profile-1621234567890-123456789.jpg
3. In the "Headers" tab (if PASSWORD is set), add a key "Authorization" with the value of your password
4. Send the request

## Technologies Used

- Express.js
- Multer (for file handling)
- Morgan (logging)
- CORS
