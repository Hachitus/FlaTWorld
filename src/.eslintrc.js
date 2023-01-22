module.exports = {
  /* "parser": "babel-eslint", */
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  },
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "node": true,
    "jasmine": true,
    "worker": true,
    "es6": true
  },
  "rules": {
    "indent": ["error", 2, {
      "SwitchCase": 1
    }],
    "eqeqeq": ["error", "always"],
    "no-undef": "error",
    "no-unused-vars": "error",
    "prefer-const": ["error", {
      "destructuring": "all"
    }],
    "no-var": "error",
    "no-use-before-define": ["error", {
      "functions": false,
      "classes": true
    }],
    "max-len": ["warn", {
      code: 140,
    }],
  }
};
