Critical Injector
===

Injects CSS or JS files contents into HTML file in marked places.
Actual detection of critical path CSS should be done by other means. On small pages it can me done manually.

You can keep Your code in separate files, process them by other packages (compile, minify) and finally inject their source.

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
    <link rel="stylesheet" href="page-critical-1.css">
    <link rel="stylesheet" href="page-critical-2.css">
    <!-- endinjector -->

    <link rel="preload" href="page-1.css" as="style" onload="this.rel='stylesheet'">
</head>
<body>
    <!-- injector:js -->
    <script src="page-critical-1.js"></script>
    <script src="page-critical-2.js"></script>
    <!-- endinjector -->

    <script src="page-1.js" defer></script>
</body>
</html>
```

The resulting HTML would be:

```html
<html>
<head>
    <style>/* Merged contents of all CSS files */</style>

    <link rel="preload" href="page-1.css" as="style" onload="this.rel='stylesheet'">
</head>
<body>
    <script>/* Merged contents of all JS files */</script>

    <script src="page-1.js" defer></script>
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
