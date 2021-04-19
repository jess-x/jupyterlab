// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from 'react';
import { IHeading, INotebookHeading } from './utils/headings';

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
interface IState {}

/**
 * React component for a table of contents entry.
 *
 * @private
 */
class TOCItem extends React.Component<IProperties, IState> {
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
    console.log(FLG);

    return content && <li onClick={onClick}>{content}</li>;
  }
}

/**
 * Exports.
 */
export { TOCItem };
