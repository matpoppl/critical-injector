const fs = require('fs');
const nodePath = require('path');

const BLOCK_START = '<!-- injector';
const BLOCK_END = '<!-- endinjector -->';
const PATH_REGEXP = /(src|href)\="?([^" >]+)"?/gi;

/**
 * @var {Object}
 */
const DEFAULTS = {
  basePath: '.',
  isPath: true,
};

// Infinite loop prevention. Max number of blocks or files in block
const HARD_LIMIT = 100;

/**
 *
 *
 * @param {String} input Pathname to HTML content
 * @param {Object} options @see DEFAULTS
 */
function Injector(input, options) {

  const opts = Object.assign(DEFAULTS, !options ? {} : options);
  let newContent = (opts.isPath) ? fs.readFileSync(input, 'utf8') : input;

  for (let block of Injector.extractBlocks(newContent)) {
    newContent = newContent.replace(
      block,
      Injector.finishBlock(
        block,
        Injector.processBlock(opts.basePath, block)
      )
    );
  }

  return newContent;
}

/**
 * Find pathnames in [src] or [href] attributes.
 *
 * @param {String} contents
 * @return {Array.<String>}
 */
Injector.extractPaths = function*(contents) {

  const regexp = new RegExp(PATH_REGEXP);
  let match;

  for (let i = 0; i < HARD_LIMIT && (match = regexp.exec(contents)); i++) {
    yield match[2];
  }
};

/**
 * Find blocks in contents.
 *
 * @param {String} contents
 * @return {Array.<String>}
 */
Injector.extractBlocks = function*(contents) {

  for (let i = 0, globalOffset = 0, startIndex, endIndex;
    i < HARD_LIMIT
    && -1 < (startIndex = contents.indexOf(BLOCK_START, globalOffset));
    i++) {

    endIndex = contents.indexOf(BLOCK_END, startIndex);

    yield contents.substring(startIndex, endIndex + BLOCK_END.length);

    globalOffset = endIndex + BLOCK_END.length;
  }
};

/**
 * Read & merge detected file contents.
 *
 * @param {String} basePath
 * @param {String} block
 * @returns {String} Concatenated files contents
 */
Injector.processBlock = function(basePath, block) {

  var newBlock = '';
  var filepath;

  for (let extractedPath of Injector.extractPaths(block)) {

    filepath = nodePath.join(basePath, extractedPath);

    newBlock += fs.readFileSync(filepath, 'utf8');
  }

  return newBlock;
};

/**
 * Wrap mewBlock in proper tag based on block header with attributes.
 *
 * @param {String} oldBlock
 * @param {String} newBlock
 * @returns {String}
 */
Injector.finishBlock = function(oldBlock, newBlock) {

  let tag = '';
  let attrs = '';

  if (oldBlock.indexOf(':css') > -1) {
    tag = 'style';
  } else if (oldBlock.indexOf(':js')) {
    tag = 'script';
  }

  // First space after start block <!-- injector:foo| xxx -->
  let startIndex = oldBlock.indexOf(' ', BLOCK_START.length);
  let endIndex = oldBlock.indexOf('-->', startIndex);

  // Attributes exists
  if (endIndex - startIndex > 1) {
    attrs = ' ' + oldBlock.substring(startIndex, endIndex).trim();
  }

  return `<${tag}${attrs}>${newBlock}</${tag}>`;
};

module.exports = Injector;
