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
    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();

    const internalLinkRegex = /\[\[([^\]|#\^]+)(?:#([^\]|^]+))?(?:\^([^\]|]+))?(?:\|([^\]]+))?\]\]/gu;
    let match;
    let newContent = content;
    let foundMatch = false;

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
        foundMatch = true;
      }
    }

    if (foundMatch) {
      if (selectedText) {
        editor.replaceSelection(newContent);
      } else {
        editor.setValue(newContent);
      }
      new Notice('Converted internal links to external links.');
    } else {
      new Notice('No internal links found to convert.');
    }
  }

  async convertExternalToInternalLinks() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown view found.');
      return;
    }

    const editor = activeView.editor;
    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();

    const externalLinkRegex = /obsidian:\/\/open\?vault=([^\&]+)&file=([^\&\)\#]+)(?:\#([^\)\^]+))?(?:\^([^\)]+))?/g;
    let match;
    let newContent = content;

    while ((match = externalLinkRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const fileParam = match[2];
      const heading = match[3];

      let link = `[[${decodeURIComponent(fileParam)}`;

      if (heading) {
        link += `#${heading}`;
      }

      link += ']]';
      newContent = newContent.replace(fullMatch, link);
    }

    if (selectedText) {
      editor.replaceSelection(newContent);
    } else {
      editor.setValue(newContent);
    }
    new Notice('Converted external links to internal links.');
  }
}
