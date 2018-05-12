#!/usr/bin/env node
import program from "commander";
import generators from "./src/generators";

const p = require('./../package.json');

program
  .version(p.version, '-v, --version')
  .description(`\x1b[32m
      ASPIRE
    \x1b[0m
  ${p.description}`)
  .usage('<cmd> [options]');

program
  .command('new <name>')
  .alias('n')
  .option('-c, --config <config>', 'predefined structure')
  .description('create new project')
  .action((name, options) => generators.app(name, options))


program
  .command('setup [env]')
  .description('run setup commands for all envs')
  .option("-s, --setup_mode [mode]", "Which setup mode to use")
  .action(function (env, options) {
    var mode = options.setup_mode || "normal";
    env = env || 'all';
    console.log('setup for %s env(s) with %s mode', env, mode);
  });


program.parse(process.argv);

// no command ==> print help info
if (process.argv.length === 2) program.outputHelp();
