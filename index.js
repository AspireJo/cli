#!/usr/bin/env node
import program from "commander";
import generators from "./src/generators";

const p = require('./../package.json');

program
  .version(p.version,  '-v, --version')
  .usage('[options')
  //.option('n new <name>','create new project',/^\w$/i)
  .description(p.description);

program
  .command('new <name>')
  .alias('n')
  .description('create new project')
  .action(name => generators.app(name))

program.parse(process.argv);