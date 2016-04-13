import fs from 'fs';

const readFile = (filename: string) => fs.readFileSync(filename, 'utf8');

export { readFile };
