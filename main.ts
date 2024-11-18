import { Plugin, Notice, MarkdownView, TFile, Vault } from 'obsidian';

export default class ConvertURIsToLinksPlugin extends Plugin {
  async onload() {
    console.log('Loading Convert URIs to Internal Links plugin');

    // Set up the command
    this.addCommand({
      id: 'convert-uris-to-links',
      name: 'Convert URIs to Internal Links',
      callback: async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
          new Notice('No active Markdown editor found.');
          return;
        }

        const editorInstance = activeView.editor;
        if (!editorInstance) {
          new Notice('No active editor found.');
          return;
        }

        const text = editorInstance.getSelection();
        if (!text) {
          new Notice('No text selected.');
          return;
        }

        // Regex for Obsidian URI matching (updated to include 'uid')
        const uriRegex = /obsidian:\/\/(?:open|adv-uri)\?vault=[^&]+&(file|uuid|uid)=([^&]+)/g;

        // Replace URIs with markdown links
        const newText = text.replace(uriRegex, (match, type, identifier) => {
          const decodedIdentifier = decodeURIComponent(identifier);
          if (type === 'file') {
            return this.findAndCreateInternalLinkByName(decodedIdentifier);
          } else if (type === 'uuid' || type === 'uid') {
            return this.findAndCreateInternalLinkByUUID(decodedIdentifier);
          }
          return match; // If not a recognized type, return the original link
        });

        if (newText === text) {
          new Notice('No valid URIs to convert found.');
          return;
        }

        // Set the replaced text back into the editor
        editorInstance.replaceSelection(newText);
        new Notice('URIs converted to internal links!');
      }
    });
  }

  onunload() {
    console.log('Unloading Convert URIs to Internal Links plugin');
  }

  findAndCreateInternalLinkByUUID(uuid: string): string {
    console.log(`Finding internal link for UUID: ${uuid}`);

    // Find the note with the matching front matter 'uuid'
    const noteFile = this.app.vault.getMarkdownFiles().find(
      (file) => this.app.metadataCache.getFileCache(file)?.frontmatter?.uuid === uuid
    );

    if (noteFile) {
      const markdownLink = `[[${noteFile.basename}]]`;
      console.log(`Converted to internal link by UUID: ${markdownLink}`);
      return markdownLink;
    } else {
      console.log(`No matching note found for UUID: ${uuid}`);
      return `obsidian://adv-uri?vault=Obsidian%20Plugin%20Test&uid=${encodeURIComponent(uuid)}`;
    }
  }

  findAndCreateInternalLinkByName(noteName: string): string {
    console.log(`Finding internal link for note name: ${noteName}`);

    const noteFile = this.app.vault.getMarkdownFiles().find(
      (file) => file.basename.toLowerCase() === noteName.toLowerCase()
    );

    if (noteFile) {
      const markdownLink = `[[${noteFile.basename}]]`;
      console.log(`Converted to internal link by name: ${markdownLink}`);
      return markdownLink;
    } else {
      console.log(`No matching note found for name: ${noteName}`);
      return `obsidian://adv-uri?vault=Obsidian%20Plugin%20Test&file=${encodeURIComponent(noteName)}`;
    }
  }
}
