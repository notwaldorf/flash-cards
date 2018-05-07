[![Built with pwa–starter–kit](https://img.shields.io/badge/built_with-pwa–starter–kit_-blue.svg)](https://github.com/Polymer/pwa-starter-kit "Built with pwa–starter–kit")

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

