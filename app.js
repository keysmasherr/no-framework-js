const express = require('express');
require('dotenv').config();

const app = express();
const port = 3000;
const path = require('path');

const Prismic = require('@prismicio/client');
const PrismicDOM = require('prismic-dom');

// Initialize the prismic.io api
const initApi = (req) => Prismic.getApi(
  process.env.PRISMIC_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  },
);

const handleLinkResolver = (doc) => {

  // Define the url depending on the document type
  //   if (doc.type === 'page') {
  //     return '/page/' + doc.uid;
  //   } else if (doc.type === 'blog_post') {
  //     return '/blog/' + doc.uid;
  //   }

  //   // Default to homepage
  return '/';
}

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  };
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM;
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/about', (req, res) => {
  initApi(req).then((api) => {
    api.query([
      Prismic.Predicates.any('document.type', ['metadata', 'about']),
    ]).then(({ results }) => {
      const [about, meta] = results;
      console.log(meta);
      res.render('pages/about', { about, meta });
    });
  });
});

app.get('/detail/:uid', (req, res) => {
  res.render('pages/detail');
});

app.get('/collection', (req, res) => {
  res.render('pages/collection');
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});