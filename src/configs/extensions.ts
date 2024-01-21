import path from 'node:path'
import url from 'node:url'

const EXTENSION_FOLDER_PATH = '../../extensions'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export const EXTENSION_PATH = path.join(__dirname, EXTENSION_FOLDER_PATH)

// export const EXTENSION_IDS = {
//   DarkReader: 'eimadpbcbfnmbkopoojfekhnkhdbieeh'
// } as Record<string, string>

interface EXTENSION_GITHUB_TYPE {
  owner: string
  repo: string
  assetNumber: number
}

export const EXTENSION_GITHUB = [
  {
    owner: 'darkreader',
    repo: 'darkreader',
    assetNumber: 1
  }
] as EXTENSION_GITHUB_TYPE[]