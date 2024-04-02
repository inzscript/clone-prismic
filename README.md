# Static site
## Setup
In your terminal cd into the directory and run the following commands:

`nvm use`

`npm i`

## Development
`npm run gulp`

### Use Browser-Sync 
This will allow you to build on the fly without loading page on each change

`npm run gulp-sync`

## Build

`npm run build`

The following files compile into the public folder:

* js/**
* scss/**
* index.html

The Public folder contains all files for a staging or production environment.

The `index.html` file on the root contains a {{dir}} template tag, which is given a value from the gulpfile. This tag contains the references to assets in the `dev` folder when developing locally and the `dist` folder, which is compiled using the `npm run build` when pushing to a staging or production environment.

*Must run `npm run build` before pushing to staging or production*

## Linting
If you are using Atom as your text editor, we include Semistandard for JS linting in this package.
Install the following packages for some top notch linting:
- linter
- linter-eslint
- linter-js-standard
- linter-ui-default

We are using our own css mixin called laconic-mixin.

https://www.npmjs.com/package/laconic-mixin
# CNE-Look-Bank
