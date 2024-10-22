import crypto from 'node:crypto'
import fs from "node:fs"
import { Request, Response, NextFunction } from 'express'
import winston from 'winston';


export const generateMD5 = (filePath: string): Promise<string>  => {
    return new Promise((res, rej) => {
        const hash = crypto.createHash('md5');
        const rStream = fs.createReadStream(filePath);

        rStream.on('data', (data) => {
            hash.update(data);
        });
        rStream.on('end', () => {
            res(hash.digest('hex'));
        });
    })
}

export function logger(req: Request, res: Response, next: NextFunction) {
    const requestTime = new Date(Date.now()).toString();
    console.log(req.method, req.hostname, req.path, `[${requestTime}]`);

    next()
}

const { combine, timestamp, prettyPrint, colorize } = winston.format;

export const winstonLogger = winston.createLogger({
    format: combine(
        timestamp(),
        prettyPrint(),
        colorize({ all: true }),
    ),
    transports: [new winston.transports.Console()]
})
