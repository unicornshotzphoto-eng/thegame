# Profile Picture Upload Feature

## Implementation Summary

The profile picture upload feature has been fully implemented with both backend and frontend components.

## Backend Changes

### 1. Django Views (`api/quiz/views.py`)
- Added `UpdateProfilePictureView` API endpoint
- Requires JWT authentication (`IsAuthenticated` permission)
- Handles `multipart/form-data` requests with `MultiPartParser` and `FormParser`
- Deletes old thumbnail before uploading new one
- Returns updated user data after successful upload

### 2. URL Configuration (`api/quiz/urls.py`)
- Added endpoint: `POST /quiz/profile/picture/`

### 3. Settings Configuration (`api/api/settings.py`)
- Added `MEDIA_URL = '/media/'`
- Added `MEDIA_ROOT = BASE_DIR / 'media'`

### 4. URL Patterns (`api/api/urls.py`)
- Configured media file serving in development mode
- Media files accessible at `http://192.168.1.210:8000/media/`

### 5. User Model (`api/quiz/models.py`)
- Already has `thumbnail = ImageField(upload_to=upload_thumbnail)`
- Uploads stored in `media/thumbnails/{username}/{filename}`

### 6. Serializer (`api/quiz/serializers.py`)
- `UserSerializer` already includes `thumbnail` field

## Frontend Changes

### 1. ProfileScreen Component (`my-app/app/(tabs)/index.jsx`)
- Added image picker functionality with `expo-image-picker`
- Requests camera roll permissions
- Allows 1:1 aspect ratio editing
- Compresses images to 50% quality

### 2. Image Upload Logic
- Creates `FormData` with the selected image
- Retrieves JWT token from `AsyncStorage`
- POSTs to `quiz/profile/picture/` with authentication header
- Updates Zustand store with new user data on success
- Shows success/error alerts

### 3. Image Display
- Displays uploaded thumbnail from backend: `http://192.168.1.210:8000${user.thumbnail}`
- Falls back to locally selected image URI during upload
- Shows placeholder with "Tap to upload" if no image

### 4. Styling
- Circular profile image (150x150 with border-radius 75)
- White border around image
- Gray placeholder background
- Centered layout

## Dependencies Installed

- `expo-image-picker` - For selecting images from device
- `Pillow` (Python) - For Django ImageField support (already installed)

## How to Test

### 1. Start Django Server
```powershell
cd c:\Users\unico\thegame
.\thegame\Scripts\Activate.ps1
cd api
python manage.py runserver 0.0.0.0:8000
```

### 2. Start React Native App
```powershell
cd c:\Users\unico\thegame\my-app
npm start
```

### 3. Test Flow
1. Log in to the app
2. Navigate to Profile page
3. Tap on the circular profile picture area
4. Select an image from your device
5. Allow camera roll permissions if prompted
6. Crop the image to 1:1 aspect ratio
7. Confirm the selection
8. Wait for upload to complete
9. See success alert
10. Image should persist even after logout/login

### 4. Verify Backend
- Check `api/media/thumbnails/{username}/` directory for uploaded images
- Access image via: `http://192.168.1.210:8000/media/thumbnails/{username}/{filename}`

## API Endpoint Details

### POST /quiz/profile/picture/

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {access_token}
```

**Body (FormData):**
```
thumbnail: File (image file)
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "thumbnail": "/media/thumbnails/testuser/image.jpg"
  },
  "message": "Profile picture updated successfully"
}
```

**Error Responses:**
- `400`: No image file provided
- `401`: Not authenticated (missing/invalid token)

## File Structure

```
api/
├── media/                          # Created automatically on first upload
│   └── thumbnails/
│       └── {username}/
│           └── {image_files}
├── quiz/
│   ├── views.py                   # UpdateProfilePictureView
│   ├── urls.py                    # profile/picture/ route
│   ├── models.py                  # User model with thumbnail field
│   └── serializers.py             # UserSerializer with thumbnail
└── api/
    ├── settings.py                # MEDIA_URL and MEDIA_ROOT
    └── urls.py                    # Media file serving

my-app/
└── app/
    ├── (tabs)/
    │   └── index.jsx              # ProfileScreen with upload logic
    └── src/
        ├── core/
        │   ├── api.js             # Axios instance
        │   └── global.js          # Zustand store
        └── utils/
            └── alert.js           # Cross-platform alerts
```

## Security Considerations

✅ JWT authentication required for uploads
✅ File type validation in model (jpg, jpeg, png, gif only)
✅ Old thumbnail deleted before new upload
✅ Files organized by username to prevent conflicts
⚠️ In production, should add file size limits
⚠️ In production, should use cloud storage (S3, Cloudinary, etc.)
⚠️ In production, should add rate limiting

## Troubleshooting

### Upload fails with "Network Error"
- Verify Django server is running on `0.0.0.0:8000`
- Check CORS settings include the network IP
- Ensure JWT token is valid (check AsyncStorage)

### Image not displaying
- Verify image uploaded to `api/media/thumbnails/`
- Check that `MEDIA_URL` is correctly configured
- Ensure image URL is constructed correctly: `http://192.168.1.210:8000${user.thumbnail}`

### Permissions denied
- User must grant camera roll permissions
- On iOS, permissions are requested automatically
- On Android, may need to add permissions to `AndroidManifest.xml`

### File upload returns 400
- Ensure FormData is constructed correctly
- Check that field name is `thumbnail` (matches Django view)
- Verify Content-Type header is `multipart/form-data`
