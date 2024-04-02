const Express = require('express');
const hbs = require('hbs');
const app = new Express();
const bodyParser = require('body-parser');
const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const PrismicConfig = require('./prismic-configuration');
const apiEndpoint = PrismicConfig.apiEndpoint;
require('dotenv').config();
const basicAuth = require('express-basic-auth');
let numOfTemplates = 50;
function getUnauthorizedResponse (req) {
  return req.auth
    ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
    : 'No credentials provided';
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', `${__dirname}/views`);

app.use(Express.static(`${__dirname}/static`));

app.use((req, res, next) => {
  if (req.get('x-forwarded-port') === '80' || req.get('x-forwarded-port') === 80) {
    return res.redirect(301, 'https://www.cnecreativevault.com' + req.path);
  }

  return next();
});

app.use(basicAuth({
  users: { [process.env.NAME]: process.env.PASSWORD },
  challenge: true,
  unauthorizedResponse: getUnauthorizedResponse
}));

function initApi (req) {
  return Prismic.getApi(apiEndpoint, {
    req: req
  });
}

// Navigation Middleware
app.use((req, res, next) => {
  initApi(req).then(function (api) {
    api.query(
      Prismic.Predicates.any('document.tags', ['Past Promos', 'Concept Look Bank']),
      {
        orderings: '[ my.templates.title]',
        fetch: ['templates.title']
      }
    ).then(function (navItems) {
      if (navItems) {
        let navOne = [];
        let navTwo = [];

        for (let i = 0; i < navItems.results.length; i++) {
          if (navItems.results[i].tags.indexOf('Concept Look Bank') >= 0) {
            navOne.push({
              navTite: navItems.results[i].data.title[0].text,
              navLink: navItems.results[i].uid
            });
          } else if (navItems.results[i].tags.indexOf('Past Promos') >= 0) {
            navTwo.push({
              navTite: navItems.results[i].data.title[0].text,
              navLink: navItems.results[i].uid
            });
          }
        }
        req.nav = { navOne, navTwo };
        next();
      } else {
        next({ status: 404 });
      }
    }).catch(function (error) {
      next(error);
    });
  });
});

app.get('/', function (req, res, next) {
  initApi(req).then(function (api) {
    api.query(
      Prismic.Predicates.at('document.tags', ['Home Page']),
      { orderings: '[ my.templates.title]' }
    ).then(function (document) {
      if (document) {
        const pages = document.results;
        res.render('home', {
          navOne: req.nav.navOne,
          navTwo: req.nav.navTwo,
          pages,
          documents: {
            title: [ { text: 'Creative Vault' } ]
          },
          title: 'CNE Creative Vault',
          author: 'RedSquare',
          description: 'CNE Look Book Options'
        });
      } else {
        next({ status: 404 });
      }
    }).catch(function (error) {
      next(error);
    });
  });
});

app.post('/get-new-page-data', function (req, res, next) {
  let orderType = req.body.ids === 'events-top-performing' ? '[my.detail.order]' : '[document.first_publication_date]';
  let data = [];
  initApi(req).then(function (api) {
    api.getByUID('templates', req.body.ids).then(function (document) {
      if (document) {
        let counter = 0;
        let templates = [];
        for (let i = 0; i < document.data.body.length; i++) {
          let slice = document.data.body[i];
          if (slice.slice_type === 'section') {
            templates.push({
              ids: slice.items.map(item => item.templates.id)
            });
          }
        }
        for (let i = 0; i < templates.length; i++) {
          api.getByIDs(templates[req.body.index].ids, {
            pageSize: numOfTemplates,
            page: req.body.pageNum,
            orderings: orderType
          }).then(function (response) {
            if (response) {
              // Set the results to a new key:value pair in the  `templates` array
              templates[i].details = response.results;
              // Check if all of the needed api calls have been made
              if (counter === templates.length - 1) {
                for (let i = 0; i < templates[0].details.length; i++) {
                  let item = {
                    name: templates[0].details[i].data.template_name,
                    image: templates[0].details[i].data.template_thumbnail.url,
                    color: templates[0].details[i].data.more_colors,
                    referenceNumber: templates[0].details[i].data.reference_number,
                    template_description: templates[0].details[i].data.template_description,
                    template_images: templates[0].details[i].data.template_images
                  };
                  data.push(item);
                }
                res.send(data);
              }
              // Increment the counter to count all the api calls made.
              // Moved this after the conditional above because it was firing
              // too soon and not all the api call were finishing
              counter++;
            } else {
              next({ status: 404 });
            }
          });
        }
      } else {
        next({ status: 404 });
      }
    }).catch(function (error) {
      console.log(error);
      next(error);
    });
  });
  // res.sendStatus(200);
});

app.get('/:uid', (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  let orderType = req.params.uid === 'events-top-performing' ? '[my.detail.order]' : '[document.first_publication_date]';
  initApi(req).then(function (api) {
    api.getByUID('templates', req.params.uid).then(function (document) {
      if (document) {
        let counter = 0;
        const documents = document.data;
        let templates = [];
        for (let i = 0; i < documents.body.length; i++) {
          let slice = documents.body[i];
          if (slice.slice_type === 'structure') {
            templates.push({
              styles: slice.primary,
              headline: [],
              ids: []
            });
          } else if (slice.slice_type === 'section') {
            templates.push({
              styles: [],
              headline: slice.primary.headline,
              ids: slice.items.map(item => item.templates.id)
            });
          }
        }
        // We are now able to only need one for loop and are not nesint for loops anymore
        for (let i = 0; i < templates.length; i++) {
          // for each template (slice) we make an api call with the array of ids.
          api.getByIDs(templates[i].ids, {
            pageSize: numOfTemplates,
            page: 1,
            orderings: orderType
          }).then(function (response) {
            let createPagination = [];
            if (response.total_pages > 1) {
              for (let i = 1; i < response.total_pages + 1; i++) {
                createPagination.push(`<li class="${page === i ? 'active' : ''}">${i}</li>`);
              }
            }
            if (response) {
              // Set the results to a new key:value pair in the  `templates` array
              templates[i].details = response.results;
              templates[i].pagination = createPagination;
              // Check if all of the needed api calls have been made
              if (counter === templates.length - 1) {
                res.render('detail', {
                  documents,
                  templates,
                  navOne: req.nav.navOne,
                  navTwo: req.nav.navTwo,
                  pagination: createPagination,
                  title: 'CNE Creative Vault',
                  author: 'Red Square',
                  description: 'CNE Look Book Options'
                });
              }
              // Increment the counter to count all the api calls made.
              // Moved this after the conditional above because it was firing
              // too soon and not all the api call were finishing
              counter++;
            } else {
              next({ status: 404 });
            }
          });
        }
      } else {
        next({ status: 404 });
      }
    }).catch(function (error) {
      console.log(error);
      next(error);
    });
  });
});

hbs.registerHelper('PrismicRichText', context => PrismicDOM.RichText.asHtml(context, PrismicConfig.linkResolver));
hbs.registerHelper('PrismicPlainText', context => PrismicDOM.RichText.asText(context));
hbs.registerHelper('IfEqualTo', function (item1, item2, options) {
  if (item1 === item2) {
    return options.fn(this);
  } else {
    return '';
  }
});
hbs.registerHelper('empty', function (item, options) {
  if (item === undefined || item.length === 0) {
    return '';
  } else {
    if (item[0].text === '') {
      return '';
    } else {
      return options.fn(this);
    }
  }
});
hbs.registerHelper('MoreColors', function (item1, item2) {
  if (item1 === 'Yes') {
    return '<span>+</span> More Colors';
  } else {
    return '';
  }
});

app.get('*', function (req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.render('four-oh-four', {
    navOne: req.nav.navOne,
    navTwo: req.nav.navTwo,
    title: 'CNE Creative Vault',
    documents: {
      title: [{ text: '' }]
    },
    description: '404 Page',
    url: `${(req.get('x-forwarded-port') === '443' || req.get('x-forwarded-port') === 443) ? 'https' : 'http'}://${req.get('host')}${req.originalUrl}`,
    author: 'Red Square'
  });

  if (err.status !== 404) {
    return next();
  }
});
app.listen(process.env.PORT || 3000);
