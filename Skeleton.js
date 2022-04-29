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
var child_process_1 = require("child_process");
var GenerateFromFolder_Tools = /** @class */ (function () {
    function GenerateFromFolder_Tools() {
    }
    GenerateFromFolder_Tools.getTempFileContent = function (filePath) {
        var fileText = fs.readFileSync(filePath, "utf8");
        while (fileText.slice(-1) !== "`") {
            fileText = fileText.substring(0, fileText.length - 1);
        }
        if (fileText.endsWith("`")) {
            fileText.replace("// eslint-disable-next-line no-unused-expressions", "");
            fileText.replace("/* eslint-disable no-unused-expressions */", "");
            return "".concat(GenerateFromFolder.HEADER).concat(fileText).concat(GenerateFromFolder.FOOTER);
        }
        else {
            console.log("Error reading file: ".concat(filePath));
            return "";
        }
    };
    GenerateFromFolder_Tools.stringfyParams = function (params) {
        return "\"".concat(JSON.stringify(params).replace(/"/g, '\\"'), "\"");
    };
    GenerateFromFolder_Tools.getFilesPaths = function (relativePath, boneFileName, boneWord) {
        var boneFilePath = path.join(GenerateFromFolder.bonesPath, relativePath, boneFileName);
        var tempFilePath = path.join(GenerateFromFolder.bonesPath, relativePath, boneFileName.replace(GenerateFromFolder.SKL_EXTENTION, GenerateFromFolder.TEMP_EXTENTION));
        var generatedFilePath = path
            .join(GenerateFromFolder.distPath, relativePath, boneFileName.replace(GenerateFromFolder.TEMP_EXTENTION, ""))
            .replace(/SKELETON/g, boneWord);
        return { boneFilePath: boneFilePath, tempFilePath: tempFilePath, generatedFilePath: generatedFilePath };
    };
    return GenerateFromFolder_Tools;
}());
var GenerateFromFolder = /** @class */ (function () {
    function GenerateFromFolder() {
    }
    GenerateFromFolder.forOneBoneWord = function (boneWord) {
        console.log("\n".concat(GenerateFromFolder.SPARKS_ICON, " Generating files for \"").concat(boneWord, "\" at \"").concat(GenerateFromFolder.distPath, "\"\n"));
        GenerateFromFolder.folderIterator(GenerateFromFolder.bonesPath, boneWord);
    };
    GenerateFromFolder.SPARKS_ICON = "✨";
    GenerateFromFolder.DIST_WORD = "dist_";
    GenerateFromFolder.SKL_EXTENTION = "skl.js";
    GenerateFromFolder.TEMP_EXTENTION = "skltmp.js";
    GenerateFromFolder.bonesPath = "";
    GenerateFromFolder.distPath = "";
    GenerateFromFolder.params = {};
    GenerateFromFolder.folderIterator = function (rootPath, boneWord, relativePath) {
        if (relativePath === void 0) { relativePath = ""; }
        fs.readdir(rootPath, function (err, filesAndFolders) {
            if (err) {
                console.error("Could not list the directory.", err);
                process.exit(1);
            }
            filesAndFolders.forEach(function (fileOrFolderName) {
                var fileOrFolderPath = path.join(GenerateFromFolder.bonesPath, relativePath, fileOrFolderName);
                fs.stat(fileOrFolderPath, function (error, fileOrFolder) {
                    if (error) {
                        console.error("Error stating file.", error);
                        return;
                    }
                    if (fileOrFolder.isFile()) {
                        if (fileOrFolderName.endsWith(GenerateFromFolder.SKL_EXTENTION)) {
                            GenerateFromFolder.fileGenerator(relativePath, fileOrFolderName, boneWord);
                        }
                    }
                    else {
                        GenerateFromFolder.folderIterator(fileOrFolderPath, boneWord, path.join(relativePath, fileOrFolderName));
                    }
                });
            });
        });
    };
    GenerateFromFolder.fileGenerator = function (relativePath, boneFileName, boneWord) {
        var _a = GenerateFromFolder_Tools.getFilesPaths(relativePath, boneFileName, boneWord), boneFilePath = _a.boneFilePath, tempFilePath = _a.tempFilePath, generatedFilePath = _a.generatedFilePath;
        var tempFileContent = GenerateFromFolder_Tools.getTempFileContent(boneFilePath);
        var params = __assign(__assign({}, GenerateFromFolder.params), { bone: boneWord, Bone: boneWord.charAt(0).toUpperCase() + boneWord.slice(1), boneFilePath: path.dirname(boneFilePath), boneFileName: path.basename(boneFilePath), tempFilePath: path.dirname(tempFilePath), tempFileName: path.basename(tempFilePath), generatedFilePath: path.dirname(generatedFilePath), generatedFileName: path
                .basename(generatedFilePath)
                .replace(".".concat(GenerateFromFolder.SKL_EXTENTION), ""), extension: path
                .basename(generatedFilePath)
                .replace(".".concat(GenerateFromFolder.SKL_EXTENTION), "")
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
        fs.writeFileSync(tempFilePath, tempFileContent);
        var command = "node \"".concat(tempFilePath, "\" ").concat(GenerateFromFolder_Tools.stringfyParams(params));
        var output = (0, child_process_1.execSync)(command, { encoding: "utf-8" });
        fs.unlinkSync(tempFilePath);
        console.log(output);
    };
    GenerateFromFolder.HEADER = "\"use strict\";\nexports.__esModule = true;\nvar fs = require(\"fs\");\nvar path = require(\"path\");\nvar params = JSON.parse(process.argv[2].replace(/\"/g, '\"'));\nconst folderIcon = \"\uD83D\uDCC2\";\nconst fileIcon = \"\uD83D\uDCC4\";\nconst getFileContent = ";
    GenerateFromFolder.FOOTER = "\nconst fileContent = getFileContent(params);\nfs.mkdirSync(params.generatedFilePath, { recursive: true });\nfs.writeFileSync(\n  path.join(params.generatedFilePath, params.generatedFileName),\n  fileContent\n);\nconsole.log(`\t ${folderIcon} ${params.generatedFilePath}\n\t  \u2514\u2500${fileIcon} ${params.generatedFileName}`);\n";
    return GenerateFromFolder;
}());
var Skeleton = /** @class */ (function () {
    function Skeleton() {
    }
    Skeleton.generateFromFolder = function (paths, boneWord, params) {
        if (params === void 0) { params = {}; }
        GenerateFromFolder.params = params;
        if (typeof paths === "string") {
            GenerateFromFolder.bonesPath = paths;
            GenerateFromFolder.distPath = path.join(path.dirname(paths), "".concat(GenerateFromFolder.DIST_WORD).concat(path.basename(paths)));
        }
        else {
            GenerateFromFolder.bonesPath = paths.bonesPath;
            GenerateFromFolder.distPath = paths.distPath;
        }
        if (typeof boneWord === "string")
            GenerateFromFolder.forOneBoneWord(boneWord);
        else
            boneWord.forEach(function (bone) { return GenerateFromFolder.forOneBoneWord(bone); });
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
