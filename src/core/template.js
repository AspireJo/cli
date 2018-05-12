import { template } from 'lodash';
import { readFileSync, outputFile, copy, lstatSync } from 'fs-extra';
import glob from 'glob-promise';
import { each } from 'bluebird';

export default class Template {
    static copyFile(templatePath, destinationPath, tokens) {
        console.log('tokens', tokens);
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
                    console.log(filename);
                    const destinationFilePath = filename.replace(templatePath, destinationPath);
                    return Template.copyFile(filename, destinationFilePath, tokens);
                })
            })
    }
}