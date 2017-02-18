Critical Injector
===

Injects CSS or JS files contents into HTML file in marked places.

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

An example of this in completed form can be seen below:

```html
<html>
<head>
    <!-- injector:css -->
    <link rel="stylesheet" href="file1.css">
    <link rel="stylesheet" href="file2.css">
    <!-- endinjector -->
</head>
<body>
    <!-- injector:js -->
    <script src="file1.js"></script>
    <script src="file2.js"></script>
    <!-- endinjector -->
</body>
</html>
```

The resulting HTML would be:

```html
<html>
<head>
    <style>/* Merged contents of all CSS files */</style>
</head>
<body>
    <script>/* Merged contents of all JS files */</script>
</body>
</html>
```

## API

### criticalInjector(src, options, callback)

### src

Type: `String`  
Default: `none`

File pathname or HTML content.

### Options

#### options.basePath

Type: `String`
Default: `none`  

Extracted pathnames from [src] or [href] attributes will be appended to basePath.

#### options.isPath

Type: `Boolean`
Default: `true`  

Specify if first argument is a pathname or HTML content.
