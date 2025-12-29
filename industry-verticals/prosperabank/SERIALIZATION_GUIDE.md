# Sitecore Content Serialization Guide

This guide explains how to login to Sitecore Cloud and serialize content for the ProsperaBank project.

## Prerequisites

1. **Install .NET SDK** (if not already installed)
   - Download from: https://dotnet.microsoft.com/download

2. **Install Sitecore CLI** (if not already installed)
   ```bash
   dotnet tool install -g Sitecore.CLI
   ```

3. **Verify installation**
   ```bash
   dotnet --version
   dotnet sitecore --version
   ```

## Step 1: Navigate to Project Root

```bash
cd /Users/zac/Desktop/Codebases/ze-globalpayments-3
```

## Step 2: Login to Sitecore Cloud

First, authenticate with Sitecore Cloud:

```bash
dotnet sitecore cloud login
```

This will open a browser window for authentication. Follow the prompts to complete the login.

## Step 3: Connect to Your Environment

Connect to your specific XM Cloud environment using the environment connection command:

```bash
dotnet sitecore cloud environment connect \
  --environment-id 7t1x1q0kREqbVbMfo26HX7 \
  --cm-host xmc-sitecoresaafe06-globalpaymec222-prod8b6b.sitecorecloud.io \
  --allow-write true
```

**Note:** Replace the `--environment-id` and `--cm-host` values with your actual environment details if they differ.

## Step 4: Serialize Content (Pull from Sitecore)

### Option A: Using the PowerShell Script (Windows/macOS with PowerShell)

```bash
cd industry-verticals/prosperabank
.\scripts\serialize-content.ps1
```

Or explicitly pull:
```bash
.\scripts\serialize-content.ps1 -Pull
```

### Option B: Using the Bash Script (macOS/Linux)

```bash
cd industry-verticals/prosperabank
chmod +x scripts/serialize-content.sh
./scripts/serialize-content.sh
```

### Option C: Using Sitecore CLI Directly

From the repository root:

```bash
dotnet sitecore ser pull --include prosperabank
```

## What Gets Serialized?

The serialization process pulls the following content from Sitecore based on `prosperabank.module.json`:

- **Templates**: `/sitecore/templates/Project/financial`
- **Layout**: `/sitecore/layout/Renderings/Project/financial`
- **Placeholder Settings**: `/sitecore/layout/Placeholder Settings/Project/Financial`
- **Content**: `/sitecore/content/financial`
- **Media**: `/sitecore/media library/Project/financial`

All serialized content is saved to:
```
authoring/items/prosperabank/items/
```

## Step 5: Push Content to Sitecore (Optional)

To push your local serialized content back to Sitecore:

### Using PowerShell Script:
```bash
cd industry-verticals/prosperabank
.\scripts\serialize-content.ps1 -Push
```

### Using Sitecore CLI Directly:
```bash
dotnet sitecore ser push --include prosperabank
```

## Check Serialization Status

To check the status of serialized items:

### Using PowerShell Script:
```bash
cd industry-verticals/prosperabank
.\scripts\serialize-content.ps1 -Status
```

### Using Sitecore CLI Directly:
```bash
dotnet sitecore ser status --include prosperabank
```

## Troubleshooting

### Error: "Not connected to Sitecore"

If you get this error, make sure you've completed Steps 2 and 3:
1. Run `dotnet sitecore cloud login`
2. Run `dotnet sitecore cloud environment connect` with your environment details

### Error: "Sitecore CLI is not installed"

Install it with:
```bash
dotnet tool install -g Sitecore.CLI
```

### Error: "dotnet CLI is not installed"

Install the .NET SDK from: https://dotnet.microsoft.com/download

### Verify Connection

You can verify your connection status:
```bash
dotnet sitecore login --help
```

If this command works, you're connected. If it fails, you need to reconnect.

## Quick Reference

```bash
# 1. Login to Sitecore Cloud
dotnet sitecore cloud login

# 2. Connect to environment
dotnet sitecore cloud environment connect \
  --environment-id YOUR_ENV_ID \
  --cm-host YOUR_CM_HOST \
  --allow-write true

# 3. Pull content from Sitecore
dotnet sitecore ser pull --include prosperabank

# 4. Push content to Sitecore (when needed)
dotnet sitecore ser push --include prosperabank

# 5. Check status
dotnet sitecore ser status --include prosperabank
```

## Additional Resources

- [Sitecore CLI Documentation](https://doc.sitecore.com/xmc/en/developers/xm-cloud/the-sitecore-command-line-interface--cli-.html)
- [Content Serialization Guide](https://doc.sitecore.com/xmc/en/developers/xm-cloud/content-serialization.html)

