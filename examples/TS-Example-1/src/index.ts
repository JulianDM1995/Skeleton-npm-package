import * as path from "path";
import Skeleton from "skeleton-code-generator";

const folderToGenerate = path.join(__dirname, "generationExample");
const boneWord = "Dog"
const params = {
    extraParam1: "Cat",
    extraParam2: "Bird"
}

Skeleton.generateFromFolder(folderToGenerate, boneWord, params)