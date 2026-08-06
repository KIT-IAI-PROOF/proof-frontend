export interface IFMUImporterService {

    processSelected(signal: AbortSignal | undefined, data: any): Promise<any>;

    processDefinitions(signal: AbortSignal | undefined, data: any): Promise<any>;

    uploadXml(signal: AbortSignal | undefined, file: File): Promise<any>;

    download(signal: AbortSignal | undefined, baseName: string, modalBlockData: any): Promise<any>;

}