import { glob } from 'glob';
import { copyFile, readFile, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { Templater } from './templater';
import { Parser } from './parser';

export interface GeneratorConfig {
  input: string;
  exclude: string;
  output: string;
  highlight: boolean;
  inline: boolean;
  template?: string;
}

export class Generator {
  private templater: Templater;
  private parser: Parser;

  constructor(private config: GeneratorConfig) {
    this.templater = new Templater(config.template);
    this.parser = new Parser(config);
  }

  public async generate(): Promise<void> {
    const filenames = glob.sync(this.config.input, { ignore: this.config.exclude });

    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      await this.process(filename);
    }
  }

  private async process(markdownFilePath: string): Promise<void> {
    const outputFilepath = this.getOutputFilePath(this.config.output, markdownFilePath);
    const parseResult = await this.parser.parse(markdownFilePath);
    const contentHtml = parseResult.html;
    const filename = basename(markdownFilePath).replace('.md', '');
    const html = this.templater.create({ content: contentHtml, filename: filename });
    
    await writeFile(outputFilepath, html);

    const filedirectory = dirname(markdownFilePath);
    const fixedImages = parseResult.referencedImages.map(imagePath => join(filedirectory, imagePath));
    await this.copyImages(fixedImages, this.config.output);
  }

  private getOutputFilePath(outputRoot: string, originalPath: string): string {
    const markdownFilename = basename(originalPath);
    const markdownRelativeDirectory = dirname(originalPath);

    let htmlFilename = markdownFilename.replace('.md', '.html');
    if (markdownFilename.toLowerCase() === 'readme.md') {
      htmlFilename = 'index.html';
    }

    const outputDirectory = join(outputRoot, markdownRelativeDirectory);
    if (!existsSync(outputDirectory)) {
      mkdirSync(outputDirectory, { recursive: true });
    }

    const outputFilepath = join(outputDirectory, htmlFilename);
    return outputFilepath;
  }

  private async copyImages(paths: string[], outputDirectory: string) {
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!existsSync(path)) {
        console.warn(`Cannot copy image: '${path}' - file not found`);
        continue;
      }

      const targetPath = join(outputDirectory, path);

      if (!existsSync(targetPath)) {
        await copyFile(path, targetPath);
      }
    }
  }
}
