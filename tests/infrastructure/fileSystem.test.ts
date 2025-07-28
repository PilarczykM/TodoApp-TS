import { FsExtraFileSystem } from '../../src/infrastructure/fileSystem/FsExtraFileSystem';
import * as path from 'path';
import * as os from 'os';

describe('FsExtraFileSystem', () => {
  let fileSystem: FsExtraFileSystem;
  let tempDir: string;
  let testFilePath: string;

  beforeEach(async () => {
    fileSystem = new FsExtraFileSystem();
    tempDir = path.join(os.tmpdir(), 'filesystem-test', Date.now().toString());
    testFilePath = path.join(tempDir, 'test.txt');
    await fileSystem.ensureDir(tempDir); // Ensure tempDir exists before each test
  });

  afterEach(async () => {
    // Clean up the temporary directory after each test
    await fileSystem.remove(tempDir);
  });

  const setupTestFile = async (content: string) => {
    await fileSystem.writeFile(testFilePath, content);
  };

  const writeAndReadFile = async (filePath: string, content: string) => {
    await fileSystem.writeFile(filePath, content);
    return fileSystem.readFile(filePath);
  };

  describe('readFile', () => {
    it('should read file content as string', async () => {
      const content = 'Hello, World!';
      await setupTestFile(content);

      const result = await fileSystem.readFile(testFilePath);

      expect(result).toBe(content);
    });

    it('should throw error when file does not exist', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.txt');

      await expect(fileSystem.readFile(nonExistentPath)).rejects.toThrow();
    });

    it('should handle empty file content', async () => {
      const emptyContent = '';
      await setupTestFile(emptyContent);

      const result = await fileSystem.readFile(testFilePath);

      expect(result).toBe(emptyContent);
    });

    it('should handle file with special characters', async () => {
      const specialContent = 'Special chars: äöü ñ 中文 🎉';
      await setupTestFile(specialContent);

      const result = await fileSystem.readFile(testFilePath);

      expect(result).toBe(specialContent);
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      const content = 'Test content';
      const result = await writeAndReadFile(testFilePath, content);
      expect(result).toBe(content);
    });

    it('should overwrite existing file content', async () => {
      const originalContent = 'Original content';
      const newContent = 'New content';
      await setupTestFile(originalContent);

      const result = await writeAndReadFile(testFilePath, newContent);
      expect(result).toBe(newContent);
    });

    it('should create file in existing directory', async () => {
      const content = 'Content in new file';
      const result = await writeAndReadFile(testFilePath, content);
      expect(result).toBe(content);
    });

    it('should throw error when directory does not exist', async () => {
      const content = 'Content';
      const invalidPath = path.join(tempDir, 'nonexistent', 'file.txt');

      await expect(fileSystem.writeFile(invalidPath, content)).rejects.toThrow();
    });

    it('should handle writing empty content', async () => {
      const emptyContent = '';
      const result = await writeAndReadFile(testFilePath, emptyContent);
      expect(result).toBe(emptyContent);
    });
  });

  describe('ensureDir', () => {
    it('should create directory when it does not exist', async () => {
      // tempDir is already ensured by beforeEach
      const testFile = path.join(tempDir, 'test.txt');
      const result = await writeAndReadFile(testFile, 'test');
      expect(result).toBe('test');
    });

    it('should not fail when directory already exists', async () => {
      await expect(fileSystem.ensureDir(tempDir)).resolves.not.toThrow();
    });

    it('should create nested directories', async () => {
      const nestedDir = path.join(tempDir, 'nested', 'deep', 'path');

      await fileSystem.ensureDir(nestedDir);

      const testFile = path.join(nestedDir, 'test.txt');
      const result = await writeAndReadFile(testFile, 'nested test');
      expect(result).toBe('nested test');
    });

    it('should handle absolute paths', async () => {
      const absolutePath = path.resolve(tempDir, 'absolute');

      await fileSystem.ensureDir(absolutePath);

      const testFile = path.join(absolutePath, 'test.txt');
      const result = await writeAndReadFile(testFile, 'absolute test');
      expect(result).toBe('absolute test');
    });
  });
});
