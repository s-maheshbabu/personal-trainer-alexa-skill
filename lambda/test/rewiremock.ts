import rewiremock, { addPlugin, plugins } from 'rewiremock';
addPlugin(plugins.nodejs);

rewiremock.overrideEntryPoint(module); // this is important. This command is "transfering" this module parent to rewiremock
export { rewiremock }