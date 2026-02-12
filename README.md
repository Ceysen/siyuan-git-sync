# SiYuan Git Sync Plugin

[中文](./README_zh_CN.md)

## Project Introduction

SiYuan Git Sync is a Git synchronization plugin designed specifically for SiYuan Notes, supporting automatic or manual synchronization of note content to GitHub repositories, enabling version control and multi-device synchronization of notes.

## Features

- **GitHub Repository Synchronization**: Supports synchronizing notes to specified GitHub repositories
- **Automatic/Manual Sync Mode**: Can choose between automatic scheduled sync or manual trigger sync
- **Override Local Functionality**: Supports completely replacing local files with versions from the repository
- **Multi-directory Sync**: Supports synchronizing multiple note directories simultaneously
- **Custom Commit Messages**: Supports customizing commit messages using templates and date placeholders
- **Auto-close Dialog**: Can automatically close the configuration page after executing sync or override operations
- **User-friendly Interface**: Provides an intuitive configuration interface and operation feedback

## Installation Methods

### Method 1: Install from Marketplace

1. Open SiYuan Notes
2. Go to "Marketplace" → "Plugins"
3. Search for "Git Sync" and click "Install"
4. Click "Enable" after installation is complete

### Method 2: Manual Installation

1. Download the latest `package.zip` file from [GitHub Releases](https://github.com/yourusername/siyuan-git-sync/releases)
2. Extract the downloaded file to the SiYuan Notes plugin directory `{workspace}/data/plugins/`
3. Restart SiYuan Notes
4. Go to "Settings" → "Plugins" to enable the plugin

## Usage Guide

### Configure Git Sync

1. Click the plugin icon on the right side of the SiYuan Notes top bar (you can choose to pin it to the top bar), and find this plugin below

2. Fill in the following information in the pop-up configuration dialog:

   - **GitHub Repository URL**: Fill in your GitHub repository HTTPS URL (e.g., `https://github.com/username/repo.git`)
   - **Branch Name**: Fill in the branch name you want to sync (e.g., `main`)
   - **Personal Access Token**: Fill in your GitHub Personal Access Token, which needs to have push permissions
   - **Default Commit Message Template**: Fill in the commit message template, you can use `{{date}}` placeholder to automatically generate date
   - **Note Directory**: Fill in the note directory to be synced, multiple directories separated by commas
   - **Sync Mode**: Choose "Auto Sync" or "Manual Sync"
   - **Auto Sync Interval**: When auto sync is selected, set the sync interval (minutes)
   - **Auto close page after sync or override**: Check to automatically close the configuration page after operation completion

3. Click the "Save Configuration" button to save the settings

### Manual Sync

In manual sync mode:

1. Open the Git sync configuration dialog
2. Click the "Manual Sync" button to start syncing
3. Wait for the sync to complete, the sync result will be displayed

### Override Local

When you need to replace local files with versions from the repository:

1. Open the Git sync configuration dialog
2. Click the "Override Local" button
3. Read the warning message and confirm the operation
4. Wait for the override to complete, the override result will be displayed

## Configuration Instructions

### Required Configuration Items

| Configuration Item | Description | Example |
|-------------------|-------------|---------|
| GitHub Repository URL | HTTPS URL of the GitHub repository to sync | `https://github.com/username/repo.git` |
| Branch Name | Repository branch to sync | `main` |
| Personal Access Token | GitHub personal access token, needs push permission | `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| Default Commit Message Template | Commit message template, supports `{{date}}` placeholder | `Sync note updates: {{date}}` |
| Note Directory | Note directories to sync, multiple directories separated by commas | `20260101104218-ma2fdmz` or `20260101104218-ma2fdmz,20260102104218-xyz123` |

### Optional Configuration Items

| Configuration Item | Description | Default Value |
|-------------------|-------------|---------------|
| Sync Mode | Choose sync mode: auto or manual | `manual` |
| Auto Sync Interval | Auto sync interval (minutes) | - |
| Auto close page after sync or override | Whether to automatically close the configuration page after operation completion | `false` |

## Notes

1. **About Personal Access Token**:
   - Need to create a personal access token in GitHub settings
   - Need to check `repo` permission when creating
   - Please keep your access token safe and do not share it with others

2. **About Auto Sync**:
   - To avoid note content conflicts, it is recommended to enable auto sync only on a single computer
   - If auto sync is enabled on multiple devices simultaneously, it may cause sync conflicts and data loss

3. **About Override Local**:
   - Override local operation will completely replace local files with versions from the repository
   - All local modifications will be lost, please ensure you have backed up important data
   - This operation is irreversible, please use it with caution

4. **About Sync Directory**:
   - The plugin will automatically add `/data/` prefix to the configured directory path
   - It will check and commit the `assets` folder by default

## Frequently Asked Questions

### Q: What to do if sync fails?

**A:** Please check the following:
- Is the GitHub repository URL correct?
- Is the Personal Access Token valid and has push permission?
- Is the network connection normal?
- Does the note directory exist and has the correct format?

### Q: What to do if auto sync doesn't work?

**A:** Please check the following:
- Have you selected "Auto Sync" mode?
- Have you set a sync interval greater than 0?
- Is SiYuan Notes always running (background running is also acceptable)?
- Is the network connection stable?

### Q: What to do if notes are lost after overriding local?

**A:** Override local operation is irreversible, it is recommended:
- Back up important notes before performing override operation
- If you have already performed the override operation, you can try to recover from the historical commits of the GitHub repository

## Development Guide

### Environment Requirements

- Node.js 16.0+
- pnpm 7.0+

### Development Steps

1. Clone the project to local
   ```bash
   git clone https://github.com/Ceysen/Siyuan-Git-Sync.git
   cd siyuan-git-sync
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Create symbolic link
   ```bash
   pnpm run make-link
   ```
   > Windows users please run `pnpm run make-link-win`

4. Start development server
   ```bash
   pnpm run dev
   ```

5. Build production version
   ```bash
   pnpm run build
   ```

## Contribution Guide

Welcome to submit Issues and Pull Requests to help improve this plugin!

### Before submitting a PR, please ensure:

1. The code conforms to the project's code style
2. You have run `pnpm run build` to ensure the build is successful
3. You have tested that the functionality works normally
4. You have updated the relevant documentation (if needed)

## License

This project adopts the [MIT License](./LICENSE) open source agreement.

## Contact Information

- GitHub: [Ceysen/siyuan-git-sync](https://github.com/Ceysen/Siyuan-Git-Sync.git)
- Issue Feedback: [Issues](https://github.com/Ceysen/Siyuan-Git-Sync/issues)

---

**Thank you for using SiYuan Git Sync Plugin!** We hope it can help you better manage and sync your notes.