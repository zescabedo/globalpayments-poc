// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flipMediaOnMobile = (props: any) => {
  const flipMediaOnMobile =
    (props?.params?.['Flip Media on Mobile'] && props?.params?.['Flip Media on Mobile'] === '1') ||
    false;
  const flipMediaClass = flipMediaOnMobile ? ' flip-media-on-mobile' : '';
  return flipMediaClass;
};
