import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

enum GenerationStrategy {
    JS = "js",
    TS = "ts"
}

    /**
    * Generates all the files replacing all the SKELETON matches. 
    * @param name File name
    * @param content File content
    */
export interface FileSkeleton {
    name: string
    content?: string
}

    /**
    * Generates all the files replacing all the SKELETON matches. 
    * @param name Folder name
    * @param files Folder files to generate
    * @param subfolders Subfolders to generate
    */
export interface FolderSkeleton {
    name: string
    files?: FileSkeleton[]
    subfolders?: FolderSkeleton[]
}

export default class Skeleton {

    static generationStrategy: GenerationStrategy = GenerationStrategy.JS
    static tempExtention: string = "skltmp"
    static fileExtention: string = "skl"
    static rootFolderPath = ""

    bone: string = ""
    Bone: string = ""
    fileName: string = ""
    filePath: string = ""
    params: any = {}

    constructor(bone: string, fileName: string, filePath: string, folderPath: string, params: string = "{}") {
        const folderName = path.basename(folderPath);
        this.bone = bone
        this.Bone = this.bone.charAt(0).toUpperCase() + this.bone.slice(1)
        this.fileName = fileName.replace("SKELETON", this.Bone).replace(`.${Skeleton.tempExtention}.${Skeleton.generationStrategy}`, '');
        this.filePath = filePath.replace("SKELETON", `${this.bone}`).replace(folderName, `dist_${folderName}`)
        this.params = JSON.parse(params)
    }

    generate = (generateCallbackfn: (
        bone?: string,
        Bone?: string,
        fileName?: string,
        filePath?: string,
        params?: any,
    ) => string): void => {
        this._generate(generateCallbackfn(this.bone, this.Bone, this.fileName, this.filePath, this.params))
    }

    private _generate = (body: string): void => {
        console.error(`\t-> Generating "${this.fileName}" at "${this.filePath}"`)
        fs.mkdirSync(this.filePath, { recursive: true });
        fs.writeFileSync(path.join(this.filePath, this.fileName), body);
    }

    /**
    * Generates all the files replacing all the SKELETON matches. 
    * @param rootFolderPath Path of the folder to be generated
    * @param bone Word that will replace all SKELETON matches
    * @param params Optional parameters that can be referenced inside .skl.js file
    */
    static generate = (rootFolderPath: string, bone: string, params: any = {}) => {
        Skeleton.rootFolderPath = rootFolderPath;
        Skeleton._generate(rootFolderPath, bone, JSON.stringify(params).replace(/"/g, '\\"'))
    }

    private static _generate = (rootFolderPath: string, bone: string, params: string) => {
        console.log(`Generating files for "${bone}" at "${rootFolderPath}"`)
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
                        if (filePath.endsWith("skl.js")) {
                            let header = "";
                            let executer = "";
                            if (Skeleton.generationStrategy === GenerationStrategy.TS) {
                                header = Skeleton.headerTS;
                                executer = "ts-node";
                            } else {
                                header = Skeleton.headerJS;
                                executer = "node";
                            }
                            const tempFileName = filePath.replace(".skl.js", `.${Skeleton.tempExtention}.${Skeleton.generationStrategy}`);
                            fs.writeFileSync(tempFileName, `${header}${fs.readFileSync(filePath, 'utf8')}${Skeleton.footer}`);
                            const output = execSync(`${executer} ${tempFileName} ${bone} ${Skeleton.rootFolderPath} ${params} `, { encoding: 'utf-8' });
                            fs.unlinkSync(tempFileName);
                            console.log(output);
                        }
                    }
                    else
                        Skeleton._generate(filePath, bone, params);
                });
            });
        });
    }

    private static headerTS: string =
        `import * as path from "path";
import Skeleton from "skeleton-code-generator";

const s = new Skeleton(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3]);
s.generate(
`

    private static headerJS: string = `"use strict";
exports.__esModule = true;
var path = require("path");
var skeleton_code_generator_1 = require("skeleton-code-generator");
var s = new skeleton_code_generator_1(process.argv[2], path.basename(__filename), path.dirname(__filename), process.argv[3]);
s.generate(
    `

    private static footer: string = `)`

    /**
    * Generates all the files replacing all the SKELETON matches. 
    * @param rootFolderPath Path of the folder to be generated
    * @param folderSkeleton Folder structure and files to generate
    */
    static generateFolderSkeleton = (rootFolderPath: string, folderSkeleton: FolderSkeleton) => {
        console.log(`\n✨ Generating files in : "${rootFolderPath}" \n`)
        Skeleton._generateFolderSkeleton(rootFolderPath, folderSkeleton, 0, false)
    }

    static _generateFolderSkeleton = (rootFolderPath: string, folderSkeleton: FolderSkeleton, tabLevel: number, isLastFolder: boolean) => {
        const { name, files, subfolders: folders } = folderSkeleton
        const folderPath = path.join(rootFolderPath, folderSkeleton.name);

        let prePrintFolder = ""
        if (tabLevel !== 0) {
            if (files) {
                if (files.length === 0)
                    prePrintFolder = isLastFolder ? " └─" : " ├─"
                else
                    prePrintFolder = " ├─"
            }
        }

        console.log(`${prePrintFolder}📂 ${name}`)
        tabLevel++
        fs.mkdirSync(folderPath, { recursive: true });
        if (folders) {
            folders.forEach((folder, index) => {
                Skeleton._generateFolderSkeleton(folderPath, folder, tabLevel, index === folders.length - 1)
            })
        }
        if (files) {
            files.forEach((file, index) => {
                console.log(`${" │ ".repeat(tabLevel - 1)} ${index === files.length - 1 ? "└" : "├"}─📄 ${file.name}`)
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
                                 
