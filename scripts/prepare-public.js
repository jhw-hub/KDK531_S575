import {cpSync, mkdirSync, rmSync} from 'node:fs';
mkdirSync('public', {recursive:true});
for (const directory of ['data', 'notebooks']) {
  rmSync(`public/${directory}`, {recursive:true, force:true});
  cpSync(directory, `public/${directory}`, {recursive:true});
}
