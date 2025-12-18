/**
 * ScrollRevealText - Minimal Test Component
 * 
 * Use this component to test the background-clip text effect in isolation.
 * If this works but ScrollRevealText doesn't, it helps identify the issue.
 * 
 * Usage:
 * Import and use in any page to test:
 * 
 * import { MinimalScrollRevealTest } from 'src/components/NonSitecore/ScrollRevealText.test';
 * 
 * <MinimalScrollRevealTest />
 */

import React, { useState, useEffect, CSSProperties } from 'react';

/**
 * Minimal working example of background-clip text effect
 * This component uses a simple timer to animate the reveal
 * Tests that NO background boxes or blocks appear
 */
export const MinimalScrollRevealTest = (): JSX.Element => {
  const [progress, setProgress] = useState(0);

  // Animate progress from 0 to 1 over 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) return 0; // Reset to loop
        return prev + 0.01;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = progress * 100;

  const style: CSSProperties & {
    MozBackgroundClip?: string;
    MozTextFillColor?: string;
  } = {
    // Text gradient effect
    background: `linear-gradient(to right, #2729FF ${progressPercent}%, #D3D3D3 ${progressPercent}%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    MozBackgroundClip: 'text',
    MozTextFillColor: 'transparent',
    color: 'transparent',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    
    // CRITICAL: Ensure no visible backgrounds
    backgroundColor: 'transparent',  // No solid background color
    boxShadow: 'none',              // No shadows
    border: 'none',                 // No borders
    padding: 0,                     // No padding
    margin: 0,                      // No margin
    
    // Display
    display: 'inline',
    fontSize: '48px',
    fontWeight: 900,
    
    // Isolation
    position: 'relative',
    opacity: 1,
    visibility: 'visible',
  };

  return (
    <div style={{ padding: '100px', textAlign: 'center', backgroundColor: 'white' }}>
      <div style={{ marginBottom: '30px' }}>
        <span style={style}>
          Stay ahead in the fast-paced world of commerce
        </span>
      </div>
      <p style={{ marginTop: '20px', fontSize: '16px' }}>
        Progress: {Math.round(progress * 100)}%
      </p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        ✅ If you see colored text with NO background boxes = WORKING!
        <br />
        ❌ If you see blue/gray rectangular blocks = STILL BROKEN
      </p>
    </div>
  );
};

/**
 * Static test - shows three versions side by side
 * Verifies that NO background boxes appear at any progress level
 */
export const StaticScrollRevealTest = (): JSX.Element => {
  const gradientStyle = (progress: number): CSSProperties & {
    MozBackgroundClip?: string;
    MozTextFillColor?: string;
  } => ({
    // Text gradient effect
    background: `linear-gradient(to right, #2729FF ${progress}%, #D3D3D3 ${progress}%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    MozBackgroundClip: 'text',
    MozTextFillColor: 'transparent',
    color: 'transparent',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    
    // CRITICAL: Ensure no visible backgrounds
    backgroundColor: 'transparent',
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    
    // Display and text
    display: 'inline',
    fontSize: '24px',
    fontWeight: 700,
    
    // Isolation
    position: 'relative',
    opacity: 1,
    visibility: 'visible',
  });

  return (
    <div style={{ padding: '50px', backgroundColor: 'white' }}>
      <h2>Static Background-Clip Text Test (NO Backgrounds Should Appear)</h2>
      
      <div style={{ marginBottom: '30px', padding: '20px' }}>
        <h3>0% Progress (All Gray) - NO gray boxes should appear</h3>
        <span style={gradientStyle(0)}>
          Stay ahead in the fast-paced world
        </span>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px' }}>
        <h3>50% Progress (Half Blue, Half Gray) - NO blue/gray boxes</h3>
        <span style={gradientStyle(50)}>
          Stay ahead in the fast-paced world
        </span>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px' }}>
        <h3>100% Progress (All Blue) - NO blue boxes should appear</h3>
        <span style={gradientStyle(100)}>
          Stay ahead in the fast-paced world
        </span>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h4>Expected Results:</h4>
        <ul>
          <li>✅ Each line should show TEXT only (readable characters)</li>
          <li>✅ 0% = All text gray, NO gray background boxes</li>
          <li>✅ 50% = First half blue text, second half gray text, NO boxes</li>
          <li>✅ 100% = All text blue, NO blue background boxes</li>
          <li>❌ If you see colored rectangular blocks/bars = CSS is broken</li>
          <li>❌ If you see any background boxes at all = Fix needed</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalScrollRevealTest;
