module.exports = {

  path: '/dogs/search/:search_term',

  description: "Performs search for dogs.",

  timeout: 10000, // 10 secs

  params: {
    "search_term": {
      "kind": "rest",
      "regex": "(.*)",
      "default": "",
      "enabled": true
    },
    "pagenum": {
      "kind": "query",
      "regex": "(\\d+)",
      "default": "0",
      "enabled": true
    },
    "pagesize": {
      "kind": "query",
      "regex": "(\\d+)",
      "default": "5",
      "enabled": true
    }
  }
}