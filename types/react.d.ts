import React from 'react';

declare global {
  namespace JSX {
    // Allow any HTML elements
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    // Allow any JSX elements
    interface Element extends React.ReactElement<any, any> {}

    // Allow any component classes
    interface ElementClass extends React.Component<any, any> {
      render(): React.ReactNode;
    }

    // Component prop attributes
    interface ElementAttributesProperty {
      props: {};
    }

    // Component children attributes
    interface ElementChildrenAttribute {
      children: {};
    }

    // Intrinsic class attributes
    interface IntrinsicClassAttributes<T> {}
  }
}

export {};

