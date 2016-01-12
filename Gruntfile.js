module.exports = function(grunt) {
  grunt.initConfig({

    'http-server': {

      'dev': {

        // the server root directory
        root: 'test/fixture/browser',

        port: 8282,
        // port: function() { return 8282; }

        host: "127.0.0.1",

        cache: -1,
        showDir: false,
        autoIndex: false,
        defaultExt: "html",

        // run in parallel with other tasks
        runInBackground: false

      }

    },

    'mixdown-router': {
      options: {
        router_template: './test/fixture/browser/helper/router_template.js.tpl',
        dest: './test/fixture/browser',
        paths: [{
          path: './test/fixture/controllers/api_v1',
          url_prefix: '/api/v1'
        }, {
          path: './test/fixture/controllers/api_v2'
        }, {
          path: './test/fixture/controllers/pages',
          url_prefix: '',
          add_namespace: false
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-http-server');
  grunt.task.loadTasks('./tasks');

  grunt.registerTask('default', ['browser', 'http-server:dev']);
  grunt.registerTask('browser', ['mixdown-router']);
};
