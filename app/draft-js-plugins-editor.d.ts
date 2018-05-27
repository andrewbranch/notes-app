declare module 'draft-js-plugins-editor' {
  import * as Draft from 'draft-js';
  import * as React from 'react';

  export interface DraftDecoratorComponentProps {
    contentState: Draft.ContentState;
    decoratedText: string;
    entityKey: string;
    offsetKey: string;
    getEditorState: () => Draft.EditorState;
    setEditorState: (editorState: Draft.EditorState) => void;
    children: React.ReactNode;
  }

  export type DecoratorStrategyCallback = (start: number, end: number) => void;
  export type DecoratorStrategy = (block: Draft.ContentBlock, callback: DecoratorStrategyCallback, contentState: Draft.ContentState) => void;
  export interface Decorator {
    strategy: DecoratorStrategy;
    component: React.ComponentType<any>;
  }
  
  export interface PluginProvider {
    getPlugins(): Plugin[];
    getProps(): EditorProps;
    setEditorState(editorState: Draft.EditorState): void;
    getEditorState(): Draft.EditorState;
    setReadOnly(): void;
    getReadOnly(): boolean;
    getEditorRef(): Draft.Editor;
  }

  export interface Plugin {
    placeholder?: string;
    textAlignment?: any;
    customStyleMap?: { [key: string]: React.CSSProperties };
    readOnly?: boolean;
    spellCheck?: boolean;
    stripPastedStyles?: boolean;
    tabIndex?: number;
    autoCapitalize?: string;
    autoComplete?: string;
    autoCorrect?: string;
    ariaActiveDescendantID?: string;
    ariaAutoComplete?: string;
    ariaControls?: string;
    ariaDescribedBy?: string;
    ariaExpanded?: boolean;
    ariaLabel?: string;
    ariaMultiline?: boolean;
    webDriverTestID?: string;
    blockRenderMap?: any
    blockRendererFn?(block: Draft.ContentBlock, pluginProvider: PluginProvider): any;
    blockStyleFn?(block: Draft.ContentBlock, pluginProvider: PluginProvider): string;
    customStyleFn?(style: Draft.DraftInlineStyle): Object;
    keyBindingFn?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): Draft.DraftEditorCommand | string | null;
    handleReturn?(e: React.KeyboardEvent<{}>, editorState: Draft.EditorState, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    handleKeyCommand?(command: Draft.DraftEditorCommand | string, editorState: Draft.EditorState, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    handleBeforeInput?(chars: string, editorState: Draft.EditorState, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    handlePastedText?(text: string, html: string|undefined, editorState: Draft.EditorState, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    handlePastedFiles?(files: Array<Blob>, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    handleDroppedFiles?(selection: Draft.SelectionState, files: Array<Blob>, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    handleDrop?(selection: Draft.SelectionState, dataTransfer: Object, isInternal: Draft.DraftDragType, pluginProvider: PluginProvider): Draft.DraftHandleValue;
    onEscape?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): void;
    onTab?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): void;
    onUpArrow?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): void;
    onDownArrow?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): void;
    onRightArrow?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): void;
    onLeftArrow?(e: React.KeyboardEvent<{}>, pluginProvider: PluginProvider): void;
    onBlur?(e: React.SyntheticEvent<{}>, pluginProvider: PluginProvider): void;
    onFocus?(e: React.SyntheticEvent<{}>, pluginProvider: PluginProvider): void;
    
    initialize?(plugins: Plugin[]): void;
    onChange?(editorState: Draft.EditorState): Draft.EditorState;
    willUnmount?(plugins: Plugin[]): void;
    decorators?: (Decorator | Draft.CompositeDecorator)[];
    getAccessibilityProps?(): {
      ariaHasPopup: string;
      ariaExpanded: string;
    };
  }

  export interface EditorProps extends Draft.EditorProps {
    plugins?: Plugin[];
    decorators?: Plugin['decorators'];
    defaultKeyBindings?: boolean;
    defaultBlockRenderMap?: boolean;
  }
  
  export default class Editor extends React.Component<EditorProps> {
    focus(): void;
  }
}
