# NestJS Backend for Cloudflare Stream Video Upload Service

I need to build a NestJS backend to support my Next.js frontend's Cloudflare Stream integration. The backend will handle two main operations:

1. Generating one-time upload URLs from Cloudflare Stream's Direct Creator Upload API
2. Checking the status of uploaded videos

## Project Requirements

- Create a NestJS application that will run on port 4000
- Implement a RESTful API with CORS enabled for the frontend
- Use environment variables for configuration (Cloudflare account ID and API token)
- Implement proper error handling and validation
- Use TypeScript for type safety

## API Endpoints

The backend should implement these endpoints to match the existing videoService in the frontend:

### 1. Get Upload URL

- **Endpoint**: `POST /api/videos/get-upload-url`
- **Description**: Generates a one-time upload URL from Cloudflare Stream for direct creator uploads
- **Request body**:
  ```json
  {
    "maxDurationSeconds": 3600
  }
  ```
- **Response**:
  ```json
  {
    "uploadURL": "https://upload.videodelivery.net/f65014bc6ff5419ea86e7972a047ba22",
    "uid": "f65014bc6ff5419ea86e7972a047ba22"
  }
  ```
- **Error responses**: 400 for validation errors, 500 for server errors

### 2. Check Video Status

- **Endpoint**: `GET /api/videos/status/:videoId`
- **Description**: Checks the status of an uploaded video on Cloudflare Stream
- **URL parameters**: `videoId` - The Cloudflare Stream video ID
- **Response**:
  ```json
  {
    "success": true,
    "readyToStream": true,
    "status": "ready",
    "video": {
      "uid": "f65014bc6ff5419ea86e7972a047ba22",
      "readyToStream": true,
      "thumbnail": "https://videodelivery.net/f65014bc6ff5419ea86e7972a047ba22/thumbnails/thumbnail.jpg",
      "playback": {
        "hls": "https://videodelivery.net/f65014bc6ff5419ea86e7972a047ba22/manifest/video.m3u8",
        "dash": "https://videodelivery.net/f65014bc6ff5419ea86e7972a047ba22/manifest/video.mpd"
      },
      "created": "2023-05-01T12:00:00Z",
      "duration": 120.5,
      "status": {
        "state": "ready"
      }
    }
  }
  ```
- **Error responses**: 404 if video not found, 500 for server errors

### 3. Get all videos

- **Endpoint**: `GET /api/videos`
- **Description**: Returns all videos in the Cloudflare Stream account
- **Response**:
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Videos retrieved successfully",
    "data": {
      "result": [
        {
          "uid": "f65014bc6ff5419ea86e7972a047ba22",
          "thumbnail": "https://videodelivery.net/f65014bc6ff5419ea86e7972a047ba22/thumbnails/thumbnail.jpg",
          "preview": "https://watch.videodelivery.net/f65014bc6ff5419ea86e7972a047ba22",
          "readyToStream": true,
          "readyToStreamAt": "2023-05-01T12:10:00Z",
          "status": {
            "state": "ready",
            "pctComplete": "100",
            "errorReasonCode": "",
            "errorReasonText": ""
          },
          "meta": {
            "filename": "example_video.mp4",
            "filetype": "video/mp4",
            "name": "Example Video",
            "relativePath": "",
            "type": "video"
          },
          "duration": 120.5,
          "created": "2023-05-01T12:00:00Z",
          "modified": "2023-05-01T12:10:00Z",
          "size": 15000000,
          "input": {
            "width": 1920,
            "height": 1080
          },
          "playback": {
            "hls": "https://videodelivery.net/f65014bc6ff5419ea86e7972a047ba22/manifest/video.m3u8",
            "dash": "https://videodelivery.net/f65014bc6ff5419ea86e7972a047ba22/manifest/video.mpd"
          }
        }
      ]
    }
  }
  ```

### 4. Get video by UID

- **Endpoint**: `GET /api/videos/:uid`
- **Description**: Returns a specific video by its UID
- **URL parameters**: `uid` - The Cloudflare Stream video UID
- **Response**: Same format as the get all videos endpoint, but with a single result

## Implementation Details

### Project Structure

Set up the project with the following structure:

```
src/
├── config/
│   └── configuration.ts
├── videos/
│   ├── dto/
│   │   ├── get-upload-url.dto.ts
│   │   ├── video-response.dto.ts
│   │   └── video-status-response.dto.ts
│   ├── videos.controller.ts
│   ├── videos.service.ts
│   └── videos.module.ts
├── common/
│   ├── exceptions/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── decorators/
│       └── api-response.decorator.ts
├── app.module.ts
└── main.ts
```

### Configuration

Use `@nestjs/config` to manage environment variables. Required variables:

- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Stream permissions
- `PORT`: The port to run the server on (default: 4000)
- `CORS_ORIGIN`: The allowed origin for CORS (default: http://localhost:3000)

### Video Service

Implement a service to interact with the Cloudflare Stream API:

1. Use Axios for HTTP requests to Cloudflare API
2. Implement methods for:
   - `getUploadUrl(maxDurationSeconds: number)`: Generate a direct creator upload URL
   - `getVideoStatus(videoId: string)`: Get the status of a video
   - `getAllVideos()`: Get all videos in the account
   - `getVideoByUid(uid: string)`: Get a specific video by its UID

### DTO Classes

Create DTOs (Data Transfer Objects) to ensure proper validation and consistent responses:

1. `GetUploadUrlDto`: For validating the upload URL request
   ```typescript
   export class GetUploadUrlDto {
     @IsNumber()
     @IsOptional()
     @Max(21600) // 6 hours max
     @Min(1)
     maxDurationSeconds: number = 3600;
   }
   ```

2. `VideoResponseDto`: For consistent video response format
3. `VideoStatusResponseDto`: For consistent status response format

### Error Handling

Implement global exception filters to handle:

1. HTTP exceptions (4xx, 5xx)
2. Validation exceptions (using class-validator)
3. Cloudflare API errors

### Security

1. Implement rate limiting for the API endpoints
2. Use Helmet for HTTP header security
3. Validate request inputs with class-validator

## Technical Implementation Notes

1. The Cloudflare Stream API requires an API token with the appropriate permissions
2. Direct Creator Uploads use a one-time URL that expires after 30 minutes
3. Video processing may take some time, so the status endpoint should handle the case where a video is still being processed
4. The frontend will poll the status endpoint to check when a video is ready to stream
5. All responses should follow the format expected by the frontend API connection layer

## Testing

Include unit tests for:

1. Videos service
2. Videos controller
3. Error handling middleware

## Deployment Considerations

The backend should be configured to work in:

1. Local development environment
2. Production environment with proper environment variables

Please implement this NestJS backend with clean, well-documented code that follows best practices for security, performance, and maintainability. 