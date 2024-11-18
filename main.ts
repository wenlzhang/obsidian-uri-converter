import { Plugin, Notice, MarkdownView } from 'obsidian';

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

        // 更新正则表达式以匹配 Obsidian URI
        const uriRegex = /obsidian:\/\/open\?vault=[^&]+&file=([^&]+)/g;

        // 替换 URIs 为 markdown 链接
        const newText = text.replace(uriRegex, (match, fileName) => {
          // 解码文件名并添加方括号
          const decodedFileName = decodeURIComponent(fileName);
          return `[[${decodedFileName}]]`;
        });

        // Set the replaced text back into the editor
        editorInstance.replaceSelection(newText);
        new Notice('URIs converted to internal links!');
      }
    });
  }

  onunload() {
    console.log('Unloading Convert URIs to Internal Links plugin');
  }

  findAndCreateInternalLink(noteId: string): string {
    console.log(`Finding internal link for note ID: ${noteId}`);

    // Find the note with the matching vault ID
    const noteFile = this.app.vault.getMarkdownFiles().find(
      (file) => this.app.metadataCache.getFileCache(file)?.frontmatter?.id === noteId
    );

    if (noteFile) {
      const markdownLink = `[[${noteFile.basename}]]`;
      console.log(`Converted to internal link: ${markdownLink}`);
      return markdownLink;
    } else {
      // Fallback: try to find note by name (UUID mismatch)
      const noteName = noteId.replace(/-/g, ' ');
      const noteFileByName = this.app.vault.getMarkdownFiles().find(
        (file) => file.basename.toLowerCase() === noteName.toLowerCase()
      );

      if (noteFileByName) {
        const markdownLink = `[[${noteFileByName.basename}]]`;
        console.log(`Converted to internal link by name: ${markdownLink}`);
        return markdownLink;
      } else {
        console.log(`No matching note found for ID: ${noteId}`);
        return noteId;
      }
    }
  }
}
