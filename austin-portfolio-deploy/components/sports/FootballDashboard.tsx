// Blaze Sports Intel - Football Dashboard Component
// Version: 1.0.0
// Updated: 2025-09-26

import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';

interface QBStat {
  name: string;
  comp: number;
  att: number;
  yards: number;
  td: number;
  int: number;
  rating: number;
  pressureToSackRate?: number;
}

interface RushingStat {
  name: string;
  position: string;
  carries: number;
  yards: number;
  avg: number;
  td: number;
  long: number;
}

interface DefensiveStat {
  player: string;
  tackles: number;
  sacks: number;
  int: number;
  ff: number;
  pressures: number;
}

interface FootballDashboardProps {
  teamName?: string;
  teamKey?: string;
  league?: 'NFL' | 'NCAA' | 'HS';
  showPressureAnalytics?: boolean;
  showHiddenYardage?: boolean;
}

export const FootballDashboard: React.FC<FootballDashboardProps> = ({
  teamName = 'Titans',
  teamKey = 'TEN',
  league = 'NFL',
  showPressureAnalytics = true,
  showHiddenYardage = true
}) => {
  const [activeTab, setActiveTab] = useState<'offense' | 'defense' | 'analytics'>('offense');
  const [pressureRate, setPressureRate] = useState<number>(0);
  const [hiddenYardage, setHiddenYardage] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Mock data - would be replaced with real API calls
  const quarterbacks: QBStat[] = [
    { name: 'Levis', comp: 58, att: 99, yards: 660, td: 3, int: 4, rating: 74.4, pressureToSackRate: 0.24 }
  ];

  const rushers: RushingStat[] = [
    { name: 'Pollard', position: 'RB', carries: 180, yards: 752, avg: 4.2, td: 3, long: 26 },
    { name: 'Spears', position: 'RB', carries: 45, yards: 178, avg: 4.0, td: 1, long: 18 }
  ];

  const defenders: DefensiveStat[] = [
    { player: 'Landry', tackles: 45, sacks: 4.5, int: 0, ff: 2, pressures: 28 },
    { player: 'Long Jr.', tackles: 38, sacks: 3, int: 1, ff: 1, pressures: 22 },
    { player: 'Sneed', tackles: 52, sacks: 0, int: 3, ff: 1, pressures: 8 }
  ];

  useEffect(() => {
    // Calculate mock analytics
    if (showPressureAnalytics) {
      setPressureRate(Math.random() * 0.1 + 0.2); // 20-30%
    }
    if (showHiddenYardage) {
      setHiddenYardage(Math.random() * 20 - 10); // -10 to +10
    }
  }, [showPressureAnalytics, showHiddenYardage]);

  const getPressureColor = (rate: number) => {
    if (rate < 0.22) return colors.semantic.success;
    if (rate < 0.28) return colors.semantic.warning;
    return colors.semantic.error;
  };

  return (
    <div className="football-dashboard" style={{
      backgroundColor: colors.primary[900],
      color: colors.primary[50],
      padding: spacing[8],
      borderRadius: spacing[4],
      fontFamily: typography.fonts.body
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[6],
        borderBottom: `2px solid ${colors.sports.football.field}`,
        paddingBottom: spacing[4]
      }}>
        <h2 style={{
          fontSize: typography.scale['3xl'],
          fontFamily: typography.fonts.display,
          color: colors.sports.football.endzone,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: typography.letterSpacing.wide
        }}>
          {teamName} {league} Analytics
        </h2>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <Button
            variant="football"
            size="sm"
            onClick={() => setLoading(!loading)}
            loading={loading}
          >
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: spacing[2],
        marginBottom: spacing[6]
      }}>
        {['offense', 'defense', 'analytics'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'football' : 'outline'}
            size="md"
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ minHeight: '400px' }}>
        {/* Offense Tab */}
        {activeTab === 'offense' && (
          <div>
            {/* QB Stats */}
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.football.statFont,
              marginBottom: spacing[4],
              color: colors.sports.football.hash
            }}>
              Quarterback Performance
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: spacing[4],
              marginBottom: spacing[8]
            }}>
              {quarterbacks.map((qb) => (
                <div key={qb.name} style={{
                  backgroundColor: colors.primary[800],
                  padding: spacing[5],
                  borderRadius: spacing[2],
                  border: `2px solid ${colors.sports.football.field}`,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.3)`
                }}>
                  <h4 style={{
                    fontFamily: typography.sportStyles.football.scoreFont,
                    fontSize: typography.scale['2xl'],
                    color: colors.sports.football.hash,
                    marginBottom: spacing[3],
                    textTransform: 'uppercase'
                  }}>
                    {qb.name}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing[3],
                    fontSize: typography.scale.sm
                  }}>
                    <div>
                      <span style={{ color: colors.primary[400] }}>COMP/ATT</span>
                      <div style={{ fontSize: typography.scale.lg, fontWeight: 'bold' }}>
                        {qb.comp}/{qb.att}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: colors.primary[400] }}>YDS</span>
                      <div style={{ fontSize: typography.scale.lg, fontWeight: 'bold' }}>
                        {qb.yards}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: colors.primary[400] }}>TD/INT</span>
                      <div style={{ fontSize: typography.scale.lg, fontWeight: 'bold' }}>
                        {qb.td}/{qb.int}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: colors.primary[400] }}>RATING</span>
                      <div style={{
                        fontSize: typography.scale.lg,
                        fontWeight: 'bold',
                        color: qb.rating > 90 ? colors.semantic.success : colors.semantic.warning
                      }}>
                        {qb.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rushing Stats */}
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.football.statFont,
              marginBottom: spacing[4],
              color: colors.sports.football.hash
            }}>
              Rushing Attack
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: spacing[4]
            }}>
              {rushers.map((rusher) => (
                <div key={rusher.name} style={{
                  backgroundColor: colors.primary[800],
                  padding: spacing[4],
                  borderRadius: spacing[2],
                  border: `1px solid ${colors.sports.football.pigskin}`
                }}>
                  <h4 style={{
                    fontFamily: typography.sportStyles.football.scoreFont,
                    fontSize: typography.scale.lg,
                    color: colors.sports.football.field,
                    marginBottom: spacing[2]
                  }}>
                    {rusher.name} ({rusher.position})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: spacing[2],
                    fontSize: typography.scale.sm
                  }}>
                    <div>CAR: <strong>{rusher.carries}</strong></div>
                    <div>YDS: <strong>{rusher.yards}</strong></div>
                    <div>AVG: <strong>{rusher.avg.toFixed(1)}</strong></div>
                    <div>TD: <strong>{rusher.td}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Defense Tab */}
        {activeTab === 'defense' && (
          <div>
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.football.statFont,
              marginBottom: spacing[4],
              color: colors.sports.football.endzone
            }}>
              Defensive Leaders
            </h3>
            <div style={{
              backgroundColor: colors.primary[800],
              padding: spacing[4],
              borderRadius: spacing[3],
              overflow: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.sports.football.field}` }}>
                    <th style={{ textAlign: 'left', padding: spacing[2] }}>Player</th>
                    <th style={{ textAlign: 'center', padding: spacing[2] }}>Tackles</th>
                    <th style={{ textAlign: 'center', padding: spacing[2] }}>Sacks</th>
                    <th style={{ textAlign: 'center', padding: spacing[2] }}>INT</th>
                    <th style={{ textAlign: 'center', padding: spacing[2] }}>FF</th>
                    <th style={{ textAlign: 'center', padding: spacing[2] }}>Pressures</th>
                  </tr>
                </thead>
                <tbody>
                  {defenders.map((defender, idx) => (
                    <tr key={defender.player} style={{
                      borderBottom: `1px solid ${colors.primary[700]}`,
                      backgroundColor: idx % 2 ? colors.primary[850] : 'transparent'
                    }}>
                      <td style={{ padding: spacing[2], fontWeight: 'bold' }}>{defender.player}</td>
                      <td style={{ textAlign: 'center', padding: spacing[2] }}>{defender.tackles}</td>
                      <td style={{ textAlign: 'center', padding: spacing[2] }}>{defender.sacks}</td>
                      <td style={{ textAlign: 'center', padding: spacing[2] }}>{defender.int}</td>
                      <td style={{ textAlign: 'center', padding: spacing[2] }}>{defender.ff}</td>
                      <td style={{ textAlign: 'center', padding: spacing[2] }}>{defender.pressures}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.football.statFont,
              marginBottom: spacing[4]
            }}>
              Advanced Metrics
            </h3>

            {/* Pressure to Sack Rate */}
            {showPressureAnalytics && (
              <div style={{
                backgroundColor: colors.primary[800],
                padding: spacing[6],
                borderRadius: spacing[3],
                marginBottom: spacing[4],
                border: `2px solid ${colors.sports.football.field}`
              }}>
                <h4 style={{
                  fontSize: typography.scale.lg,
                  marginBottom: spacing[3],
                  color: colors.sports.football.endzone,
                  textTransform: 'uppercase'
                }}>
                  QB Pressure→Sack Rate (Adjusted, Last 4 Games)
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[4]
                }}>
                  <div style={{
                    flex: 1,
                    height: '32px',
                    backgroundColor: colors.primary[700],
                    borderRadius: spacing[2],
                    overflow: 'hidden',
                    border: `1px solid ${colors.sports.football.hash}`
                  }}>
                    <div style={{
                      width: `${pressureRate * 100}%`,
                      height: '100%',
                      backgroundColor: getPressureColor(pressureRate),
                      transition: 'all 0.5s ease'
                    }} />
                  </div>
                  <span style={{
                    fontFamily: typography.fonts.mono,
                    fontSize: typography.scale['2xl'],
                    fontWeight: 'bold',
                    color: getPressureColor(pressureRate)
                  }}>
                    {(pressureRate * 100).toFixed(1)}%
                  </span>
                </div>
                <p style={{
                  marginTop: spacing[3],
                  fontSize: typography.scale.sm,
                  color: colors.primary[300]
                }}>
                  League Average: 23.5% • Adjusted for opponent pass block win rate
                </p>
              </div>
            )}

            {/* Hidden Yardage */}
            {showHiddenYardage && (
              <div style={{
                backgroundColor: colors.primary[800],
                padding: spacing[6],
                borderRadius: spacing[3],
                border: `2px solid ${colors.sports.football.pigskin}`
              }}>
                <h4 style={{
                  fontSize: typography.scale.lg,
                  marginBottom: spacing[3],
                  color: colors.sports.football.field,
                  textTransform: 'uppercase'
                }}>
                  Hidden Yardage per Drive (5-Game Average)
                </h4>
                <div style={{
                  fontSize: typography.scale['3xl'],
                  fontFamily: typography.sportStyles.football.scoreFont,
                  color: hiddenYardage > 0 ? colors.semantic.success : colors.semantic.error,
                  fontWeight: 'bold'
                }}>
                  {hiddenYardage > 0 ? '+' : ''}{hiddenYardage.toFixed(1)} YDS
                </div>
                <p style={{
                  marginTop: spacing[3],
                  fontSize: typography.scale.sm,
                  color: colors.primary[300]
                }}>
                  Field position advantage from returns, penalties, and starting position
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FootballDashboard;