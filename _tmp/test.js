const injector = require('./index.js');


let actual = injector('test/_files/index.html', {
    isPath: true,
    basePath: __dirname + '/test/_files',
});

console.log(actual);