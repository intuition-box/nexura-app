# Hub Endpoints Documentation

This documentation covers all API endpoints related to hubs (formerly projects) in the Nexura application server.

## Authentication Endpoints

### POST /hub/sign-up
Sign up a new hub.

**Request Body:**
- `name` (string, required): Hub name
- `description` (string, required): Hub description
- `address` (string, required): Hub address
- `logo` (file, required): Hub logo image

**Response:**
```json
{
  "message": "hub created!",
}
```

### POST /hub/sign-in
Sign in as a hub or admin.

**Request Body:**
- `email` (string, required): Email
- `password` (string, required): Password

**Response:**
```json
{
  "message": "signed in!",
  "accessToken": "jwt_token_here"
}
```

### POST /hub/logout
Logout the admin session.

**Request:** Authenticated

**Response:**
```json
{
  "message": "admin logged out!"
}
```

### POST /hub/reset-password
Reset hub password using token.

**Request Body:**
- `token` (string, required): Reset token
- `password` (string, required): New password

**Response:**
```json
{
  "message": "project password reset successful!"
}
```

### POST /hub/forgot-password
Request password reset email.

**Request Body:**
- `email` (string, required): Email

**Response:**
```json
{
  "message": "password reset email sent!"
}
```

### POST /hub/admin/sign-up
Sign up a hub admin using OTP.

**Request Body:**
- `email` (string, required): Email
- `password` (string, required): Password
- `code` (string, required): 6-digit OTP code
- `name` (string, required): Name

**Response:**
```json
{
  "message": "project admin signed up!",
  "accessToken": "jwt_token_here"
}
```

## Campaign Management Endpoints

### GET /hub/get-campaigns
Fetch all campaigns for the authenticated hub.

**Request:** Authenticated

**Response:**
```json
{
  "hubCampaigns": [
    {
      // Campaign objects
    }
  ]
}
```

### POST /hub/validate-campaign-submissions
Validate or reject a campaign submission.

**Request Body:**
- `submissionId` (string, required): Submission ID
- `action` (string, required): "accept" or "reject"

**Response:** 204 No Content

### PATCH /hub/save-campaign-quests
Save campaign with quests.

**Request Body:**
- `campaignData` (object, required): Campaign data (same as create-campaign)
- `questData` (array, required): Array of quest objects with title, description, url, reward.xp

**Request File:**
- `coverImage` (file): Campaign cover image

**Response:** 204 No Content

### PATCH /hub/save-campaign
Save a campaign draft.

**Request Body:**
- `title` (string, required): Campaign title
- `description` (string, required): Campaign description
- `nameOfProject` (string, required): Hub name
- `starts_at` (string, required): Start date
- `ends_at` (string, required): End date
- `reward` (object, required): { xp: number, trust?: number, pool: number }
- `totalTrustAvailable` (number, optional)
- `projectCoverImage` (string, optional)

**Request File:**
- `coverImage` (file): Campaign cover image

**Query Parameters:**
- `id` (string, optional): Campaign ID for updates

**Response:**
```json
{
  "message": "Campaign saved successfully",
  "campaignId": "campaign_id_here"
}
```
or if updating:
```json
{
  "campaignId": "campaign_id_here"
}
```

### GET /hub/get-campaign
Get a specific campaign with its quests.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Response:**
```json
{
  "campaignQuests": [
    // Quest objects
  ],
  "campaignFound": {
    // Campaign object
  }
}
```

### POST /hub/create-campaign
Create a new campaign.

**Request Body:**
- `title` (string, required): Campaign title
- `description` (string, required): Campaign description
- `nameOfProject` (string, required): Hub name
- `starts_at` (string, required): Start date
- `ends_at` (string, required): End date
- `reward` (object, required): { xp: number, trust?: number, pool: number }
- `totalTrustAvailable` (number, optional)
- `campaignQuests` (array, required): Array of quest objects
- `contractAddress` (string, optional)
- `txHash` (string, required): Transaction hash for fee payment

**Request File:**
- `coverImage` (file, required): Campaign cover image

**Response:**
```json
{
  "message": "campaign created!"
}
```

### PATCH /hub/update-campaign
Update an existing campaign.

**Request Body:** (any of the following)
- `description` (string)
- `title` (string)
- `ends_at` (string)
- `starts_at` (string)
- `projectCoverImage` (string)
- `reward` (object)

**Request File:**
- `coverImage` (file): New cover image

**Query Parameters:**
- `id` (string, required): Campaign ID

**Response:**
```json
{
  "message": "campaign updated!"
}
```

### PATCH /hub/close-campaign
Close an active campaign.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Response:**
```json
{
  "message": "campaign closed!"
}
```

### PATCH /hub/add-campaign-address
Add contract address to a campaign.

**Request Body:**
- `id` (string, required): Campaign ID
- `contractAddress` (string, required): Contract address

**Response:**
```json
{
  "message": "campaign address added!"
}
```

### PATCH /hub/publish-campaign
Publish a saved campaign.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Request Body:**
- `txHash` (string, required): Transaction hash for fee payment

**Response:**
```json
{
  "message": "campaign published"
}
```

### DELETE /hub/delete-campaign
Delete a campaign.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Response:** 204 No Content

### PATCH /hub/update-campaign-quest
Update a campaign quest.

**Request Body:** Quest update data

**Query Parameters:**
- `id` (string, required): Quest ID

**Response:** 204 No Content

### DELETE /hub/delete-campaign-quest
Delete a campaign quest.

**Query Parameters:**
- `id` (string, required): Quest ID

**Response:** 204 No Content

## Hub Management Endpoints

### PATCH /hub/update-hub
Update hub information.

**Request Body:**
- `name` (string): Hub name
- `logo` (string): Logo URL

**Request File:**
- `logo` (file): New logo image

**Response:** Updated hub object

### DELETE /hub/delete-hub
Delete the authenticated hub.

**Request:** Authenticated

**Response:** 204 No Content

### POST /hub/add-admin
Add a new admin to the hub.

**Request Body:**
- `email` (string, required): Admin email

**Response:**
```json
{
  "message": "otp sent"
}
```

### DELETE /hub/remove-admin
Remove an admin from the hub.

**Query Parameters:**
- `id` (string, required): Admin ID

**Response:** 204 No Content

## Claims Endpoints

### GET /get-claim
Get claims for a user.

**Request:** Loose Authentication

**Query Parameters:**
- `offset` (number, optional): Pagination offset
- `filter` (string, optional): Filter for claims

**Response:**
```json
{
  "claims": [
    {
      // Claim objects
    }
  ]
}
```
