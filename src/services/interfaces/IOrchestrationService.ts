export interface IOrchestrationService {

    startExecution(signal: AbortSignal | undefined, executionId: string): Promise<string>;

    abortExecution(signal: AbortSignal | undefined, executionId: string): Promise<void>;

}