module.exports = {
  "extends": "airbnb",
  "plugins": [
    "react"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jasmine": true,
    "worker": true
  },
  "globals": {
    "PIXI": true
  },
  "rules": {
    "no-use-before-define": "off",
  }
};