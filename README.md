![](logo.png)



# docsMD

docsMD is a Markdown to HTML generator that converts your README.md (and other .md files) to HTML using [node.js](https://nodejs.org).

## Getting started

Install docsMD

```bash
$ npm install -g @ckogler/docsmd
```

Run from the command line:

``` bash
$ docsmd -i readme.md -o ./docs

# or if you installed it without the -g flag:
$ npx docsmd -i readme.md -o ./docs
```

This will generate `docs/index.html` from the supplied readme.md file.

## How it works

docsMD takes all input markdown files and creates a .html file in the output directory with the same name and relative path. If a file is called "readme.md" (or "README.md"), the resulting HTML file will be named "index.html", unless an "index.md" file exists in the same directory.

### Example

A directory like this one:

```
|- readme.md
|- types.md
|- legacy
  |- index.md
  |- changelog.md
```

will result in the following file structure (when using default parameters):

``` 
|- docs
  |- index.html        # (renamed from readme.md)
  |- types.html
  |- legacy
    |- index.html
    |- changelog.html
```

### Images

Images with a relative URL will be copied to the same relative location in the output directory. That way the resulting HTML files will be able to show the images when the output directory is deployed to a web server. Absolute image URLs will not be touched.

### Links

If a link leads to a relative path and ends with ".md", the ending will be replaced with ".html". That way if you can link between .md files will also work in the generated HTML. Absolute links will not be touched.

### Inline support

When genering a single-file documentation the content of multiple individual files might need to be merged together. This is supported by addding a link to the markdown file to include with a text set to '#'. This feature can be disabled with the `--inline` option.

## Configuration

### Parameters

| Parameter            | Explanation                                                  |
| -------------------- | ------------------------------------------------------------ |
| `--input`     | The files to convert. Supports the *glob* pattern. Defaults to `**/*.md` |
| `--exclude`     | Excludes the matching files from the 'input' parameter. Defaults to `node_modules/**` |
| `--output`   | The directory where the generated HTML files will be placed. Defaults to `./docs` |
| `--highlight` | Can be `true` or `false`. Determines whether highlight.js will be applied to source code. Defaults to `true` |
| `--inline` | Can be `true` or `false`. Determines whether links with a text set to '#' will be replaced with the included markdown content.  |
| `--template`  | Can be used to specify a template file. If none is specified, the included default style will be used. |

### Config file

Alternatively to the CLI parameters, the configuration can be provided via a *docsmd.json* file in the executing directory. 

A provided CLI parameter will take precedence over the config file.

Example file:

```json
// docsmd.json
{
  "input": "**/*.md",
  "output": "docs",
  "template": "docs-template.html"
}
```

## Template

docsMD provides a basic template file, however it is simple to use your own by passing a filename to the "--template" parameter (or template option in the config file). The template file will be reused for each processed .md file

docsMD uses [Handlebars](https://handlebarsjs.com/) internally to apply the template. The template context contains these entries:

| name       | description                                                |
| ---------- | ---------------------------------------------------------- |
| `content`  | The generated HTML content.                                |
| `filename` | The name of the currently parsed file (without extension). |

### Sample

```html
<html>
  <head>
    <title>{{ filename }}</title>
    </head>
    <body>
    <div>Some header.</div>
    <div>
      <!-- make sure to use triple braces for the content, so HTML is not escaped! -->
      {{{ content }}}
    </div>
    <div>Some footer.</div>
  </body>
</html>
```

## Background

The idea behind this package is to deliver a quick and easy-to-use solution to generate HTML documentation from markdown files in your repository (ideally without any configuration). 

It is intended for simple use cases where solutions like [JSDoc](https://jsdoc.app/) would be overkill. It is not meant to compete with more complex products and therefore the feature set and configuration options will be kept to a minimum.

## Powered by

docsMD uses [marked](https://github.com/markedjs/marked), [handlebars](https://handlebarsjs.com/) and [highlight.js](https://github.com/highlightjs/highlight.js) internally.

## License

MIT

