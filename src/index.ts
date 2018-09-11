import fetch from 'node-fetch';
import * as fileType from 'file-type';

import * as imagemin from 'imagemin';
import * as jpegtran from 'imagemin-jpegtran';
import * as pngquant from 'imagemin-pngquant';

import * as sizeOf from 'buffer-image-size';

import * as sharp from 'sharp';

const url = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  const buffer = await res.buffer();
  return buffer;
}

function shrinkImage(file: Buffer): Promise<Buffer> {
  return sharp(file).resize(50, 50).toBuffer();
}

async function optimizeImage(file: Buffer): Promise<Buffer> {
  const ret = await imagemin.buffer(file, {
    plugins: [
      jpegtran(),
      pngquant({quality: '65-80'})
    ]
  });

  return ret;
}

process.argv.filter(arg => arg.match(url)).forEach(async arg => {
  try {
    const image = await downloadToBuffer(arg);
    const type  = fileType(image);
    const dimen = sizeOf(image);

    if (type.ext === 'png' || type.ext === 'jpeg' || type.ext === 'jpg') {
      const small = await shrinkImage(image);
      const optim = await optimizeImage(small);
      
      console.log(`height: ${dimen.height}px; width: ${dimen.width}px`);
      console.log(`data:${type.mime};base64,${optim.toString('base64')}`);
    } else {
      console.log('KE ASE NIERY??!!');
    }
  } catch (e) {
    console.log('KE ASE NIERY??!!');
  }
});
