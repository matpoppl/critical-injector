<?php


function extractPaths($contents)
{
    $match = null;

    if (preg_match_all('/(src|href)\="?([^" >]+)"?/', $contents, $match) > 0)
        return $match[2];

    return [];
}


function extractBlocks(&$contents)
{
    $globalOffset = 0;

    for ($i = 0; false !== ($startIndex = strpos($contents, '<!-- inject', $globalOffset)) && $i < 10; $i++) {

        $endIndex = strpos($contents, '<!-- endinject -->', $startIndex) + strlen('<!-- endinject -->');

        yield substr($contents, $startIndex, $endIndex - $startIndex);

        $globalOffset = $endIndex;
    }
}

function injectCritical($contents)
{
    $globalOffset = 0;

    foreach (extractBlocks($contents) as $oldPart) {

        foreach(extractPaths($oldPart) as $path) {
            echo $path . "\n";
        }

    }


}

foreach (glob('sample/*.html') as $path) {

    injectCritical(file_get_contents($path));

}
