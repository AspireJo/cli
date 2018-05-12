import { template } from 'lodash';
import { readFileSync, outputFile, copy, lstatSync } from 'fs-extra';
import glob from 'glob-promise';
import { each } from 'bluebird';

export default class Template {
  static copyFile(templatePath, destinationPath, tokens) {
    if (tokens) {
      let fileContent = readFileSync(templatePath).toString();
      for (let prop in tokens) {
        const regex = new RegExp(`<%- ${prop} %>`, 'g');
        fileContent = fileContent.replace(regex, tokens[prop]);
      }
      return outputFile(destinationPath, fileContent);
    }
    else return copy(templatePath, destinationPath);
  }

  static copyFolder(templatePath, destinationPath, tokens) {
    const templatePathFilter = templatePath + '/**/*.*';
    return glob(templatePathFilter, { dot: true })
      .then(filesname => {
        return each(filesname, filename => {
          const destinationFilePath = filename.replace(templatePath, destinationPath);
          console.log(`\x1B[33mprocessing\x1B[0m ${destinationFilePath}`);
          return Template.copyFile(filename, destinationFilePath, tokens);
        })
      })
  }
}