export class ResponseError extends Error {
    constructor(public status: number, public message: string) {
        super(message)
    }
}

export class FileUploadError extends Error {
    constructor(public status: number, public message: string) {
        super(message)
    }
}

export class AuthenticationError extends Error {
    constructor(public status: number, public message: string) {
        super(message)
    }
}