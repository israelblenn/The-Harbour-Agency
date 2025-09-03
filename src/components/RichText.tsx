'use client'

import React, { useState } from 'react'
import { LexicalEditor, Klass, LexicalNode, SerializedEditorState } from 'lexical'
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

interface PayloadRichTextData {
  root: {
    type: string
    children: unknown[]
    format: string
    indent: number
    direction: 'ltr' | 'rtl' | null
    version: number
  }
}

interface RichTextProps {
  content: PayloadRichTextData | null | undefined
}

const editorNodes: Klass<LexicalNode>[] = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LinkNode,
  AutoLinkNode,
]

const RichText: React.FC<RichTextProps> = ({ content }) => {
  const [error, setError] = useState<Error | null>(null)

  if (!content || !content.root || !content.root.children) return null
  const initialEditorState = content

  const initialConfig: InitialConfigType = {
    namespace: 'RichTextRenderer',
    editable: false,
    nodes: editorNodes,
    onError: (e: Error) => {
      console.error('Lexical Editor Error:', e)
      setError(e)
    },
    editorState: (editor: LexicalEditor) => {
      editor.setEditorState(editor.parseEditorState(initialEditorState as SerializedEditorState))
    },
  }

  if (error) {
    return <div className="lexical-error">Error: {error.message}</div>
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="rich-text-content" />}
        placeholder={null}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ErrorBoundary={LexicalErrorBoundary as any}
      />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
    </LexicalComposer>
  )
}

export default RichText
