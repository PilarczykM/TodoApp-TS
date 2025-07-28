import { Todo } from '../../src/domain/todo';
import { TodoData } from '../../src/domain/todoValidator';
import { FileSystem } from '../../src/infrastructure/fileSystem';
import { TodoRepository } from '../../src/infrastructure/todoRepository';
import { JsonTodoRepository } from '../../src/infrastructure/jsonTodoRepository';

describe('JsonTodoRepository', () => {
  let fileSystem: jest.Mocked<FileSystem>;
  let todoRepository: TodoRepository;
  let testTodoData: TodoData;

  beforeEach(() => {
    fileSystem = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      ensureDir: jest.fn(),
      remove: jest.fn(),
    };
    todoRepository = new JsonTodoRepository(fileSystem);
    testTodoData = {
      id: '123',
      title: 'Test Todo',
      description: 'Test Description',
      status: 'pending',
    };
  });

  describe('save', () => {
    it('should save a new todo to empty storage', async () => {
      fileSystem.readFile.mockRejectedValue(new Error('File not found'));
      fileSystem.writeFile.mockResolvedValue();

      const todo = new Todo(testTodoData);
      await todoRepository.save(todo);

      expect(fileSystem.writeFile).toHaveBeenCalledWith('data/todos.json', JSON.stringify([testTodoData], null, 2));
    });

    it('should save a new todo to existing storage', async () => {
      const existingTodo = {
        id: '456',
        title: 'Existing Todo',
        description: 'Existing Description',
        status: 'completed' as const,
      };
      fileSystem.readFile.mockResolvedValue(JSON.stringify([existingTodo]));
      fileSystem.writeFile.mockResolvedValue();

      const todo = new Todo(testTodoData);
      await todoRepository.save(todo);

      expect(fileSystem.writeFile).toHaveBeenCalledWith(
        'data/todos.json',
        JSON.stringify([existingTodo, testTodoData], null, 2)
      );
    });
  });

  describe('findById', () => {
    it('should return todo when found', async () => {
      const existingTodos = [testTodoData];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));

      const result = await todoRepository.findById('123');

      expect(result).toBeInstanceOf(Todo);
      expect(result?.id).toBe('123');
      expect(result?.title).toBe('Test Todo');
    });

    it('should return null when todo not found', async () => {
      const existingTodos = [testTodoData];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));

      const result = await todoRepository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(new Error('File not found'));

      const result = await todoRepository.findById('123');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all todos when file exists', async () => {
      const existingTodos = [
        testTodoData,
        {
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed' as const,
        },
      ];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));

      const result = await todoRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(result[0].id).toBe('123');
      expect(result[1]).toBeInstanceOf(Todo);
      expect(result[1].id).toBe('456');
    });

    it('should return empty array when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(new Error('File not found'));

      const result = await todoRepository.findAll();

      expect(result).toEqual([]);
    });

    it('should return empty array when file is empty', async () => {
      fileSystem.readFile.mockResolvedValue('[]');

      const result = await todoRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update existing todo', async () => {
      const existingTodos = [
        testTodoData,
        {
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed' as const,
        },
      ];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));
      fileSystem.writeFile.mockResolvedValue();

      const updatedTodo = new Todo({
        id: '123',
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'completed',
      });

      await todoRepository.update(updatedTodo);

      const expectedTodos = [
        {
          id: '123',
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'completed',
        },
        {
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed',
        },
      ];

      expect(fileSystem.writeFile).toHaveBeenCalledWith('data/todos.json', JSON.stringify(expectedTodos, null, 2));
    });

    it('should throw error when todo does not exist', async () => {
      const existingTodos = [testTodoData];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));

      const nonExistentTodo = new Todo({
        id: 'nonexistent',
        title: 'Non-existent Todo',
        description: 'Non-existent Description',
        status: 'pending',
      });

      await expect(todoRepository.update(nonExistentTodo)).rejects.toThrow('Todo not found');
    });

    it('should throw error when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(new Error('File not found'));

      const todo = new Todo(testTodoData);

      await expect(todoRepository.update(todo)).rejects.toThrow('Todo not found');
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const existingTodos = [
        testTodoData,
        {
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed' as const,
        },
      ];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));
      fileSystem.writeFile.mockResolvedValue();

      await todoRepository.delete('123');

      const expectedTodos = [
        {
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed',
        },
      ];

      expect(fileSystem.writeFile).toHaveBeenCalledWith('data/todos.json', JSON.stringify(expectedTodos, null, 2));
    });

    it('should throw error when todo does not exist', async () => {
      const existingTodos = [testTodoData];
      fileSystem.readFile.mockResolvedValue(JSON.stringify(existingTodos));

      await expect(todoRepository.delete('nonexistent')).rejects.toThrow('Todo not found');
    });

    it('should throw error when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(new Error('File not found'));

      await expect(todoRepository.delete('123')).rejects.toThrow('Todo not found');
    });
  });

  describe('error scenarios', () => {
    describe('invalid JSON handling', () => {
      it('should throw error on findById when JSON is invalid', async () => {
        fileSystem.readFile.mockResolvedValue('invalid json');

        await expect(todoRepository.findById('123')).rejects.toThrow();
      });

      it('should throw error on findAll when JSON is invalid', async () => {
        fileSystem.readFile.mockResolvedValue('invalid json');

        await expect(todoRepository.findAll()).rejects.toThrow();
      });

      it('should throw error on update when JSON is invalid', async () => {
        fileSystem.readFile.mockResolvedValue('invalid json');
        const todo = new Todo(testTodoData);

        await expect(todoRepository.update(todo)).rejects.toThrow();
      });

      it('should throw error on delete when JSON is invalid', async () => {
        fileSystem.readFile.mockResolvedValue('invalid json');

        await expect(todoRepository.delete('123')).rejects.toThrow();
      });
    });

    describe('directory creation', () => {
      it('should ensure directory exists before saving', async () => {
        fileSystem.readFile.mockRejectedValue(new Error('File not found'));
        fileSystem.ensureDir.mockResolvedValue();
        fileSystem.writeFile.mockResolvedValue();

        const todo = new Todo(testTodoData);
        await todoRepository.save(todo);

        expect(fileSystem.ensureDir).toHaveBeenCalledWith('data');
      });

      it('should use custom file path when provided', async () => {
        const customRepository = new JsonTodoRepository(fileSystem, 'custom/path/todos.json');
        fileSystem.readFile.mockRejectedValue(new Error('File not found'));
        fileSystem.ensureDir.mockResolvedValue();
        fileSystem.writeFile.mockResolvedValue();

        const todo = new Todo(testTodoData);
        await customRepository.save(todo);

        expect(fileSystem.ensureDir).toHaveBeenCalledWith('custom');
        expect(fileSystem.writeFile).toHaveBeenCalledWith(
          'custom/path/todos.json',
          JSON.stringify([testTodoData], null, 2)
        );
      });
    });
  });
});
