import React from 'react';

interface ThreeBodyLoaderProps {
  className?: string;
}

export const ThreeBodyLoader: React.FC<ThreeBodyLoaderProps> = ({ className = '' }) => {
  return (
    <>
      <div className={`three-body-loader ${className}`}>
        <div className="three-body-dot dot1"></div>
        <div className="three-body-dot dot2"></div>
        <div className="three-body-dot dot3"></div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .three-body-loader {
            position: relative;
            display: inline-block;
            height: 35px;
            width: 35px;
            animation: spin78236 2s infinite linear;
          }

          .three-body-dot {
            position: absolute;
            height: 100%;
            width: 30%;
          }

          .three-body-dot::after {
            content: '';
            position: absolute;
            height: 0%;
            width: 100%;
            padding-bottom: 100%;
            background-color: #5D3FD3;
            border-radius: 50%;
          }

          .three-body-dot.dot1 {
            bottom: 5%;
            left: 0;
            transform: rotate(60deg);
            transform-origin: 50% 85%;
          }

          .three-body-dot.dot1::after {
            bottom: 0;
            left: 0;
            animation: wobble1 0.8s infinite ease-in-out;
            animation-delay: -0.24s;
          }

          .three-body-dot.dot2 {
            bottom: 5%;
            right: 0;
            transform: rotate(-60deg);
            transform-origin: 50% 85%;
          }

          .three-body-dot.dot2::after {
            bottom: 0;
            left: 0;
            animation: wobble1 0.8s infinite ease-in-out;
            animation-delay: -0.12s;
          }

          .three-body-dot.dot3 {
            bottom: -5%;
            left: 0;
            transform: translateX(116.666%);
          }

          .three-body-dot.dot3::after {
            top: 0;
            left: 0;
            animation: wobble2 0.8s infinite ease-in-out;
          }

          @keyframes spin78236 {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes wobble1 {
            0%, 100% {
              transform: translateY(0%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-66%) scale(0.65);
              opacity: 0.8;
            }
          }

          @keyframes wobble2 {
            0%, 100% {
              transform: translateY(0%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(66%) scale(0.65);
              opacity: 0.8;
            }
          }
        `
      }} />
    </>
  );
};

export default ThreeBodyLoader;