#!/bin/bash
set -e

if [ "$ENV" = 'TEST' ]; then
  echo "unit test"
  exec /usr/src/app/node_modules/mocha/bin/_mocha test/bootstrap.test.js test/unit/**/*.test.js
else
  echo "development"
  exec /usr/src/app/node_modules/nodemon/bin/nodemon.js -L --ignore node_modules/ --ignore public/ --ignore .tmp/ /usr/src/app/app.js
fi
