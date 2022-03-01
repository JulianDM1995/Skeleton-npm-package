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
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
var oo_ascii_tree_1 = require("oo-ascii-tree");
var GenerationStrategy;
(function (GenerationStrategy) {
    GenerationStrategy["JS"] = "js";
    GenerationStrategy["TS"] = "ts";
})(GenerationStrategy || (GenerationStrategy = {}));
var Skeleton = /** @class */ (function () {
    function Skeleton(bone, fileName, filePath, folderPath, params) {
        var _this = this;
        this.fileName = "";
        this.filePath = "";
        this.params = {};
        this.generateFromFolder = function (generateCallbackfn) {
            _this._generateFromFolder(generateCallbackfn(_this.params));
        };
        this._generateFromFolder = function (body) {
            console.log("\t " + Skeleton.folderIcon + " " + _this.filePath + "\n\t  \u2514\u2500" + Skeleton.fileIcon + " " + _this.fileName);
            fs.mkdirSync(_this.filePath, { recursive: true });
            fs.writeFileSync(path.join(_this.filePath, _this.fileName), body);
        };
        var folderName = path.basename(folderPath);
        var Bone = bone.charAt(0).toUpperCase() + bone.slice(1);
        this.fileName = fileName.replace("SKELETON", Bone).replace("." + Skeleton.tempExtention + "." + Skeleton.generationStrategy, '');
        this.filePath = filePath.replace("SKELETON", "" + bone).replace(folderName, "dist_" + folderName);
        this.params = JSON.parse(params);
        var _fileName = this.fileName.split(".");
        var extension = _fileName.pop();
        this.params = __assign(__assign({}, this.params), { bone: bone, Bone: Bone, fileName: _fileName.join(""), fileExtension: extension, filePath: this.filePath });
    }
    var _a;
    _a = Skeleton;
    Skeleton.generationStrategy = GenerationStrategy.JS;
    Skeleton.tempExtention = "skltmp";
    Skeleton.fileExtention = "skl";
    Skeleton.folderPath = "";
    /**
    * Generates all the files, folders and subfolders defined at "folderPath".
    * The word SKELETON in folder and file names will be replaced by "bone" parameter.
    * Files inside "folderPath" that matchs the extension *skl.js will be generated, replacing the content inside.
    * A new folder named "dist_FOLDERNAME" will be created at the same height of "FOLDERNAME".
    * All generated files will be inside "dist_FOLDERNAME" folder, preserving the original structure.
    * @param folderPath Path of the root folder to be generated.
    * @param bone Word that will replace SKELETON matches.
    * @param params Optional parameters that can be referenced inside .skl.js files.
    */
    Skeleton.generateFromFolder = function (folderPath, bone, params) {
        if (params === void 0) { params = {}; }
        console.log("\n" + Skeleton.sparklesIcon + " Generating files for \"" + bone + "\" at \"" + folderPath + "\"\n");
        Skeleton.folderPath = folderPath;
        Skeleton._generateFromFolder(folderPath, bone, JSON.stringify(params).replace(/"/g, '\\"'));
    };
    Skeleton._generateFromFolder = function (rootFolderPath, bone, params) {
        fs.readdir(rootFolderPath, function (err, files) {
            if (err) {
                console.error("Could not list the directory.", err);
                process.exit(1);
            }
            files.forEach(function (file) {
                var filePath = path.join(rootFolderPath, file);
                fs.stat(filePath, function (error, stat) {
                    if (error) {
                        console.error("Error stating file.", error);
                        return;
                    }
                    if (stat.isFile()) {
                        if (filePath.endsWith(Skeleton.fileExtention + ".js")) {
                            var header = "";
                            var executer = "";
                            if (Skeleton.generationStrategy === GenerationStrategy.TS) {
                                header = Skeleton.headerTS;
                                executer = "ts-node";
                            }
                            else {
                                header = Skeleton.headerJS;
                                executer = "node";
                            }
                            var tempFileName = filePath.replace("." + Skeleton.fileExtention + ".js", "." + Skeleton.tempExtention + "." + Skeleton.generationStrategy);
                            fs.writeFileSync(tempFileName, "" + header + fs.readFileSync(filePath, 'utf8') + Skeleton.footer);
                            var command = executer + " " + tempFileName + " " + bone + " " + Skeleton.folderPath + " " + params + " ";
                            var output = (0, child_process_1.execSync)(command, { encoding: 'utf-8' });
                            fs.unlinkSync(tempFileName);
                            console.log(output);
                        }
                    }
                    else
                        Skeleton._generateFromFolder(filePath, bone, params);
                });
            });
        });
    };
    Skeleton.headerTS = "import * as path from \"path\";\nimport Skeleton from \"skeleton-code-generator\";\nconst s = new Skeleton(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3], process.argv[4]);\ns.generateFromFolder(\n";
    Skeleton.headerJS = "\"use strict\";\nexports.__esModule = true;\nvar path = require(\"path\");\nvar skeleton_code_generator_1 = require(\"skeleton-code-generator\");\nvar s = new skeleton_code_generator_1(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3], process.argv[4]);\ns.generateFromFolder(\n    ";
    Skeleton.footer = ")";
    /**
    * Generates all the files, folders and subfolders defined at "folderJSON" object inside "generationPath" folder.
    * @param generationPath Path of the folder to be generated.
    * @param folderJSON Folder, subfolders and files to generate.
    */
    Skeleton.sparklesIcon = "✨";
    Skeleton.generateFromJSON = function (generationPath, folderJSON) {
        console.log("\n" + Skeleton.sparklesIcon + " Generating files in : \"" + generationPath + "\" \n");
        Skeleton.tree = Skeleton._generateFromJSON(generationPath, folderJSON);
        Skeleton.tree.printTree();
        console.log("\n");
    };
    Skeleton.folderIcon = "📂";
    Skeleton.fileIcon = "📄";
    Skeleton._generateFromJSON = function (rootFolderPath, folderSkeleton) {
        var name = folderSkeleton.name, files = folderSkeleton.files, folders = folderSkeleton.subfolders;
        var folderPath = path.join(rootFolderPath, name);
        var tree = new oo_ascii_tree_1.AsciiTree(_a.folderIcon + " " + folderSkeleton.name);
        fs.mkdirSync(folderPath, { recursive: true });
        if (folders) {
            folders.forEach(function (folder) {
                tree.add(Skeleton._generateFromJSON(folderPath, folder));
            });
        }
        if (files) {
            files.forEach(function (file) {
                if (file.name.startsWith("/") || file.name.startsWith("\\"))
                    file.name = file.name.slice(1);
                file.name = file.name.replace("/", "\\");
                if (file.name.split("\\").length > 1) {
                    var folder = Skeleton.generateSubfolderSkeleton(file);
                    tree.add(Skeleton._generateFromJSON(folderPath, folder));
                }
                else {
                    tree.add(new oo_ascii_tree_1.AsciiTree(_a.fileIcon + " " + file.name));
                    fs.writeFileSync(path.join(folderPath, file.name), file.content || "No content");
                }
            });
        }
        return tree;
    };
    Skeleton.generateSubfolderSkeleton = function (file) {
        var names = file.name.split("\\");
        var fileName = names.pop() || "";
        var folderName = path.join.apply(path, names);
        var fileFolder = {
            name: folderName,
            files: [{
                    name: fileName,
                    content: file.content
                }]
        };
        while (fileFolder.name.split("\\").length > 1) {
            var folderNames = fileFolder.name.split("\\");
            var subfolderName = folderNames.pop() || "";
            var folderName_1 = path.join.apply(path, folderNames);
            fileFolder = {
                name: folderName_1,
                subfolders: [{
                        name: subfolderName,
                        files: fileFolder.files,
                        subfolders: fileFolder.subfolders
                    }]
            };
        }
        return fileFolder;
    };
    return Skeleton;
}());
module.exports = Skeleton;
// Created by:
//
//         ___       _ _     _
//        |_  |     | (_)   |/
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
// 23/02/22
