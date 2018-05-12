import { template } from 'lodash';
import { readFileSync, outputFile, copy } from 'fs-extra';
import glob from 'glob-promise';
import { each } from 'bluebird';

export default class Template {
    static copyFile(templatePath, destinationPath, tokens) {
        if (tokens) {
            const tpl = template(readFileSync(templatePath));
            return outputFile(destinationPath, tpl(tokens));
        }
        else {
            return copy(templatePath, destinationPath);
        }
    }

    static copyFolder(templatePath, destinationPath, tokens) {
        const templatePathFilter = templatePath + '/**/*.*';
        return glob(templatePathFilter).then(filesname => {
            return each(filesname, filename => {
                const destinationFilePath = filename.replace(templatePath, destinationPath);
                return Template.copyFile(filename, destinationFilePath, tokens);
            })
        })
    }
}