import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Leaderboard = ({ score, onRestart, onSaveScore, showScoreInput = true }) => {
  const [showNicknameInput, setShowNicknameInput] = useState(showScoreInput);
  const [nickname, setNickname] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async() => {
    try {
        setLoading(true);

        const { data: allScores, error } = await supabase
              .from('score')
              .select('nickname, score')
              .order('score', { ascending: false });

        if (error) {
          console.error('Error loading score:', error);
          return;
        }

        const topScoresByNickname = {};

        allScores.forEach(record => {
          if (!topScoresByNickname[record.nickname] || 
            record.score > topScoresByNickname[record.nickname].score) {
              topScoresByNickname[record.nickname] = {
                nickname: record.nickname,
                score: record.score
              };
            }
        });

        const sortedRanking = Object.values(topScoresByNickname)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map((entry, index) => ({
              ...entry,
              rank: index + 1
            }));

        setLeaderboard(sortedRanking);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('An error occurred while loading leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      alert('Enter your nickname!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('score')
        .insert([
          {
            nickname: nickname.trim(),
            score: score
          }
        ])
        .select();

      if (error) {
          console.error('Error saving score:', error);
          alert('Failed to save score. Please try again.');
          return;
      }

      console.log('Score saved successfully:', data);
      await fetchLeaderboard();
      setShowNicknameInput(false);
      if (onSaveScore) {
      onSaveScore(nickname, score);
    }

    } catch (error) {
      console.error("Error:", error);
      alert('An error occurred while saving the score.');
    }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? '20px 10px' : '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '20px' : '30px',
        padding: isMobile ? '20px' : '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '30px' }}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '42px',
            color: '#667eea',
            margin: '0 0 10px 0',
            fontWeight: 'bold'
          }}>
            🏆 Ranking
          </h1>
          <p style={{ color: '#666', fontSize: isMobile ? '14px' : '16px', margin: 0 }}>
            Something special might happen to our champion?🐹
          </p>
        </div>

        {showScoreInput && showNicknameInput && (
          <div style={{
            background: '#f8f9ff',
            padding: isMobile ? '20px' : '30px',
            borderRadius: isMobile ? '15px' : '20px',
            marginBottom: isMobile ? '20px' : '30px',
            border: '3px solid #667eea'
          }}>
            <h3 style={{
              color: '#667eea',
              margin: '0 0 10px 0',
              fontSize: isMobile ? '20px' : '24px',
              textAlign: 'center'
            }}>
              🎮 Game Over!
            </h3>
            <p style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 'bold',
              color: '#333',
              margin: '10px 0 20px 0',
              textAlign: 'center'
            }}>
              Your Score: {score}
            </p>
            <input
              type="text"
              placeholder="Enter your name..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={12}
              style={{
                width: '100%',
                padding: isMobile ? '12px' : '15px',
                fontSize: isMobile ? '16px' : '18px',
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
                padding: isMobile ? '12px' : '15px',
                fontSize: isMobile ? '16px' : '18px',
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

        <div style={{
          background: '#f8f9ff',
          borderRadius: isMobile ? '15px' : '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '50px 1fr 80px' : '60px 1fr 100px',
            gap: isMobile ? '10px' : '15px',
            padding: isMobile ? '15px 15px' : '20px 25px',
            background: '#667eea',
            color: 'white',
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <div>Ranking</div>
            <div>Name</div>
            <div style={{ textAlign: 'right' }}>Score</div>
          </div>

          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              No scores yet. Be the first! 🎮
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const isNewEntry = entry.nickname === nickname && !showNicknameInput;
              const medalEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';

              return (
                <div
                  key={`${entry.nickname}-${index}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '50px 1fr 80px' : '60px 1fr 100px',
                    gap: isMobile ? '10px' : '15px',
                    padding: isMobile ? '15px 15px' : '20px 25px',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid #e0e0e0' : 'none',
                    background: isNewEntry ? '#fff9e6' : 'white',
                    transition: 'background 0.3s',
                    animation: isNewEntry ? 'highlight 0.5s ease' : 'none'
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    color: entry.rank <= 3 ? '#667eea' : '#666',
                    fontSize: isMobile ? '14px' : '18px'
                  }}>
                    {medalEmoji} {entry.rank}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '14px' : '18px',
                    color: '#333',
                    fontWeight: isNewEntry ? 'bold' : 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {entry.nickname}
                    {isNewEntry && <span style={{ marginLeft: isMobile ? '5px' : '10px', color: '#667eea' }}>✨{isMobile ? '' : ' NEW'}</span>}
                  </div>
                  <div style={{
                    textAlign: 'right',
                    fontSize: isMobile ? '14px' : '18px',
                    fontWeight: 'bold',
                    color: '#667eea'
                  }}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
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