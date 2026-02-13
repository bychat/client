# bychat.io Client

Your local AI agents assistant with access to your workspaces, files, and local data.

## About

ByChat Client is a desktop application for [bychat.io](https://bychat.io) that brings AI-powered assistance directly to your local laptop. It provides seamless access to your workspaces, files, and local data while maintaining privacy and security.

## Features

- 🤖 **AI Agent Integrations** - Connect with intelligent agents to assist with your tasks
- 📁 **Local File Access** - Securely interact with your local files and directories
- 🗂️ **Workspace Management** - Organize and manage your workspaces efficiently
- 🖥️ **Native Desktop Experience** - Fast and responsive Electron-based application
- 🔒 **Privacy First** - Your data stays on your machine
- 🎨 **Professional UI** - Modern Material-UI design with reusable components
- ⚙️ **Comprehensive Settings** - Tabbed settings dialog with General, AI Models, and Appearance options
- 🗨️ **Studio Panel** - Quick access to AI-powered tools like audio overview, video analysis, mind maps, and more

## Component Architecture

The application uses a modular component structure with Material-UI:

### Common Components (`/src/renderer/components/common`)
- **MessageBubble** - Reusable message display with role-based styling
- **EmptyState** - Empty state placeholder for new chats
- **ActionCard** - Studio action card with hover effects
- **ModelSelector** - AI model selection dropdown with refresh

### Chat Components (`/src/renderer/components/chat`)
- **ChatHeader** - Top navigation with menu, new chat, settings, and logout
- **ChatSidebar** - Drawer with chat history and management
- **MessageList** - Scrollable message container
- **ChatInput** - Message input field with send button
- **StudioPanel** - Right panel with AI studio actions

### Settings Components (`/src/renderer/components/settings`)
- **GeneralSettings** - User preferences, notifications, and privacy
- **ModelSettings** - AI model configuration and title generation
- **AppearanceSettings** - Theme and display preferences

All components use Material-UI's `sx` prop for styling with minimal custom CSS.



## License

MIT

---
For more information, visit [bychat.io](https://bychat.io)