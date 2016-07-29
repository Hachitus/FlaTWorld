module.exports = {
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "node": true,
    "jasmine": true,
    "worker": true,
    "es6": true
  },
  "rules": {
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "eqeqeq": ["error", "always"],
    "no-undef": "error",
    "no-unused-vars": "error"
  }
};
