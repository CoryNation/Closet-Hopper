import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { EbayExporter } from './exporter';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.env.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('export-listings', async (event, { username, outputDir, limit }) => {
  try {
    const exporter = new EbayExporter({
      username,
      outputDir: outputDir || path.join(require('os').homedir(), 'ClosetHopper', 'exports'),
      limit: limit || 100,
      headless: true
    });

    await exporter.export();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-exports-folder', async () => {
  const exportsPath = path.join(require('os').homedir(), 'ClosetHopper', 'exports');
  require('child_process').exec(`explorer "${exportsPath}"`);
});
