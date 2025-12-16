import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';

interface ProductInterestField {
  fields?: {
    Value?: {
      value: string;
    };
  };
}

const ProductInterest = (): JSX.Element | null => {
  const { sitecoreContext } = useSitecoreContext();

  const rawProductInterest = sitecoreContext?.route?.fields
    ?.ProductInterest as ProductInterestField;

  const value = rawProductInterest?.fields?.Value?.value;

  if (!value) {
    return null;
  }

  return <div className="product-interest" data-value={value}></div>;
};

export default ProductInterest;
