const { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen, Tray, nativeImage } = require("electron");
const path = require("path");

let windows = [];
let tray = null;
const iconPath = path.join(__dirname, 'assets', 'icon.png');
const trayIcon = nativeImage.createFromPath(iconPath);
trayIcon.setTemplateImage(true);

function createWindow(noteId = null) {
  // Create the browser window with maximum transparency and stealth features
  const newWindow = new BrowserWindow({
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
  newWindow.loadFile("index.html");

  // Show window when ready with enhanced stealth settings
  newWindow.once("ready-to-show", () => {
    newWindow.show();

    // Set maximum stealth level
    newWindow.setAlwaysOnTop(true, "screen-saver", 1);
    newWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    newWindow.setFullScreenable(false);

    // Try to make it as invisible as possible to screen capture
    try {
      // Windows-specific: Try to exclude from screen capture
      if (process.platform === "win32") {
        newWindow.setContentProtection(true);
      }
    } catch (error) {
      console.log("Content protection not available:", error.message);
    }
  });

  // Handle window closed
  newWindow.on("closed", () => {
    windows = windows.filter(win => win !== newWindow);
    updateTrayMenu();
  });

  // Maintain stealth when losing focus
  newWindow.on("blur", () => {
    if (newWindow && !newWindow.isDestroyed()) {
      newWindow.setAlwaysOnTop(true, "screen-saver", 1);
      // Reduce opacity even further when not focused
      newWindow.setOpacity(0.4);
    }
  });

  // Restore opacity when focused
  newWindow.on("focus", () => {
    if (newWindow && !newWindow.isDestroyed()) {
      newWindow.setOpacity(0.4); // Restore to visible but still very transparent
    }
  });

  // Handle mouse enter/leave for dynamic visibility
  newWindow.on("enter-full-screen", () => {
    newWindow.setOpacity(0.01); // Nearly invisible in fullscreen
  });

  newWindow.on("leave-full-screen", () => {
    newWindow.setOpacity(0.3);
  });

  newWindow.webContents.on("did-finish-load", () => {
    newWindow.webContents.send("note-id", noteId || `${Date.now()}`);
  });

  windows.push(newWindow);
  // Only update the tray menu if the tray exists
  if (tray) {
    updateTrayMenu();
  }
  return newWindow;
}

function updateTrayMenu() {
  // Check if the tray object is initialized before using it
  if (!tray) return;

  const windowSubmenu = windows.map((win, index) => ({
    label: `Note ${index + 1}`,
    click: () => {
      win.show();
      win.focus();
    }
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "New Note",
      click: () => {
        createWindow();
      }
    },
    {
      type: "separator"
    },
    ...windowSubmenu,
    {
      type: "separator"
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

// Enhanced app initialization
app.disableHardwareAcceleration();

app.whenReady().then(() => {

  // Create system tray icon
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show All Notes",
      click: () => {
        windows.forEach(win => {
          win.show();
          win.focus();
        });
      }
    },
    {
      label: "Hide All Notepad",
      click: () => {
        windows.forEach(win => win.hide());
      }
    },
    {
      type: "separator"
    },
    {
      label: "New Note",
      click: () => createWindow()
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

  // Now that the tray exists, create the first window and update the menu
  createWindow();
  updateTrayMenu(); // Initial call to set the tray menu

  // Register enhanced global shortcuts
  globalShortcut.register("CommandOrControl+Shift+N", () => {
    if (windows.length > 0) {
      const activeWindow = BrowserWindow.getFocusedWindow();
      if (activeWindow) {
        if (activeWindow.isVisible()) {
          activeWindow.hide();
        } else {
          activeWindow.show();
          activeWindow.focus();
        }
      }
    }
  });

  // Emergency hide shortcut
  globalShortcut.register("CommandOrControl+Shift+H", () => {
    if (windows.length > 0) {
      const activeWindow = BrowserWindow.getFocusedWindow();
      if (activeWindow) {
        activeWindow.setOpacity(0.01);
      }
    } // Nearly invisible
  });

  // Restore visibility shortcut
  globalShortcut.register("CommandOrControl+Shift+S", () => {
    if (windows.length > 0) {
      const activeWindow = BrowserWindow.getFocusedWindow();
      if (activeWindow) {
        activeWindow.setOpacity(0.3); // Restore visibility
        activeWindow.focus();
      }
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Handle display changes
  screen.on("display-added", () => {
    windows.forEach(win => win.webContents.send("display-changed"));
  });

  screen.on("display-removed", () => {
    windows.forEach(win => win.webContents.send("display-changed"));
  });

  screen.on("display-metrics-changed", () => {
    windows.forEach(win => win.webContents.send("display-changed"));
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
ipcMain.handle("create-new-note", () => {
  createWindow();
});

ipcMain.handle("minimize-window", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
    window.hide(); // Change hide() to minimize()
  }
});

ipcMain.handle("close-window", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
    window.close();
    // Remove from windows array
    windows = windows.filter(win => win !== window);
    updateTrayMenu();
  }
});

ipcMain.handle("set-opacity", (event, opacity) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.setOpacity(opacity / 100);
    return opacity;
  }
  return 30;
});

ipcMain.handle("toggle-always-on-top", () => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    const isOnTop = window.isAlwaysOnTop();
    window.setAlwaysOnTop(!isOnTop, "screen-saver", 1);
    return !isOnTop;
  }
  return false;
});

ipcMain.handle("set-stealth-mode", (event, enabled) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    if (enabled) {
      window.setOpacity(0.05);
      window.setSkipTaskbar(true);
      window.setAlwaysOnTop(true, "screen-saver", 1);
    } else {
      window.setOpacity(0.3);
      window.setSkipTaskbar(false);
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