export class FileUploadError extends Error {
    constructor(public status: number, public message: string) {
        super(message)
    }
}