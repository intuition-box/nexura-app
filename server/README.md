# Project Endpoints Documentation

This documentation covers all API endpoints related to projects in the Nexura application server.

## Authentication Endpoints

### POST /project/sign-up
Sign up a new project.

**Request Body:**
- `name` (string, required): Project name
- `email` (string, required): Project email
- `description` (string, required): Project description
- `address` (string, required): Project address
- `password` (string, required): Password (minimum 8 characters)
- `logo` (file, required): Project logo image

**Response:**
```json
{
  "message": "project created!",
  "accessToken": "jwt_token_here"
}
```

### POST /project/sign-in
Sign in as a project or admin.

**Request Body:**
- `email` (string, required): Email
- `password` (string, required): Password
- `role` (string, required): "project" or "admin"

**Response:**
```json
{
  "message": "signed in!",
  "accessToken": "jwt_token_here"
}
```

### POST /project/logout
Logout the current project or admin session.

**Request:** Authenticated

**Response:**
```json
{
  "message": "project or admin logged out!"
}
```

### POST /project/reset-password
Reset project password using token.

**Request Body:**
- `token` (string, required): Reset token
- `password` (string, required): New password

**Response:**
```json
{
  "message": "project password reset successful!"
}
```

### POST /project/reset-password-admin
Reset project admin password using token.

**Request Body:**
- `token` (string, required): Reset token
- `password` (string, required): New password

**Response:**
```json
{
  "message": "project admin password reset successful!"
}
```

### POST /project/forgot-password
Request password reset email.

**Request Body:**
- `email` (string, required): Email
- `role` (string, required): "project" or "admin"

**Response:**
```json
{
  "message": "password reset email sent!"
}
```

### POST /project/admin/sign-up
Sign up a project admin using OTP.

**Request Body:**
- `email` (string, required): Email
- `password` (string, required): Password
- `code` (string, required): 6-digit OTP code
- `name` (string required): Name

**Response:**
```json
{
  "message": "project admin signed up!",
  "accessToken": "jwt_token_here"
}
```

## Campaign Management Endpoints

### GET /project/get-campaigns
Fetch all campaigns for the authenticated project.

**Request:** Authenticated

**Response:**
```json
{
  "projectCampaigns": [
    {
      // Campaign objects
    }
  ]
}
```

### POST /project/validate-campaign-submissions
Validate or reject a campaign submission.

**Request Body:**
- `submissionId` (string, required): Submission ID
- `action` (string, required): "accept" or "reject"

**Response:** 204 No Content

### PATCH /project/save-campaign-quests
Save campaign with quests.

**Request Body:**
- `campaignData` (object, required): Campaign data (same as create-campaign)
- `questData` (array, required): Array of quest objects with title, description, url, reward.xp

**Request File:**
- `coverImage` (file): Campaign cover image

**Response:** 204 No Content

### PATCH /project/save-campaign
Save a campaign draft.

**Request Body:**
- `title` (string, required): Campaign title
- `description` (string, required): Campaign description
- `nameOfProject` (string, required): Project name
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

### GET /project/get-campaign
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

### POST /project/create-campaign
Create a new campaign.

**Request Body:**
- `title` (string, required): Campaign title
- `description` (string, required): Campaign description
- `nameOfProject` (string, required): Project name
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

### PATCH /project/update-campaign
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

### PATCH /project/close-campaign
Close an active campaign.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Response:**
```json
{
  "message": "campaign closed!"
}
```

### PATCH /project/add-campaign-address
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

### PATCH /project/publish-campaign
Publish a saved campaign.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Request Body**
- `txHash` (string, required): transaction hash for fee payment

**Response:**
```json
{
  "message": "campaign published"
}
```

### DELETE /project/delete-campaign
Delete a campaign.

**Query Parameters:**
- `id` (string, required): Campaign ID

**Response:** 204 No Content

### PATCH /project/update-campaign-quest
Update a campaign quest.

**Request Body:** Quest update data

**Query Parameters:**
- `id` (string, required): Quest ID

**Response:** 204 No Content

### DELETE /project/delete-campaign-quest
Delete a campaign quest.

**Query Parameters:**
- `id` (string, required): Quest ID

**Response:** 204 No Content

## Project Management Endpoints

### PATCH /project/update-project
Update project information.

**Request Body:**
- `name` (string): Project name
- `logo` (string): Logo URL

**Request File:**
- `logo` (file): New logo image

**Response:** Updated project object

### DELETE /project/delete-project
Delete the authenticated project.

**Request:** Authenticated

**Response:** 204 No Content

### POST /project/add-admin
Add a new admin to the project.

**Request Body:**
- `email` (string, required): Admin email

**Response:**
```json
{
  "message": "otp sent"
}
```

### DELETE /project/remove-admin
Remove an admin from the project.

**Query Parameters:**
- `id` (string, required): Admin ID

**Response:** 204 No Content</content>
