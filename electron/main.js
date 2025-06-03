import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hàm tìm port Vite đang chạy
function findVitePort() {
  return new Promise((resolve) => {
    // Thử các port phổ biến của Vite
    const ports = [5173, 5174, 5175, 3000, 4173];
    
    const checkPort = (port) => {
      exec(`curl -s http://localhost:${port} > /dev/null`, (error) => {
        if (!error) {
          console.log(`Found Vite running on port ${port}`);
          resolve(port);
        } else if (ports.length > 0) {
          checkPort(ports.shift());
        } else {
          console.log('Using default port 5173');
          resolve(5173);
        }
      });
    };
    
    checkPort(ports.shift());
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Cho phép load từ localhost trong development
    }
  });

  // Kiểm tra nếu đang trong development mode
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Development: tìm port Vite và load
    findVitePort().then(port => {
      const url = `http://localhost:${port}`;
      console.log(`Loading from ${url}`);
      
      win.loadURL(url).catch(err => {
        console.error('Failed to load URL:', err);
        // Nếu không load được, thử lại sau 2 giây
        setTimeout(() => {
          win.loadURL(url);
        }, 2000);
      });
    });
    
    // win.webContents.openDevTools();
    
    // Reload khi có lỗi
    win.webContents.on('did-fail-load', () => {
      console.log('Failed to load, retrying...');
      setTimeout(() => {
        findVitePort().then(port => {
          win.loadURL(`http://localhost:${port}`);
        });
      }, 2000);
    });
  } else {
    // Production: load built files
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Debug logging
  win.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});