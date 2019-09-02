import { VirtualEditor } from '../editor';
import { CodeMirror } from '../../adapters/codemirror';
import { IEditorPosition, IRootPosition } from '../../positioning';

export class VirtualFileEditor extends VirtualEditor {
  protected cm_editor: CodeMirror.Editor;

  constructor(language: string, path: string, cm_editor: CodeMirror.Editor) {
    // TODO: for now the magics and extractors are not used in FileEditor,
    //  although it would make sense to pass extractors (e.g. for CSS in HTML,
    //  or SQL in Python files) in the future.
    super(language, path, {}, {});
    this.cm_editor = cm_editor;
    let handler = {
      get: function(
        target: VirtualFileEditor,
        prop: keyof CodeMirror.Editor,
        receiver: any
      ) {
        if (prop in cm_editor) {
          return cm_editor[prop];
        } else {
          return Reflect.get(target, prop, receiver);
        }
      }
    };
    return new Proxy(this, handler);
  }

  public transform_virtual_to_source(
    position: CodeMirror.Position
  ): CodeMirror.Position {
    return position;
  }
  public transform_editor_to_root(
    cm_editor: CodeMirror.Editor,
    position: IEditorPosition
  ): IRootPosition {
    return (position as unknown) as IRootPosition;
  }

  public get_editor_index(position: CodeMirror.Position): number {
    return 0;
  }

  get_cm_editor(position: IRootPosition): CodeMirror.Editor {
    return undefined;
  }

  // TODO: force re-definition of this method (in base class, so that it is never proxied)
  getValue(seperator?: string): string {
    this.virtual_document.clear();
    this.virtual_document.append_code_block(
      this.cm_editor.getValue(seperator),
      this.cm_editor
    );
    return this.virtual_document.value;
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.cm_editor.getWrapperElement().addEventListener(type, listener);
  }
}