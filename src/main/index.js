import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { parseUrl } from '../renderer/src/utils/video'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 690,
    // show: false,
    center: true,
    frame: false,
    transparent: true,
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    let options = {
      ...details.responseHeaders
    }
    options['access-control-allow-origin'] = '*'
    callback({
      responseHeaders: options
    })
  })

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    let options = { ...details.requestHeaders }
    if (
      details.url.includes('api.bilibili.com') ||
      details.url.includes('bilivideo.cn') ||
      details.url.includes('bilivideo.com')
    ) {
      options = {
        Origin: 'https://www.bilibili.com',
        Referer: 'https://www.bilibili.com/video/' + parseUrl(details.url),
        Cookie:
          "buvid3=45B42408-FDEF-BE2A-78F0-C5156C12166A59929infoc; b_nut=1672663858; buvid4=F7FA71ED-F027-BDF7-6489-ECAF2518930E59929-023010220-wxjirmtjyzcanDrruwr7yQ%3D%3D; rpdid=|(J|)ukukYku0J'uY~kYYJ)YY; i-wanna-go-back=-1; DedeUserID=351510358; DedeUserID__ckMd5=9bba0719ca96536e; buvid_fp_plain=undefined; FEED_LIVE_VERSION=V8; header_theme_version=CLOSE; CURRENT_PID=7c5e3350-e694-11ed-8f26-7f17cb307b51; LIVE_BUVID=AUTO6016874367156935; hit-new-style-dyn=1; CURRENT_QUALITY=80; is-2022-channel=1; enable_web_push=DISABLE; _uuid=10861A1013-1910B-BF1D-8CE1-8D1BF542F6A791398infoc; hit-dyn-v2=1; dy_spec_agreed=1; CURRENT_BLACKGAP=0; fingerprint=52854afb0f07103bb595617edf2c0b2c; bp_article_offset_351510358=891570790440370184; CURRENT_FNVAL=4048; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY5NjczOTgsImlhdCI6MTcwNjcwODEzOCwicGx0IjotMX0.bqVbtPAfA1zeoijewtVYL7p54So35FrtcLYTAxCHzaQ; bili_ticket_expires=1706967338; SESSDATA=e6acdbd6%2C1722260199%2Ca9d1f%2A12CjDiUAkzCec-4Yio3XMQOYZB-g_LeXPvoI020Q89_PbDtCEd1x2mVyc836jMFC77MgwSVkZnRE53cnZXaXh2dTY0Tk4yRFpLVUxKWV9zRHNjajBGbHFuVFJSeXlSb2IxZVYwaFNRUE9YOFo3a1A5ZWJwQms5bmhSLXNuQXBhMVg0UG1sUG9NVjVnIIEC; bili_jct=a36c9a585ab79e5bc0eeb7b3ff92f33f; PVID=1; buvid_fp=52854afb0f07103bb595617edf2c0b2c; sid=6zjjjyn9; b_lsid=6FCFA654_18D6E684E4E; home_feed_column=4; browser_resolution=1290-738; bp_video_offset_351510358=893860407438999572",
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      }
    }
    if (details.url.includes('hdslb.com')) {
      delete options['Referer']
      delete options['referer']
    }
    callback({
      requestHeaders: options
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
let ipcOnActions = [
  {
    action: 'window-minimize',
    handler: () => {
      const window = BrowserWindow.getFocusedWindow()
      if (window) {
        window.minimize()
      }
    }
  },
  {
    action: 'window-close',
    handler: () => {
      const window = BrowserWindow.getFocusedWindow()
      if (window) {
        window.close()
      }
    }
  }
]

for (let ipcOnAction of ipcOnActions) {
  ipcMain.on(ipcOnAction.action, ipcOnAction.handler)
}
