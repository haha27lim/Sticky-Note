# 📝 Sticky Notepad - Transparent Always-On-Top Notepad

A lightweight, transparent sticky notepad application designed for interviews, presentations, and productivity. Built with Electron, it stays on top of all other windows and can be made semi-transparent for unobtrusive note-taking.

## ✨ Features

### Core Features
- **🔝 Always On Top**: Stays visible above all other applications, including fullscreen apps
- **👻 Transparent Background**: Adjustable opacity from 10% to 100% for see-through functionality
- **🎨 Customizable Appearance**: 8 color presets plus custom background and text colors
- **📏 Resizable**: Drag to resize the window to your preferred dimensions
- **💾 Auto-Save**: Automatically saves your notes every 30 seconds and on window blur
- **⌨️ Keyboard Shortcuts**: Quick access via Ctrl+Shift+N to show/hide

### Perfect For
- **Job Interviews**: Keep notes visible while in video calls
- **Presentations**: Quick reference without switching windows
- **Screen Recording**: Transparent overlay for tutorials
- **Multi-tasking**: Always-visible reminders and notes

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** (Download from [nodejs.org](https://nodejs.org/))
- **Windows 10/11** (Primary target platform)

### Installation

1. **Download the source code** (ZIP file provided)
2. **Extract** to your desired location
3. **Open Command Prompt** in the extracted folder
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Run the application**:
   ```bash
   npm start
   ```

## 🎯 Usage Guide

### Basic Operation

1. **Launch**: Run `npm start` or double-click the executable
2. **Write**: Click in the text area and start typing
3. **Customize**: Click the ⚙️ settings button to adjust appearance
4. **Move**: Drag the title bar to reposition the window
5. **Resize**: Drag the corners/edges to resize

### Settings Panel

Access via the ⚙️ button in the title bar:

#### Opacity Control
- **Slider**: Adjust transparency from 10% (very transparent) to 100% (opaque)
- **Real-time**: Changes apply immediately
- **Use Case**: Set to 30-50% for interviews to see content behind

#### Background Colors
- **8 Presets**: Quick color selection
  - White, Light Gray, Light Yellow, Light Green
  - Light Blue, Light Pink, Light Orange, Light Purple
- **Custom Color**: Use the color picker for any color
- **Click Presets**: Instant application

#### Text Customization
- **Text Color**: Full color picker
- **Font Size**: 10px to 24px range
- **Font**: Fixed-width Courier New for consistent spacing

### Keyboard Shortcuts

- **Ctrl+Shift+N**: Show/Hide the notepad window
- **Ctrl+S**: Manual save (auto-save is always active)
- **Ctrl+,**: Toggle settings panel

### Window Controls

- **⚙️ Green**: Settings panel
- **− Yellow**: Minimize to taskbar
- **× Red**: Close application

## 🔧 Technical Details

### Architecture
- **Framework**: Electron (Cross-platform desktop apps)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: LocalStorage for settings and content
- **Transparency**: Native Electron transparent window support

### File Structure
```
sticky-notepad/
├── main.js          # Electron main process
├── index.html       # UI and styling
├── package.json     # Dependencies and scripts
└── README.md        # This documentation
```

### System Requirements
- **OS**: Windows 10/11 (primary), macOS, Linux (secondary)
- **RAM**: 50MB minimum
- **Disk**: 200MB for installation
- **Display**: Any resolution (responsive design)

## 🛠️ Development

### Building from Source

1. **Clone/Download** the source code
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Development mode**:
   ```bash
   npm start
   ```
4. **Build for Windows** (requires additional setup):
   ```bash
   npm run build-win
   ```

### Customization

#### Modify Appearance
Edit the CSS in `index.html` to change:
- Window styling
- Color schemes
- Fonts and sizing
- Animation effects

#### Add Features
Extend functionality by:
- Adding new IPC handlers in `main.js`
- Implementing UI features in `index.html`
- Creating new keyboard shortcuts

### Configuration Options

#### Window Behavior
```javascript
// In main.js, modify BrowserWindow options:
{
  width: 400,           // Initial width
  height: 300,          // Initial height
  transparent: true,    // Enable transparency
  alwaysOnTop: true,    // Stay on top
  frame: false          // Frameless window
}
```

#### Default Settings
```javascript
// In index.html, modify default settings:
const settings = {
  opacity: 90,              // Default opacity
  backgroundColor: '#ffffff', // Default background
  textColor: '#333333',      // Default text color
  fontSize: 14               // Default font size
};
```

## 🎨 Use Cases & Examples

### Interview Preparation
```
Interview Notes - Software Engineer Position

Company: TechCorp
Interviewer: Jane Smith
Time: 2:00 PM

Key Points to Mention:
- 5 years React experience
- Led team of 4 developers
- Reduced load time by 40%

Questions to Ask:
- Team structure?
- Growth opportunities?
- Tech stack details?
```

### Presentation Notes
```
Presentation Outline - Q4 Results

Slide 1: Revenue up 25%
Slide 2: New product launch
Slide 3: Market expansion
Slide 4: Team growth

Remember:
- Speak slowly
- Make eye contact
- Pause for questions
```

### Daily Reminders
```
Today's Tasks:

High Priority:
□ Finish project proposal
□ Call client at 3 PM
□ Review team code

Low Priority:
□ Update documentation
□ Plan next sprint
□ Organize desk
```

## 🔒 Privacy & Security

### Data Storage
- **Local Only**: All data stored locally on your machine
- **No Cloud**: No data sent to external servers
- **Auto-Save**: Content saved to browser LocalStorage
- **Portable**: Notes tied to installation location

### Security Features
- **No Network Access**: Application doesn't require internet
- **Sandboxed**: Electron security best practices implemented
- **No Tracking**: No analytics or telemetry

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
- **Check Node.js**: Ensure Node.js 16+ is installed
- **Dependencies**: Run `npm install` in the application folder
- **Permissions**: Run as administrator if needed

#### Window Not Visible
- **Always On Top**: May be behind other windows initially
- **Multiple Monitors**: Check all connected displays
- **Keyboard Shortcut**: Use Ctrl+Shift+N to toggle visibility

#### Transparency Not Working
- **Windows Version**: Requires Windows 10+ for full transparency
- **Graphics Drivers**: Update to latest drivers
- **Compositor**: Ensure Windows composition is enabled

#### Settings Not Saving
- **Permissions**: Check folder write permissions
- **Storage**: Ensure sufficient disk space
- **Browser Data**: Clear application data and restart

### Performance Tips

- **Lower Opacity**: Use 50-70% for better performance
- **Smaller Window**: Reduce size for less GPU usage
- **Close When Not Needed**: Minimize resource usage
- **Regular Restart**: Restart weekly for optimal performance

## 📋 Changelog

### Version 1.0.0
- Initial release
- Transparent always-on-top window
- Customizable opacity and colors
- Auto-save functionality
- Keyboard shortcuts
- Settings panel
- Cross-platform support

## 🆘 Support

### Getting Help
- **Documentation**: This README file
- **Issues**: Check common troubleshooting steps
- **Community**: Share with other users

### Reporting Bugs
When reporting issues, include:
- Operating system version
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

MIT License - Feel free to modify and distribute.

## 🙏 Acknowledgments

- **Electron Team**: For the amazing framework
- **Open Source Community**: For inspiration and tools
- **Beta Testers**: For feedback and suggestions

---

**Made with ❤️ for productivity enthusiasts and interview success!**

*Perfect for keeping important notes visible during video calls, presentations, and daily work.*

