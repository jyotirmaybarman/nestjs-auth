import * as fs from 'fs';
import { execSync } from 'child_process';

const args = process.argv;

if(args[2] == 'git-init'){
    if(fs.existsSync('.git')){
        execSync('rm -rf .git');
        execSync('git init --initial-branch=main')
    }
}


if (!fs.existsSync('node_modules')){
    execSync('npx npm-check-updates -u')
    execSync("echo \"# Enironment variables\n.env\n.env.*\" > .gitignore;")
}
if (!fs.existsSync('./.env')){
    execSync("echo \"\n\n# Enironment variables\n.env\n.env.*\" >> .gitignore;")
}
if (!fs.existsSync('./.env')){
    execSync("echo \"# Create environment variables\" > .env");
}
if(!fs.existsSync('./src/models')){
    execSync("mkdir ./src/models")
    execSync("echo \"here lives the models with modules, services & controllers\" > ./src/models/readme.md");
}
if(!fs.existsSync('./src/providers')){
    execSync("mkdir ./src/providers")
    execSync("echo \"here lives the different providers\" > ./src/providers/readme.md");
    execSync("mkdir ./src/providers/database")
    execSync("echo \"here lives the main database related stuff\" > ./src/providers/database/readme.md");
}
if(!fs.existsSync('./src/common')){
    execSync("mkdir ./src/common")
    execSync("echo \"here lives the global middleware, interceptors etc\" > ./src/common/readme.md");
}
if(!fs.existsSync('./src/utils')){
    execSync("mkdir ./src/utils")
    execSync("echo \"here we bring all the utilties as per our need\" > ./src/utils/readme.md");
}

