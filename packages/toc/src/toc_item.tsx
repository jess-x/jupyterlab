// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from 'react';
import { IHeading, INotebookHeading } from './utils/headings';
import { CodeCell } from '@jupyterlab/cells';
import { NotebookPanel } from '@jupyterlab/notebook';

let show = false;
/**
 * Tests whether a heading is a notebook heading.
 *
 * @private
 * @param heading - heading to test
 * @returns boolean indicating whether a heading is a notebook heading
 */
function isNotebookHeading(heading: any): heading is INotebookHeading {
  return heading.type !== undefined && heading.cellRef !== undefined;
}

/**
 * Checks whether a heading has runnable code cells.
 *
 * @private
 * @param headings - list of headings
 * @param heading - heading
 * @returns boolean indicating whether a heading has runnable code cells
 */
function hasCodeCells(headings: IHeading[], heading: IHeading): boolean {
  let h: INotebookHeading;
  let i: number;

  if (!isNotebookHeading(heading)) {
    return false;
  }
  // Find the heading in the list of headings...
  for (i = 0; i < headings.length; i++) {
    if (heading === headings[i]) {
      break;
    }
  }
  // Check if the current heading is a "code" heading...
  h = heading as INotebookHeading;
  if (h.type === 'code') {
    return true;
  }
  // Check for nested code headings...
  const level = heading.level;
  for (i = i + 1; i < headings.length; i++) {
    h = headings[i] as INotebookHeading;
    if (h.level <= level) {
      return false;
    }
    if (h.type === 'code') {
      return true;
    }
  }
  return false;
}

/**
 * Interface describing component properties.
 *
 * @private
 */
interface IProperties {
  /**
   * Heading to render.
   */
  heading: IHeading;

  /**
   * List of all headings.
   */
  toc: IHeading[];

  /**
   * Renders a heading.
   *
   * @param item - heading
   * @returns rendered heading
   */
  itemRenderer: (item: IHeading) => JSX.Element | null;
}

/**
 * Interface describing component state.
 *
 * @private
 */
 interface IState {
  /**
   * Mouse x-position.
   */
  mouseX: number | null;

  /**
   * Mouse y-position.
   */
  mouseY: number | null;
}

function MyComponent(label: string, onclick: React.MouseEventHandler<HTMLDivElement>) {
  return ( 
    {show} ?         
    <div className="lm-Widget p-Widget lm-Menu p-Menu" id="contextmenu">
      <ul className="lm-Menu-content p-Menu-content" role="menu">
        <li role="menuitem" className="lm-Menu-item p-Menu-item">
          <div className="lm-Menu-itemLabel p-Menu-itemLabel" onClick={onclick}>{label}</div>
        </li>
      </ul>
    </div> : null);
}

/**
 * React component for a table of contents entry.
 *
 * @private
 */
class TOCItem extends React.Component<IProperties, IState> {
  /**
   * Returns a component which renders a table of contents entry.
   *
   * @param props - component properties
   * @returns component
   */
   constructor(props: IProperties) {
    super(props);
    this.state = {
      mouseX: null,
      mouseY: null
    };
  }

  /**
   * Renders a table of contents entry.
   *
   * @returns rendered entry
   */
  render() {
    const { heading } = this.props;

    // Create an onClick handler for the TOC item
    // that scrolls the anchor into view.
    const onClick = (event: React.SyntheticEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
      heading.onClick();
    };

    let content = this.props.itemRenderer(heading);
    const FLG = hasCodeCells(this.props.toc, heading);
    console.log("FLG: ", FLG);
    console.log("show: ", show);

    return (
      <li
        onClick={onClick}
        onContextMenu={          
          FLG
            ? this._onContextMenuFactory(heading as INotebookHeading)
            : undefined
        }
      >
        {content}
        {FLG && show ? (
          MyComponent("Run Cell(s)", this._onRunFactory(heading as INotebookHeading))

        ) : null}
      </li>
    );
  }

  /**
   * Returns a callback which is invoked upon opening a context menu.
   *
   * @param heading - heading
   * @returns callback
   */
   private _onContextMenuFactory(heading: INotebookHeading) {
    const self = this;
    show = !show;
    console.log("menu");
    return onContextMenu;

    /**
     * Callback invoked upon opening a job's context menu.
     *
     * @private
     * @param event - event object
     */
    function onContextMenu(event: any): void {
      event.preventDefault();
      event.stopPropagation();

      self.setState({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4
      });
    }
  }

  /**
   * Returns a callback which is invoked upon clicking a menu item to run code cells.
   *
   * @param heading - heading
   * @returns callback
   */
   private _onRunFactory(heading: INotebookHeading) {
    const self = this;
    return onClick;

    /**
     * Callback invoked upon clicking a menu item to run code cells.
     *
     * @private
     * @param event - event object
     */
    async function onClick(event: any): Promise<void> {
      let code: INotebookHeading[];
      let h: INotebookHeading;
      let i: number;

      event.preventDefault();
      event.stopPropagation();

      self._closeContextMenu();

      // Find the heading in the list of ToC headings...
      const headings = self.props.toc;
      for (i = 0; i < headings.length; i++) {
        if (heading === headings[i]) {
          break;
        }
      }
      code = [];

      // Check if the current heading is a "code" heading...
      h = heading as INotebookHeading;
      if (h.type === 'code') {
        code.push(h);
      }
      // Find all nested code headings...
      else {
        const level = heading.level;
        for (i = i + 1; i < headings.length; i++) {
          h = headings[i] as INotebookHeading;
          if (h.level <= level) {
            break;
          }
          if (h.type === 'code') {
            code.push(h);
          }
        }
      }
      // Run each of the associated code cells...
      for (i = 0; i < code.length; i++) {
        if (code[i].cellRef) {
          const cell = code[i].cellRef as CodeCell;
          const panel = cell.parent?.parent as NotebookPanel;
          if (panel) {
            await CodeCell.execute(cell, panel.sessionContext);
          }
        }
      }
      this._closeContextMenu();
    }
  }

  // /**
  //  * Callback invoked upon closing a context menu.
  //  *
  //  * @param event - event object
  //  */
  //  private _onContextMenuClose = (event: any): void => {
  //   event.preventDefault();
  //   event.stopPropagation();

  //   this._closeContextMenu();
  // };

  /**
   * Closes a context menu.
   */
   private _closeContextMenu(): void {
     show = !show;
    this.setState({
      mouseX: null,
      mouseY: null
    });
    
  }
}

/**
 * Exports.
 */
 export { TOCItem };
