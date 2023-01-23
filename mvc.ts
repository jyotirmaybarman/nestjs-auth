import { execSync } from 'child_process';


let values = getValue();
let cmd: string, empty = true;

if(values.module.value){
    cmd = `nest g module models/${values.module.forModel || values.module.value} ${values.module.withSpec ? '': '--no-spec'}`
    execSync(cmd)
    empty = false
}

if(values.controller.value){
    cmd = `nest g controller models/${values.controller.forModel || values.controller.value}/controllers/${values.controller.value}.v${values.controller.version} --flat ${values.controller.withSpec ? '': '--no-spec'}`
    execSync(cmd)
    empty = false
}

if(values.service.value){
    cmd = `nest g service models/${values.service.forModel || values.service.value}/services/${values.service.value}.v${values.service.version} --flat ${values.service.withSpec ? '': '--no-spec'}`
    execSync(cmd)
    empty = false
}

if(values.resource.value){
    let module = `nest g module models/${values.resource.forModel || values.resource.value} ${values.service.withSpec ? '': '--no-spec'}`
    let service  = `nest g service models/${values.resource.forModel || values.resource.value}/services/${values.resource.value}.v${values.resource.version} --flat ${values.resource.withSpec ? '': '--no-spec'}`
    let controller = `nest g controller models/${values.resource.forModel || values.resource.value}/controllers/${values.resource.value}.v${values.resource.version} --flat ${values.resource.withSpec ? '': '--no-spec'}`
    execSync(module)
    execSync(service)
    execSync(controller)
    cmd = module +'\n'+service +'\n'+controller
    empty = false
}


if(empty) console.error('No argument passed, make sure to pass "--" while running "npm run mvc"');
else console.log(cmd);




/** Function For Getting the arguments */

interface InnerValue { value: string; forModel: string; version: string, withSpec: boolean }
interface Value { controller: InnerValue; module: InnerValue; service: InnerValue, resource: InnerValue }
function getValue(): Value {

    const args = process.argv;
    let index: number, 
    forModel: string, 
    version: string = '1', 
    withSpec: boolean = false, 
    div = { value: null, forModel: null, version: '1', withSpec: false };
    const res: Value = {
        controller: div,
        module: div,
        service: div,
        resource: div,
    }
    
    index = args.indexOf('--for-model');
    if(index == -1) index = args.indexOf('-fm')
    if(index != -1) forModel = args[ index + 1 ];

    index = args.indexOf('--version');
    if(index == -1) index = args.indexOf('-v')
    if(index != -1) version = args[ index + 1 ];

    index = args.indexOf('--with-spec');
    if(index == -1) index = args.indexOf('-ws')
    if(index != -1) withSpec = true;
    

    index = args.indexOf('--resource')
    if(index == -1) index = args.indexOf('-r')
    if(index != -1) res.resource = {
        value: args[ index + 1 ],
        forModel,
        version,
        withSpec
    }

    index = args.indexOf('--controller')
    if(index == -1) index = args.indexOf('-c')
    if(index != -1) res.controller = {
        value: args[ index + 1 ],
        forModel,
        version,
        withSpec
    }

    index = args.indexOf('--module')
    if(index == -1) index = args.indexOf('-m')
    if(index != -1) res.module = {
        value: args[ index + 1 ],
        forModel,
        version,
        withSpec
    }

    index = args.indexOf('--service')
    if(index == -1) index = args.indexOf('-s')
    if(index != -1) res.service = {
        value: args[ index + 1 ],
        forModel,
        version,
        withSpec
    }

    return res
}