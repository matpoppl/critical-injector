const injector = require('../');
const fs = require('fs');
const assert = require('assert');

describe('critical-injector', function() {

  describe('extractPaths', function() {
    [{
      block: '<link href="dir1/file1.css" /><link href="dir2/file2.css" />',
      expected: ['dir1/file1.css', 'dir2/file2.css',],
    }, {
      block: '<script src="dir3/file3.js"><script src="dir4/file4.js">',
      expected: ['dir3/file3.js', 'dir4/file4.js',],
    },].forEach(row => {
      it('Extract paths from src or href attributes', function() {

        let paths = [];

        for (let path of injector.extractPaths(row.block)) {
          paths.push(path);
        }

        assert.deepEqual(paths, row.expected);
      });
    });
  });

  describe('extractBlocks', function() {
    it('Extract blocks from content', function() {

      const content = 'a<!-- injector -->b<!-- endinjector -->'
        + 'c<!-- injector -->d<!-- endinjector -->e';
      let blocks = [];

      for (let path of injector.extractBlocks(content)) {
        blocks.push(path);
      }

      assert.deepEqual(
        blocks,
        [
          '<!-- injector -->b<!-- endinjector -->',
          '<!-- injector -->d<!-- endinjector -->',
        ]
      );
    });
  });

  describe('finishBlock', function() {

    [{
      args: ['<!-- inject:css -->', 'a',],
      expected: '<style>a</style>',
    }, {
      args: ['<!-- inject:js -->', 'b',],
      expected: '<script>b</script>',
    },].forEach(row => {
      it('Wrap content in proper tag based on inject header', function() {

        assert.equal(
          injector.finishBlock.apply(null, row.args),
          row.expected
        );
      });
    });
  });

  describe('processBlock', function() {

    [{
      block: 'src="test.css"',
      dirname: __dirname + '/_files',
    }, {
      block: 'src="/test.css"',
      dirname: __dirname + '/_files',
    }, {
      block: 'src="/test/_files/test.css"',
      dirname: __dirname + '/..',
    },].forEach(row => {
      it('Read & inject file contents', function() {

        assert.equal(
          injector.processBlock(row.dirname, row.block),
          'html { top: 1; }'
        );
      });
    });
  });

  describe('main', function() {
    it('Module test', function() {

      let actual = injector('test/_files/index.html', {
        isPath: true,
        basePath: 'test/_files',
      });

      assert.equal(
        actual.replace(/\s+/g, ''),
        fs.readFileSync(
          'test/_files/expected.html',
          'utf8'
        ).replace(/\s+/g, '')
      );
    });
  });
});
