import { join } from 'path';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';

export interface TemplateContext {
  filename: string;
  content: string;
}

export class Templater {
  private template: HandlebarsTemplateDelegate;

  constructor(templatePath?: string) {
    const templateFile = this.getTemplate(templatePath);
    this.template = compile(templateFile);
  }

  create(context: TemplateContext): string {
    context.content += "Hugo";
    return this.template(context);
  }

  private getTemplate(path?: string): string {
    if (!path) {
      path = join(__dirname, '..', 'assets/template.html');
    }

    const file = readFileSync(path);
    return file.toString();
  }
}
