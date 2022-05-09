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
</p>

<p>
  <a href="https://github.com/JulianDM1995" target="_blank">
    <img alt="Version" src="https://github.com/JulianDM1995/Skeleton-npm-package/blob/main/design.svg">
  </a>
</p>

## Installation

```bash
$ npm install skeleton-code-generator -D
```
or
```bash
$ yarn add skeleton-code-generator -D
```

## generate

- Generates all the files, folders and subfolders defined at **bonesPath**. If **bonesPath** is a string, a new folder named "**dist_FOLDERNAME**" will be created at the same height of "**FOLDERNAME**". If **bonesPath** is an object **{bonesPath: "..." , distPath: "..."}** all the files in **bonesPath** will be generated in **distPath**
- The word **SKELETON** in folders and files names will be replaced by **bone** parameter.
- Files inside **bonesPath** that match the extension **\*SKL.JS** will be generated, replacing the content inside.
- All generated files will preserve the original structure.


| Parameter | Type | Description |
| --------------- | --------------- | --------------- |
| bonesPath | string or {bonesPath: string , distPath: string} | Path of folder to be generated and dist folder |
| bone | string | Word that will replace SKELETON matches |
| params | any | Optional parameters that can be referenced inside .skl.js files |

## Implementation Example:
```js
var path = require("path");
var Skeleton = require("skeleton-code-generator");

//You can use this, if you want to generate files at dist_FOLDERNAME
const bonesPath = path.join(__dirname, "bonesFolder");
Skeleton.generate(bonesPath, boneWord);

//You can use this if you want to specify the dist path.
const sklPaths = {
  bonesPath: path.join(__dirname, "bonesFolder"), //This can be the path for a folder with Skeleton structure, or a skl.js file
  distPath: path.join(__dirname, "generatedFolder"),
};
//Skeleton.generate(sklPaths, boneWord);

//Add this parameter if you want to reference any extra param in the skl.js file. 
const extraParams = {signature: "YourName", date: "01/01/2023"}
//Skeleton.generate(sklPaths, boneWord, extraParams);
```

## .skl.js file example
```js
({ Bone }) => `
import { Router } from "express";

import {
  create${Bone},
  read${Bone},
  delete${Bone},
  update${Bone},
} from "../../../controllers/${Bone}";

export const ${Bone}Routes = {
  create${Bone}: "/create${Bone}",
  read${Bone}: "/read${Bone}",
  update${Bone}: "/update${Bone}",
  delete${Bone}: "/delete${Bone}",
};

const router: Router = Router();

router.post(${Bone}Routes.create${Bone}, create${Bone});
router.get(${Bone}Routes.read${Bone}+"/:id", read${Bone});
router.put(${Bone}Routes.update${Bone}+"/:id", update${Bone});
router.delete(${Bone}Routes.delete${Bone}+"/:id", delete${Bone});

export default router;
`;

```

"Bone" is not the only parameter you can reference. By default you can use the following ones:
| Parameter | Description |
| --------------- | --------------- |
| bone | Word that will replace SKELETON matches |
| Bone | Word that will replace SKELETON matches with first letter in Uppercase |
| boneFilePath | bone file path |
| boneFileName | bone file name |
| tempFilePath | temp bone file path |
| tempFileName | temp bone file name |
| generatedFilePath | generated file path |
| generatedFileName | generated file name |
| extension | generated file extension |

**You can also use ANY parameter defined in "params".**