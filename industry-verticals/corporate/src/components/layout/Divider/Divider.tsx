import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap/dist/gsap';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { DividerProps } from './Divider.types';
import { Container } from 'react-bootstrap';
import { DividerConstants } from '@/constants/appConstants';

gsap.registerPlugin(MotionPathPlugin);

export const Default = (props: DividerProps): JSX.Element => {
  const { backgroundColorVariant, topBackgroundColor } = props?.params || {};
  const lineRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);
  const ellipseTwoRef = useRef<SVGPathElement>(null);
  const ellipseThreeRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { defaultVariant } = DividerConstants;
  const variant = props.variant || defaultVariant;

  const [hasAnimated, sethasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          sethasAnimated(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasAnimated) {
      const pathLength = lineRef.current?.getTotalLength();
      gsap.set(lineRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset:
          pathLength &&
          (variant === 'RightToLeftCurve' || variant === 'RightToLeftCurveGlow'
            ? pathLength
            : -pathLength),
      });

      const animationTimeline = gsap.timeline();
      animationTimeline.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power1.in' }
      );
      animationTimeline.to(lineRef.current, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power1.inOut',
      });
      animationTimeline.fromTo(arrowRef.current, { opacity: 0 }, { opacity: 1 });
      if (variant !== 'RightToLeftCurve') {
        animationTimeline.fromTo(
          [ellipseThreeRef.current, ellipseTwoRef.current],
          { scale: 0, opacity: 1, transformOrigin: 'center center', ease: 'power1.out' },
          {
            scale: 1,
            opacity: 0,
            repeat: 2,
            duration: 1.5,
            transformOrigin: 'center center',
            ease: 'power1.out',
          }
        );
      }
    }
  }, [hasAnimated]);

  const renderSVGContent = () => {
    switch (variant) {
      case 'RightToLeftCurve':
        return (
          <svg
            className="rl-curve"
            width="100%"
            height="100%"
            viewBox="0 0 1320 272"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path ref={arrowRef} d="M278 198L267 218L256 198H278Z" fill="black" />
            <path
              ref={lineRef}
              d="M1165 0V48C1165 74.5097 1143.51 96 1117 96H315C288.49 96 267 117.49 267 144V198"
              stroke="black"
              strokeWidth={2}
            />
          </svg>
        );
      case 'RightToLeftCurveGlow':
        return (
          <svg
            className="rl-curve-glow"
            width="100%"
            height="100%"
            viewBox="0 0 1320 272"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={ellipseThreeRef}
              opacity="0.25"
              d="M266.201 148.029C251.536 148.515 237.554 154.324 226.884 164.363C216.213 174.402 209.587 187.981 208.252 202.548C207.471 211.021 208.508 219.564 211.294 227.607C214.081 235.65 218.552 243.01 224.411 249.198C230.271 255.386 237.384 260.26 245.279 263.495C253.174 266.731 261.669 268.255 270.2 267.965C286.083 267.335 301.072 260.467 311.894 248.861C322.717 237.254 328.495 221.851 327.967 206.013C327.439 190.175 320.648 175.188 309.076 164.324C297.504 153.459 282.091 147.599 266.201 148.021V148.029Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
            />
            <path
              ref={ellipseTwoRef}
              d="M266.441 156.026C253.732 156.447 241.617 161.481 232.373 170.181C223.129 178.882 217.392 190.65 216.242 203.275C215.569 210.618 216.471 218.022 218.889 224.993C221.307 231.963 225.185 238.342 230.266 243.705C235.347 249.068 241.514 253.292 248.358 256.096C255.201 258.9 262.564 260.221 269.957 259.97C283.723 259.424 296.71 253.472 306.085 243.413C315.459 233.353 320.46 220.004 319.996 206.278C319.531 192.552 313.64 179.563 303.606 170.147C293.573 160.731 280.212 155.652 266.441 156.019L266.441 156.026Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
            />
            <path ref={arrowRef} d="M278 198L267 218L256 198H278Z" fill="black" />
            <path
              ref={lineRef}
              d="M1165 0V48C1165 74.5097 1143.51 96 1117 96H315C288.49 96 267 117.49 267 144V198"
              stroke="black"
              strokeWidth={2}
            />
          </svg>
        );
      case 'CenterRightLeftCenterGlow':
        return (
          <svg
            className="crlc-curve-glow"
            width="100%"
            height="100%"
            viewBox="0 0 1320 272"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={ellipseThreeRef}
              opacity="0.25"
              d="M713.201 141.029C698.536 141.515 684.554 147.324 673.884 157.363C663.213 167.402 656.587 180.981 655.252 195.548C654.471 204.021 655.508 212.564 658.294 220.607C661.081 228.65 665.552 236.01 671.411 242.198C677.271 248.386 684.384 253.26 692.279 256.495C700.174 259.731 708.669 261.255 717.2 260.965C733.083 260.335 748.072 253.467 758.894 241.861C769.717 230.254 775.495 214.851 774.967 199.013C774.439 183.175 767.648 168.188 756.076 157.324C744.504 146.459 729.091 140.599 713.201 141.021V141.029Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
            />
            <path
              ref={ellipseTwoRef}
              d="M713.441 149.026C700.732 149.447 688.617 154.481 679.373 163.181C670.129 171.882 664.392 183.65 663.242 196.275C662.569 203.618 663.471 211.022 665.889 217.993C668.307 224.963 672.185 231.342 677.266 236.705C682.347 242.068 688.514 246.292 695.358 249.096C702.201 251.9 709.564 253.221 716.957 252.97C730.723 252.424 743.71 246.472 753.085 236.413C762.459 226.353 767.46 213.004 766.996 199.278C766.531 185.552 760.64 172.563 750.606 163.147C740.573 153.731 727.212 148.652 713.441 149.019L713.441 149.026Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
            />
            <path ref={arrowRef} d="M726 195L715 215L704 195H726Z" fill="black" />
            <path
              ref={lineRef}
              d="M715 201.5V188.234C715 161.633 693.367 140.105 666.766 140.235L509.653 141H225V103C225 76.4903 246.49 55 273 55H1271C1297.51 55 1319 33.5097 1319 7V1H672"
              stroke="black"
              strokeWidth={2}
            />
          </svg>
        );
      default:
        return (
          <svg
            className="crl-curve-glow"
            width="100%"
            height="100%"
            viewBox="0 0 1320 272"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={ellipseThreeRef}
              opacity="0.25"
              d="M75.2006 145.029C60.5361 145.515 46.5545 151.324 35.8835 161.363C25.2126 171.402 18.5871 184.981 17.2523 199.548C16.4713 208.021 17.5083 216.564 20.2944 224.607C23.0805 232.65 27.5519 240.01 33.4114 246.198C39.2709 252.386 46.3844 257.26 54.279 260.495C62.1737 263.731 70.6688 265.255 79.1997 264.965C95.0832 264.335 110.072 257.467 120.894 245.861C131.717 234.254 137.495 218.851 136.967 203.013C136.439 187.175 129.648 172.188 118.076 161.324C106.504 150.459 91.091 144.599 75.2006 145.021V145.029Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
            />
            <path
              ref={ellipseTwoRef}
              d="M75.4406 153.026C62.7315 153.447 50.6166 158.481 41.3727 167.181C32.1288 175.882 26.3925 187.65 25.2418 200.275C24.5686 207.618 25.471 215.022 27.889 221.993C30.307 228.963 34.1854 235.342 39.2662 240.705C44.3471 246.068 50.5142 250.292 57.3576 253.096C64.201 255.9 71.564 257.221 78.9574 256.97C92.7228 256.424 105.71 250.472 115.085 240.413C124.459 230.353 129.46 217.004 128.996 203.278C128.531 189.552 122.64 176.563 112.606 167.147C102.573 157.731 89.2121 152.652 75.4406 153.019L75.4406 153.026Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
            />
            <path ref={arrowRef} d="M87 199L76 219L65 199H87Z" fill="black" />
            <path
              ref={lineRef}
              d="M76 200.289V136C76 109.49 97.4903 88 124 88H1047C1073.51 88 1095 66.5097 1095 40V1H672"
              stroke="black"
              strokeWidth={2}
            />
          </svg>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`dividers bg-${
        backgroundColorVariant && JSON.parse(backgroundColorVariant)?.Value?.value
      }`}
    >
      <Container>
        <div className="divider">
          <div
            className={`stripe-${variant.toLowerCase()} bg-${
              topBackgroundColor && JSON.parse(topBackgroundColor)?.Value?.value
            }`}
          />
          {renderSVGContent()}
        </div>
      </Container>
    </div>
  );
};

export const CentreRightLeftCurveGlow = (props: DividerProps): JSX.Element => {
  return <Default {...props} variant="CentreRightLeftCurveGlow" />;
};

export const RightToLeftCurveGlow = (props: DividerProps): JSX.Element => {
  return <Default {...props} variant="RightToLeftCurveGlow" />;
};

export const RightToLeftCurve = (props: DividerProps): JSX.Element => {
  return <Default {...props} variant="RightToLeftCurve" />;
};

export const CenterRightLeftCenterGlow = (props: DividerProps): JSX.Element => {
  return <Default {...props} variant="CenterRightLeftCenterGlow" />;
};
