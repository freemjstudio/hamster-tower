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
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const Matter = window.Matter;
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Events = Matter.Events;

    const canvas = canvasRef.current;
    const width = 600;
    const height = 800;

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
      
      const x = 250 + Math.random() * 100; 
      const width = 180 + Math.random() * 40; 
      const height = 50 + Math.random() * 10; 
      const textures = [hamsterGray, hamsterPink, hamsterYellow];
      const randomTexture = textures[Math.floor(Math.random() * textures.length)];

      const hamster = Bodies.rectangle(x, 50, width, height, {
        chamfer: { radius: height / 2 },
        restitution: 0.1, 
        friction: 0.8, 
        frictionAir: 0.02, 
        render: {
          sprite: {
          texture: randomTexture,
          xScale: 0.15,
          yScale: 0.15
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
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            color: '#667eea', 
            marginBottom: '30px',
            fontWeight: 'bold'
          }}>
            Hamster Tower Game 🐹
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#666', 
            marginBottom: '40px' 
          }}>
            Hamster friends are falling down!<br/>
            Help them to be stacked and fall safe!<br/>
          </p>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center'
          }}>
            <button
              onClick={startGame}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '20px 50px',
                fontSize: '24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
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
                padding: '20px 40px',
                fontSize: '24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
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
          
          {/* UI 오버레이 */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '15px 25px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#667eea'
            }}>
              Score {score}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '15px 25px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              fontSize: '24px',
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
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                color: '#667eea', 
                fontSize: '36px', 
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                Game Over!
              </h2>
              <p style={{ 
                fontSize: '24px', 
                marginBottom: '30px', 
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
                  padding: '15px 40px',
                  fontSize: '20px',
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