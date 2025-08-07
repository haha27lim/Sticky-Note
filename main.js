const { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen, Tray, nativeImage } = require("electron");
const path = require("path");

let mainWindow;
let tray = null;

function createWindow() {
  // Create the browser window with maximum transparency and stealth features
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: true, // Remove window frame completely
    transparent: false, // Enable transparency
    alwaysOnTop: true, // Keep window always on top
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    skipTaskbar: true, // Hide from taskbar for stealth
    focusable: true,
    hasShadow: false, // Remove window shadow
    thickFrame: false, // Remove thick frame
    titleBarStyle: "hidden", // Hide title bar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false, // Prevent throttling when not focused
      offscreen: false
    },
    show: false, // Don't show until ready
    opacity: 1.0, // Start with very low opacity
    backgroundColor: "#00000000", // Fully transparent background
    vibrancy: "ultra-dark", // macOS vibrancy effect
    visualEffectState: "active"
  });

  // Load the HTML file
  mainWindow.loadFile("index.html");

  // Show window when ready with enhanced stealth settings
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Set maximum stealth level
    mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setFullScreenable(false);

    // Try to make it as invisible as possible to screen capture
    try {
      // Windows-specific: Try to exclude from screen capture
      if (process.platform === "win32") {
        mainWindow.setContentProtection(true);
      }
    } catch (error) {
      console.log("Content protection not available:", error.message);
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Maintain stealth when losing focus
  mainWindow.on("blur", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
      // Reduce opacity even further when not focused
      mainWindow.setOpacity(0.4);
    }
  });

  // Restore opacity when focused
  mainWindow.on("focus", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setOpacity(0.4); // Restore to visible but still very transparent
    }
  });

  // Handle mouse enter/leave for dynamic visibility
  mainWindow.on("enter-full-screen", () => {
    mainWindow.setOpacity(0.01); // Nearly invisible in fullscreen
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.setOpacity(0.3);
  });
}

// Enhanced app initialization
app.disableHardwareAcceleration();

app.whenReady().then(() => {

  createWindow();

  // Register enhanced global shortcuts
  globalShortcut.register("CommandOrControl+Shift+N", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Emergency hide shortcut
  globalShortcut.register("CommandOrControl+Shift+H", () => {
    if (mainWindow) {
      mainWindow.setOpacity(0.01); // Nearly invisible
    }
  });

  // Restore visibility shortcut
  globalShortcut.register("CommandOrControl+Shift+S", () => {
    if (mainWindow) {
      mainWindow.setOpacity(0.3); // Restore visibility
      mainWindow.focus();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Handle display changes
  screen.on("display-added", () => {
    if (mainWindow) {
      mainWindow.webContents.send("display-changed");
    }
  });

  screen.on("display-removed", () => {
    if (mainWindow) {
      mainWindow.webContents.send("display-changed");
    }
  });

  screen.on("display-metrics-changed", () => {
    if (mainWindow) {
      mainWindow.webContents.send("display-changed");
    }
  });

  // Create system tray icon
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  trayIcon.setTemplateImage(true); // For macOS dark/light mode support

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Notepad", click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: "Hide Notepad", click: () => {
        mainWindow.hide();
      }
    },
    {
      type: "separator"
    },
    {
      label: "Quit", click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip("Stealth Notepad");
  tray.setContextMenu(contextMenu);

  // Enable left-click or right-click to open context menu
  tray.on('click', () => {
    tray.popUpContextMenu();
  });

  tray.on('right-click', () => {
    tray.popUpContextMenu();
  });

});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Unregister all shortcuts when app is quitting
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Enhanced IPC handlers
ipcMain.handle("minimize-window", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("set-opacity", (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity / 100);
    return opacity;
  }
  return 30;
});

ipcMain.handle("toggle-always-on-top", () => {
  if (mainWindow) {
    const isOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isOnTop, "screen-saver", 1);
    return !isOnTop;
  }
  return false;
});

ipcMain.handle("set-stealth-mode", (event, enabled) => {
  if (mainWindow) {
    if (enabled) {
      mainWindow.setOpacity(0.05);
      mainWindow.setSkipTaskbar(true);
      mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
    } else {
      mainWindow.setOpacity(0.3);
      mainWindow.setSkipTaskbar(false);
    }
    return enabled;
  }
  return false;
});

ipcMain.handle("get-screen-info", () => {
  const displays = screen.getAllDisplays();
  return displays.map(display => ({
    id: display.id,
    bounds: display.bounds,
    workArea: display.workArea,
    scaleFactor: display.scaleFactor,
    primary: display === screen.getPrimaryDisplay()
  }));
});