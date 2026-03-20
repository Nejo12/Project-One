# Storage API Contract

This document defines the first object-storage boundary for photo uploads and future render artifacts.

## Goals

- keep object storage behind the API boundary instead of exposing raw bucket credentials to the browser
- persist stable metadata records for uploaded photos and later render artifacts
- make the current editor slice able to upload one photo through the authenticated API

## Routes

### `GET /storage/photo-uploads`

Returns the authenticated user's stored photo uploads in reverse chronological order.

Response shape:

```json
{
  "objects": [
    {
      "id": "stored_object_123",
      "kind": "PHOTO_UPLOAD",
      "originalFilename": "family-photo.jpg",
      "contentType": "image/jpeg",
      "sizeBytes": 1024,
      "createdAt": "2026-03-20T00:00:00.000Z",
      "updatedAt": "2026-03-20T00:00:00.000Z"
    }
  ]
}
```

### `POST /storage/photo-uploads`

Uploads one image file for the authenticated user.

Request:

- `multipart/form-data`
- field name: `file`

Current validation rules:

- file is required
- content type must start with `image/`
- file size must be `<= 8 MB`

Response shape:

```json
{
  "object": {
    "id": "stored_object_123",
    "kind": "PHOTO_UPLOAD",
    "originalFilename": "family-photo.jpg",
    "contentType": "image/jpeg",
    "sizeBytes": 1024,
    "createdAt": "2026-03-20T00:00:00.000Z",
    "updatedAt": "2026-03-20T00:00:00.000Z"
  }
}
```

## Current Limitations

- photo uploads are stored and tracked, but browser delivery still uses the local preview URL in the editor
- signed download URLs are not implemented yet
- render-artifact upload and retrieval are reserved for the next rendering slice
