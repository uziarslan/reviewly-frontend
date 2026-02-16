import React from 'react';

/**
 * Renders text from the backend, preserving \n as line breaks.
 * Use for any field that may contain newline characters from the database.
 *
 * @param {Object} props - Component props
 * @param {string} [props.children] - The text content
 * @param {string} [props.as='span'] - HTML element to render as
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement|null}
 */
export function TextWithNewlines({ children, as: Tag = 'span', className = '', ...rest }) {
  if (children == null || children === '') return null;
  return (
    <Tag className={`whitespace-pre-line ${className}`.trim()} {...rest}>
      {String(children)}
    </Tag>
  );
}
