"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
var GenerationStrategy;
(function (GenerationStrategy) {
    GenerationStrategy["JS"] = "js";
    GenerationStrategy["TS"] = "ts";
})(GenerationStrategy || (GenerationStrategy = {}));
var Skeleton = /** @class */ (function () {
    function Skeleton(bone, fileName, filePath, folderPath, params) {
        var _this = this;
        if (params === void 0) { params = "{}"; }
        this.bone = "";
        this.Bone = "";
        this.fileName = "";
        this.filePath = "";
        this.params = {};
        this.generate = function (generateCallbackfn) {
            _this._generate(generateCallbackfn(_this.bone, _this.Bone, _this.fileName, _this.filePath, _this.params));
        };
        this._generate = function (body) {
            console.error("\t-> Generating \"" + _this.fileName + "\" at \"" + _this.filePath + "\"");
            fs.mkdirSync(_this.filePath, { recursive: true });
            fs.writeFileSync(path.join(_this.filePath, _this.fileName), body);
        };
        var folderName = path.basename(folderPath);
        this.bone = bone;
        this.Bone = this.bone.charAt(0).toUpperCase() + this.bone.slice(1);
        this.fileName = fileName.replace("SKELETON", this.Bone).replace("." + Skeleton.tempExtention + "." + Skeleton.generationStrategy, '');
        this.filePath = filePath.replace("SKELETON", "" + this.bone).replace(folderName, "dist_" + folderName);
        this.params = JSON.parse(params);
    }
    Skeleton.generationStrategy = GenerationStrategy.JS;
    Skeleton.tempExtention = "skltmp";
    Skeleton.fileExtention = "skl";
    Skeleton.rootFolderPath = "";
    /**
    * Generates all the files replacing all the SKELETON matches.
    * @param rootFolderPath Path of the folder to be generated
    * @param bone Word that will replace all SKELETON matches
    * @param params Optional parameters that can be referenced inside .skl.js file
    */
    Skeleton.generate = function (rootFolderPath, bone, params) {
        if (params === void 0) { params = {}; }
        Skeleton.rootFolderPath = rootFolderPath;
        Skeleton._generate(rootFolderPath, bone, JSON.stringify(params).replace(/"/g, '\\"'));
    };
    Skeleton._generate = function (rootFolderPath, bone, params) {
        console.log("Generating files for \"" + bone + "\" at \"" + rootFolderPath + "\"");
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
                        if (filePath.endsWith("skl.js")) {
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
                            var tempFileName = filePath.replace(".skl.js", "." + Skeleton.tempExtention + "." + Skeleton.generationStrategy);
                            fs.writeFileSync(tempFileName, "" + header + fs.readFileSync(filePath, 'utf8') + Skeleton.footer);
                            var output = (0, child_process_1.execSync)(executer + " " + tempFileName + " " + bone + " " + Skeleton.rootFolderPath + " " + params + " ", { encoding: 'utf-8' });
                            fs.unlinkSync(tempFileName);
                            console.log(output);
                        }
                    }
                    else
                        Skeleton._generate(filePath, bone, params);
                });
            });
        });
    };
    Skeleton.headerTS = "import * as path from \"path\";\nimport Skeleton from \"skeleton-code-generator\";\n\nconst s = new Skeleton(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3]);\ns.generate(\n";
    Skeleton.headerJS = "\"use strict\";\nexports.__esModule = true;\nvar path = require(\"path\");\nvar skeleton_code_generator_1 = require(\"skeleton-code-generator\");\nvar s = new skeleton_code_generator_1(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3]);\ns.generate(\n    ";
    Skeleton.footer = ")";
    /**
    * Generates all the files replacing all the SKELETON matches.
    * @param rootFolderPath Path of the folder to be generated
    * @param folderSkeleton Folder structure and files to generate
    */
    Skeleton.generateFolderSkeleton = function (rootFolderPath, folderSkeleton) {
        console.log("\n\u2728 Generating files in : \"" + rootFolderPath + "\" \n");
        Skeleton._generateFolderSkeleton(rootFolderPath, folderSkeleton, 0, false);
    };
    Skeleton._generateFolderSkeleton = function (rootFolderPath, folderSkeleton, tabLevel, isLastFolder) {
        var name = folderSkeleton.name, files = folderSkeleton.files, folders = folderSkeleton.subfolders;
        var folderPath = path.join(rootFolderPath, folderSkeleton.name);
        var prePrintFolder = "";
        if (tabLevel !== 0) {
            if (files) {
                if (files.length === 0)
                    prePrintFolder = isLastFolder ? " └─" : " ├─";
                else
                    prePrintFolder = " ├─";
            }
        }
        console.log(prePrintFolder + "\uD83D\uDCC2 " + name);
        tabLevel++;
        fs.mkdirSync(folderPath, { recursive: true });
        if (folders) {
            folders.forEach(function (folder, index) {
                Skeleton._generateFolderSkeleton(folderPath, folder, tabLevel, index === folders.length - 1);
            });
        }
        if (files) {
            files.forEach(function (file, index) {
                console.log(" │ ".repeat(tabLevel - 1) + " " + (index === files.length - 1 ? "└" : "├") + "\u2500\uD83D\uDCC4 " + file.name);
                fs.writeFileSync(path.join(folderPath, file.name), file.content || "No content");
            });
        }
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