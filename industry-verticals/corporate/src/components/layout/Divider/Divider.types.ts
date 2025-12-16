interface Fields {
  variant:
    | 'CentreRightLeftCurveGlow'
    | 'RightToLeftCurveGlow'
    | 'RightToLeftCurve'
    | 'CenterRightLeftCenterGlow';
  fullBackground?: string;
  topBackground?: string;
}

export interface DividerProps {
  params: {
    [key: string]: string;
  };
  fields: Fields;
  variant?: string;
}
