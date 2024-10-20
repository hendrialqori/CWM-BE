import { XENDIT_SECRET_KEY } from '../constant';
import { Xendit } from 'xendit-node';

const secretKey = XENDIT_SECRET_KEY;
export const XENDIT_CLIENT = new Xendit({ secretKey })