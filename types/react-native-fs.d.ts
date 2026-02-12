declare module 'react-native-fs' {
  export const DocumentDirectoryPath: string;
  export const DownloadDirectoryPath: string;
  export const CachesDirectoryPath: string;
  export const ExternalDirectoryPath: string;
  export const ExternalStorageDirectoryPath: string;
  export const PicturesDirectoryPath: string;
  export const TemporaryDirectoryPath: string;
  export const MainBundlePath: string;

  export function writeFile(filepath: string, contents: string, encoding?: string): Promise<void>;

  export function readFile(filepath: string, encoding?: string): Promise<string>;

  export function copyFile(filepath: string, destPath: string): Promise<void>;

  export function moveFile(filepath: string, destPath: string): Promise<void>;

  export function unlink(filepath: string): Promise<void>;

  export function exists(filepath: string): Promise<boolean>;

  export function mkdir(
    filepath: string,
    options?: {NSURLIsExcludedFromBackupKey?: boolean},
  ): Promise<void>;

  export function readDir(dirpath: string): Promise<ReadDirItem[]>;

  export interface ReadDirItem {
    ctime: Date | null;
    mtime: Date | null;
    name: string;
    path: string;
    size: number;
    isFile: () => boolean;
    isDirectory: () => boolean;
  }

  const RNFS: {
    DocumentDirectoryPath: string;
    DownloadDirectoryPath: string;
    CachesDirectoryPath: string;
    ExternalDirectoryPath: string;
    ExternalStorageDirectoryPath: string;
    PicturesDirectoryPath: string;
    TemporaryDirectoryPath: string;
    MainBundlePath: string;
    writeFile: typeof writeFile;
    readFile: typeof readFile;
    copyFile: typeof copyFile;
    moveFile: typeof moveFile;
    unlink: typeof unlink;
    exists: typeof exists;
    mkdir: typeof mkdir;
    readDir: typeof readDir;
  };

  export default RNFS;
}
