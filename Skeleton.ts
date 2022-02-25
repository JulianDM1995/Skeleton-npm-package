import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

enum GenerationStrategy {
    JS = "js",
    TS = "ts"
}

/**
* JSON definition of a text-based file. 
* @param name File name
* @param content File content
*/
export interface FileSkeleton {
    name: string
    content?: string
}

/**
* JSON definition of a folder file. 
* @param name Folder name
* @param files Folder files
* @param subfolders Subfolders
*/
export interface FolderSkeleton {
    name: string
    files?: FileSkeleton[]
    subfolders?: FolderSkeleton[]
}

export default class Skeleton {

    private static generationStrategy: GenerationStrategy = GenerationStrategy.TS
    private static tempExtention: string = "skltmp"
    private static fileExtention: string = "skl"
    private static folderPath = ""
    private fileName: string = ""
    private filePath: string = ""
    private params: any = {}

    constructor(bone: string, fileName: string, filePath: string, folderPath: string, params: string) {
        const folderName = path.basename(folderPath);

        let Bone = bone.charAt(0).toUpperCase() + bone.slice(1)
        this.fileName = fileName.replace("SKELETON", Bone).replace(`.${Skeleton.tempExtention}.${Skeleton.generationStrategy}`, '');
        this.filePath = filePath.replace("SKELETON", `${bone}`).replace(folderName, `dist_${folderName}`)
        this.params = JSON.parse(params)
        let _fileName = this.fileName.split(".")
        let extension = _fileName.pop();

        this.params = {
            ...this.params,
            bone,
            Bone,
            fileName: _fileName.join(""),
            fileExtension: extension,
            filePath: this.filePath,
        }
    }

    generateFromFolder = (generateCallbackfn: (
        params?: any,
    ) => string): void => {
        this._generateFromFolder(generateCallbackfn(this.params))
    }

    private _generateFromFolder = (body: string): void => {
        console.log(`\t ${Skeleton.folderIcon} ${this.filePath}\n\t  └─${Skeleton.fileIcon} ${this.fileName}`)
        fs.mkdirSync(this.filePath, { recursive: true });
        fs.writeFileSync(path.join(this.filePath, this.fileName), body);
    }

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
    static generateFromFolder = (folderPath: string, bone: string, params: any = {}) => {
        console.log(`\n${Skeleton.sparklesIcon} Generating files for "${bone}" at "${folderPath}"\n`)
        Skeleton.folderPath = folderPath;
        Skeleton._generateFromFolder(folderPath, bone, JSON.stringify(params).replace(/"/g, '\\"'))
    }

    private static _generateFromFolder = (rootFolderPath: string, bone: string, params: string) => {
        fs.readdir(rootFolderPath, (err, files) => {
            if (err) {
                console.error("Could not list the directory.", err);
                process.exit(1);
            }
            files.forEach(file => {
                var filePath = path.join(rootFolderPath, file);
                fs.stat(filePath, (error, stat) => {
                    if (error) {
                        console.error("Error stating file.", error);
                        return;
                    }
                    if (stat.isFile()) {
                        if (filePath.endsWith(`${Skeleton.fileExtention}.js`)) {
                            let header = "";
                            let executer = "";
                            if (Skeleton.generationStrategy === GenerationStrategy.TS) {
                                header = Skeleton.headerTS;
                                executer = "ts-node";
                            } else {
                                header = Skeleton.headerJS;
                                executer = "node";
                            }
                            const tempFileName = filePath.replace(`.${Skeleton.fileExtention}.js`, `.${Skeleton.tempExtention}.${Skeleton.generationStrategy}`);

                            fs.writeFileSync(tempFileName, `${header}${fs.readFileSync(filePath, 'utf8')}${Skeleton.footer}`);
                            const command = `${executer} ${tempFileName} ${bone} ${Skeleton.folderPath} ${params} `
                            const output = execSync(command, { encoding: 'utf-8' });
                            fs.unlinkSync(tempFileName);
                            console.log(output);
                        }
                    }
                    else
                        Skeleton._generateFromFolder(filePath, bone, params);
                });
            });
        });
    }

    private static headerTS: string =
        `import * as path from "path";
import Skeleton from "skeleton-code-generator";
const s = new Skeleton(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3], process.argv[4]);
s.generateFromFolder(
`

    private static headerJS: string = `"use strict";
exports.__esModule = true;
var path = require("path");
var skeleton_code_generator_1 = require("skeleton-code-generator");
var s = new skeleton_code_generator_1(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3], process.argv[4]);
s.generateFromFolder(
    `

    private static footer: string = `)`

    /**
    * Generates all the files, folders and subfolders defined at "folderJSON" object inside "generationPath" folder. 
    * @param generationPath Path of the folder to be generated.
    * @param folderJSON Folder, subfolders and files to generate.
    */
    private static sparklesIcon = "✨"
    static generateFromJSON = (generationPath: string, folderJSON: FolderSkeleton) => {
        console.log(generationPath)
        console.log(`\n${Skeleton.sparklesIcon} Generating files in : "${generationPath}" \n`)
        Skeleton._generateFromJSON(generationPath, folderJSON)
    }

    private static folderIcon = "📂"
    private static fileIcon = "📄"
    private static _generateFromJSON = (rootFolderPath: string, folderSkeleton: FolderSkeleton, x: number = 0) => {
        const { name, files, subfolders: folders } = folderSkeleton
        const folderPath = path.join(rootFolderPath, folderSkeleton.name);
        console.log(`${"   ".repeat(x)}${Skeleton.folderIcon} ${name}`)
        x++;
        fs.mkdirSync(folderPath, { recursive: true });
        if (folders) {
            folders.forEach((folder, index) => {
                Skeleton._generateFromJSON(folderPath, folder, x)
            })
        }
        if (files) {
            files.forEach((file, index) => {
                console.log(`${"   ".repeat(x)}${Skeleton.fileIcon} ${file.name}`)
                fs.writeFileSync(path.join(folderPath, file.name), file.content || "No content");
            })
        }
    }

}

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

