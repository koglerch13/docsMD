import { parse } from 'marked';
import marked = require('marked');
const hljs = require('highlight.js'); // TODO convert to import somehow...

export interface ParserConfig {
  highlight: boolean;
}

export interface ParserResult {
  referencedImages: string[],
  html: string
}

export class Parser {
  private defaultRenderer: marked.Renderer;

  constructor(private config: ParserConfig) {
    this.defaultRenderer = new marked.Renderer();
  }

  parse(markdown: string): Promise<ParserResult> {
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

    return new Promise((resolve, reject) => {
      parse(markdown, options, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({ html: result, referencedImages: referencedImages });
      });
    });
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
