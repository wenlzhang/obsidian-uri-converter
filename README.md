# URI Converter

[![GitHub release (Latest by date)](https://img.shields.io/github/v/release/wenlzhang/obsidian-uri-converter)](https://github.com/wenlzhang/obsidian-uri-converter/releases) ![GitHub all releases](https://img.shields.io/github/downloads/wenlzhang/obsidian-uri-converter/total?color=success)

An [Obsidian](https://obsidian.md/) plugin to convert Obsidian URIs to external links.

## Features

- Convert [Obsidian URIs](https://help.obsidian.md/Extending+Obsidian/Obsidian+URI) and [Advanced URIs](https://publish.obsidian.md/advanced-uri-doc/Home) to Obsidian internal links
- Convert various URI types
    - Note links
    - Heading links
    - Block links
- Convert various link formats
    - Pure URIs
    - Markdown URIs

## Usage

- Use select any text containing the URIs and call the plugin command
    - Text besides the URIs stay unchanged.
- UID field in frontmatter
- Enforce vault name matching
    - Explain the use case

## The Story Behind the Plugin

This plugin was born out of my own use case and a common challenge I faced while working in Obsidian. Often, I copy links to an Obsidian note, heading, or block—whether it’s a specific note, a snippet of text, or a task—and use these links in external apps like Todoist. For instance, I might add these links to the description field in Todoist to provide additional context for a task.

When it comes time to complete the task in Todoist, I revisit the description to review any relevant information. That's when I encounter the issue: while these external links point to my Obsidian content, they aren’t functional as bidirectional links within Obsidian when copied back. This breaks the seamless navigation and connection that Obsidian is known for.

The tedious part is having to manually convert these external links into Obsidian-compatible internal links. This repetitive task inspired me to create a solution—a plugin that would automate the conversion process, saving time and effort. And so, the **URI Converter** plugin was developed to bridge the gap and make working with external apps and Obsidian smoother and more efficient.

## Support me

<a href='https://ko-fi.com/C0C66C1TB' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
