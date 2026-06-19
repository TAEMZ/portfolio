import React, { useState, useEffect, useRef } from 'react';
import './PetCompanion.css';
import { answeredge } from '../answeredgeClient';

const PetCompanion = () => {
  const [mood, setMood] = useState('idle'); 
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const lastMove = useRef(Date.now());
  const messageTimeout = useRef(null);

  const phrases = {
    idle: ["Just chilling.", "Nice portfolio, Abiy.", "Seen anything you like?", "I'm watching you...", "Is it coffee time yet?"],
    excited: ["Ooh, shiny!", "Where we going?", "That looks clickable.", "Click it. I dare you.", "Ooh, go there!"],
    curious: ["What's down there?", "Scrolling for secrets?", "Interesting choice...", "Deep dive, huh?", "Looking for more?"],
    scared: ["HEY! Watch the cursor.", "Ouch! Poking isn't polite.", "I'm fragile, you know!", "Don't make me hide.", "Security!"],
    sleepy: ["Zzz... Oh, you're still here?", "Just resting my eyes.", "Is it 2026 already?", "Five more minutes...", "Bored yet?"],
    happy: ["Looking good!", "Great day to code.", "You have excellent taste.", "Stay awesome.", "I like your style."],
    sad: ["Come back...", "Where'd you go?", "Don't leave!"]
  };

  const triggerMessage = (newMood) => {
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    
    const possiblePhrases = phrases[newMood] || phrases.idle;
    const randomPhrase = possiblePhrases[Math.floor(Math.random() * possiblePhrases.length)];
    
    setMessage(randomPhrase);
    setShowMessage(true);
    
    messageTimeout.current = setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      lastMove.current = Date.now();
      
      // Calculate Eye Tracking
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      setEyePos({ x, y });

      // Detect Fast Movement
      if (Math.abs(x) > 10 || Math.abs(y) > 10) {
        // setMood('confused'); // Optional dizzy state
      }

      // Interaction Moods
      if (mood === 'sleepy') setMood('idle');
      
      // Check for Hovering on buttons/links
      const target = e.target;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        if (mood !== 'excited') {
          setMood('excited');
          triggerMessage('excited');
        }
      } else if (mood !== 'scared' && mood !== 'sad') {
        if (window.scrollY > 100) setMood('curious');
        else setMood('happy');
        
        const timeout = setTimeout(() => {
          if (window.scrollY > 100) setMood('curious');
          else setMood('idle');
        }, 2000);
        return () => clearTimeout(timeout);
      }
    };

    const handleMouseDown = () => {
      setMood('scared');
      triggerMessage('scared');
      setTimeout(() => setMood('idle'), 1000);
    };

    const handleScroll = () => {
      if (window.scrollY > 100) {
        if (mood !== 'curious') {
          setMood('curious');
          triggerMessage('curious');
        }
      } else {
        setMood('idle');
      }
    };

    // Blink Logic
    const blinkInterval = setInterval(() => {
      if (mood !== 'sleepy') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 4000);

    // Sleepy Logic
    const sleepCheck = setInterval(() => {
      if (Date.now() - lastMove.current > 15000) {
        if (mood !== 'sleepy') {
          setMood('sleepy');
          triggerMessage('sleepy');
        }
      }
    }, 5000);

    const handleMouseLeave = () => {
      setMood('sad');
      triggerMessage('sad');
    };

    const handleMouseEnter = () => {
      setMood('happy');
      triggerMessage('happy');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      clearInterval(blinkInterval);
      clearInterval(sleepCheck);
    };
  }, [mood]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`pet-wrapper ${mood}`}>
      <div className="pet-container">
        {showMessage && (
          <div className="pet-speech-bubble">
            {message}
          </div>
        )}
        <svg width="90" height="90" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4a373" />
              <stop offset="100%" stopColor="#bc8a5f" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Body */}
          <circle cx="50" cy="50" r="35" className="pet-body" fill="url(#bodyGradient)" filter="url(#glow)" />
          
          {/* Eyebrows */}
          <g className="eyebrows">
            <rect x="28" y="32" width="18" height="4" rx="2" className="eyebrow left" fill="rgba(255,255,255,0.8)" />
            <rect x="54" y="32" width="18" height="4" rx="2" className="eyebrow right" fill="rgba(255,255,255,0.8)" />
          </g>

          {/* Eyes */}
          {!isBlinking && (
            <g transform={`translate(${eyePos.x}, ${eyePos.y})`}>
              {/* Left Eye */}
              <circle cx="40" cy="48" r={mood === 'excited' ? "9" : "7.5"} fill="white" />
              <circle cx="40" cy="48" r="3.5" fill="#1a252f" transform={`translate(${eyePos.x * 0.4}, ${eyePos.y * 0.4})`} />
              
              {/* Right Eye */}
              <circle cx="60" cy="48" r={mood === 'excited' ? "9" : "7.5"} fill="white" />
              <circle cx="60" cy="48" r="3.5" fill="#1a252f" transform={`translate(${eyePos.x * 0.4}, ${eyePos.y * 0.4})`} />
            </g>
          )}
          {isBlinking && (
            <g>
              <line x1="33" y1="48" x2="47" y2="48" stroke="white" strokeWidth="2" />
              <line x1="53" y1="48" x2="67" y2="48" stroke="white" strokeWidth="2" />
            </g>
          )}

          {/* Mouth */}
          <g className="mouth">
            {mood === 'happy' || mood === 'excited' ? (
              <path d="M 42 65 Q 50 75 58 65" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            ) : mood === 'curious' ? (
              <path d="M 45 68 Q 50 68 55 68" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            ) : mood === 'scared' ? (
              <circle cx="50" cy="70" r="5" fill="white" />
            ) : mood === 'sleepy' ? (
              <path d="M 45 65 Q 50 60 55 65" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            ) : mood === 'sad' ? (
              <path d="M 42 72 Q 50 62 58 72" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <line x1="45" y1="68" x2="55" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default PetCompanion;
