import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  Field,
  ImageField,
  Text,
  LinkField,
  Link,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Text1: Field<string>;
  SubText1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Text2: Field<string>;
  SubText2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Text3: Field<string>;
  SubText3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Stat1?: Field<string>;
  Stat2?: Field<string>;
  Stat3?: Field<string>;
  Title?: Field<string>;
  Subtitle?: Field<string>;
}

export type ThreeColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    // Map to Storybook button classes
    const getButtonClass = (style?: string) => {
      if (!style) return 'btn btn-base btn-md';
      const styleMap: { [key: string]: string } = {
        'primary': 'btn btn-base btn-md',
        'secondary': 'btn btn-outline btn-md',
        'main': 'btn btn-base btn-md',
      };
      return styleMap[style.toLowerCase()] || 'btn btn-base btn-md';
    };
    
    const buttonStyle = props.params?.ButtonStyle
      ? getButtonClass(props.params.ButtonStyle)
      : 'btn btn-base btn-md';

    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={400} height={400} />
          <h2 className="title-sm">
            <Text field={text} />
          </h2>
          <p className="body-md">
            <Text field={subText} />
          </p>
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={buttonStyle} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        {(isPageEditing || props.fields?.Title?.value || props.fields?.Subtitle?.value) && (
          <div className="statistics-header">
            {(isPageEditing || props.fields?.Title?.value) && (
              <h2 className="statistics-title">
                <Text field={props.fields.Title} />
              </h2>
            )}
            {(isPageEditing || props.fields?.Subtitle?.value) && (
              <p className="statistics-subtitle">
                <Text field={props.fields.Subtitle} />
              </p>
            )}
          </div>
        )}
        <div className="row">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIcons = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="image-wrapper mb-5">
              <NextImage field={image} width={32} height={32} />
            </div>
            <h2>
              <Text field={text} />
            </h2>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIconsCompact = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="image-wrapper">
                <NextImage field={image} width={32} height={32} />
              </div>
              <h2 className="eyebrow-accent mb-0 mt-2">
                <Text field={text} />
              </h2>
            </div>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons with-icons-compact ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

// Circular Progress Component (same as TwoColumnCta)
interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress = ({ 
  percentage, 
  color, 
  size = 200, 
  strokeWidth = 12 
}: CircularProgressProps): JSX.Element => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let current = 0;
            const duration = 1500; // 1.5 seconds
            const startTime = Date.now();

            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Easing function for smooth animation
              const easeOutCubic = 1 - Math.pow(1 - progress, 3);
              current = Math.round(percentage * easeOutCubic);
              setAnimatedPercentage(current);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setAnimatedPercentage(percentage);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="circular-progress-wrapper" ref={ref} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="circular-progress-circle"
        />
      </svg>
      <div className="circular-progress-content">
        <span className="circular-progress-number">{animatedPercentage}</span>
        <span className="circular-progress-symbol">%</span>
      </div>
    </div>
  );
};

// Statistics Variant
export const Statistics = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  // Parse stat values (they come as strings from Sitecore, representing percentage out of 100)
  const stat1Value = props.fields?.Stat1?.value 
    ? parseFloat(props.fields.Stat1.value) 
    : 0;
  const stat2Value = props.fields?.Stat2?.value 
    ? parseFloat(props.fields.Stat2.value) 
    : 0;
  const stat3Value = props.fields?.Stat3?.value 
    ? parseFloat(props.fields.Stat3.value) 
    : 0;

  const StatItem = ({
    statValue,
    text,
    color,
    delay,
  }: {
    statValue: number;
    text: Field<string>;
    color: string;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);

    return (
      <div
        className={`col-sm-12 col-lg-4 statistics-item ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <div className="statistics-content">
          <CircularProgress 
            percentage={statValue} 
            color={color}
            size={200}
            strokeWidth={12}
          />
          {(isPageEditing || text?.value) && (
            <p className="statistics-text">
              <Text field={text} />
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`component component-spaced three-column-cta statistics-variant ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        {(isPageEditing || props.fields?.Title?.value || props.fields?.Subtitle?.value) && (
          <div className="statistics-header">
            {(isPageEditing || props.fields?.Title?.value) && (
              <h2 className="statistics-title">
                <Text field={props.fields.Title} />
              </h2>
            )}
            {(isPageEditing || props.fields?.Subtitle?.value) && (
              <p className="statistics-subtitle">
                <Text field={props.fields.Subtitle} />
              </p>
            )}
          </div>
        )}
        <div className="row statistics-row">
          <StatItem
            statValue={stat1Value}
            text={props.fields.SubText1}
            color="#1BABFF"
            delay={0}
          />
          <StatItem
            statValue={stat2Value}
            text={props.fields.SubText2}
            color="#FFCC07"
            delay={300}
          />
          <StatItem
            statValue={stat3Value}
            text={props.fields.SubText3}
            color="#87169D"
            delay={600}
          />
        </div>
      </div>
    </div>
  );
};
