/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const {startServer} = require('polyserve');
const path = require('path');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const currentDir = `${process.cwd()}/test/integration/screenshots-current`;
const baselineDir = `${process.cwd()}/test/integration/screenshots-baseline`;

describe('👀 page screenshots are correct', function() {
  let polyserve, browser, page;

  before(async function() {
    polyserve = await startServer({port:4444, root:path.join(__dirname, '../..'), moduleResolution:'node'});

    // Create the test directory if needed.
    if (!fs.existsSync(currentDir)){
      fs.mkdirSync(currentDir);
    }
    // And it's subdirectories.
    if (!fs.existsSync(`${currentDir}/wide`)){
      fs.mkdirSync(`${currentDir}/wide`);
    }
    if (!fs.existsSync(`${currentDir}/narrow`)){
      fs.mkdirSync(`${currentDir}/narrow`);
    }
  });

  after((done) => polyserve.close(done));

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  describe('wide screen', function() {
    beforeEach(async function() {
      return page.setViewport({width: 800, height: 600});
    });

    it('/index.html', async function() {
      return takeAndCompareScreenshot(page, '', 'wide');
    });
    it('/play', async function() {
      return takeAndCompareScreenshot(page, 'play', 'wide');
    });
    it('/stats', async function() {
      return takeAndCompareScreenshot(page, 'stats', 'wide');
    });
    it('/about', async function() {
      return takeAndCompareScreenshot(page, 'about', 'wide');
    });
    it('/404', async function() {
      return takeAndCompareScreenshot(page, 'batmanNotAView', 'wide');
    });
  });

  describe('narrow screen', function() {
    beforeEach(async function() {
      return page.setViewport({width: 375, height: 667});
    });

    it('/index.html', async function() {
      return takeAndCompareScreenshot(page, '', 'narrow');
    });
    it('/play', async function() {
      return takeAndCompareScreenshot(page, 'play', 'narrow');
    });
    it('/stats', async function() {
      return takeAndCompareScreenshot(page, 'stats', 'narrow');
    });
    it('/about', async function() {
      return takeAndCompareScreenshot(page, 'about', 'narrow');
    });
    it('/404', async function() {
      return takeAndCompareScreenshot(page, 'batmanNotAView', 'narrow');
    });
  });
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeAndCompareScreenshot(page, route, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  let fileName = filePrefix + '/' + (route ? route : 'index');

  await page.goto(`http://127.0.0.1:4444/${route}#test`);

  // Wait for the json to load.
  await timeout(500);
  await page.screenshot({path: `${currentDir}/${fileName}.png`});

  return compareScreenshots(fileName);
}

function compareScreenshots(view) {
  return new Promise((resolve, reject) => {
    const img1 = fs.createReadStream(`${currentDir}/${view}.png`).pipe(new PNG()).on('parsed', doneReading);
    const img2 = fs.createReadStream(`${baselineDir}/${view}.png`).pipe(new PNG()).on('parsed', doneReading);

    let filesRead = 0;
    function doneReading() {
      // Wait until both files are read.
      if (++filesRead < 2) return;

      // The files should be the same size.
      expect(img1.width, 'image widths are the same').equal(img2.width);
      expect(img1.height, 'image heights are the same').equal(img2.height);

      // Do the visual diff.
      const diff = new PNG({width: img1.width, height: img1.height});

      // Skip the bottom/rightmost row of pixels, since it seems to be
      // noise on some machines :/
      const width = img1.width - 1;
      const height = img1.height - 1;

      const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data,
          width, height, {threshold: 0.3});
      const percentDiff = numDiffPixels/(width*height)*100;

      const stats = fs.statSync(`${currentDir}/${view}.png`);
      const fileSizeInBytes = stats.size;
      console.log(`📸 ${view}.png => ${fileSizeInBytes} bytes, ${percentDiff}% different`);

      // Note: for debugging, you can dump the screenshotted img as base64.
      // if (numDiffPixels !== 0) {
        // fs.createReadStream(`${currentDir}/${view}.png`, { encoding: 'base64' })
        //   .on('data', function (data) {
        //     console.log('output is:', data)
        //   })
        //   .on('end', function () {
        //     console.log('\n\n')
        //   });
        // diff.pack().pipe(fs.createWriteStream(`${currentDir}/${view}-diff.png`));
        // fs.createReadStream(`${currentDir}/${view}-diff.png`, { encoding: 'base64' })
        //   .on('data', function (data) {
        //     console.log('diff is:', data)
        //   })
        //   .on('end', function () {
        //     console.log('\n\n')
        //   });
      // }

      // There's some noise of 4 pixels sometimes.
      expect(numDiffPixels < 10, 'number of different pixels');
      resolve();
    }
  });
}
