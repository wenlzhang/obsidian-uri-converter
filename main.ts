import {
  Plugin,
  Notice,
  MarkdownView,
  App,
  PluginSettingTab,
  Setting,
} from 'obsidian';

// Define the settings interface and default values
interface URIConverterSettings {
  uidFieldName: string;
  enforceVaultName: boolean;
}

const DEFAULT_SETTINGS: URIConverterSettings = {
  uidFieldName: 'uuid',
  enforceVaultName: true,
};

export default class URIConverter extends Plugin {
  settings: URIConverterSettings = DEFAULT_SETTINGS;

  async onload() {
    console.log('Loading URI Converter plugin');

    await this.loadSettings();

    // Add the settings tab
    this.addSettingTab(new URIConverterSettingTab(this.app, this));

    // Set up the command
    this.addCommand({
      id: 'uri-converter',
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

        // Updated regex to match Obsidian URIs and markdown links containing Obsidian URIs
        const uriRegex = /(\[([^\]]*)\]\((obsidian:\/\/[^\)]+)\))|(obsidian:\/\/[^\s\)]+)/g;

        // Replace URIs with markdown links
        const newText = text.replace(
          uriRegex,
          (match, markdownLink, displayText, uriInMarkdown, plainUri) => {
            let uri: string = match; // Initialize with the original match as fallback
            let display: string | null = null;
            try {
              if (uriInMarkdown) {
                // It's a markdown link
                uri = uriInMarkdown;
                display = displayText;
              } else {
                // It's a plain Obsidian URI
                uri = plainUri;
              }

              // Process the URI to get the internal link
              let internalLink = this.processObsidianURI(uri);

              // If no conversion was made, return the original match
              if (!internalLink || internalLink === uri) {
                return match;
              }

              if (display) {
                // Include the display text
                // Remove the leading and trailing [[ ]]
                internalLink = internalLink.substring(2, internalLink.length - 2); // Remove [[ and ]]

                return `[[${internalLink}|${display}]]`;
              } else {
                return internalLink;
              }
            } catch (e) {
              console.error(`Failed to parse URI: ${uri}`, e);
              return match; // Return the original match if parsing fails
            }
          }
        );

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
    console.log('Unloading URI Converter plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  processObsidianURI(uri: string): string {
    try {
      // Parse the URI
      const parsedUri = new URL(uri);
      const params = new URLSearchParams(parsedUri.search);

      // Get parameters
      const vault = params.get('vault');
      const currentVaultName = this.app.vault.getName();

      // Compare vault names if the setting is enabled
      if (
        this.settings.enforceVaultName &&
        vault &&
        decodeURIComponent(vault) !== currentVaultName
      ) {
        console.warn(
          `URI points to a different vault: ${decodeURIComponent(
            vault
          )}. Skipping conversion.`
        );
        return uri; // Return the original URI if it points to a different vault
      }

      // Proceed with existing code
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
      const heading = params.get('heading');

      if (!identifier) {
        return uri; // Cannot process without an identifier
      }

      const decodedIdentifier = decodeURIComponent(identifier);

      let internalLink: string | null = null;

      if (type === 'file') {
        internalLink = this.findAndCreateInternalLinkByName(decodedIdentifier);
      } else if (type === 'uuid' || type === 'uid') {
        internalLink = this.findAndCreateInternalLinkByUUID(decodedIdentifier);
      } else {
        return uri; // Unrecognized type
      }

      if (!internalLink) {
        // Note not found; return the original URI
        return uri;
      }

      if (block) {
        const decodedBlock = decodeURIComponent(block);
        internalLink = internalLink.replace(/\]\]$/, `#^${decodedBlock}]]`);
      } else if (heading) {
        const decodedHeading = decodeURIComponent(heading);
        internalLink = internalLink.replace(/\]\]$/, `#${decodedHeading}]]`);
      }

      return internalLink;
    } catch (e) {
      console.error(`Failed to parse URI: ${uri}`, e);
      return uri; // Return the original URI if parsing fails
    }
  }

  findAndCreateInternalLinkByUUID(uuid: string): string | null {
    console.log(`Finding internal link for UID: ${uuid}`);

    const uidFieldName = this.settings.uidFieldName;

    // Find the note with the matching front matter UID field
    const noteFile = this.app.vault.getMarkdownFiles().find((file) => {
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
      return frontmatter && frontmatter[uidFieldName] === uuid;
    });

    if (noteFile) {
      const markdownLink = `[[${noteFile.basename}]]`;
      console.log(`Converted to internal link by UID: ${markdownLink}`);
      return markdownLink;
    } else {
      console.log(`No matching note found for UID: ${uuid}`);
      return null;
    }
  }

  findAndCreateInternalLinkByName(noteName: string): string | null {
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
      return null;
    }
  }
}

// Settings tab class
class URIConverterSettingTab extends PluginSettingTab {
  plugin: URIConverter;

  constructor(app: App, plugin: URIConverter) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', {
      text: 'URI Converter',
    });

    new Setting(containerEl)
      .setName('UID field in frontmatter')
      .setDesc(
        'Specify the field name used for UID in the frontmatter of your notes.'
      )
      .addText((text) =>
        text
          .setPlaceholder('Enter UID field name')
          .setValue(this.plugin.settings.uidFieldName)
          .onChange(async (value) => {
            this.plugin.settings.uidFieldName = value.trim() || 'uuid';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enforce vault name matching')
      .setDesc('Only convert URIs that point to the current vault.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enforceVaultName)
          .onChange(async (value) => {
            this.plugin.settings.enforceVaultName = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
