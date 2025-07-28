import { IdGenerator } from '../../src/infrastructure/idGenerator';
import { UuidIdGenerator } from '../../src/infrastructure/uuidIdGenerator';

describe('IdGenerator', () => {
  describe('interface contract', () => {
    it('should have generate method that returns string', () => {
      const generator: IdGenerator = new UuidIdGenerator();
      const id = generator.generate();
      expect(typeof id).toBe('string');
    });
  });
});

describe('UuidIdGenerator', () => {
  let generator: UuidIdGenerator;

  beforeEach(() => {
    generator = new UuidIdGenerator();
  });

  describe('generate', () => {
    it('should generate a valid UUID string', () => {
      const id = generator.generate();

      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generator.generate();
      const id2 = generator.generate();

      expect(id1).not.toBe(id2);
    });

    it('should generate non-empty strings', () => {
      const id = generator.generate();

      expect(id).toBeTruthy();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate consistent format across multiple calls', () => {
      const ids = Array.from({ length: 5 }, () => generator.generate());

      ids.forEach(id => {
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    });
  });
});
