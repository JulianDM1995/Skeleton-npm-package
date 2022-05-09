"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var path = require("path");
var fs = require("fs");
var readline = require("readline");
var child_process_1 = require("child_process");
var SkeletonGenerator_Tools = /** @class */ (function () {
    function SkeletonGenerator_Tools() {
    }
    SkeletonGenerator_Tools.getTempFileContent = function (filePath) {
        var fileText = fs.readFileSync(filePath, "utf8");
        while (fileText.slice(-1) !== "`") {
            fileText = fileText.substring(0, fileText.length - 1);
            if (fileText.length == 0) {
                console.log("Error reading file: ".concat(filePath));
                return "";
            }
        }
        if (fileText.endsWith("`")) {
            fileText.replace("// eslint-disable-next-line no-unused-expressions", "");
            fileText.replace("/* eslint-disable no-unused-expressions */", "");
            return "".concat(SkeletonGenerator.HEADER).concat(fileText).concat(SkeletonGenerator.FOOTER);
        }
        else {
            console.log("Error reading file: ".concat(filePath));
            return "";
        }
    };
    SkeletonGenerator_Tools.stringfyParams = function (params) {
        return "\"".concat(JSON.stringify(params).replace(/"/g, '\\"'), "\"");
    };
    SkeletonGenerator_Tools.replaceFilePromptLoop = function (rl, fileName, functionToExecute) {
        var answer = false;
        rl.question("\"".concat(fileName, "\" already exists. Do you want to replace it? [Y/N] "), function (answerText) {
            answerText = answerText.toLowerCase();
            var answerFormat = answerText === "y" ||
                answerText === "yes" ||
                answerText === "n" ||
                answerText === "no";
            if (answerFormat) {
                answer = answerText === "y" || answerText === "yes";
                if (answer)
                    functionToExecute();
                return rl.close();
            }
            else {
                answer = SkeletonGenerator_Tools.replaceFilePromptLoop(rl, fileName, functionToExecute);
            }
        });
        return answer;
    };
    SkeletonGenerator_Tools.getFilesPaths = function (relativePath, boneFileName, boneWord) {
        var boneFilePath = path.join(SkeletonGenerator.bonesPath, relativePath, boneFileName);
        var tempFilePath = path.join(SkeletonGenerator.bonesPath, relativePath, boneFileName.replace(SkeletonGenerator.SKL_EXTENTION, SkeletonGenerator.TEMP_EXTENTION));
        var generatedFilePath = path
            .join(SkeletonGenerator.distPath, relativePath, boneFileName.replace(SkeletonGenerator.TEMP_EXTENTION, ""))
            .replace(/SKELETON/g, boneWord);
        return { boneFilePath: boneFilePath, tempFilePath: tempFilePath, generatedFilePath: generatedFilePath };
    };
    SkeletonGenerator_Tools.replaceFilePrompt = function (fileName, functionToExecute) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        var answer = SkeletonGenerator_Tools.replaceFilePromptLoop(rl, fileName, functionToExecute);
        return answer;
    };
    return SkeletonGenerator_Tools;
}());
var SkeletonGenerator = /** @class */ (function () {
    function SkeletonGenerator() {
    }
    SkeletonGenerator.forOneBoneWord = function (boneWord) {
        console.log("\n".concat(SkeletonGenerator.SPARKS_ICON, " Generating files for \"").concat(boneWord, "\" at \"").concat(SkeletonGenerator.distPath, "\"\n"));
        SkeletonGenerator.folderIterator(SkeletonGenerator.bonesPath, boneWord);
    };
    SkeletonGenerator.generateTempFileAndRun = function (tempFilePath, tempFileContent, params) {
        fs.writeFileSync(tempFilePath, tempFileContent);
        var command = "node \"".concat(tempFilePath, "\" ").concat(SkeletonGenerator_Tools.stringfyParams(params));
        var output = (0, child_process_1.execSync)(command, { encoding: "utf-8" });
        fs.unlinkSync(tempFilePath);
        console.log(output);
    };
    SkeletonGenerator.forRootFile = function (boneWord, paths) {
        var rootFilePath = "";
        if (typeof paths === "string") {
            rootFilePath = paths;
            SkeletonGenerator.bonesPath = path.dirname(paths);
            SkeletonGenerator.distPath = path.dirname(paths);
        }
        else {
            rootFilePath = paths.bonesPath;
            SkeletonGenerator.bonesPath = path.dirname(paths.bonesPath);
            SkeletonGenerator.distPath = paths.distPath;
        }
        if (typeof boneWord === "string") {
            SkeletonGenerator.fileGenerator("", path.basename(rootFilePath), boneWord);
        }
        else {
            boneWord.forEach(function (bone) {
                return SkeletonGenerator.fileGenerator("", path.basename(rootFilePath), bone);
            });
        }
    };
    SkeletonGenerator.SPARKS_ICON = "✨";
    SkeletonGenerator.DIST_WORD = "dist_";
    SkeletonGenerator.SKL_EXTENTION = "skl.js";
    SkeletonGenerator.TEMP_EXTENTION = "skltmp.js";
    SkeletonGenerator.bonesPath = "";
    SkeletonGenerator.distPath = "";
    SkeletonGenerator.params = {};
    SkeletonGenerator.folderIterator = function (rootPath, boneWord, relativePath) {
        if (relativePath === void 0) { relativePath = ""; }
        fs.readdir(rootPath, function (err, filesAndFolders) {
            if (err) {
                console.error("Could not list the directory.", err);
                process.exit(1);
            }
            filesAndFolders.forEach(function (fileOrFolderName) {
                var fileOrFolderPath = path.join(SkeletonGenerator.bonesPath, relativePath, fileOrFolderName);
                fs.stat(fileOrFolderPath, function (error, fileOrFolder) {
                    if (error) {
                        console.error("Error stating file.", error);
                        return;
                    }
                    if (fileOrFolder.isFile()) {
                        if (fileOrFolderName.endsWith(SkeletonGenerator.SKL_EXTENTION)) {
                            SkeletonGenerator.fileGenerator(relativePath, fileOrFolderName, boneWord);
                        }
                    }
                    else {
                        SkeletonGenerator.folderIterator(fileOrFolderPath, boneWord, path.join(relativePath, fileOrFolderName));
                    }
                });
            });
        });
    };
    SkeletonGenerator.fileGenerator = function (relativePath, boneFileName, boneWord) {
        var _a = SkeletonGenerator_Tools.getFilesPaths(relativePath, boneFileName, boneWord), boneFilePath = _a.boneFilePath, tempFilePath = _a.tempFilePath, generatedFilePath = _a.generatedFilePath;
        var tempFileContent = SkeletonGenerator_Tools.getTempFileContent(boneFilePath);
        var params = __assign(__assign({}, SkeletonGenerator.params), { bone: boneWord, Bone: boneWord.charAt(0).toUpperCase() + boneWord.slice(1), boneFilePath: path.dirname(boneFilePath), boneFileName: path.basename(boneFilePath), tempFilePath: path.dirname(tempFilePath), tempFileName: path.basename(tempFilePath), generatedFilePath: path.dirname(generatedFilePath), generatedFileName: path
                .basename(generatedFilePath)
                .replace(".".concat(SkeletonGenerator.SKL_EXTENTION), ""), extension: path
                .basename(generatedFilePath)
                .replace(".".concat(SkeletonGenerator.SKL_EXTENTION), "")
                .split(".")
                .pop() });
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (err) {
                console.error("Error deleting file: ".concat(tempFileContent, ", : ").concat(err));
            }
        }
        var finalGeneratedFile = generatedFilePath.replace(".".concat(SkeletonGenerator.SKL_EXTENTION), "");
        if (fs.existsSync(finalGeneratedFile)) {
            SkeletonGenerator_Tools.replaceFilePrompt(path.basename(finalGeneratedFile), function () {
                SkeletonGenerator.generateTempFileAndRun(tempFilePath, tempFileContent, params);
            });
        }
        else
            SkeletonGenerator.generateTempFileAndRun(tempFilePath, tempFileContent, params);
    };
    SkeletonGenerator.HEADER = "\"use strict\";\nexports.__esModule = true;\nvar fs = require(\"fs\");\nvar path = require(\"path\");\nvar params = JSON.parse(process.argv[2].replace(/\"/g, '\"'));\nconst folderIcon = \"\uD83D\uDCC2\";\nconst fileIcon = \"\uD83D\uDCC4\";\nconst getFileContent = ";
    SkeletonGenerator.FOOTER = "\nconst fileContent = getFileContent(params);\nfs.mkdirSync(params.generatedFilePath, { recursive: true });\nfs.writeFileSync(\n  path.join(params.generatedFilePath, params.generatedFileName),\n  fileContent\n);\nconsole.log(`\t ${folderIcon} ${params.generatedFilePath}\n\t  \u2514\u2500${fileIcon} ${params.generatedFileName}`);\n";
    return SkeletonGenerator;
}());
var Skeleton = /** @class */ (function () {
    function Skeleton() {
    }
    Skeleton.generate = function (paths, boneWord, params) {
        if (params === void 0) { params = {}; }
        SkeletonGenerator.params = params;
        if (typeof paths === "string") {
            if (paths.endsWith(SkeletonGenerator.SKL_EXTENTION)) {
                SkeletonGenerator.forRootFile(boneWord, paths);
                return;
            }
            else {
                SkeletonGenerator.bonesPath = paths;
                SkeletonGenerator.distPath = path.join(path.dirname(paths), "".concat(SkeletonGenerator.DIST_WORD).concat(path.basename(paths)));
            }
        }
        else {
            if (paths.bonesPath.endsWith(SkeletonGenerator.SKL_EXTENTION)) {
                SkeletonGenerator.forRootFile(boneWord, paths);
                return;
            }
            else {
                SkeletonGenerator.bonesPath = paths.bonesPath;
                SkeletonGenerator.distPath = paths.distPath;
            }
        }
        if (typeof boneWord === "string")
            SkeletonGenerator.forOneBoneWord(boneWord);
        else
            boneWord.forEach(function (bone) { return SkeletonGenerator.forOneBoneWord(bone); });
    };
    return Skeleton;
}());
module.exports = Skeleton;
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
