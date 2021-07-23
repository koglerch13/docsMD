#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { existsSync, readFileSync } from 'fs';
import { Generator, GeneratorConfig } from './generator';

let yarg = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'The files to convert. Supports the glob pattern',
    default: '**/*.md'
  })
  .option('exclude', {
    alias: 'e',
    type: 'string',
    description: 'Ignores matching files from input. Supports the glob pattern.',
    default: 'node_modules/**'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'The directory where the generated HTML files will be placed.',
    default: './docs'
  })
  .option('highlight', {
    alias: 'h',
    type: 'boolean',
    description: 'Determines whether highlight.js will be applied to source code',
    default: true
  })
  .option('template', {
    alias: 't',
    type: 'string',
    description: 'Can be used to specify a template file. If none is specified the included default style will be used.'
  });



const CONFIG_FILE = 'docsmd.json';
if (existsSync(CONFIG_FILE)) {
  try {
    const configFile = readFileSync(CONFIG_FILE).toString();
    const config = JSON.parse(configFile) || {};
    yarg = yarg.config(config);
  }
  catch {
    console.warn('Unable to parse docsmd.json file.')
  }
}

const argv: any = yarg.argv;
const config: GeneratorConfig = {
  input: argv['input'],
  exclude: argv['exclude'],
  output: argv['output'],
  highlight: argv['highlight'],
  template: argv['template'],
};

const generator = new Generator(config);
generator.generate();
