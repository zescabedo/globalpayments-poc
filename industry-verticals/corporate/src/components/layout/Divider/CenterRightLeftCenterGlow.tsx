import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap/dist/gsap';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { DividerProps } from './Divider.types';
import { Container } from 'react-bootstrap';

gsap.registerPlugin(MotionPathPlugin);

const CenterRightLeftCenterGlow = (props: DividerProps) => {
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
            className={`stripe-crlc-curve-glow bg-${
              topBackgroundColor && JSON.parse(topBackgroundColor)?.Value?.value
            }`}
          />
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
        </div>
      </Container>
    </div>
  );
};

export default CenterRightLeftCenterGlow;
