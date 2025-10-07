import React, { useState, useEffect, useRef } from 'react';
import hamsterGray from '../assets/hamster_gray.png';
import hamsterPink from '../assets/hamster_pink.png';
import hamsterYellow from '../assets/hamster_yellow.png';
import Leaderboard from './Leaderboard';

const HamsterGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [hamsterCount, setHamsterCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const hamstersRef = useRef([]);
  const currentHamsterRef = useRef(null); 
  const keysPressed = useRef({ left: false, right: false, down: false});
  const gameOverRef = useRef(false);
  const dropIntervalRef = useRef(null);
  const [isFromGame, setIsFromGame] = useState(false); 

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => {
        setIsFromGame(true);
        setShowLeaderboard(true);
      }, 4000)
    }
  }, [gameOver]);

    const showLeaderboardOnly = () => {
      setIsFromGame(false);
      setShowLeaderboard(true);
  };

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        keysPressed.current.left = true;
      } else if (e.key === 'ArrowRight') {
        keysPressed.current.right = true;
      } else if (e.key === 'ArrowDown' || e.key === ' ' ||  e.key === 'Spacebar') {
        keysPressed.current.down = true;
      }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'ArrowLeft') {
          keysPressed.current.left = false;
        } else if (e.key === 'ArrowRight') {
          keysPressed.current.right = false;
        } else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Spacebar') {
          keysPressed.current.down = false;
        }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const canvasWidth = rect.width;

      if (touchX < canvasWidth / 2) {
        keysPressed.current.left = true;
      } else {
        keysPressed.current.right = true;
      }
      keysPressed.current.down = true;
    };

    const handleTouchEnd = () => {
      keysPressed.current.left = false;
      keysPressed.current.right = false;
      keysPressed.current.down = false;
    };

    const Matter = window.Matter;
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Events = Matter.Events;

    const canvas = canvasRef.current;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    const isMobile = window.innerWidth < 768;
    const width = isMobile ? Math.min(window.innerWidth - 40, 400) : 600;
    const height = isMobile ? Math.min(window.innerHeight - 100, 600) : 800;

    const engine = Engine.create();
    engine.gravity.y = 0.5; 
    engineRef.current = engine;

    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#f0f0f0'
      }
    });
    renderRef.current = render;

    const ground = Bodies.rectangle(width / 2, height - 10, width, 20, {
      isStatic: true,
      render: { fillStyle: '#667eea' }
    });
    
    const leftWall = Bodies.rectangle(10, height / 2, 20, height, {
      isStatic: true,
      render: { fillStyle: '#667eea' }
    });

    const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, {
      isStatic: true,
      render: { fillStyle: '#667eea' }
    });

    World.add(engine.world, [ground, leftWall, rightWall]);

    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let pair of pairs) {
        if ((pair.bodyA === ground && pair.bodyB.label === 'hamster') ||
            (pair.bodyB === ground && pair.bodyA.label === 'hamster')) {

          const hamster = pair.bodyA.label === 'hamster' ? pair.bodyA : pair.bodyB;

          if (hamstersRef.current[0] !== hamster) {
            gameOverRef.current = true;
            if (dropIntervalRef.current) {
              clearInterval(dropIntervalRef.current);
            }
            setGameOver(true);
            Matter.Runner.stop(engineRef.current);
          }
        }
        if (pair.bodyA.label === 'hamster' && pair.bodyB.label === 'hamster') {
          const hamsterA = pair.bodyA;
          const hamsterB = pair.bodyB;

          if (!hamsterA.scored || !hamsterB.scored) {
            hamsterA.scored = true;
            hamsterB.scored = true;
            setScore(prev => prev + 100);
          }
        }
      }
    });

    Events.on(engine, 'beforeUpdate', () => {
      if (!currentHamsterRef.current) return;

      const currentHamster = currentHamsterRef.current;
      const horizontalForce = 0.002;
      const fastFallForce = 0.005;

      if (keysPressed.current.left) Matter.Body.applyForce(currentHamster, currentHamster.position, { x: -horizontalForce, y: 0 });
      if (keysPressed.current.right) Matter.Body.applyForce(currentHamster, currentHamster.position, { x: horizontalForce, y: 0 });
      if (keysPressed.current.down) Matter.Body.applyForce(currentHamster, currentHamster.position, { x: 0, y: fastFallForce });
      
      if (currentHamster.position.y > height - 100) currentHamsterRef.current = null; 
  
    })

    Matter.Runner.run(engine);
    Render.run(render);

    dropIntervalRef.current = setInterval(() => {
      if (gameOverRef.current) return;
      if (!engineRef.current) return;

      const centerX = width / 2;
      const rangeX = width * 0.15;
      const x = centerX - rangeX + Math.random() * (rangeX * 2);

      const hamsterWidth = 180 + Math.random() * 40;
      const hamsterHeight = 50 + Math.random() * 10;
      const textures = [hamsterGray, hamsterPink, hamsterYellow];
      const randomTexture = textures[Math.floor(Math.random() * textures.length)];

      const hamster = Bodies.rectangle(x, 50, hamsterWidth, hamsterHeight, {
        chamfer: { radius: hamsterHeight / 2 },
        restitution: 0.1,
        friction: 0.8,
        frictionAir: 0.02,
        render: {
          sprite: {
          texture: randomTexture,
          xScale: 0.1,
          yScale: 0.1
          }
        }
      });

      hamster.label = 'hamster';
      World.add(engineRef.current.world, hamster);
      hamstersRef.current.push(hamster);
      currentHamsterRef.current = hamster;

      setHamsterCount(prev => prev + 1);
    }, 1700); 

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }

      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
    };
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setHamsterCount(0);
    setGameOver(false);
    setShowLeaderboard(false);
    gameOverRef.current = false;
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setShowLeaderboard(false);
    setScore(0);
    setHamsterCount(0);
    hamstersRef.current = [];
    gameOverRef.current = false;
    currentHamsterRef.current = null; 
    keysPressed.current = { left: false, right: false, space: false };  
    
    setTimeout(() => {
      setGameStarted(true);
    }, 100);
  };

  const handleRestart = () => {
    setIsFromGame(false);
    restartGame();
  };

  const handleSaveScore = (nickname, score) => {
    console.log('Save Score:', nickname, score);
  };

  if (showLeaderboard) {
    return (
      <Leaderboard 
        score={score} 
        onRestart={handleRestart}
        onSaveScore={handleSaveScore}
        showScoreInput={isFromGame}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {!gameStarted && !gameOver && (
        <div className="start-screen" style={{
          background: 'white',
          padding: window.innerWidth < 768 ? '30px 20px' : '60px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: '90%',
          margin: '20px'
        }}>
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '32px' : '48px',
            color: '#667eea',
            marginBottom: window.innerWidth < 768 ? '15px' : '30px',
            fontWeight: 'bold'
          }}>
            Hamster Tower Game 🐹
          </h1>
          <p style={{
            fontSize: window.innerWidth < 768 ? '16px' : '20px',
            color: '#666',
            marginBottom: window.innerWidth < 768 ? '25px' : '40px'
          }}>
            Hamster friends are falling down!<br/>
            Help them to be stacked and fall safe!<br/>
          </p>

          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: window.innerWidth < 768 ? '12px' : '20px',
            justifyContent: 'center'
          }}>
            <button
              onClick={startGame}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: window.innerWidth < 768 ? '15px 30px' : '20px 50px',
                fontSize: window.innerWidth < 768 ? '18px' : '24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                width: window.innerWidth < 768 ? '100%' : 'auto'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎮 Game Start
            </button>

            <button
              onClick={showLeaderboardOnly}
              style={{
                background: 'white',
                color: '#667eea',
                border: '3px solid #667eea',
                padding: window.innerWidth < 768 ? '15px 30px' : '20px 40px',
                fontSize: window.innerWidth < 768 ? '18px' : '24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                width: window.innerWidth < 768 ? '100%' : 'auto'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
              }}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <div style={{ position: 'relative' }}>
          <canvas 
            ref={canvasRef}
            style={{
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          />
          
          <div style={{
            position: 'absolute',
            top: window.innerWidth < 768 ? '10px' : '20px',
            left: window.innerWidth < 768 ? '10px' : '20px',
            right: window.innerWidth < 768 ? '10px' : '20px',
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: window.innerWidth < 768 ? '10px 15px' : '15px 25px',
              borderRadius: window.innerWidth < 768 ? '10px' : '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              fontSize: window.innerWidth < 768 ? '16px' : '24px',
              fontWeight: 'bold',
              color: '#667eea'
            }}>
              Score {score}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: window.innerWidth < 768 ? '10px 15px' : '15px 25px',
              borderRadius: window.innerWidth < 768 ? '10px' : '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              fontSize: window.innerWidth < 768 ? '16px' : '24px',
              fontWeight: 'bold',
              color: '#667eea'
            }}>
              🐹 {hamsterCount}
            </div>
          </div>

          {gameOver && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: window.innerWidth < 768 ? '25px 20px' : '40px',
              borderRadius: window.innerWidth < 768 ? '15px' : '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              textAlign: 'center',
              width: window.innerWidth < 768 ? '80%' : 'auto',
              maxWidth: window.innerWidth < 768 ? '300px' : 'none'
            }}>
              <h2 style={{
                color: '#667eea',
                fontSize: window.innerWidth < 768 ? '28px' : '36px',
                marginBottom: window.innerWidth < 768 ? '15px' : '20px',
                fontWeight: 'bold'
              }}>
                Game Over!
              </h2>
              <p style={{
                fontSize: window.innerWidth < 768 ? '20px' : '24px',
                marginBottom: window.innerWidth < 768 ? '20px' : '30px',
                color: '#333'
              }}>
                Your Score: {score}
              </p>
              <button
                onClick={restartGame}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: window.innerWidth < 768 ? '12px 30px' : '15px 40px',
                  fontSize: window.innerWidth < 768 ? '16px' : '20px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HamsterGame;