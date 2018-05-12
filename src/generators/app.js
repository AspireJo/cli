import inquirer from 'inquirer';

export default async (name)=> {
  const questions = [
    {
      type: 'list',
      name: 'template',
      message: 'Choose your template',
      choices: [
        new inquirer.Separator('NodeJs'),
        {
          name: 'ES2015',
          checked: true
        },
        {
          name: 'ES6'
        }
      ]
    }
  ];

  const answers = await inquirer.prompt(questions);

  console.log(answers);

}