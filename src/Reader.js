/*
 * Sorry if this guy makes you disappointed. It's just a wrapper around `fs.readFileSync`.
 */
import { readFileSync } from 'fs';

const readFile = (filename: string) => readFileSync(filename, 'utf8');

export { readFile };
