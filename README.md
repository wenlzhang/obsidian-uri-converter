# URI Converter

[![GitHub release (Latest by date)](https://img.shields.io/github/v/release/wenlzhang/obsidian-uri-converter)](https://github.com/wenlzhang/obsidian-uri-converter/releases) ![GitHub all releases](https://img.shields.io/github/downloads/wenlzhang/obsidian-uri-converter/total?color=success)

An [Obsidian](https://obsidian.md/) plugin to convert Obsidian URIs to Obsidian internal links.

## Features

- Convert [Obsidian URIs](https://help.obsidian.md/Extending+Obsidian/Obsidian+URI) and [Advanced URIs](https://publish.obsidian.md/advanced-uri-doc/Home)
- Convert various URI types
    - Note links
    - Heading links
    - Block links
- Convert various link formats
    - Pure URIs, e.g., `obsidian://open?vault=my%20vault&file=my%20note`.
    - URIs of Markdown URL format, e.g., `[Any text or empty](obsidian://open?vault=my%20vault&file=my%20note)`.

## Usage

- Select any text containing the URIs to be converted, and call the command "URI Converter: Convert URIs to Internal Links"
    - If the text contains several URIs, they will all be converted into Obsidian internal links.
    - Text that is not URIs stays unchanged.
- Settings: UID field in frontmatter
    - One needs to specify an ID filed in the note frontmatter, as this is used to find the the corresponding note based on the UID info in the Advanced URI note links.
- Settings: Enforce vault name matching
    - This is for controlling whether the conversion command should work if the note comes from another vault. For example, sometimes you have a note in one vault but afterwards you move it to another vault.

## The story

This plugin was born out of my own use case and a common challenge I faced while working in Obsidian. Often, I copy links to an Obsidian note, heading, or block—whether it’s a specific note, a snippet of text, or a task—and use these links in external apps like Todoist. For instance, I might add these links to the description field in Todoist to provide additional context for a task.

When it comes time to complete the task in Todoist, I revisit the description to review any relevant information. That's when I encounter the issue: while these external links point to my Obsidian content, they aren’t functional as bidirectional links within Obsidian when copied back. This breaks the seamless navigation and connection that Obsidian is known for.

Manually converting these external links into Obsidian-compatible internal links was tedious, so I decided to create a solution—a plugin. Using the power of AI-assisted IDE tools, I was able to make the first basic version of the plugin work within an hour. Building on that foundation, it took just three hours in total to create the first complete version of the plugin.

With the **Obsidian URI Converter** plugin, I can now automate this conversion process, saving time and effort while maintaining the bidirectional linking power of Obsidian. This plugin makes working with external apps and Obsidian smoother and more efficient and has become an essential part of my workflow.

I hope this plugin can help you as well.

## Support me

<a href='https://ko-fi.com/C0C66C1TB' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
