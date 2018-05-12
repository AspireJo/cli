import inquirer from 'inquirer';
import _ from 'lodash';
import { NewApp } from '../models/newApp';

export default async (name, options = {}) => {
  const app = new NewApp();
  if (options && options.config) {
    app.name = options.config;
  }
  else {
    const questions = [
      {
        type: 'list',
        name: 'template',
        message: 'Application template: (NodeJs/ES2015)',
        choices: [
          new inquirer.Separator('NodeJs'),
          {
            name: 'ES2015',
            checked: true
          },
          {
            name: 'ES6'
          },
        ]
      },
      {
        type: 'input',
        name: 'desc',
        message: 'Application description:',
        validate: name => !_.isEmpty(name)
      }
    ];

    const answers = await inquirer.prompt(questions);

    app.name = name;
    app.description = answers.template;
    app.template = answers.desc;
  }
  await generate(app);
}

const generate = async (app) => {
  console.log(app);
}