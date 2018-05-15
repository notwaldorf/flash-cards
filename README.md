[![Built with pwa–starter–kit](https://img.shields.io/badge/built_with-pwa–starter–kit_-blue.svg)](https://github.com/Polymer/pwa-starter-kit "Built with pwa–starter–kit")
[![Build status](https://api.travis-ci.com/notwaldorf/flash-cards.svg?branch=master)](https://travis-ci.com/notwaldorf/flash-cards)

# Flash Cards
This is a simple flash cards app to help you learn Japanese. It is built using the [PWA Starter Kit](https://github.com/PolymerLabs/pwa-starter-kit), using the default template as the starting point and the [wiki](https://github.com/PolymerLabs/pwa-starter-kit/wiki) for configuring and personalizing.

Apart from several game options, `flash-cards` also comes with a stats page that shows you a heatmap of your answers.

<img width="1171" alt="screen shot 2018-03-23 at 6 49 11 pm" src="https://user-images.githubusercontent.com/1369170/37859047-f30576da-2eca-11e8-860b-cb338385f9da.png">

## Features/highlights
- uses Redux to handle the application's state
- this state is also stored and loaded from `localStorage`, so that the last question asked and the stats are persisted across refreshes
- uses the [SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) to read out the question being asked
- the actual cards data is loaded from arbitrary `json` files, so the app can be extended to work for any language and any set of words being learnt

## Setup

```
git clone https://github.com/notwaldorf/flash-cards
cd flash-cards
npm install
npm start
```

To run the tests, you can run `npm run test`.

## Build and deploy

To build the app, run `npm run build`. This will create a `build` folder that has all the minified 
bundles and assets you need to deploy. If you want to test that the build output works, you can run

```
npm run serve
```

For deployment, I used [Netlify](https://www.netlify.com/)'s 
pretty much out-of-the-box setup. These are my deploy settings (so that the app is rebuilt and
the bundled app is redeployed every time there's a new commit to master):
<img width="400" alt="screenshot of netlify settings" src="https://user-images.githubusercontent.com/1369170/39498608-eb2abe78-4d5d-11e8-9cca-40f75aa9d754.png">

Since this app is structured as an `app-shell` (the `index.html` knows how to display the correct route based on the URL, but each URL does not correspond to a standalone view you can just load), I've also added a [`_redirects file`](https://github.com/notwaldorf/flash-cards/blob/master/_redirects) used by the Netlify server tohandle these redirects (read more about that [here](https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps))

### Supported browsers
This app uses the `es6-bundled` bundle -- this means that it will not work on IE11. If you want to deploy this app and have it work on IE11, you must use the `es5-bundled` bundle instead. 

## Performance
### Lighthouse:
<img width="827" alt="screen shot 2018-05-15 at 3 12 38 pm" src="https://user-images.githubusercontent.com/1369170/40086267-834daa7c-5852-11e8-95a8-b98b8eca835a.png">

### WebPageTest:
[Full test results](https://www.webpagetest.org/result/180515_ZH_744d89edf78869d0c934d72ee7bab994/). 
<img width="964" alt="screen shot 2018-05-15 at 3 18 40 pm" src="https://user-images.githubusercontent.com/1369170/40086471-48e2ab5c-5853-11e8-83e3-0bd413164f87.png">

## Known Issues
There's a problem with the SpeechSyntesis API on Windows, where I bail out early if I don't find a Voice I can recognize (because there don't seem to be any Japanese languages installed by default on Windows). Should prolly figure out something around this.
