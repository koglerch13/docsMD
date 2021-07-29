import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import marked = require('marked');
import { dirname, join } from 'path';
const hljs = require('highlight.js'); // TODO convert to import somehow...

export interface ParserConfig {
  highlight: boolean;
  inline: boolean;
}

export interface ParserResult {
  referencedImages: string[],
  html: string
}

export class TokenReplacement {
  constructor(public tokenList: any[], public token: any, public relativePath: string, public filePathToInclude: string) {

  }
}


export class Parser {
  private defaultRenderer: marked.Renderer;

  constructor(private config: ParserConfig) {
    this.defaultRenderer = new marked.Renderer();
  }

  getReplacement(parentToken: any, parentList: any[], inputDirectory: string): TokenReplacement | null {

    if (parentToken.type == 'paragraph' && parentToken.tokens && parentToken.tokens.length > 0)
    {
      let token = parentToken.tokens[0];
      if (token.type == 'link')  {
        if (token.text == '#') {

          let includedFile = join(inputDirectory, token.href);
          if (existsSync(includedFile)) {
            return new TokenReplacement(parentList, parentToken, token.href, includedFile);
          }
        }
      }
    }
    
    return null;
  }

  async parse(markdownFilePath: string): Promise<ParserResult> {
    const referencedImages: string[] = [];

    const renderer = new marked.Renderer();
    renderer.link = (href: string | null, title: string | null, text: string): string => this.renderLink(href, title, text);
    renderer.image = (href: string | null, title: string | null, text: string): string => this.renderImage(href, title, text, referencedImages);

    const options: marked.MarkedOptions = {
      renderer: renderer
    };

    if (this.config.highlight) {
      options.highlight = (code, lang, callback) => this.highlight(code, lang, callback)
    }

    const tokens = await this.tokenize(markdownFilePath);
    const result = marked.parser(tokens, options);
    return { html: result, referencedImages: referencedImages };
  }


  joinUrls(base: string, second: string): string {
    if (this.isAbsoluteUrl(second))  {
      return second;
    }

    if (base.endsWith('/')) {
      return base + second;
    }

    return base + '/' + second;
  }

  fixLinksAndImagesForChildPage(tokenList: marked.TokensList, relativePathOfIncludedPage: string) {

    let relativeDir = dirname(relativePathOfIncludedPage);

    marked.walkTokens(tokenList, x => {
      if (x.type == 'link') {
          x.href = this.joinUrls(relativeDir, x.href);
      } 
      else if (x.type == 'image') {
          x.href = this.joinUrls(relativeDir, x.href);
      }
    })
  }
  
  async tokenize(markdownFilePath: string): Promise<marked.TokensList> {
    
    const markdown = (await readFile(markdownFilePath)).toString();
    const tokens = marked.lexer(markdown);
    

    // we perform the action at the lexer step because only here we can recursively iterate all children
    // in the parser step we already have finished html. This has 2 problems
    // 1.) we need to specify the exact order how to traverse all pages (which is quasi-impossible)
    // 2.) we would need parse the HTML again to fix links etc. 
    if (this.config.inline) {

      const inputFileDirectory = dirname(markdownFilePath);
      let replacements: TokenReplacement[] = [];

      for (let i = 0; i < tokens.length; i++) {
        let replacement = this.getReplacement(tokens[i], tokens, inputFileDirectory);
        replacement && replacements.push(replacement);
      }

      for (let replacement of replacements) {
        let idx = replacement.tokenList.indexOf(replacement.token);
        let innerResult = await this.tokenize(replacement.filePathToInclude);
        
        this.fixLinksAndImagesForChildPage(innerResult, replacement.relativePath);
        replacement.tokenList.splice(idx, 1);
        for (let childIdx = 0; childIdx < innerResult.length; childIdx++) {
          replacement.tokenList.splice(idx+childIdx, 0, innerResult[childIdx]);
        }
      }
    }

    return tokens;
  }

  private highlight(code: string, lang: string, callback?: (error: any | undefined, code?: string) => void) {
    if (!callback) {
      throw new Error('No callback provided');
    }

    if (!lang || !hljs.getLanguage(lang)) {
      callback(null, code);
      return;
    }

    try {
      const result = hljs.highlight(code, { language: lang });
      callback(null, result.value);
    } catch {
      callback(null, code);
      return;
    }
  }

  private renderLink(href: string | null, title: string | null, text: string): string {
    if (href && !this.isAbsoluteUrl(href) && href.endsWith('.md')) {
      if (href.toLowerCase().endsWith('readme.md')) {
        const withoutReadme = href.substr(0, href.length - 'readme.md'.length);
        href = withoutReadme + 'index.html';
      }
      else {
        const withoutFileEnding = href.substr(0, href.length - '.md'.length);
        href = withoutFileEnding + '.html';
      }
    }

    return this.defaultRenderer.link(href, title, text);
  }

  private renderImage(href: string | null, title: string | null, text: string, referencedImages: string[]): string {
    if (href && !this.isAbsoluteUrl(href)) {
      if (!referencedImages.find(x => x === href)) {
        referencedImages.push(href);
      }
    }

    return this.defaultRenderer.image(href, title, text);
  }

  private absoluteUrlRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
  private isAbsoluteUrl(url: string) {
    return this.absoluteUrlRegex.test(url);
  }
}
