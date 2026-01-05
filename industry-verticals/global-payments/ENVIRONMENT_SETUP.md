# Environment Variables Setup for Global Payments

This guide will help you configure the required environment variables for your new XM Cloud organization and environment.

## Required Environment Variables

You'll need to set these environment variables for the application to work with your XM Cloud instance:

### 1. **SITECORE_EDGE_CONTEXT_ID**
   - **Description**: Server-side Edge Context ID for API calls
   - **Where to find**: XM Cloud Deploy Portal → Your Environment → Edge Context ID
   - **Usage**: Used by server-side code to fetch content from XM Cloud Edge

### 2. **NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID**
   - **Description**: Client-side Edge Context ID (public, exposed to browser)
   - **Where to find**: Same as above, but needs to be public
   - **Usage**: Used by client-side code for personalization and analytics

### 3. **NEXT_PUBLIC_DEFAULT_SITE_NAME**
   - **Description**: Default site name in Sitecore
   - **Where to find**: XM Cloud Deploy Portal → Your Environment → Site Name
   - **Common values**: `Financial`, `global-payments`, or your site name
   - **Usage**: Used to resolve the correct site in multisite scenarios

### 4. **SITECORE_EDITING_SECRET**
   - **Description**: Secret key for Sitecore editing mode
   - **Where to find**: XM Cloud Deploy Portal → Your Environment → Editing Secret
   - **Usage**: Required for connected/disconnected mode and editing functionality

### 5. **NEXT_PUBLIC_SEARCH_ENV** (Optional)
   - **Description**: Sitecore Search environment
   - **Where to find**: Sitecore Search Portal
   - **Usage**: Only needed if using Sitecore Search

### 6. **NEXT_PUBLIC_SEARCH_CUSTOMER_KEY** (Optional)
   - **Description**: Sitecore Search customer key
   - **Where to find**: Sitecore Search Portal
   - **Usage**: Only needed if using Sitecore Search

### 7. **NEXT_PUBLIC_SEARCH_API_KEY** (Optional)
   - **Description**: Sitecore Search API key
   - **Where to find**: Sitecore Search Portal
   - **Usage**: Only needed if using Sitecore Search

## Where to Set Environment Variables

### For Local Development

Create a `.env.local` file in the `industry-verticals/global-payments/` directory:

```bash
# XM Cloud Edge Configuration
SITECORE_EDGE_CONTEXT_ID=your-edge-context-id-here
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=your-edge-context-id-here
NEXT_PUBLIC_DEFAULT_SITE_NAME=Financial

# Editing Secret
SITECORE_EDITING_SECRET=your-editing-secret-here

# Optional: Sitecore Search (if using)
NEXT_PUBLIC_SEARCH_ENV=your-search-env
NEXT_PUBLIC_SEARCH_CUSTOMER_KEY=your-customer-key
NEXT_PUBLIC_SEARCH_API_KEY=your-api-key
```

### For XM Cloud Deployment

Set these in the XM Cloud Deploy Portal:
1. Go to your project → Environments → Your Environment
2. Navigate to "Environment Variables" or "Rendering Host Settings"
3. Add each variable listed above

## Additional Configuration Needed

### 1. Update XM Cloud Instance URL

You'll need to update the hardcoded XM Cloud instance URL in these files:

**File: `next.config.js`**
- Line 77: Update `hostname: 'xmc-sitecoresaafe06-globalpaymec222-prod8b6b.sitecorecloud.io'`
- Line 126: Update the rewrite destination URL

**File: `src/lib/imageLoader.ts`**
- Line 16: Update the XM Cloud instance URL

**File: `src/lib/image-url-transformer.ts`**
- Line 14: Update the XM Cloud instance URL

**Your new XM Cloud instance URL format**: `xmc-{org}-{env}-{random}.sitecorecloud.io`

### 2. Update Sitecore CLI Configuration

For content serialization, ensure your `authoring/items/global-payments/global-payments.module.json` is configured correctly. The namespace should already be set to `global-payments`.

## How to Find Your Values

### Finding Edge Context ID
1. Log into XM Cloud Deploy Portal
2. Navigate to your project and environment
3. Go to "Edge Context" or "API Keys" section
4. Copy the Edge Context ID

### Finding Site Name
1. In XM Cloud Deploy Portal
2. Go to your environment settings
3. Look for "Site Name" or check your Sitecore content tree
4. Common site names are defined in your Sitecore instance

### Finding Editing Secret
1. In XM Cloud Deploy Portal
2. Go to your environment → Rendering Hosts
3. Find the "Editing Secret" or "JSS Editing Secret"
4. Copy the value

### Finding XM Cloud Instance URL
1. In XM Cloud Deploy Portal
2. Go to your environment
3. Look for "Rendering Host URL" or "Instance URL"
4. It will be in format: `https://xmc-{org}-{env}-{random}.sitecorecloud.io`

## Testing Your Configuration

After setting up your environment variables:

1. **Test local development**:
   ```bash
   cd industry-verticals/global-payments
   npm run dev
   ```

2. **Test content serialization**:
   ```bash
   # Make sure you're logged into Sitecore CLI
   dotnet sitecore cloud login
   
   # Test serialization
   dotnet sitecore ser pull --include global-payments
   ```

3. **Verify environment variables are loaded**:
   - Check browser console for any missing configuration errors
   - Verify the site loads content from your XM Cloud instance

## Using API Keys for Authentication

If you're getting authorization errors, you can use API keys with client credentials authentication:

### Step 1: Create Environment-Level API Key

1. Go to XM Cloud Deploy Portal
2. Navigate to: Your Project → Environments → Your Environment
3. Go to "API Keys" or "Settings" → "API Keys"
4. Create a new API key for this environment
5. **Copy the Client ID and Client Secret** (you'll only see the secret once!)

### Step 2: Login with Client Credentials

```bash
# Login using the API key credentials
dotnet sitecore cloud login \
  --client-id YOUR_CLIENT_ID \
  --client-secret YOUR_CLIENT_SECRET \
  --client-credentials true
```

### Step 3: Connect to Environment

```bash
# Connect to your environment
dotnet sitecore cloud environment connect \
  --environment-id YOUR_ENVIRONMENT_ID \
  --cm-host xmc-globalpayme583f-globalpayme5281-globalpayme1d82.sitecorecloud.io \
  --allow-write true
```

### Step 4: Connect to CM Host

```bash
# Also connect directly to CM host for serialization
dotnet sitecore connect --ref xmcloud \
  --cm https://xmc-globalpayme583f-globalpayme5281-globalpayme1d82.sitecorecloud.io \
  --allow-write true \
  -n default
```

### Step 5: Serialize Content

```bash
# Now try serialization
dotnet sitecore ser pull --include global-payments
```

**Note**: Use **environment-level** API keys (not organization-level) for serialization, as they're scoped to the specific environment you're working with.

## Troubleshooting

- **"Edge Context ID missing"**: Ensure `SITECORE_EDGE_CONTEXT_ID` and `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` are set
- **"Site not found"**: Verify `NEXT_PUBLIC_DEFAULT_SITE_NAME` matches your Sitecore site name
- **"Editing secret invalid"**: Check that `SITECORE_EDITING_SECRET` matches your environment's editing secret
- **Images not loading**: Update the XM Cloud instance URLs in `next.config.js` and image loader files
- **"You are not authorized"**: 
  - Use environment-level API keys (not organization-level)
  - Ensure you've connected to both the cloud environment AND the CM host
  - Verify your API key has the correct permissions/scopes
  - Try using client credentials authentication instead of device login

