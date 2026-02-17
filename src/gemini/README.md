# Gemini API Endpoints - Quick Reference

## Base URL

```
http://localhost:3001/api
```

---

## 1. Analyze Image

**Endpoint:** `POST /api/analyze-image`

**Purpose:** Analyzes source image to identify ingredients (food) or text/materials (product)

### Request

```json
{
  "base64": "YOUR_BASE64_IMAGE_STRING",
  "toolType": "FOOD"
}
```

| Field    | Type   | Required | Options               | Description          |
| -------- | ------ | -------- | --------------------- | -------------------- |
| base64   | string | ✅       | -                     | Base64 encoded image |
| toolType | string | ❌       | `"FOOD"`, `"PRODUCT"` | Defaults to `"FOOD"` |

### Response

```json
{
  "details": "grilled chicken, lettuce, tomato, cheese, sesame bun",
  "props": ["white plate", "wooden table", "fork", "napkin"]
}
```

---

## 2. Analyze Reference

**Endpoint:** `POST /api/analyze-reference`

**Purpose:** Identifies props in a reference/style image (useful for determining what to exclude)

### Request

```json
{
  "referenceBase64": "YOUR_BASE64_IMAGE_STRING"
}
```

| Field           | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| referenceBase64 | string | ✅       | Base64 encoded reference image |

### Response

```json
{
  "props": ["ceramic vase", "dried flowers", "marble pedestal", "studio lights"]
}
```

---

## 3. Enhance Image (Main Pipeline)

**Endpoint:** `POST /api/enhance-image`

**Purpose:** Generates enhanced/styled image using AI with advanced prompt engineering

### Request - Simple Example

```json
{
  "sourceBase64": "YOUR_BASE64_IMAGE_STRING",
  "styleInput": {
    "type": "TEXT",
    "description": "dark moody lighting with dramatic shadows"
  },
  "options": {
    "toolType": "FOOD",
    "aspectRatio": "1:1",
    "quality": "8K"
  }
}
```

### Request - Complete Example

```json
{
  "sourceBase64": "YOUR_SOURCE_IMAGE_BASE64",
  "styleInput": {
    "type": "IMAGE",
    "data": "YOUR_REFERENCE_IMAGE_BASE64"
  },
  "options": {
    "toolType": "PRODUCT",
    "aspectRatio": "16:9",
    "quality": "4K",
    "backgroundMode": "STYLE_MATCH",
    "excludedProps": ["vase", "flowers"],
    "detectedSubjectDetails": "Chanel No.5, clear glass, gold cap",
    "productDescription": "Chanel No.5 Perfume",
    "cameraAngle": "EYE_LEVEL",
    "usageScenario": "WEBSITE_HERO",
    "customInstructions": "Add soft golden hour lighting"
  }
}
```

### Request Parameters

#### Required Fields

| Field        | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| sourceBase64 | string | Base64 encoded source image to enhance |
| styleInput   | object | Style definition (see below)           |
| options      | object | Enhancement options (see below)        |

#### styleInput Object

| Field       | Type   | Options             | Description                                           |
| ----------- | ------ | ------------------- | ----------------------------------------------------- |
| type        | string | `"TEXT"`, `"IMAGE"` | Style input type                                      |
| description | string | -                   | Required if type is `"TEXT"`                          |
| data        | string | -                   | Base64 reference image, required if type is `"IMAGE"` |

#### options Object

**Required:**
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| toolType | string | `"FOOD"`, `"PRODUCT"` | Context mode |
| aspectRatio | string | `"1:1"`, `"16:9"`, `"9:16"`, `"4:3"` | Output aspect ratio |
| quality | string | `"HD"`, `"FHD"`, `"4K"`, `"8K"` | Output quality |

**Optional:**
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| backgroundMode | string | `"TRANSPARENT"`, `"COLOR"`, `"CUSTOM"`, `"KEEP_ORIGINAL"`, `"STYLE_MATCH"` | Background handling |
| backgroundColor | string | - | Hex color (e.g., `"#ffffff"`) if backgroundMode is `"COLOR"` |
| customBackground | string | - | Base64 image if backgroundMode is `"CUSTOM"` |
| excludedProps | string[] | - | Props from reference to exclude (from analyze-reference) |
| detectedSubjectDetails | string | - | Subject details to preserve (from analyze-image) |
| productDescription | string | - | Product/dish name for context |
| cameraAngle | string | `"TOP_DOWN"`, `"EYE_LEVEL"`, `"MACRO"`, `"FORTY_FIVE"` | Camera perspective |
| usageScenario | string | `"ECOMMERCE_MENU"`, `"WEBSITE_HERO"`, `"SOCIAL_LIFESTYLE"` | Use case styling |
| customInstructions | string | - | Additional custom requirements |
| useHighFidelity | boolean | - | Reserved for future use |

### Response

```json
{
  "imageBase64": "ENHANCED_IMAGE_BASE64_STRING"
}
```

---

## Complete Workflow Example

### Step 1: Analyze your source image

```bash
curl -X POST http://localhost:3001/api/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"base64": "SOURCE_IMAGE", "toolType": "PRODUCT"}'
```

**Response:** `{ "details": "Vodka bottle, frosted glass, silver cap", "props": [...] }`

### Step 2: (Optional) Analyze reference image

```bash
curl -X POST http://localhost:3001/api/analyze-reference \
  -H "Content-Type: application/json" \
  -d '{"referenceBase64": "REFERENCE_IMAGE"}'
```

**Response:** `{ "props": ["ice cubes", "cocktail glass", "lime"] }`

### Step 3: Generate enhanced image

```bash
curl -X POST http://localhost:3001/api/enhance-image \
  -H "Content-Type: application/json" \
  -d '{
    "sourceBase64": "SOURCE_IMAGE",
    "styleInput": {"type": "IMAGE", "data": "REFERENCE_IMAGE"},
    "options": {
      "toolType": "PRODUCT",
      "aspectRatio": "1:1",
      "quality": "8K",
      "excludedProps": ["cocktail glass", "lime"],
      "detectedSubjectDetails": "Vodka bottle, frosted glass, silver cap",
      "cameraAngle": "EYE_LEVEL"
    }
  }'
```

**Response:** `{ "imageBase64": "ENHANCED_IMAGE" }`

---

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- `400` - Bad Request (missing required fields)
- `500` - Server Error (Gemini API failed or internal error)

---

## Notes

- All images must be base64 encoded
- Maximum recommended image size: 10MB before encoding
- Processing time varies: 2-10 seconds for analysis, 10-30 seconds for enhancement
- Use `analyze-image` and `analyze-reference` results to populate `detectedSubjectDetails` and `excludedProps` for better results
