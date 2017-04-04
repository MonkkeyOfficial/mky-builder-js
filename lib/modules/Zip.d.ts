export interface ZipCallback {
    (directoryPath: string, destinationPath: string): void;
}
export interface ZipErrorCallback {
    (error: any, directoryPath: string, destinationPath: string): void;
}
export default function zip(directoryPath: string, destinationPath: string, callback: ZipCallback, errorCallback: ZipErrorCallback): void;
