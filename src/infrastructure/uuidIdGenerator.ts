import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from './idGenerator';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
