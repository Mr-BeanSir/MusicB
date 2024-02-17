import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import DB from './db'

// Custom APIs for renderer
const rootPath = process.cwd()
const db = new DB(rootPath)
const api = {
  rootPath,
  db
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}