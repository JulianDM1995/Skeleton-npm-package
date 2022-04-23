import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

interface IPaths {
  bonesPath: string;
  distPath: string;
}

class GenerateFromFolder_Tools {
  static getTempFileContent(filePath: string): string {
    let fileText = fs.readFileSync(filePath, "utf8");
    while (fileText.slice(-1) !== "`") {
      fileText = fileText.substring(0, fileText.length - 1);
    }
    if (fileText.endsWith("`"))
      return `${GenerateFromFolder.HEADER}${fileText}${GenerateFromFolder.FOOTER}`;
    else {
      console.log(`Error reading file: ${filePath}`);
      return "";
    }
  }
  static stringfyParams(params: any) {
    return `\"${JSON.stringify(params).replace(/"/g, '\\"')}\"`;
  }
  static getFilesPaths = (
    relativePath: string,
    boneFileName: string,
    boneWord: string
  ) => {
    const boneFilePath = path.join(
      GenerateFromFolder.bonesPath,
      relativePath,
      boneFileName
    );

    const tempFilePath = path.join(
      GenerateFromFolder.bonesPath,
      relativePath,
      boneFileName.replace(
        GenerateFromFolder.SKL_EXTENTION,
        GenerateFromFolder.TEMP_EXTENTION
      )
    );

    const generatedFilePath = path
      .join(
        GenerateFromFolder.distPath,
        relativePath,
        boneFileName.replace(GenerateFromFolder.TEMP_EXTENTION, "")
      )
      .replace(/SKELETON/g, boneWord);
    return { boneFilePath, tempFilePath, generatedFilePath };
  };
}

class GenerateFromFolder {
  static SPARKS_ICON = "✨";
  static DIST_WORD: string = "dist_";
  static SKL_EXTENTION: string = "skl.js";
  static TEMP_EXTENTION: string = "skltmp.js";

  static bonesPath: string = "";
  static distPath: string = "";
  static params: any = {};

  static forOneBoneWord(boneWord: string) {
    console.log(
      `\n${GenerateFromFolder.SPARKS_ICON} Generating files for "${boneWord}" at "${GenerateFromFolder.distPath}"\n`
    );
    GenerateFromFolder.folderIterator(GenerateFromFolder.bonesPath, boneWord);
  }

  static folderIterator = (
    rootPath: string,
    boneWord: string,
    relativePath: string = ""
  ) => {
    fs.readdir(rootPath, (err, filesAndFolders) => {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }
      filesAndFolders.forEach((fileOrFolderName) => {
        const fileOrFolderPath = path.join(
          GenerateFromFolder.bonesPath,
          relativePath,
          fileOrFolderName
        );
        fs.stat(fileOrFolderPath, (error, fileOrFolder) => {
          if (error) {
            console.error("Error stating file.", error);
            return;
          }
          if (fileOrFolder.isFile()) {
            GenerateFromFolder.fileGenerator(
              relativePath,
              fileOrFolderName,
              boneWord
            );
          } else {
            GenerateFromFolder.folderIterator(
              fileOrFolderPath,
              boneWord,
              path.join(relativePath, fileOrFolderName)
            );
          }
        });
      });
    });
  };

  static fileGenerator = (
    relativePath: string,
    boneFileName: string,
    boneWord: string
  ) => {
    const { boneFilePath, tempFilePath, generatedFilePath } =
      GenerateFromFolder_Tools.getFilesPaths(
        relativePath,
        boneFileName,
        boneWord
      );

    const tempFileContent =
      GenerateFromFolder_Tools.getTempFileContent(boneFilePath);

    const params = {
      ...GenerateFromFolder.params,
      bone: boneWord,
      Bone: boneWord.charAt(0).toUpperCase() + boneWord.slice(1),
      boneFilePath: path.dirname(boneFilePath),
      boneFileName: path.basename(boneFilePath),
      tempFilePath: path.dirname(tempFilePath),
      tempFileName: path.basename(tempFilePath),
      generatedFilePath: path.dirname(generatedFilePath),
      generatedFileName: path
        .basename(generatedFilePath)
        .replace(`.${GenerateFromFolder.SKL_EXTENTION}`, ""),
      extension: path
        .basename(generatedFilePath)
        .replace(`.${GenerateFromFolder.SKL_EXTENTION}`, "")
        .split(".")
        .pop(),
    };

    fs.writeFileSync(tempFilePath, tempFileContent);

    const command = `node "${tempFilePath}" ${GenerateFromFolder_Tools.stringfyParams(
      params
    )}`;
    
    const output = execSync(command, { encoding: "utf-8" });
    fs.unlinkSync(tempFilePath);
    console.log(output);
  };

  static HEADER: string = `"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var params = JSON.parse(process.argv[2].replace(/\\"/g, '"'));
const folderIcon = "📂";
const fileIcon = "📄";
const getFileContent =
    `;

  static FOOTER: string = `;
const fileContent = getFileContent(params);
fs.mkdirSync(params.generatedFilePath, { recursive: true });
fs.writeFileSync(path.join(params.generatedFilePath, params.generatedFileName), fileContent);
console.log(
    \`\t \${folderIcon} \${params.generatedFilePath}\n\t  └─\${fileIcon} \${params.generatedFileName}\`
  );
`;
}

export default class Skeleton {
  public static generateFromFolder = (
    paths: string | IPaths,
    boneWord: string | string[],
    params: any = {}
  ) => {
    GenerateFromFolder.params = params;
    if (typeof paths === "string") {
      GenerateFromFolder.bonesPath = paths;
      GenerateFromFolder.distPath = path.join(
        path.dirname(paths),
        `${GenerateFromFolder.DIST_WORD}${path.basename(paths)}`
      );
    } else {
      GenerateFromFolder.bonesPath = paths.bonesPath;
      GenerateFromFolder.distPath = paths.distPath;
    }
    if (typeof boneWord === "string")
      GenerateFromFolder.forOneBoneWord(boneWord);
    else boneWord.forEach((bone) => GenerateFromFolder.forOneBoneWord(bone));
  };
}

//module.exports = Skeleton;
// Created by:
//
//       _____       _ _     _
//      |___  |     | (_)   |/
//          | |_   _| |_  __ _ _ __
//          | | | | | | |/ _` | '_ \
//      /\__/ / |_| | | | (_| | | | |
//      \____/ \__,_|_|_|\__,_|_| |_|
//
//
//      ___  ___         _ _
//      |  \/  |        | (_)
//      | .  . | ___  __| |_ _ __   __ _
//      | |\/| |/ _ \/ _` | | '_ \ / _` |
//      | |  | |  __/ (_| | | | | | (_| |
//      \_|  |_/\___|\__,_|_|_| |_|\__,_|
//
//
// JulianDM1995@gmail.com
// 1.0:  23/02/22
// 1.1:  23/04/22
