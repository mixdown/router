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

    }
  });

  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('default', ['http-server:dev']);
};