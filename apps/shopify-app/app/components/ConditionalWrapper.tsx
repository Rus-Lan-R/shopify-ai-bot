import React, { ReactNode } from "react";

const ConditionalWrapper: React.FC<{
  condition: boolean;
  wrapper: (children: ReactNode) => JSX.Element;
  elseWrapper?: (children: ReactNode) => JSX.Element;
  children: ReactNode;
}> = ({ condition, wrapper, children, elseWrapper }) => (
  <>
    {condition
      ? wrapper(children)
      : elseWrapper
        ? elseWrapper(children)
        : children}
  </>
);

export default ConditionalWrapper;
