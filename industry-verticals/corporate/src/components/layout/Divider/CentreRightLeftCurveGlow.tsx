import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap/dist/gsap';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { DividerProps } from './Divider.types';
import { Container } from 'react-bootstrap';

gsap.registerPlugin(MotionPathPlugin);

const CentreRightLeftCurveGlow = (props: DividerProps) => {
  const { backgroundColorVariant, topBackgroundColor } = props?.params || {};
  const lineRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);
  const ellipseTwoRef = useRef<SVGPathElement>(null);
  const ellipseThreeRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        strokeDashoffset: pathLength && -pathLength,
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
  }, [hasAnimated]);

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
            className={`stripe-crl-curve-glow bg-${
              topBackgroundColor && JSON.parse(topBackgroundColor)?.Value?.value
            }`}
          />
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
        </div>
      </Container>
    </div>
  );
};

export default CentreRightLeftCurveGlow;
