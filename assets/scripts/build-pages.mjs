// Static packaging only: application files are copied byte-for-byte.
import {cpSync,existsSync,mkdirSync,readdirSync,readFileSync,writeFileSync,lstatSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {entryDefinitions} from '../location-data.js';
import {locationURL} from '../locations.js';

const source=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const base=option('--base-url',process.env.PAGES_BASE_URL);
if(!base)throw Error('Supply --base-url https://USER.github.io/REPO/ (or PAGES_BASE_URL).');
const url=new URL(base);
if(!['http:','https:'].includes(url.protocol)||url.search||url.hash)throw Error('Base URL must be an http(s) directory without a query or fragment.');
if(!url.pathname.endsWith('/'))url.pathname+='/';
const output=resolve(option('--out-dir',join(source,'dist')));
if(output===source||source.startsWith(output+'/'))throw Error('Output must not be the application directory or an ancestor.');
if(existsSync(output)&&readdirSync(output).length)throw Error('Choose an empty output directory; existing output is never deleted.');
mkdirSync(output,{recursive:true});
const files=['index.html','styles.css','mobile.css','app.js','audio.js','building.js','calibration.js','engine.js','location-data.js','locations.js','navigation.js','network.js','pathfinding.js','renderer.js','qr.html','map-holt-1st floor.png','vendor'];
for(const file of files)cpSync(join(source,file),join(output,file),{recursive:true});
writeFileSync(join(output,'.nojekyll'),'');
const qr=entryDefinitions.map(entry=>({
 file:'entrance-'+entry.id.slice(-1)+'.svg',
 id:entry.id,
 url:locationURL(url.href,entry.id)
}));
// qrcode is already used by generate_qr.py; this is a build-time dependency only.
const child=spawnSync(process.env.PYTHON||'python3',[join(source,'scripts/qr-assets.py'),output],{
 input:JSON.stringify(qr),encoding:'utf8'
});
if(child.status!==0)throw Error('QR build failed: '+child.stderr);
const qrPage=readFileSync(join(output,'qr.html'),'utf8')
 .replace('Entry B and C are provisional pending on-site door confirmation.','QR installation positions should match the marked entry locations.')
 .replace('<main>','<p>QR destination: '+url.href.replaceAll('&','&amp;').replaceAll('<','&lt;')+'</p><main>');
writeFileSync(join(output,'qr.html'),qrPage);
const hashes={};
function walk(dir,prefix=''){
 for(const name of readdirSync(dir)){const rel=prefix+name,full=join(dir,name);
  if(lstatSync(full).isSymbolicLink())throw Error('Symbolic links cannot be published: '+rel);
  if(lstatSync(full).isDirectory())walk(full,rel+'/');
  else hashes[rel]=createHash('sha256').update(readFileSync(full)).digest('hex');
 }
}
walk(output);
writeFileSync(join(output,'pages-manifest.json'),JSON.stringify({baseURL:url.href,qr,sha256:hashes},null,2)+'\n');
console.log('Static Pages package: '+output+'\nURL: '+url.href+'\nFiles: '+Object.keys(hashes).length);
