export interface IFileService {

    listFiles(type: string, signal: AbortSignal | undefined): Promise<string[]>;

    uploadFile(file: File, type: string, signal: AbortSignal | undefined): Promise<string>;

    downloadFile(path: string, signal: AbortSignal | undefined): Promise<File>;

}