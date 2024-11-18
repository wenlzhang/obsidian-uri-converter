import {
  Plugin,
  Notice,
  MarkdownView,
  App,
  PluginSettingTab,
  Setting,
} from 'obsidian';

// Define the settings interface and default values
interface ConvertURIsToLinksPluginSettings {
  uidFieldName: string;
}

const DEFAULT_SETTINGS: ConvertURIsToLinksPluginSettings = {
  uidFieldName: 'uuid',
};

export default class ConvertURIsToLinksPlugin extends Plugin {
  settings: ConvertURIsToLinksPluginSettings;

  async onload() {
    console.log('Loading Convert URIs to Internal Links plugin');

    await this.loadSettings();

    // Add the settings tab
    this.addSettingTab(new ConvertURIsToLinksPluginSettingTab(this.app, this));

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

        // Updated regex to match the entire Obsidian URI
        const uriRegex = /obsidian:\/\/[^\s]+/g;

        // Replace URIs with markdown links
        const newText = text.replace(uriRegex, (match) => {
          try {
            // Parse the URI
            const uri = new URL(match);
            const params = new URLSearchParams(uri.search);

            // Get parameters
            const vault = params.get('vault');
            const type = params.has('file')
              ? 'file'
              : params.has('uuid')
              ? 'uuid'
              : params.has('uid')
              ? 'uid'
              : null;
            const identifier =
              params.get('file') || params.get('uuid') || params.get('uid');
            const block = params.get('block');

            if (!identifier) {
              return match; // Cannot process without an identifier
            }

            const decodedIdentifier = decodeURIComponent(identifier);

            let internalLink = '';

            if (type === 'file') {
              internalLink = this.findAndCreateInternalLinkByName(decodedIdentifier);
            } else if (type === 'uuid' || type === 'uid') {
              internalLink = this.findAndCreateInternalLinkByUUID(decodedIdentifier);
            } else {
              return match; // Unrecognized type
            }

            if (block) {
              const decodedBlock = decodeURIComponent(block);
              internalLink = internalLink.replace(/\]\]$/, `#^${decodedBlock}]]`);
            }

            return internalLink;
          } catch (e) {
            console.error(`Failed to parse URI: ${match}`, e);
            return match; // Return the original match if parsing fails
          }
        });

        if (newText === text) {
          new Notice('No valid URIs to convert found.');
          return;
        }

        // Set the replaced text back into the editor
        editorInstance.replaceSelection(newText);
        new Notice('URIs converted to internal links!');
      },
    });
  }

  onunload() {
    console.log('Unloading Convert URIs to Internal Links plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  findAndCreateInternalLinkByUUID(uuid: string): string {
    console.log(`Finding internal link for UUID: ${uuid}`);

    const uidFieldName = this.settings.uidFieldName;

    // Find the note with the matching front matter UID field
    const noteFile = this.app.vault.getMarkdownFiles().find((file) => {
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
      return frontmatter && frontmatter[uidFieldName] === uuid;
    });

    if (noteFile) {
      const markdownLink = `[[${noteFile.basename}]]`;
      console.log(`Converted to internal link by UUID: ${markdownLink}`);
      return markdownLink;
    } else {
      console.log(`No matching note found for UUID: ${uuid}`);
      return `obsidian://adv-uri?vault=${encodeURIComponent(
        this.app.vault.getName()
      )}&uid=${encodeURIComponent(uuid)}`;
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
      return `obsidian://adv-uri?vault=${encodeURIComponent(
        this.app.vault.getName()
      )}&file=${encodeURIComponent(noteName)}`;
    }
  }
}

// Settings tab class
class ConvertURIsToLinksPluginSettingTab extends PluginSettingTab {
  plugin: ConvertURIsToLinksPlugin;

  constructor(app: App, plugin: ConvertURIsToLinksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Convert URIs to Internal Links Settings' });

    new Setting(containerEl)
      .setName('UID field in frontmatter')
      .setDesc('Specify the field name used for UID in the frontmatter of your notes.')
      .addText((text) =>
        text
          .setPlaceholder('Enter UID field name')
          .setValue(this.plugin.settings.uidFieldName)
          .onChange(async (value) => {
            this.plugin.settings.uidFieldName = value.trim() || 'uuid';
            await this.plugin.saveSettings();
          })
      );
  }
}
