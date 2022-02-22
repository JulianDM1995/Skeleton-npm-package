import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export class Skeleton {

    bone: string = ""
    Bone: string = ""
    fileName: string = ""
    filePath: string = ""
    params: any = {}

    constructor(bone: string, fileName: string, filePath: string, folderPath: string, params: string = "{}") {
        const folderName = path.basename(folderPath);
        this.bone = bone
        this.Bone = this.bone.charAt(0).toUpperCase() + this.bone.slice(1)
        this.fileName = fileName.replace("SKELETON", this.Bone).replace(/.skltmp.ts/ig, '');
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
        console.error(`Generating "${this.fileName}" at "${this.filePath}"`)
        fs.mkdirSync(this.filePath, { recursive: true });
        fs.writeFileSync(path.join(this.filePath, this.fileName), body);
    }

    static rootFolderPath = ""
    static generate = (rootFolderPath: string, meet: string, params: any = {}) => {
        Skeleton.rootFolderPath = rootFolderPath;
        Skeleton._generate(rootFolderPath, meet, JSON.stringify(params).replace(/"/g, '\\"'))
    }

    private static _generate = (rootFolderPath: string, meet: string, params: string) => {
        fs.readdir(rootFolderPath, (err, files) => {
            if (err) {
                console.error("Could not list the directory.", err);
                process.exit(1);
            }

            files.forEach(function (file, index) {
                var filePath = path.join(rootFolderPath, file);

                fs.stat(filePath, function (error, stat) {

                    if (error) {
                        console.error("Error stating file.", error);
                        return;
                    }

                    if (stat.isFile()) {
                        if (filePath.endsWith("skl.js")) {
                            const tempFileName = filePath.replace(".skl.js", ".skltmp.ts")
                            fs.writeFileSync(tempFileName, `${Skeleton.headerTS}${fs.readFileSync(filePath, 'utf8')}${Skeleton.footer}`);
                            const output = execSync(`ts-node ${tempFileName} ${meet} ${Skeleton.rootFolderPath} ${params} `, { encoding: 'utf-8' });
                            fs.unlinkSync(tempFileName)
                            console.log(output)
                        }
                    }
                    else
                        Skeleton._generate(filePath, meet, params);
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
    var skeleton = require("skeleton-code-generator");
    var s = new skeleton.Skeleton(process.argv[2], path["default"].basename(__filename), path["default"].dirname(__filename), process.argv[3]);
    s.generate(
    `

    private static footer: string = `)`

}

export default Skeleton