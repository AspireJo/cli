import program from "commander";
const p = require('./../package.json');

program
  .version(p.version)
  .description(p.description);


program
  .command('version')
  .alias('v')
  .description('CLI version')
  .action(() => console.log(version));
  

program.parse(process.argv);