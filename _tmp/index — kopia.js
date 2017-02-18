const fs = require('fs');

const BLOCK_START = '<!-- injector',
    BLOCK_END = '<!-- endinjector -->',
	// Infinite loop prevention. Max number of blocks or files in block
    HARD_LIMIT = 100,
    PATH_REGEXP = /(src|href)\="?([^" >]+)"?/gi,
    DEFAULTS = {
        basePath: '.'
    };

/**
 * @param {String} input Path to HTML file
 * @param {Object} options
 * @param {Function} cb Call when done
 */
function Injector(input, options, cb) {

    function done(oldBlock, newBlock) {
        blocks--;

        newContent = newContent.replace(oldBlock, Injector.finishBlock(oldBlock, newBlock));

        if (blocks > 0) return;

        cb(newContent);
    }

    var blocks = 0, newContent = '';

	if (options.isPath) {
		fs.readFile(input, 'utf8', (err, data) => {
			if (err) throw err;

			newContent = data;

			for (let block of Injector.extractBlocks(data)) {

				blocks++;

				Injector.processBlock(options.basePath, block, done);
			}
		});
	} else {
		newContent = input;

		for (let block of Injector.extractBlocks(input)) {

			blocks++;

			Injector.processBlock(options.basePath, block, done);
		}
	}
}

/**
 * @param {String} contents
 * @return {Array.<String>}
 */
Injector.extractPaths = function* (contents) {
    let i, match, regexp = new RegExp(PATH_REGEXP);

    for (i = 0; i < HARD_LIMIT && (match = regexp.exec(contents)); i++) {
        yield match[2];
    }
};

/**
 * @param {String} contents
 * @return {Array.<String>}
 */
Injector.extractBlocks = function* (contents) {

    var i, globalOffset = 0, startIndex, endIndex;

    for (i = 0; i < HARD_LIMIT && -1 < (startIndex = contents.indexOf(BLOCK_START, globalOffset)); i++) {

        endIndex = contents.indexOf(BLOCK_END, startIndex);

        yield contents.substring(startIndex, endIndex + BLOCK_END.length);

        globalOffset = endIndex + BLOCK_END.length;
    }
};

/**
 * @param {String} basePath
 * @param {String} block
 * @param {Function} cb
 */
Injector.processBlock = function(basePath, block, cb) {

    var counter = 0, newBlock = '', filepath;

    for (let extractedPath of Injector.extractPaths(block)) {

        counter++;

        filepath = basePath.replace(/\/$/, '') + '/' + extractedPath.replace(/^\//, '');

        fs.readFile(filepath, 'utf8', (err, data) => {

            counter--;

            if (err) throw err;

            newBlock += data;

            if (counter > 0) return;

            cb(block, newBlock);
        });
    }
};

/**
 * @param {String} oldBlock
 * @param {String} newBlock
 * @returns {String}
 */
Injector.finishBlock = function(oldBlock, newBlock) {

    let tag = '';

    if (oldBlock.indexOf(':css') > -1) {
        tag = 'style';
    } else if (oldBlock.indexOf(':js')) {
        tag = 'script';
    }

    return '<' + tag + '>' + newBlock + '</' + tag + '>';
};

module.exports = Injector;