# API Documentation

## Base URL
```
Development: http://localhost:4000/api
Production: https://api.jewelfit.com/api
```

## Authentication

All authenticated endpoints require a JWT token in either:
- Cookie: `token`
- Header: `Authorization: Bearer <token>`

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Get Current User
```http
GET /auth/me
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Logout
```http
POST /auth/logout
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### Products

#### List Products
```http
GET /products?page=1&pageSize=20&published=true
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `published` (optional): Filter by published status (default: true)

**Response** (200):
```json
{
  "products": [
    {
      "id": "uuid",
      "sku": "JF-NECK-001",
      "title": "Vintage Gold Necklace",
      "description": "14K gold chain with pendant",
      "priceCents": 129990,
      "published": true,
      "assets": [
        {
          "id": "uuid",
          "type": "MODEL_GLTF",
          "url": "https://cdn.../necklace.glb",
          "metadata": { "anchors": ["neck_anchor"] }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

#### Get Product
```http
GET /products/:id
```

**Response** (200):
```json
{
  "id": "uuid",
  "sku": "JF-NECK-001",
  "title": "Vintage Gold Necklace",
  "description": "14K gold chain with pendant",
  "priceCents": 129990,
  "published": true,
  "assets": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Admin (Authenticated)

#### Create Product
```http
POST /admin/products
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "sku": "JF-NECK-004",
  "title": "Emerald Necklace",
  "description": "18K gold with emerald",
  "priceCents": 189990
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "sku": "JF-NECK-004",
  "title": "Emerald Necklace",
  "description": "18K gold with emerald",
  "priceCents": 189990,
  "published": false,
  "assets": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Product
```http
PATCH /admin/products/:id
```

**Headers**: `Authorization: Bearer <token>`

**Request Body** (partial):
```json
{
  "title": "Updated Title",
  "priceCents": 199990
}
```

#### Delete Product
```http
DELETE /admin/products/:id
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "message": "Product deleted"
}
```

#### Publish/Unpublish Product
```http
PATCH /admin/products/:id/publish
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "published": true
}
```

#### Add Asset to Product
```http
POST /admin/products/:id/assets
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "type": "MODEL_GLTF",
  "url": "https://cdn.../model.glb",
  "metadata": {
    "anchors": ["neck_anchor"],
    "polyCount": 25000
  }
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "productId": "uuid",
  "type": "MODEL_GLTF",
  "url": "https://cdn.../model.glb",
  "metadata": {...},
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Delete Asset
```http
DELETE /admin/assets/:id
```

**Headers**: `Authorization: Bearer <token>`

---

### Try-On Events

#### Record Try-On Event
```http
POST /tryon/events
```

**Headers**: `Authorization: Bearer <token>` (optional)

**Request Body**:
```json
{
  "productId": "uuid",
  "mode": "PHOTO",
  "metadata": {
    "duration": 120,
    "device": "mobile"
  }
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "mode": "PHOTO",
  "metadata": {...},
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Analytics
```http
GET /tryon/analytics
```

**Response** (200):
```json
{
  "byMode": [
    { "mode": "PHOTO", "_count": 1250 },
    { "mode": "MODEL3D", "_count": 890 }
  ],
  "topProducts": [
    { "productId": "uuid", "_count": 450 }
  ]
}
```

---

### Upload (Authenticated)

#### Get Presigned Upload URL
```http
POST /upload/presign
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "fileName": "necklace.glb",
  "fileType": "model/gltf-binary"
}
```

**Response** (200):
```json
{
  "uploadUrl": "https://s3.../presigned-url",
  "fileUrl": "https://cdn.../necklace.glb",
  "key": "uploads/user-id/uuid-necklace.glb"
}
```

**Usage**:
1. Get presigned URL from this endpoint
2. Upload file directly to S3 using PUT request to `uploadUrl`
3. Use `fileUrl` to reference the uploaded file

---

### User Images (Authenticated)

#### List Saved Images
```http
GET /user/images
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "images": [
    {
      "id": "uuid",
      "userId": "uuid",
      "url": "https://cdn.../image.jpg",
      "meta": { "productId": "uuid" },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Save Image
```http
POST /user/images
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "url": "https://cdn.../image.jpg",
  "meta": {
    "productId": "uuid",
    "mode": "PHOTO"
  }
}
```

#### Delete Image
```http
DELETE /user/images/:id
```

**Headers**: `Authorization: Bearer <token>`

---

### Checkout (Authenticated)

#### Create Checkout Session
```http
POST /checkout/create-session
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1,
      "customization": {
        "metal": "Rose Gold",
        "size": "7"
      }
    }
  ]
}
```

**Response** (200):
```json
{
  "sessionId": "stripe-session-id",
  "url": "https://checkout.stripe.com/..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Unauthenticated**: 100 requests per 15 minutes
- **Authenticated**: 1000 requests per 15 minutes
- **Admin**: 5000 requests per 15 minutes

---

## Webhooks

### Stripe Webhook
```http
POST /webhooks/stripe
```

**Headers**: `stripe-signature`

Handles Stripe events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.failed`
