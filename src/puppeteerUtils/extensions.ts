import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'
import { downloadRelease } from 'github-util'
// import { downloadExtension } from 'chrome-extensions-util'

import { EXTENSION_GITHUB, EXTENSION_PATH } from '@/configs/extensions.ts'

// export const downloadExtensions = async (chromeVersion: string) => {
//   for (const extensionName in EXTENSION_IDS) {
//     const crxFileName = await downloadExtension(extensionName, EXTENSION_IDS[extensionName], chromeVersion, EXTENSION_PATH)
//     console.log(`Extension downloaded and saved as ${crxFileName}`)
//   }
// }

export const downloadExtensions = async () => {
  for (const { owner, repo, assetNumber } of EXTENSION_GITHUB) {
    await downloadRelease(owner, repo, assetNumber, EXTENSION_PATH)
  }
}

export const updateExtensions = () => {
  // TODO
}

export const getExtensionFileNames = () => {
  return fs.readdirSync(EXTENSION_PATH)
}

export const getExtensionFilePaths = (extensionPath = EXTENSION_PATH) => {
  const extensionFileNames = fs.readdirSync(extensionPath, { withFileTypes: true })
  return extensionFileNames
    .filter((dirent) => dirent.isDirectory() === true)
    .map((dirent) => path.join(dirent.path, dirent.name))
}

export const getZipExtensionFilePaths = () => {
  const extensionFileNames = fs.readdirSync(EXTENSION_PATH, { withFileTypes: true })
  return extensionFileNames
    .filter((dirent) => dirent.isFile() === true && dirent.name.slice(-4) === '.zip')
    .map((dirent) => path.join(dirent.path, dirent.name))
}

export const extractZipExtensions = async (filepaths = getZipExtensionFilePaths()) => {
  for (const filepath of filepaths) {
    const zip = new AdmZip(filepath)
    const targetFolderPath = filepath.slice(0, -4)
    if (fs.existsSync(targetFolderPath) === true) {
      return
    }
    fs.mkdirSync(targetFolderPath)
    zip.extractAllTo(targetFolderPath, true)
  }
}