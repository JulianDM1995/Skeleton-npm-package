
CHCP 65001
cls
@echo off
set NLM=^


set NL=^^^%NLM%%NLM%^%NLM%%NLM%

color 6
                                                   
echo %NL%%NL%1.Install Material Icon %NL%%NL%    https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme %NL%%NL%2. Add the following lines to settings.json
echo %NL%    "material-icon-theme.files.associations": {
echo        "*.SKL.js": "../../skl-icons/SKL",
echo        "*.SKLTMP.ts": "../../skl-icons/SKL-tmp",
echo        "Skeleton.ts": "../../skl-icons/SKL-classTS",
echo        "Skeleton.js": "../../skl-icons/SKL-classJS"
echo    }
echo    "material-icon-theme.folders.associations": {
echo        "codegenerator": "../../../../skl-icons/SKL-folder",
echo        "code_generator": "../../../../skl-icons/SKL-folder"
echo    }%NL%%NL% 

xcopy "./skl-icons" "%USERPROFILE%/.vscode/extensions/skl-icons" /E & code & code %appdata%/code/user/settings.json & pause