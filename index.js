#!/usr/bin/env node
import program from "commander";
import generators from "./src/generators";

const p = require('./../package.json');

program
  .version(p.version, '-v, --version')
  .description(`\x1b[34m
      ASPIRE CLI
    \x1b[0m
  ${p.description}`)
  .usage('<cmd> [options]');

program
  .command('new <name>')
  .alias('n')
  .option('-c, --config <config>', 'predefined structure')
  .description('create new project')
  .action((name, options) => generators.app(name, options))

program.on('command:*', function () {
  console.log(process.cwd())
  console.log('\x1b[31mInvalid command: %s\nSee --help for a list of available commands.\x1b[0m', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

// no command ==> print help info
if (process.argv.length === 2) program.outputHelp();
