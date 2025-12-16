import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap/dist/gsap';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { DividerProps } from './Divider.types';
import { Container } from 'react-bootstrap';

gsap.registerPlugin(MotionPathPlugin);

const RightToLeftCurve = (props: DividerProps) => {
  const { backgroundColorVariant, topBackgroundColor } = props?.params || {};
  const lineRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);
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
        strokeDashoffset: pathLength && pathLength,
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
            className={`stripe-rl-curve bg-${
              topBackgroundColor && JSON.parse(topBackgroundColor)?.Value?.value
            }`}
          />
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
        </div>
      </Container>
    </div>
  );
};

export default RightToLeftCurve;
