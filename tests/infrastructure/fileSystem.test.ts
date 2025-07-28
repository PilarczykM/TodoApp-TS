import { FsExtraFileSystem } from '../../src/infrastructure/fsExtraFileSystem';
import * as path from 'path';
import * as os from 'os';

describe('FsExtraFileSystem', () => {
  let fileSystem: FsExtraFileSystem;
  let tempDir: string;
  let testFilePath: string;

  beforeEach(() => {
    fileSystem = new FsExtraFileSystem();
    tempDir = path.join(os.tmpdir(), 'filesystem-test', Date.now().toString());
    testFilePath = path.join(tempDir, 'test.txt');
  });

  describe('readFile', () => {
    it('should read file content as string', async () => {
      const content = 'Hello, World!';
      await fileSystem.ensureDir(tempDir);
      await fileSystem.writeFile(testFilePath, content);

      const result = await fileSystem.readFile(testFilePath);

      expect(result).toBe(content);
    });

    it('should throw error when file does not exist', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.txt');

      await expect(fileSystem.readFile(nonExistentPath)).rejects.toThrow();
    });

    it('should handle empty file content', async () => {
      const emptyContent = '';
      await fileSystem.ensureDir(tempDir);
      await fileSystem.writeFile(testFilePath, emptyContent);

      const result = await fileSystem.readFile(testFilePath);

      expect(result).toBe(emptyContent);
    });

    it('should handle file with special characters', async () => {
      const specialContent = 'Special chars: äöü ñ 中文 🎉';
      await fileSystem.ensureDir(tempDir);
      await fileSystem.writeFile(testFilePath, specialContent);

      const result = await fileSystem.readFile(testFilePath);

      expect(result).toBe(specialContent);
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      const content = 'Test content';
      await fileSystem.ensureDir(tempDir);

      await fileSystem.writeFile(testFilePath, content);

      const result = await fileSystem.readFile(testFilePath);
      expect(result).toBe(content);
    });

    it('should overwrite existing file content', async () => {
      const originalContent = 'Original content';
      const newContent = 'New content';
      await fileSystem.ensureDir(tempDir);
      await fileSystem.writeFile(testFilePath, originalContent);

      await fileSystem.writeFile(testFilePath, newContent);

      const result = await fileSystem.readFile(testFilePath);
      expect(result).toBe(newContent);
    });

    it('should create file in existing directory', async () => {
      const content = 'Content in new file';
      await fileSystem.ensureDir(tempDir);

      await fileSystem.writeFile(testFilePath, content);

      const result = await fileSystem.readFile(testFilePath);
      expect(result).toBe(content);
    });

    it('should throw error when directory does not exist', async () => {
      const content = 'Content';
      const invalidPath = path.join(tempDir, 'nonexistent', 'file.txt');

      await expect(fileSystem.writeFile(invalidPath, content)).rejects.toThrow();
    });

    it('should handle writing empty content', async () => {
      const emptyContent = '';
      await fileSystem.ensureDir(tempDir);

      await fileSystem.writeFile(testFilePath, emptyContent);

      const result = await fileSystem.readFile(testFilePath);
      expect(result).toBe(emptyContent);
    });
  });

  describe('ensureDir', () => {
    it('should create directory when it does not exist', async () => {
      await fileSystem.ensureDir(tempDir);

      const testFile = path.join(tempDir, 'test.txt');
      await fileSystem.writeFile(testFile, 'test');
      const result = await fileSystem.readFile(testFile);
      expect(result).toBe('test');
    });

    it('should not fail when directory already exists', async () => {
      await fileSystem.ensureDir(tempDir);

      await expect(fileSystem.ensureDir(tempDir)).resolves.not.toThrow();
    });

    it('should create nested directories', async () => {
      const nestedDir = path.join(tempDir, 'nested', 'deep', 'path');

      await fileSystem.ensureDir(nestedDir);

      const testFile = path.join(nestedDir, 'test.txt');
      await fileSystem.writeFile(testFile, 'nested test');
      const result = await fileSystem.readFile(testFile);
      expect(result).toBe('nested test');
    });

    it('should handle absolute paths', async () => {
      const absolutePath = path.resolve(tempDir, 'absolute');

      await fileSystem.ensureDir(absolutePath);

      const testFile = path.join(absolutePath, 'test.txt');
      await fileSystem.writeFile(testFile, 'absolute test');
      const result = await fileSystem.readFile(testFile);
      expect(result).toBe('absolute test');
    });
  });
});
