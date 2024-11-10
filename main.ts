import { App, Notice, Plugin, TFile, MarkdownView } from 'obsidian';

export default class LinkConverterPlugin extends Plugin {
  async onload() {
    console.log('Loading Link Converter Plugin');

    this.addCommand({
      id: 'convert-internal-to-external',
      name: 'Convert Internal Links to External Links',
      callback: () => this.convertInternalToExternalLinks(),
    });

    this.addCommand({
      id: 'convert-external-to-internal',
      name: 'Convert External Links to Internal Links',
      callback: () => this.convertExternalToInternalLinks(),
    });
  }

  onunload() {
    console.log('Unloading Link Converter Plugin');
  }

  async convertInternalToExternalLinks() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown view found.');
      return;
    }

    const editor = activeView.editor;
    const content = editor.getValue();

    // Regular expression to find internal links, including block and heading references
    const internalLinkRegex = /\[\[([^\]|#\^]+)(?:#([^\]|^]+))?(?:\^([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
    let match;
    let newContent = content;

    while ((match = internalLinkRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const noteTitle = match[1];
      const heading = match[2];
      const blockRef = match[3];
      const alias = match[4];

      const noteFile = this.app.metadataCache.getFirstLinkpathDest(noteTitle, '');
      if (noteFile) {
        let uri = `obsidian://open?path=${encodeURIComponent(noteFile.path)}`;

        if (heading) {
          uri += `#${encodeURIComponent(heading)}`;
        }

        if (blockRef) {
          uri += `#^${encodeURIComponent(blockRef)}`;
        }

        const linkText = alias || noteTitle;
        const replacement = `[${linkText}](${uri})`;
        newContent = newContent.replace(fullMatch, replacement);
      }
    }

    editor.setValue(newContent);
    new Notice('Converted internal links to external links.');
  }

  async convertExternalToInternalLinks() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown view found.');
      return;
    }

    const editor = activeView.editor;
    const content = editor.getValue();

    // Regular expression to find Obsidian URIs
    const externalLinkRegex = /\[([^\]]+)\]\(obsidian:\/\/open\?path=([^\)\#]+)(?:\#([^\)\^]+))?(?:\^([^\)]+))?\)/g;
    let match;
    let newContent = content;

    while ((match = externalLinkRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const linkText = match[1];
      const encodedPath = match[2];
      const heading = match[3];
      const blockRef = match[4];

      const notePath = decodeURIComponent(encodedPath);
      const noteFile = this.app.vault.getAbstractFileByPath(notePath);

      if (noteFile instanceof TFile) {
        const noteTitle = noteFile.basename;
        let link = `[[${noteTitle}`;

        if (heading) {
          link += `#${heading}`;
        }

        if (blockRef) {
          link += `^${blockRef}`;
        }

        if (linkText !== noteTitle) {
          link += `|${linkText}`;
        }

        link += ']]';
        newContent = newContent.replace(fullMatch, link);
      }
    }

    editor.setValue(newContent);
    new Notice('Converted external links to internal links.');
  }
}
