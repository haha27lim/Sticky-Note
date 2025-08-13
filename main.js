const { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen, Tray, nativeImage } = require("electron");
const path = require("path");
const Store = require('electron-store').default;

let windows = [];
let tray = null;
const store = new Store({
  name: 'sticky-notepad-store' // Add a name for the store
});  // Initialize the data store
const iconPath = path.join(__dirname, 'assets', 'icon.png');
const trayIcon = nativeImage.createFromPath(iconPath);
trayIcon.setTemplateImage(true);

let windowZIndexCounter = 1;


function createWindow(noteId = null, bounds = null) {
  // Use noteId passed, or generate a new one
  const newNoteId = noteId || `${Date.now()}`;

  // Get primary display bounds
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Set window dimensions
  const windowWidth = 400;
  const windowHeight = 300;

  // Calculate center position
  const centerX = Math.floor((screenWidth - windowWidth) / 2);
  const centerY = Math.floor((screenHeight - windowHeight) / 2);

  // Calculate offset for cascading windows
  const offset = 30;

  const windowBounds = bounds || {
    width: windowWidth,
    height: windowHeight,
    x: centerX + (windows.length * offset),
    y: centerY + (windows.length * offset)
  };

  // Reset position if window would go off screen
  if (windowBounds.x + windowBounds.width > screenWidth) {
    windowBounds.x = centerX;
  }
  if (windowBounds.y + windowBounds.height > screenHeight) {
    windowBounds.y = centerY;
  }

  // Create the browser window with maximum transparency and stealth features
  const newWindow = new BrowserWindow({
    ...windowBounds,
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
      offscreen: false,
      partition: 'persist:sticky-notepad',
      webSecurity: false
    },
    show: false, // Don't show until ready
    opacity: 1.0, // Start with very low opacity
    backgroundColor: "#00000000", // Fully transparent background
    vibrancy: "ultra-dark", // macOS vibrancy effect
    visualEffectState: "active"
  });

  // Add cache configuration
  newWindow.webContents.session.clearCache();
  newWindow.webContents.session.clearStorageData({
    storages: ['cache']
  });

  // Load the HTML file
  newWindow.loadFile("index.html");

  // Show window when ready with enhanced stealth settings
  newWindow.once("ready-to-show", () => {
    newWindow.show();

    // Set maximum stealth level
    newWindow.setAlwaysOnTop(true, "screen-saver", windowZIndexCounter++);
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

  // Save the window bounds when it moves or resizes
  newWindow.on('moved', () => {
    saveWindowPosition(newWindow, newNoteId);
  });
  newWindow.on('resized', () => {
    saveWindowPosition(newWindow, newNoteId);
  });

  // Handle window closed
  newWindow.on("closed", () => {
    windows = windows.filter(win => win !== newWindow);
    store.delete(`window-bounds-${newNoteId}`); // Delete the bounds when the window is closed
    store.set('note-ids', windows.map(win => win.noteId)); // Update the list of active notes 
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

  newWindow.on("focus", () => {
    if (newWindow && !newWindow.isDestroyed()) {
      // Bring the focused window to the front by updating its z-index level.
      newWindow.setAlwaysOnTop(true, "screen-saver", windowZIndexCounter++);
      newWindow.setOpacity(0.4);
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
    newWindow.webContents.send("note-id", newNoteId);
  });

  newWindow.noteId = newNoteId; // Assign the noteId to the window object
  windows.push(newWindow);
  store.set('note-ids', windows.map(win => win.noteId)); // Save the new note ID

  if (tray) {
    updateTrayMenu();
  }
  newWindow.focus();
  return newWindow;
}

// Function to save the window's position and size
function saveWindowPosition(window, noteId) {
  const bounds = window.getBounds();
  store.set(`window-bounds-${noteId}`, bounds);
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

  // Load existing notes on startup
  const savedNoteIds = store.get('note-ids', []);
  if (savedNoteIds.length > 0) {
    savedNoteIds.forEach(noteId => {
      const bounds = store.get(`window-bounds-${noteId}`);
      createWindow(noteId, bounds);
    });
  } else {
    createWindow();
  }
  updateTrayMenu();

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
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }
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
    window.minimize(); // Change hide() to minimize()
  }
});

ipcMain.handle("close-window", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
    window.close();
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

ipcMain.handle("focus-window", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
    window.focus();
  }
});