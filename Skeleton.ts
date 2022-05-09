import * as path from "path";
import * as fs from "fs";
import * as readline from "readline";
import { execSync } from "child_process";

interface IPaths {
  bonesPath: string;
  distPath: string;
}

class SkeletonGenerator_Tools {
  static getTempFileContent(filePath: string): string {
    let fileText = fs.readFileSync(filePath, "utf8");
    while (fileText.slice(-1) !== "`") {
      fileText = fileText.substring(0, fileText.length - 1);
      if (fileText.length == 0) {
        console.log(`Error reading file: ${filePath}`);
        return "";
      }
    }
    if (fileText.endsWith("`")) {
      fileText.replace("// eslint-disable-next-line no-unused-expressions", "");
      fileText.replace("/* eslint-disable no-unused-expressions */", "");
      return `${SkeletonGenerator.HEADER}${fileText}${SkeletonGenerator.FOOTER}`;
    } else {
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
      SkeletonGenerator.bonesPath,
      relativePath,
      boneFileName
    );

    const tempFilePath = path.join(
      SkeletonGenerator.bonesPath,
      relativePath,
      boneFileName.replace(
        SkeletonGenerator.SKL_EXTENTION,
        SkeletonGenerator.TEMP_EXTENTION
      )
    );

    const generatedFilePath = path
      .join(
        SkeletonGenerator.distPath,
        relativePath,
        boneFileName.replace(SkeletonGenerator.TEMP_EXTENTION, "")
      )
      .replace(/SKELETON/g, boneWord);
    return { boneFilePath, tempFilePath, generatedFilePath };
  };
  static replaceFilePrompt = (
    fileName: string,
    functionToExecute: () => void
  ): boolean => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let answer = SkeletonGenerator_Tools.replaceFilePromptLoop(
      rl,
      fileName,
      functionToExecute
    );
    return answer;
  };

  static replaceFilePromptLoop(
    rl: readline.Interface,
    fileName: string,
    functionToExecute: () => void
  ) {
    let answer = false;
    rl.question(
      `"${fileName}" already exists. Do you want to replace it? [Y/N] `,
      (answerText) => {
        answerText = answerText.toLowerCase();
        let answerFormat =
          answerText === "y" ||
          answerText === "yes" ||
          answerText === "n" ||
          answerText === "no";
        if (answerFormat) {
          answer = answerText === "y" || answerText === "yes";
          if (answer) functionToExecute();
          return rl.close();
        } else {
          answer = SkeletonGenerator_Tools.replaceFilePromptLoop(
            rl,
            fileName,
            functionToExecute
          );
        }
      }
    );
    return answer;
  }
}

class SkeletonGenerator {
  static SPARKS_ICON = "✨";
  static DIST_WORD: string = "dist_";
  static SKL_EXTENTION: string = "skl.js";
  static TEMP_EXTENTION: string = "skltmp.js";

  static bonesPath: string = "";
  static distPath: string = "";
  static params: any = {};

  static forOneBoneWord(boneWord: string) {
    console.log(
      `\n${SkeletonGenerator.SPARKS_ICON} Generating files for "${boneWord}" at "${SkeletonGenerator.distPath}"\n`
    );
    SkeletonGenerator.folderIterator(SkeletonGenerator.bonesPath, boneWord);
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
          SkeletonGenerator.bonesPath,
          relativePath,
          fileOrFolderName
        );
        fs.stat(fileOrFolderPath, (error, fileOrFolder) => {
          if (error) {
            console.error("Error stating file.", error);
            return;
          }
          if (fileOrFolder.isFile()) {
            if (fileOrFolderName.endsWith(SkeletonGenerator.SKL_EXTENTION)) {
              SkeletonGenerator.fileGenerator(
                relativePath,
                fileOrFolderName,
                boneWord
              );
            }
          } else {
            SkeletonGenerator.folderIterator(
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
      SkeletonGenerator_Tools.getFilesPaths(
        relativePath,
        boneFileName,
        boneWord
      );

    const tempFileContent =
      SkeletonGenerator_Tools.getTempFileContent(boneFilePath);

    const params = {
      ...SkeletonGenerator.params,
      bone: boneWord,
      Bone: boneWord.charAt(0).toUpperCase() + boneWord.slice(1),
      boneFilePath: path.dirname(boneFilePath),
      boneFileName: path.basename(boneFilePath),
      tempFilePath: path.dirname(tempFilePath),
      tempFileName: path.basename(tempFilePath),
      generatedFilePath: path.dirname(generatedFilePath),
      generatedFileName: path
        .basename(generatedFilePath)
        .replace(`.${SkeletonGenerator.SKL_EXTENTION}`, ""),
      extension: path
        .basename(generatedFilePath)
        .replace(`.${SkeletonGenerator.SKL_EXTENTION}`, "")
        .split(".")
        .pop(),
    };

    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error(`Error deleting file: ${tempFileContent}, : ${err}`);
      }
    }

    const finalGeneratedFile = generatedFilePath.replace(
      `.${SkeletonGenerator.SKL_EXTENTION}`,
      ""
    );
    if (fs.existsSync(finalGeneratedFile)) {
      SkeletonGenerator_Tools.replaceFilePrompt(
        path.basename(finalGeneratedFile),
        () => {
          SkeletonGenerator.generateTempFileAndRun(
            tempFilePath,
            tempFileContent,
            params
          );
        }
      );
    } else
      SkeletonGenerator.generateTempFileAndRun(
        tempFilePath,
        tempFileContent,
        params
      );
  };

  static generateTempFileAndRun(
    tempFilePath: string,
    tempFileContent: string,
    params: any
  ) {
    fs.writeFileSync(tempFilePath, tempFileContent);

    const command = `node "${tempFilePath}" ${SkeletonGenerator_Tools.stringfyParams(
      params
    )}`;

    const output = execSync(command, { encoding: "utf-8" });
    fs.unlinkSync(tempFilePath);
    console.log(output);
  }

  static forRootFile(boneWord: string | string[], paths: string | IPaths) {
    let rootFilePath = "";
    if (typeof paths === "string") {
      rootFilePath = paths;
      SkeletonGenerator.bonesPath = path.dirname(paths);
      SkeletonGenerator.distPath = path.dirname(paths);
    } else {
      rootFilePath = paths.bonesPath;
      SkeletonGenerator.bonesPath = path.dirname(paths.bonesPath);
      SkeletonGenerator.distPath = paths.distPath;
    }
    if (typeof boneWord === "string") {
      SkeletonGenerator.fileGenerator(
        "",
        path.basename(rootFilePath),
        boneWord
      );
    } else {
      boneWord.forEach((bone) =>
        SkeletonGenerator.fileGenerator("", path.basename(rootFilePath), bone)
      );
    }
  }

  static HEADER: string = `"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var params = JSON.parse(process.argv[2].replace(/\"/g, '"'));
const folderIcon = "📂";
const fileIcon = "📄";
const getFileContent = `;

  static FOOTER: string = `
const fileContent = getFileContent(params);
fs.mkdirSync(params.generatedFilePath, { recursive: true });
fs.writeFileSync(
  path.join(params.generatedFilePath, params.generatedFileName),
  fileContent
);
console.log(\`\t \${folderIcon} \${params.generatedFilePath}\n\t  └─\${fileIcon} \${params.generatedFileName}\`);
`;
}

export default class Skeleton {
  public static generate = (
    paths: string | IPaths,
    boneWord: string | string[],
    params: any = {}
  ) => {
    SkeletonGenerator.params = params;
    if (typeof paths === "string") {
      if (paths.endsWith(SkeletonGenerator.SKL_EXTENTION)) {
        SkeletonGenerator.forRootFile(boneWord, paths);
        return;
      } else {
        SkeletonGenerator.bonesPath = paths;
        SkeletonGenerator.distPath = path.join(
          path.dirname(paths),
          `${SkeletonGenerator.DIST_WORD}${path.basename(paths)}`
        );
      }
    } else {
      if (paths.bonesPath.endsWith(SkeletonGenerator.SKL_EXTENTION)) {
        SkeletonGenerator.forRootFile(boneWord, paths);
        return;
      } else {
        SkeletonGenerator.bonesPath = paths.bonesPath;
        SkeletonGenerator.distPath = paths.distPath;
      }
    }
    if (typeof boneWord === "string")
      SkeletonGenerator.forOneBoneWord(boneWord);
    else boneWord.forEach((bone) => SkeletonGenerator.forOneBoneWord(bone));
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
