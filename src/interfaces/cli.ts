#!/usr/bin/env node

import { TodoService } from '../application/services/TodoService';
import { ErrorHandler } from '../application/services/ErrorHandler';
import { CommandDispatcher } from '../application/services/CommandDispatcher';
import { JsonTodoRepository } from '../infrastructure/repositories/JsonTodoRepository';
import { UuidIdGenerator } from '../infrastructure/idGeneration/UuidIdGenerator';
import { FsExtraFileSystem } from '../infrastructure/fileSystem/FsExtraFileSystem';
import { InquirerConsole } from '../infrastructure/console/InquirerConsole';
import { TodoCLI } from './cli/TodoCLI';

async function main(): Promise<void> {
  try {
    // Initialize infrastructure dependencies
    const fileSystem = new FsExtraFileSystem();
    const idGenerator = new UuidIdGenerator();
    const errorHandler = new ErrorHandler();

    // Initialize repository with dependency injection
    const todoRepository = new JsonTodoRepository(fileSystem, errorHandler, 'data/todos.json');

    // Initialize application services
    const todoService = new TodoService(todoRepository, idGenerator, errorHandler);

    // Initialize console interface
    const consoleInterface = new InquirerConsole();

    // Initialize command dispatcher
    const commandDispatcher = new CommandDispatcher();

    // Initialize and start CLI
    const cli = new TodoCLI(todoService, consoleInterface, commandDispatcher);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      consoleInterface.displayInfo('\nShutting down gracefully...');
      cli.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      consoleInterface.displayInfo('\nShutting down gracefully...');
      cli.stop();
      process.exit(0);
    });

    // Start the CLI
    await cli.start();
  } catch (error) {
    const errorHandler = new ErrorHandler();
    const errorResult = errorHandler.handleError(error);

    console.error(`Fatal error: ${errorResult.message}`);
    process.exit(1);
  }
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
