import * as fs from 'fs-extra';
import { FileSystem } from '../../interfaces/infrastructure/FileSystem';

export class FsExtraFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }

  async ensureDir(path: string): Promise<void> {
    await fs.ensureDir(path);
  }

  async remove(path: string): Promise<void> {
    await fs.remove(path);
  }
}
