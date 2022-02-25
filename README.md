<p>
  <a href="https://www.npmjs.com/package/skeleton-code-generator" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/skeleton-code-generator.svg">
  </a>
  <a href="https://github.com/JulianDM1995/Skeleton-npm-package#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/JulianDM1995/Skeleton-npm-package/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/JulianDM1995/Skeleton-npm-package/blob/master/LICENSE" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/github/license/JulianDM1995/skeleton-code-generator" />
  </a>
</p>

<p>
  <a href="https://github.com/JulianDM1995" target="_blank">
    <img alt="Version" src="https://github.com/JulianDM1995/Skeleton-npm-package/blob/main/designs/design03.svg">
  </a>
</p>

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install skeleton-code-generator
```
## Module importation
### Javascript:
```js
//Importation
var Skeleton = require("skeleton-code-generator");

//Main methods:
Skeleton.generateFromFolder(folderToGenerate, boneWord, params)
Skeleton.generateFromJSON(folderToGenerate, folderSkeleton)
```
### Typescript:
```js
//Importation
import Skeleton, { FolderSkeleton } from "skeleton-code-generator";

//Main methods:
Skeleton.generateFromFolder(folderToGenerate, boneWord, params)
Skeleton.generateFromJSON(folderToGenerate, folderSkeleton)
```

## Main Methods
### generateFromFolder

- Generates all the files, folders and subfolders defined at "folderPath". 
- The word SKELETON in folder and file names will be replaced by "bone" parameter.
- Files inside "folderPath" that matchs the extension **\*SKL.JS** will be generated, replacing the content inside.
- A new folder named "**dist_FOLDERNAME**" will be created at the same height of "**FOLDERNAME**".
- All generated files will be inside "**dist_FOLDERNAME**" folder, preserving the original structure.

<p>
  <a href="https://github.com/JulianDM1995" target="_blank">
    <img alt="Version" src="https://github.com/JulianDM1995/Skeleton-npm-package/blob/main/designs/design02.svg">
  </a>
</p>

 | Parameter | Type | Description |
 | ------------ | ------------ |
 | folderPath | string | Path of the root folder to be generated |
 | bone | string | Word that will replace SKELETON matches |
 | params | any | Optional parameters that can be referenced inside .skl.js files. |

### generateFromJSON

<p>
  <a href="https://github.com/JulianDM1995" target="_blank">
    <img alt="Version" src="https://github.com/JulianDM1995/Skeleton-npm-package/blob/main/designs/design03.svg">
  </a>
</p>

Generates all the files, folders and subfolders defined at "folderJSON" object inside "generationPath" folder.

| Parameter | Type | Description |
| ------------ | ------------ |
| generationPath | string | Path of the folder to be generated |
| folderJSON | FolderSkeleton | Folder, subfolders and files to generate |