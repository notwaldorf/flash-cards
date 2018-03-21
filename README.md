![built_with pwa–starter–kit_](https://img.shields.io/badge/built_with-pwa–starter–kit_-blue.svg)

# Flash Cards
This is a simple flash cards app to help you learn Japanese. It is built using the [PWA Starter Kit](https://github.com/PolymerLabs/pwa-starter-kit), using the default template as the starting point and the [wiki](https://github.com/PolymerLabs/pwa-starter-kit/wiki) for configuring and personalizing.

<img width="400" alt="screenshot of the game screen" src="https://user-images.githubusercontent.com/1369170/37738326-e4892236-2d13-11e8-820d-05f609bfc449.png">

Apart from several game options, `flash-cards` also comes with a stats page that shows you a heatmap of your answers.

<img width="400" alt="screenshot of stats screen" src="https://user-images.githubusercontent.com/1369170/37738328-e6392c34-2d13-11e8-949f-bdd4e8aae76e.png">

## Features/highlights

## Setup

```
git clone https://github.com/notwaldorf/flash-cards
cd flash-cards
npm install
polymer serve   # or a different local server
```

## Build and deploy

To build the app, run `npm run build`. This will create a `dist` folder that has all the minified 
bundles and assets you need to deploy. If you want to test that the build output works, you can just
start a local server from that output folder:
```
cd dist
polymer serve   # or a different local server
```

For deployment, I used [Netlify](https://www.netlify.com/)'s 
pretty much out-of-the-box setup. These are my deploy settings (so that the app is rebuilt and
the bundled app is redeployed every time there's a new commit to master):
<img width="400" alt="screenshot of netlify settings" src="https://user-images.githubusercontent.com/1369170/37738873-989129b2-2d15-11e8-95cb-c17f75691e00.png">

Since this app is structured as an `app-shell` (the `index.html` knows how to display the correct route based on the URL, but each URL does not correspond to a standalone view you can just load), I've also added a [`_redirects file`](https://github.com/notwaldorf/flash-cards/blob/master/_redirects) used by the Netlify server tohandle these redirects (read more about that [here](https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps))

