import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap/dist/gsap';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { DividerProps } from './Divider.types';
import { Container } from 'react-bootstrap';

gsap.registerPlugin(MotionPathPlugin);

const RightToLeftCurveGlow = (props: DividerProps) => {
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
            className={`stripe-rl-curve-glow bg-${
              topBackgroundColor && JSON.parse(topBackgroundColor)?.Value?.value
            }`}
          />
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
              data-svg-origin="267.99996185302734 207.99974822998047"
              transform="matrix(1,0,0,1,0,0)"
            />
            <path
              ref={ellipseTwoRef}
              d="M266.441 156.026C253.732 156.447 241.617 161.481 232.373 170.181C223.129 178.882 217.392 190.65 216.242 203.275C215.569 210.618 216.471 218.022 218.889 224.993C221.307 231.963 225.185 238.342 230.266 243.705C235.347 249.068 241.514 253.292 248.358 256.096C255.201 258.9 262.564 260.221 269.957 259.97C283.723 259.424 296.71 253.472 306.085 243.413C315.459 233.353 320.46 220.004 319.996 206.278C319.531 192.552 313.64 179.563 303.606 170.147C293.573 160.731 280.212 155.652 266.441 156.019L266.441 156.026Z"
              stroke="#07F285"
              strokeWidth={2}
              strokeMiterlimit="10"
              data-svg-origin="268.0256881713867 208.00025177001953"
              transform="matrix(1,0,0,1,0,0)"
            />
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

export default RightToLeftCurveGlow;
