module.exports = {

  apiEndpoint: 'https://cne-look-bank.cdn.prismic.io/api/v2',

  // -- Access token if the Master is not open
  // accessToken: process.env.PRISMIC_TOKEN,

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver(doc) {
    if (doc.type === 'blog_post') {
      return '/blog/' + doc.uid;
    }

    return '/';
  },
};
