import inquirer from 'inquirer';
import _ from 'lodash';
import path from 'path';

import { NewApp } from '../models/newApp';
import template from './../core/template';

export default async (name, options = {}) => {
  const app = new NewApp();
  if (options && options.config) app.name = options.config;
  else {
    const questions = [
      {
        type: 'list',
        name: 'template',
        message: 'template: (NodeJs/ES2015)',
        choices: [
          new inquirer.Separator('NodeJs'),
          {
            name: 'ES2015',
            checked: true
          }
        ]
      },
      {
        type: 'input',
        name: 'description',
        message: 'description:',
        validate: name => !_.isEmpty(name)
      },
      {
        type: 'input',
        name: 'version',
        message: 'version (1.0.0):',
        default: '1.0.0'
      },
      {
        type: 'input',
        name: 'url',
        message: 'base url:',
        validate: name => !_.isEmpty(name)
      },
      {
        type: 'input',
        name: 'host',
        message: 'host:',
        validate: name => !_.isEmpty(name)
      },
      {
        type: 'list',
        name: 'dbProvider',
        message: 'database provider:',
        choices: [
          {
            name: 'Oracle',
            checked: true
          }
        ]
      },
      {
        type: 'input',
        name: 'dbConnection',
        message: 'database connection:',
        validate: name => !_.isEmpty(name)
      },
      {
        type: 'input',
        name: 'dbUser',
        message: 'database uasername:',
        validate: name => !_.isEmpty(name)
      },
      {
        type: 'input',
        name: 'dbPassword',
        message: 'database password:',
        validate: name => !_.isEmpty(name)
      },
    ];

    const answers = await inquirer.prompt(questions);

    app.name = name;
    app.version = answers.version;
    app.template = answers.template;
    app.description = answers.description;
    app.baseUrl = answers.url;
    app.db = {
      provider: answers.dbProvider,
      connection: {
        host: answers.dbConnection,
        username: answers.dbUser,
        password: answers.dbPassword
      }
    };
    app.doc = {
      host : answers.host,
    }
  }
  await generate(app);
}

const generate = async (app) => {
  const tokens = {
    APP_NAME: app.name,
    APP_DESC: app.description,
    APP_VERSION: app.version,
    DB_USERNAME: app.db.connection.username,
    DB_PASSWORD: app.db.connection.password,
    DB_DATASOURCE: app.db.connection.host,
    DB_PROVIDER_LIB: app.db.provider === 'Oracle' ? '"oracledb": "^2.2.0",' : '',
    DOC_HOST : app.doc.host
  };
  await template.copyFolder(path.join(__dirname, `./../../../src/templates/app/${app.template}`),
    path.join(process.cwd(), `./${app.name}`),
    tokens);
}
