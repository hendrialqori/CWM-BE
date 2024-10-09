import { Xendit } from 'xendit-node';

const secretKey = process.env.XENDIT_SECRET_KEY;

export const XENDIT_CLIENT = new Xendit({ secretKey })