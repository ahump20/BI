// Blaze Sports Intel - Baseball Dashboard Component
// Version: 1.0.0
// Updated: 2025-09-26

import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';

interface PlayerStat {
  name: string;
  position: string;
  avg: number;
  hr: number;
  rbi: number;
  ops: number;
  war: number;
}

interface PitcherStat {
  name: string;
  w: number;
  l: number;
  era: number;
  so: number;
  whip: number;
  ip: number;
}

interface BaseballDashboardProps {
  teamName?: string;
  teamKey?: string;
  showBullpenFatigue?: boolean;
  showChaseRate?: boolean;
  showTTO?: boolean;
}

export const BaseballDashboard: React.FC<BaseballDashboardProps> = ({
  teamName = 'Cardinals',
  teamKey = 'STL',
  showBullpenFatigue = true,
  showChaseRate = true,
  showTTO = true
}) => {
  const [activeTab, setActiveTab] = useState<'hitting' | 'pitching' | 'analytics'>('hitting');
  const [bullpenFatigue, setBullpenFatigue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Mock data - would be replaced with real API calls
  const hitters: PlayerStat[] = [
    { name: 'Goldschmidt', position: '1B', avg: .281, hr: 25, rbi: 80, ops: .821, war: 3.2 },
    { name: 'Arenado', position: '3B', avg: .266, hr: 26, rbi: 93, ops: .764, war: 2.8 },
    { name: 'Contreras', position: 'C', avg: .262, hr: 20, rbi: 67, ops: .796, war: 3.5 }
  ];

  const pitchers: PitcherStat[] = [
    { name: 'Gray', w: 8, l: 9, era: 3.91, so: 203, whip: 1.13, ip: 166.1 },
    { name: 'Fedde', w: 8, l: 9, era: 3.30, so: 154, whip: 1.16, ip: 177.1 },
    { name: 'Pallante', w: 8, l: 6, era: 3.78, so: 78, whip: 1.29, ip: 121.1 }
  ];

  useEffect(() => {
    // Calculate mock bullpen fatigue
    if (showBullpenFatigue) {
      const calculateFatigue = () => {
        const base = Math.random() * 0.4 + 0.3; // 0.3 to 0.7
        setBullpenFatigue(base);
      };
      calculateFatigue();
      const interval = setInterval(calculateFatigue, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [showBullpenFatigue]);

  const getFatigueColor = (value: number) => {
    if (value < 0.4) return colors.semantic.success;
    if (value < 0.7) return colors.semantic.warning;
    return colors.semantic.error;
  };

  return (
    <div className="baseball-dashboard" style={{
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
        borderBottom: `2px solid ${colors.sports.baseball.diamond}`,
        paddingBottom: spacing[4]
      }}>
        <h2 style={{
          fontSize: typography.scale['3xl'],
          fontFamily: typography.fonts.display,
          color: colors.blaze.primary,
          margin: 0
        }}>
          {teamName} Analytics Dashboard
        </h2>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <Button
            variant="baseball"
            size="sm"
            onClick={() => setLoading(!loading)}
            loading={loading}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: spacing[2],
        marginBottom: spacing[6]
      }}>
        {['hitting', 'pitching', 'analytics'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'baseball' : 'ghost'}
            size="md"
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ minHeight: '400px' }}>
        {/* Hitting Tab */}
        {activeTab === 'hitting' && (
          <div>
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.baseball.statFont,
              marginBottom: spacing[4]
            }}>
              Batting Leaders
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: spacing[4]
            }}>
              {hitters.map((player) => (
                <div key={player.name} style={{
                  backgroundColor: colors.primary[800],
                  padding: spacing[4],
                  borderRadius: spacing[2],
                  border: `1px solid ${colors.sports.baseball.diamond}`
                }}>
                  <h4 style={{
                    fontFamily: typography.sportStyles.baseball.scoreFont,
                    fontSize: typography.scale.lg,
                    color: colors.sports.baseball.grass,
                    marginBottom: spacing[2]
                  }}>
                    {player.name} ({player.position})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing[2],
                    fontSize: typography.scale.sm
                  }}>
                    <div>AVG: <strong>{player.avg.toFixed(3)}</strong></div>
                    <div>HR: <strong>{player.hr}</strong></div>
                    <div>RBI: <strong>{player.rbi}</strong></div>
                    <div>OPS: <strong>{player.ops.toFixed(3)}</strong></div>
                    <div>WAR: <strong>{player.war}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitching Tab */}
        {activeTab === 'pitching' && (
          <div>
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.baseball.statFont,
              marginBottom: spacing[4]
            }}>
              Pitching Staff
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: spacing[4]
            }}>
              {pitchers.map((pitcher) => (
                <div key={pitcher.name} style={{
                  backgroundColor: colors.primary[800],
                  padding: spacing[4],
                  borderRadius: spacing[2],
                  border: `1px solid ${colors.sports.baseball.diamond}`
                }}>
                  <h4 style={{
                    fontFamily: typography.sportStyles.baseball.scoreFont,
                    fontSize: typography.scale.lg,
                    color: colors.sports.baseball.warning,
                    marginBottom: spacing[2]
                  }}>
                    {pitcher.name}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing[2],
                    fontSize: typography.scale.sm
                  }}>
                    <div>W-L: <strong>{pitcher.w}-{pitcher.l}</strong></div>
                    <div>ERA: <strong>{pitcher.era.toFixed(2)}</strong></div>
                    <div>SO: <strong>{pitcher.so}</strong></div>
                    <div>WHIP: <strong>{pitcher.whip.toFixed(2)}</strong></div>
                    <div>IP: <strong>{pitcher.ip}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h3 style={{
              fontSize: typography.scale.xl,
              fontFamily: typography.sportStyles.baseball.statFont,
              marginBottom: spacing[4]
            }}>
              Advanced Analytics
            </h3>

            {/* Bullpen Fatigue */}
            {showBullpenFatigue && (
              <div style={{
                backgroundColor: colors.primary[800],
                padding: spacing[6],
                borderRadius: spacing[3],
                marginBottom: spacing[4]
              }}>
                <h4 style={{
                  fontSize: typography.scale.lg,
                  marginBottom: spacing[3],
                  color: colors.sports.baseball.warning
                }}>
                  Bullpen Fatigue Index (3-Day)
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[4]
                }}>
                  <div style={{
                    flex: 1,
                    height: '24px',
                    backgroundColor: colors.primary[700],
                    borderRadius: spacing[2],
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${bullpenFatigue * 100}%`,
                      height: '100%',
                      backgroundColor: getFatigueColor(bullpenFatigue),
                      transition: 'all 0.5s ease'
                    }} />
                  </div>
                  <span style={{
                    fontFamily: typography.fonts.mono,
                    fontSize: typography.scale.xl,
                    fontWeight: 'bold',
                    color: getFatigueColor(bullpenFatigue)
                  }}>
                    {(bullpenFatigue * 100).toFixed(1)}%
                  </span>
                </div>
                <p style={{
                  marginTop: spacing[2],
                  fontSize: typography.scale.sm,
                  color: colors.primary[300]
                }}>
                  Based on recent pitcher usage, back-to-back appearances, and pitch counts
                </p>
              </div>
            )}

            {/* Chase Rate */}
            {showChaseRate && (
              <div style={{
                backgroundColor: colors.primary[800],
                padding: spacing[6],
                borderRadius: spacing[3],
                marginBottom: spacing[4]
              }}>
                <h4 style={{
                  fontSize: typography.scale.lg,
                  marginBottom: spacing[3],
                  color: colors.sports.baseball.grass
                }}>
                  Team Chase Rate Below Zone (30-Day)
                </h4>
                <div style={{
                  fontSize: typography.scale['2xl'],
                  fontFamily: typography.fonts.mono,
                  color: colors.semantic.warning
                }}>
                  27.3%
                </div>
                <p style={{
                  marginTop: spacing[2],
                  fontSize: typography.scale.sm,
                  color: colors.primary[300]
                }}>
                  League Average: 28.5% (Better discipline than average)
                </p>
              </div>
            )}

            {/* Times Through Order */}
            {showTTO && (
              <div style={{
                backgroundColor: colors.primary[800],
                padding: spacing[6],
                borderRadius: spacing[3]
              }}>
                <h4 style={{
                  fontSize: typography.scale.lg,
                  marginBottom: spacing[3],
                  color: colors.sports.baseball.leather
                }}>
                  Times-Through-Order Penalty (2nd→3rd)
                </h4>
                <div style={{
                  fontSize: typography.scale['2xl'],
                  fontFamily: typography.fonts.mono,
                  color: colors.semantic.error
                }}>
                  +.045 wOBA
                </div>
                <p style={{
                  marginTop: spacing[2],
                  fontSize: typography.scale.sm,
                  color: colors.primary[300]
                }}>
                  Performance drops significantly on third time through lineup
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseballDashboard;