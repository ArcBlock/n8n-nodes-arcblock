import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { createHeadlessEditor } from '@lexical/headless';
import { $generateNodesFromDOM } from '@lexical/html';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { JSDOM } from 'jsdom';
import { $getRoot, $insertNodes, LineBreakNode, TextNode } from 'lexical';
import { marked } from 'marked';

import { ImageNode } from './ImageNode';

export async function markdownToLexical(markdown: string): Promise<any> {
	const html = await marked(markdown);
	const editor = createHeadlessEditor({
		namespace: 'editor',
		theme: {},
		nodes: [
			HeadingNode,
			QuoteNode,
			ListNode,
			ListItemNode,
			CodeNode,
			CodeHighlightNode,
			TableNode,
			TableRowNode,
			TableCellNode,
			LinkNode,
			ImageNode,
			TextNode,
			LineBreakNode,
		],
	});

	editor.update(
		() => {
			const dom = new JSDOM(html);
			const htmlDocument = dom.window.document;
			const nodes = $generateNodesFromDOM(editor, htmlDocument);
			$getRoot().select();
			$insertNodes(nodes);
		},
		{ discrete: true },
	);

	return new Promise((resolve) => {
		setTimeout(
			() => {
				editor.update(() => {
					const state = editor.getEditorState();
					const json = state.toJSON();
					resolve(json);
				});
			},
			Math.min(markdown.length, 500),
		);
	});
}
