import React, { useState } from 'react';

const Leaderboard = ({ score, onRestart, onSaveScore, showScoreInput = true }) => {
  const [showNicknameInput, setShowNicknameInput] = useState(showScoreInput);
  const [nickname, setNickname] = useState('');
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, nickname: '줄줄이', score: 1000 },
    { rank: 2, nickname: '민허', score: 500 },
    { rank: 3, nickname: '민지민지민지', score: 300 },
  ]);

  const handleSubmit = () => {
    if (!nickname.trim()) {
      alert('Enter your nickname!');
      return;
    }

    const newEntry = {
      rank: 0,
      nickname: nickname,
      score: score
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setLeaderboard(updatedLeaderboard);
    setShowNicknameInput(false);

    if (onSaveScore) {
      onSaveScore(nickname, score);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '30px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '42px',
            color: '#667eea',
            margin: '0 0 10px 0',
            fontWeight: 'bold'
          }}>
            🏆 Hamster Tower Ranking
          </h1>
          <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
            Something special might happen to our champion...? 🐹
          </p>
        </div>

        {showScoreInput && showNicknameInput && (
          <div style={{
            background: '#f8f9ff',
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '30px',
            border: '3px solid #667eea'
          }}>
            <h3 style={{
              color: '#667eea',
              margin: '0 0 10px 0',
              fontSize: '24px'
            }}>
              🎮 Game Over!
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
              margin: '10px 0 20px 0'
            }}>
              Your Score: {score}
            </p>
            <input
              type="text"
              placeholder="Enter your name..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={12}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                marginBottom: '15px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '15px',
                fontSize: '18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Enter
            </button>
          </div>
        )}

        {/* 리더보드 테이블 */}
        <div style={{
          background: '#f8f9ff',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px',
            gap: '15px',
            padding: '20px 25px',
            background: '#667eea',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            <div>Ranking</div>
            <div>Name</div>
            <div style={{ textAlign: 'right' }}>Score</div>
          </div>

          {leaderboard.map((entry, index) => {
            const isNewEntry = entry.nickname === nickname && !showNicknameInput;
            const medalEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';

            return (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px',
                  gap: '15px',
                  padding: '20px 25px',
                  borderBottom: index < leaderboard.length - 1 ? '1px solid #e0e0e0' : 'none',
                  background: isNewEntry ? '#fff9e6' : 'white',
                  transition: 'background 0.3s',
                  animation: isNewEntry ? 'highlight 0.5s ease' : 'none'
                }}
              >
                <div style={{
                  fontWeight: 'bold',
                  color: entry.rank <= 3 ? '#667eea' : '#666',
                  fontSize: '18px'
                }}>
                  {medalEmoji} {entry.rank}
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: isNewEntry ? 'bold' : 'normal'
                }}>
                  {entry.nickname}
                  {isNewEntry && <span style={{ marginLeft: '10px', color: '#667eea' }}>✨ NEW</span>}
                </div>
                <div style={{
                  textAlign: 'right',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#667eea'
                }}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onRestart}
          style={{
            width: '100%',
            marginTop: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px',
            fontSize: '18px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {showScoreInput ? '🐹 Play Again' : '🎮 Start Game'}
        </button>
      </div>

      <style>{`
        @keyframes highlight {
          0%, 100% { background: white; }
          50% { background: #fff9e6; }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;