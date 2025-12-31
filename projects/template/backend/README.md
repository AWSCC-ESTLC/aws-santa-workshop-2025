# SantaCloud AWS Backend

This directory contains the AWS CDK infrastructure for the SantaCloud application backend.

## Architecture

- **API Gateway**: REST API with CORS enabled
- **Lambda Functions**: Serverless functions for each API endpoint
- **DynamoDB Tables**:
  - `SantaChildren`: Stores child information
  - `SantaGifts`: Stores gift manufacturing status
  - `SantaReindeers`: Stores reindeer status and location
  - `SantaLetters`: Stores children's letters

## Prerequisites

1. AWS CLI installed and configured with credentials
2. Node.js 18+ installed
3. AWS CDK CLI installed (`npm install -g aws-cdk`)

## Deployment

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Bootstrap CDK (first time only):**
   ```bash
   cdk bootstrap
   ```

3. **Deploy the stack:**
   ```bash
   cdk deploy
   ```

4. **Note the API URL** from the deployment output (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

## Populate Initial Data

After deployment, add the initial data to DynamoDB tables using AWS Console or CLI:

### Children Table
```json
[
  {"id": "1", "name": "Emma Thompson", "age": 7, "country": "USA", "status": "nice", "wishlist": ["Teddy Bear", "Art Set"], "niceScore": 95},
  {"id": "2", "name": "Lucas Martin", "age": 9, "country": "France", "status": "nice", "wishlist": ["Lego Set", "Soccer Ball"], "niceScore": 88},
  // ... add all children
]
```

### Gifts Table
```json
[
  {"id": "1", "childId": "1", "childName": "Emma Thompson", "giftName": "Teddy Bear Deluxe", "status": "ready", "priority": "high"},
  // ... add all gifts
]
```

### Reindeers Table
```json
[
  {"id": "1", "name": "Rudolph", "status": "resting", "location": "North Pole Stable", "energyLevel": 100},
  // ... add all reindeers
]
```

### Letters Table
```json
[
  {"id": "1", "childName": "Emma Thompson", "message": "Dear Santa...", "receivedDate": "2024-12-01", "replied": true},
  // ... add all letters
]
```

## Update Frontend

1. In `src/services/api.ts`, replace the `API_BASE` URL with your deployed API Gateway URL:
   ```typescript
   const API_BASE = 'https://your-api-id.execute-api.region.amazonaws.com/prod';
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /dashboard/stats` - Get dashboard statistics
- `GET /children` - Get all children (supports `?query=search`)
- `GET /children/{id}` - Get single child
- `POST /children` - Add new child
- `GET /gifts` - Get all gifts
- `PUT /gifts/{id}` - Update gift status
- `GET /gifts/progress` - Get gift progress statistics
- `GET /reindeers` - Get all reindeers
- `PUT /reindeers/{id}` - Update reindeer status
- `GET /letters` - Get all letters
- `POST /letters/reply` - Generate magic reply

## Cleanup

To destroy the stack:
```bash
cd backend
cdk destroy
```

## Cost Optimization

- DynamoDB uses on-demand pricing
- Lambda functions are triggered only when needed
- Consider API Gateway caching for frequently accessed data
