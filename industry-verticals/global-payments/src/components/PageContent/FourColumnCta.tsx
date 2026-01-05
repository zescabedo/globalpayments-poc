import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Title1: Field<string>;
  Text1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Title2: Field<string>;
  Text2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Title3: Field<string>;
  Text3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Title4: Field<string>;
  Text4: Field<string>;
  Image4: ImageField;
  Link4: LinkField;
  Stat1?: Field<string>;
  Stat2?: Field<string>;
  Stat3?: Field<string>;
  Stat4?: Field<string>;
  Title?: Field<string>;
  Subtitle?: Field<string>;
}

export type FourColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
    delay,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-3 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <Link field={link}>
          <div className="content-wrapper">
            <NextImage field={image} width={300} height={300} />
            <div className="text-wrapper">
              <h2 className="title-xs">
                <Text field={title} />
              </h2>
              <p className="body-md">
                <Text field={text} />
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced four-column-cta ${sxaStyles}`}
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
            title={props.fields.Title1}
            text={props.fields.Text1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            title={props.fields.Title2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            title={props.fields.Title3}
            text={props.fields.Text3}
            link={props.fields.Link3}
            delay={1000}
          />
          <Column
            image={props.fields.Image4}
            title={props.fields.Title4}
            text={props.fields.Text4}
            link={props.fields.Link4}
            delay={1500}
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
export const Statistics = (props: FourColumnCtaProps): JSX.Element => {
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
  const stat4Value = props.fields?.Stat4?.value 
    ? parseFloat(props.fields.Stat4.value) 
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
        className={`col-sm-12 col-lg-3 statistics-item ${
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
    <div className={`component component-spaced four-column-cta statistics-variant ${sxaStyles}`} id={id ? id : undefined}>
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
            text={props.fields.Text1}
            color="#1BABFF"
            delay={0}
          />
          <StatItem
            statValue={stat2Value}
            text={props.fields.Text2}
            color="#FFCC07"
            delay={300}
          />
          <StatItem
            statValue={stat3Value}
            text={props.fields.Text3}
            color="#87169D"
            delay={600}
          />
          <StatItem
            statValue={stat4Value}
            text={props.fields.Text4}
            color="#FEA152"
            delay={900}
          />
        </div>
      </div>
    </div>
  );
};
