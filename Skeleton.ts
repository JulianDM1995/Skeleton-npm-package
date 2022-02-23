import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

enum GenerationStrategy {
    JS = "js",
    TS = "ts"
}

export default class Skeleton {

    static generationStrategy: GenerationStrategy = GenerationStrategy.JS
    static tempExtention: string = "skltmp"
    static fileExtention: string = "skl"
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

    static rootFolderPath = ""
    /**
    * Generates all the files replacing all the SKELETON matches. 
    * @param rootFolderPath Path of the folder that will be conver
    * @param bone Word that will replace all the SKELETON matches
    * @param params Optional parameters that can be referenced in the .skl.js file
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

}
