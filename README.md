Critical Injector
===

## Usage

```js
const criticalInjector = require('critical-injector');

/**
 * @param {String} newContent 
 */
function onFinishCallback(newContent)
{
    // do something, save or pass
}

criticalInjector('src/file.html', {
    basePath: '../htdocs',
}, onFinishCallback);
```

## Description


