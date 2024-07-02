import { randomUUID } from 'node:crypto';

if (!globalThis.crypto) {
    globalThis.crypto = {};
}
globalThis.crypto.randomUUID = randomUUID;
