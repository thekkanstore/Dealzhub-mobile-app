import React from 'react';

type RenderIfProps = {
  isRender: boolean;
  children: React.ReactNode;
};
const TKRenderIf: React.FC<RenderIfProps> = ({isRender: isRenderCondition, children}) => {
  if (!isRenderCondition) return null;
  return <>{children}</>;
};

export default React.memo(TKRenderIf);
