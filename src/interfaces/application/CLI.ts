export interface CLI {
  start(): Promise<void>;
  stop(): void;
}
