import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSportsData } from '../hooks/useSportsData';
import AnalyticsChart from '../components/AnalyticsChart';

const BlazeScout = () => {
  const { getTeamAnalytics, getPlayerStats, getLiveScores } = useSportsData();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedSport, setSelectedSport] = useState('all');
  const [scoutingData, setScoutingData] = useState({
    prospects: [],
    teams: [],
    analytics: null,
    loading: true
  });

  useEffect(() => {
    loadScoutingData();
  }, [selectedSport]);

  const loadScoutingData = async () => {
    setScoutingData(prev => ({ ...prev, loading: true }));

    try {
      // Mock scouting data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = {
        prospects: [
          {
            id: 1,
            name: 'Quinn Ewers',
            position: 'QB',
            school: 'Texas',
            year: 'Junior',
            rating: 95,
            height: '6\'3"',
            weight: '215',
            armStrength: 94,
            accuracy: 91,
            mobility: 82,
            stats: {
              completionPct: 68.5,
              passingYards: 1289,
              touchdowns: 12,
              interceptions: 3
            }
          },
          {
            id: 2,
            name: 'Arch Manning',
            position: 'QB',
            school: 'Texas',
            year: 'Redshirt Freshman',
            rating: 98,
            height: '6\'4"',
            weight: '215',
            armStrength: 97,
            accuracy: 95,
            mobility: 85,
            stats: {
              completionPct: 75.0,
              passingYards: 456,
              touchdowns: 4,
              interceptions: 0
            }
          },
          {
            id: 3,
            name: 'Will Levis',
            position: 'QB',
            school: 'Tennessee Titans',
            year: 'Pro',
            rating: 78,
            height: '6\'3"',
            weight: '229',
            armStrength: 89,
            accuracy: 74,
            mobility: 76,
            stats: {
              completionPct: 58.2,
              passingYards: 1023,
              touchdowns: 6,
              interceptions: 8
            }
          }
        ],
        teams: [
          {
            name: 'Texas Longhorns',
            sport: 'College Football',
            record: '4-0',
            ranking: 3,
            strengthOfSchedule: 'Medium',
            keyPlayers: ['Quinn Ewers', 'Jonathon Brooks', 'T\'Vondre Sweat'],
            upcomingGames: ['vs Mississippi State', 'vs Oklahoma']
          },
          {
            name: 'Tennessee Titans',
            sport: 'NFL',
            record: '1-3',
            ranking: 30,
            strengthOfSchedule: 'Hard',
            keyPlayers: ['Will Levis', 'Derrick Henry', 'Jeffery Simmons'],
            upcomingGames: ['vs Dolphins', 'vs Colts']
          },
          {
            name: 'St. Louis Cardinals',
            sport: 'MLB',
            record: '83-79',
            ranking: 12,
            strengthOfSchedule: 'Medium',
            keyPlayers: ['Nolan Arenado', 'Paul Goldschmidt', 'Jordan Walker'],
            upcomingGames: ['vs Brewers', 'vs Cubs']
          }
        ],
        analytics: {
          prospectTrends: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
              label: 'Average Prospect Rating',
              data: [89, 91, 88, 92],
              borderColor: '#BF5700',
              backgroundColor: 'rgba(191, 87, 0, 0.1)',
              tension: 0.4
            }]
          },
          positionBreakdown: {
            labels: ['QB', 'RB', 'WR', 'OL', 'DL', 'LB', 'DB'],
            datasets: [{
              data: [12, 25, 45, 32, 38, 28, 41],
              backgroundColor: [
                '#BF5700',
                '#9E1B32',
                '#003087',
                '#461D7C',
                '#BA0C2F',
                '#FF8200',
                '#14213D'
              ]
            }]
          }
        },
        loading: false
      };

      setScoutingData(mockData);
    } catch (error) {
      console.error('Error loading scouting data:', error);
      setScoutingData(prev => ({ ...prev, loading: false }));
    }
  };

  const renderProspectCard = (prospect) => (
    <motion.div
      key={prospect.id}
      className="prospect-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="prospect-header">
        <div className="prospect-info">
          <h3>{prospect.name}</h3>
          <p className="prospect-position">{prospect.position} • {prospect.school}</p>
          <p className="prospect-year">{prospect.year}</p>
        </div>
        <div className="prospect-rating">
          <div className="rating-circle">
            {prospect.rating}
          </div>
        </div>
      </div>

      <div className="prospect-measurements">
        <div className="measurement">
          <span className="label">Height</span>
          <span className="value">{prospect.height}</span>
        </div>
        <div className="measurement">
          <span className="label">Weight</span>
          <span className="value">{prospect.weight}</span>
        </div>
      </div>

      <div className="prospect-attributes">
        <div className="attribute">
          <span className="attr-label">Arm Strength</span>
          <div className="attr-bar">
            <div
              className="attr-fill"
              style={{ width: `${prospect.armStrength}%` }}
            ></div>
          </div>
          <span className="attr-value">{prospect.armStrength}</span>
        </div>
        <div className="attribute">
          <span className="attr-label">Accuracy</span>
          <div className="attr-bar">
            <div
              className="attr-fill"
              style={{ width: `${prospect.accuracy}%` }}
            ></div>
          </div>
          <span className="attr-value">{prospect.accuracy}</span>
        </div>
        <div className="attribute">
          <span className="attr-label">Mobility</span>
          <div className="attr-bar">
            <div
              className="attr-fill"
              style={{ width: `${prospect.mobility}%` }}
            ></div>
          </div>
          <span className="attr-value">{prospect.mobility}</span>
        </div>
      </div>

      <div className="prospect-stats">
        <h4>Current Stats</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Comp %</span>
            <span className="stat-value">{prospect.stats.completionPct}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Yards</span>
            <span className="stat-value">{prospect.stats.passingYards}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">TDs</span>
            <span className="stat-value">{prospect.stats.touchdowns}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">INTs</span>
            <span className="stat-value">{prospect.stats.interceptions}</span>
          </div>
        </div>
      </div>

      <button className="prospect-action">
        <i className="fas fa-clipboard-list"></i>
        Generate Full Report
      </button>
    </motion.div>
  );

  return (
    <div className="blazescout-page">
      <div className="blazescout-header">
        <div className="header-content">
          <motion.div
            className="header-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1><i className="fas fa-search-location"></i> BlazeScout</h1>
            <p>Advanced Scouting & Intelligence Platform</p>
          </motion.div>

          <div className="header-controls">
            <div className="sport-selector">
              <label>Sport Filter:</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
              >
                <option value="all">All Sports</option>
                <option value="football">Football</option>
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
              </select>
            </div>
            <button className="refresh-data" onClick={loadScoutingData}>
              <i className="fas fa-sync-alt"></i>
              Refresh Data
            </button>
          </div>
        </div>

        <div className="section-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
            { id: 'prospects', label: 'Prospects', icon: 'fa-users' },
            { id: 'teams', label: 'Teams', icon: 'fa-shield-alt' },
            { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar' },
            { id: 'reports', label: 'Reports', icon: 'fa-file-alt' }
          ].map(section => (
            <button
              key={section.id}
              className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={`fas ${section.icon}`}></i>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="blazescout-content">
        {scoutingData.loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading scouting intelligence...</p>
          </div>
        ) : (
          <>
            {activeSection === 'dashboard' && (
              <motion.div
                className="dashboard-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="dashboard-overview">
                  <div className="overview-cards">
                    <div className="overview-card">
                      <i className="fas fa-users"></i>
                      <div className="card-content">
                        <h3>Active Prospects</h3>
                        <p className="card-value">{scoutingData.prospects?.length || 0}</p>
                      </div>
                    </div>
                    <div className="overview-card">
                      <i className="fas fa-trophy"></i>
                      <div className="card-content">
                        <h3>Top Rated</h3>
                        <p className="card-value">98</p>
                      </div>
                    </div>
                    <div className="overview-card">
                      <i className="fas fa-chart-line"></i>
                      <div className="card-content">
                        <h3>Avg Rating</h3>
                        <p className="card-value">91.2</p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-charts">
                    <div className="chart-container">
                      <h3>Prospect Trends</h3>
                      <AnalyticsChart
                        type="line"
                        data={scoutingData.analytics?.prospectTrends}
                        height={300}
                      />
                    </div>
                    <div className="chart-container">
                      <h3>Position Distribution</h3>
                      <AnalyticsChart
                        type="doughnut"
                        data={scoutingData.analytics?.positionBreakdown}
                        height={300}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'prospects' && (
              <motion.div
                className="prospects-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="section-header">
                  <h2>Prospect Database</h2>
                  <p>Comprehensive scouting reports and player evaluations</p>
                </div>

                <div className="prospects-grid">
                  {scoutingData.prospects?.map(renderProspectCard)}
                </div>
              </motion.div>
            )}

            {activeSection === 'teams' && (
              <motion.div
                className="teams-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="section-header">
                  <h2>Team Intelligence Center</h2>
                  <p>Comprehensive team analysis and competitive intelligence</p>
                </div>

                <div className="teams-grid">
                  {scoutingData.teams?.map((team, index) => (
                    <motion.div
                      key={index}
                      className="team-card"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="team-header">
                        <div className="team-info">
                          <h3>{team.name}</h3>
                          <p className="team-sport">{team.sport}</p>
                          <p className="team-record">Record: {team.record}</p>
                        </div>
                        <div className="team-ranking">
                          <span className="ranking-label">Rank</span>
                          <span className="ranking-value">#{team.ranking}</span>
                        </div>
                      </div>

                      <div className="team-metrics">
                        <div className="metric">
                          <span className="metric-label">Strength of Schedule</span>
                          <span className={`metric-value ${team.strengthOfSchedule.toLowerCase()}`}>
                            {team.strengthOfSchedule}
                          </span>
                        </div>
                      </div>

                      <div className="key-players">
                        <h4>Key Players</h4>
                        <div className="players-list">
                          {team.keyPlayers?.map((player, i) => (
                            <span key={i} className="player-tag">{player}</span>
                          ))}
                        </div>
                      </div>

                      <div className="upcoming-games">
                        <h4>Upcoming Games</h4>
                        <div className="games-list">
                          {team.upcomingGames?.map((game, i) => (
                            <div key={i} className="game-item">{game}</div>
                          ))}
                        </div>
                      </div>

                      <button className="team-action">
                        <i className="fas fa-analytics"></i>
                        Full Team Analysis
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === 'analytics' && (
              <motion.div
                className="analytics-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="analytics-dashboard">
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <h3>Performance Metrics</h3>
                      <AnalyticsChart
                        type="radar"
                        data={{
                          labels: ['Arm Strength', 'Accuracy', 'Mobility', 'Leadership', 'Field Vision', 'Pocket Presence'],
                          datasets: [{
                            label: 'Quinn Ewers',
                            data: [94, 91, 82, 88, 85, 89],
                            borderColor: '#BF5700',
                            backgroundColor: 'rgba(191, 87, 0, 0.2)'
                          }]
                        }}
                        height={350}
                      />
                    </div>
                    <div className="analytics-card">
                      <h3>Player Comparison Matrix</h3>
                      <div className="comparison-matrix">
                        <div className="matrix-header">
                          <span>Player</span>
                          <span>Rating</span>
                          <span>Comp %</span>
                          <span>TD/INT</span>
                          <span>Grade</span>
                        </div>
                        {scoutingData.prospects?.slice(0, 3).map(player => (
                          <div key={player.id} className="matrix-row">
                            <span className="player-name">{player.name}</span>
                            <span className="rating-badge">{player.rating}</span>
                            <span className="stat-value">{player.stats.completionPct}%</span>
                            <span className="stat-value">{player.stats.touchdowns}/{player.stats.interceptions}</span>
                            <span className={`grade ${player.rating >= 95 ? 'elite' : player.rating >= 85 ? 'high' : 'solid'}`}>
                              {player.rating >= 95 ? 'Elite' : player.rating >= 85 ? 'High' : 'Solid'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="analytics-card">
                      <h3>Draft Projection Model</h3>
                      <div className="draft-projections">
                        <div className="projection-item">
                          <div className="projection-player">
                            <span className="player-name">Arch Manning</span>
                            <span className="player-pos">QB - Texas</span>
                          </div>
                          <div className="projection-details">
                            <span className="draft-round">Round 1</span>
                            <span className="draft-pick">Pick 3-7</span>
                            <span className="confidence">92% confidence</span>
                          </div>
                        </div>
                        <div className="projection-item">
                          <div className="projection-player">
                            <span className="player-name">Quinn Ewers</span>
                            <span className="player-pos">QB - Texas</span>
                          </div>
                          <div className="projection-details">
                            <span className="draft-round">Round 2</span>
                            <span className="draft-pick">Pick 15-25</span>
                            <span className="confidence">78% confidence</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="analytics-card">
                      <h3>Video Analysis Hub</h3>
                      <div className="video-analysis">
                        <div className="analysis-feature">
                          <i className="fas fa-video"></i>
                          <div className="feature-content">
                            <h4>AI-Powered Breakdown</h4>
                            <p>Automated analysis of game film and practice footage</p>
                          </div>
                        </div>
                        <div className="analysis-feature">
                          <i className="fas fa-chart-area"></i>
                          <div className="feature-content">
                            <h4>Biomechanical Analysis</h4>
                            <p>Motion capture and form evaluation technology</p>
                          </div>
                        </div>
                        <div className="analysis-feature">
                          <i className="fas fa-brain"></i>
                          <div className="feature-content">
                            <h4>Character Assessment</h4>
                            <p>Micro-expression analysis and leadership evaluation</p>
                          </div>
                        </div>
                        <button className="upload-video">
                          <i className="fas fa-upload"></i>
                          Upload Game Film
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'reports' && (
              <motion.div
                className="reports-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="section-header">
                  <h2>Comprehensive Reports</h2>
                  <p>Professional scouting documentation and analysis reports</p>
                </div>

                <div className="reports-dashboard">
                  <div className="report-categories">
                    <div className="report-category">
                      <i className="fas fa-user-graduate"></i>
                      <h3>Player Reports</h3>
                      <p>Detailed scouting breakdowns with grades, projections, and recommendations</p>
                      <div className="report-stats">
                        <span>127 Reports Generated</span>
                        <span>Last Updated: 2 hours ago</span>
                      </div>
                      <button className="category-action">Generate Report</button>
                    </div>

                    <div className="report-category">
                      <i className="fas fa-shield-alt"></i>
                      <h3>Team Analysis</h3>
                      <p>Comprehensive team breakdowns including strengths, weaknesses, and matchups</p>
                      <div className="report-stats">
                        <span>45 Teams Analyzed</span>
                        <span>Last Updated: 4 hours ago</span>
                      </div>
                      <button className="category-action">View Analysis</button>
                    </div>

                    <div className="report-category">
                      <i className="fas fa-trophy"></i>
                      <h3>Draft Boards</h3>
                      <p>Complete draft evaluations with rankings, tiers, and positional needs</p>
                      <div className="report-stats">
                        <span>2025 Class Ready</span>
                        <span>312 Prospects Ranked</span>
                      </div>
                      <button className="category-action">Access Board</button>
                    </div>

                    <div className="report-category">
                      <i className="fas fa-map-signs"></i>
                      <h3>Recruiting Intel</h3>
                      <p>Pipeline tracking, commitment probabilities, and recruitment timelines</p>
                      <div className="report-stats">
                        <span>89% Prediction Accuracy</span>
                        <span>156 Active Recruitments</span>
                      </div>
                      <button className="category-action">View Intel</button>
                    </div>
                  </div>

                  <div className="recent-reports">
                    <h3>Recent Report Activity</h3>
                    <div className="reports-list">
                      <div className="report-item">
                        <div className="report-icon">
                          <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="report-details">
                          <h4>Quinn Ewers - QB Evaluation</h4>
                          <p>Complete breakdown with draft projection and team fit analysis</p>
                          <span className="report-meta">Generated 3 hours ago • 47 pages</span>
                        </div>
                        <div className="report-actions">
                          <button className="view-report">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="download-report">
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </div>

                      <div className="report-item">
                        <div className="report-icon">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="report-details">
                          <h4>Texas Longhorns - Team Analysis</h4>
                          <p>SEC transition analysis with roster evaluation and recruiting needs</p>
                          <span className="report-meta">Generated 1 day ago • 62 pages</span>
                        </div>
                        <div className="report-actions">
                          <button className="view-report">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="download-report">
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </div>

                      <div className="report-item">
                        <div className="report-icon">
                          <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="report-details">
                          <h4>2025 QB Draft Class Rankings</h4>
                          <p>Comprehensive quarterback evaluation with pro comparison analysis</p>
                          <span className="report-meta">Generated 2 days ago • 89 pages</span>
                        </div>
                        <div className="report-actions">
                          <button className="view-report">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="download-report">
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .blazescout-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--deep-navy) 0%, var(--ole-miss-navy) 100%);
        }

        .blazescout-header {
          background: rgba(20, 33, 61, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(191, 87, 0, 0.2);
          padding: 2rem;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-title h1 {
          font-family: var(--primary-font);
          font-size: 3rem;
          color: var(--burnt-orange);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title p {
          color: rgba(250, 250, 250, 0.8);
          font-size: 1.2rem;
          margin: 0.5rem 0 0 0;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .sport-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--magnolia-white);
        }

        .sport-selector select {
          padding: 0.75rem;
          background: rgba(10, 14, 27, 0.8);
          border: 1px solid rgba(191, 87, 0, 0.3);
          border-radius: 8px;
          color: var(--magnolia-white);
          font-size: 0.95rem;
        }

        .refresh-data {
          background: linear-gradient(135deg, var(--burnt-orange), var(--volunteer-orange));
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.3s ease;
        }

        .refresh-data:hover {
          transform: translateY(-2px);
        }

        .section-nav {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 1rem;
        }

        .nav-button {
          background: transparent;
          border: none;
          padding: 1rem 2rem;
          color: rgba(250, 250, 250, 0.7);
          cursor: pointer;
          border-radius: 15px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .nav-button.active {
          background: rgba(191, 87, 0, 0.2);
          color: var(--burnt-orange);
        }

        .nav-button:hover {
          background: rgba(191, 87, 0, 0.1);
          color: var(--burnt-orange);
        }

        .blazescout-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: rgba(250, 250, 250, 0.8);
        }

        .loading-section .spinner {
          margin-bottom: 1rem;
        }

        .dashboard-overview {
          display: grid;
          gap: 2rem;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .overview-card {
          background: rgba(20, 33, 61, 0.8);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(191, 87, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: transform 0.3s ease;
        }

        .overview-card:hover {
          transform: translateY(-5px);
        }

        .overview-card i {
          font-size: 3rem;
          color: var(--burnt-orange);
        }

        .card-content h3 {
          font-family: var(--primary-font);
          color: var(--magnolia-white);
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }

        .card-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--burnt-orange);
          margin: 0;
        }

        .dashboard-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .chart-container {
          background: rgba(20, 33, 61, 0.8);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(191, 87, 0, 0.2);
        }

        .chart-container h3 {
          font-family: var(--primary-font);
          color: var(--burnt-orange);
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-family: var(--primary-font);
          font-size: 2.5rem;
          color: var(--burnt-orange);
          margin: 0 0 1rem 0;
        }

        .section-header p {
          color: rgba(250, 250, 250, 0.8);
          font-size: 1.2rem;
        }

        .prospects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .prospect-card {
          background: rgba(20, 33, 61, 0.8);
          border-radius: 24px;
          padding: 2rem;
          border: 2px solid rgba(191, 87, 0, 0.2);
          transition: all 0.3s ease;
        }

        .prospect-card:hover {
          border-color: var(--burnt-orange);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        .prospect-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .prospect-info h3 {
          font-family: var(--primary-font);
          color: var(--magnolia-white);
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .prospect-position {
          color: var(--burnt-orange);
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .prospect-year {
          color: rgba(250, 250, 250, 0.7);
          margin: 0;
          font-size: 0.9rem;
        }

        .rating-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--burnt-orange), var(--volunteer-orange));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .prospect-measurements {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .measurement {
          text-align: center;
        }

        .measurement .label {
          display: block;
          color: rgba(250, 250, 250, 0.7);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .measurement .value {
          color: var(--magnolia-white);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .prospect-attributes {
          margin-bottom: 1.5rem;
        }

        .attribute {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .attr-label {
          min-width: 80px;
          color: rgba(250, 250, 250, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .attr-bar {
          flex: 1;
          height: 8px;
          background: rgba(191, 87, 0, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .attr-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--burnt-orange), var(--volunteer-orange));
          transition: width 0.8s ease;
        }

        .attr-value {
          min-width: 30px;
          text-align: right;
          color: var(--burnt-orange);
          font-weight: 700;
          font-size: 0.9rem;
        }

        .prospect-stats {
          margin-bottom: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(191, 87, 0, 0.2);
        }

        .prospect-stats h4 {
          font-family: var(--primary-font);
          color: var(--burnt-orange);
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          background: rgba(191, 87, 0, 0.1);
          padding: 1rem;
          border-radius: 10px;
        }

        .stat-label {
          display: block;
          color: rgba(250, 250, 250, 0.7);
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          color: var(--burnt-orange);
          font-weight: 700;
          font-size: 1.2rem;
        }

        .prospect-action {
          width: 100%;
          background: linear-gradient(135deg, var(--burnt-orange), var(--volunteer-orange));
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.3s ease;
        }

        .prospect-action:hover {
          transform: translateY(-2px);
        }

        /* Teams Section Styles */
        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .team-card {
          background: rgba(20, 33, 61, 0.8);
          border-radius: 24px;
          padding: 2rem;
          border: 2px solid rgba(191, 87, 0, 0.2);
          transition: all 0.3s ease;
        }

        .team-card:hover {
          border-color: var(--burnt-orange);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        .team-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .team-info h3 {
          font-family: var(--primary-font);
          color: var(--magnolia-white);
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .team-sport {
          color: var(--burnt-orange);
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .team-record {
          color: rgba(250, 250, 250, 0.7);
          margin: 0;
          font-size: 0.9rem;
        }

        .team-ranking {
          text-align: center;
        }

        .ranking-label {
          display: block;
          color: rgba(250, 250, 250, 0.7);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .ranking-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--burnt-orange);
        }

        .team-metrics {
          margin-bottom: 1.5rem;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(191, 87, 0, 0.1);
          border-radius: 8px;
        }

        .metric-label {
          color: rgba(250, 250, 250, 0.8);
          font-size: 0.9rem;
        }

        .metric-value {
          font-weight: 600;
        }

        .metric-value.easy { color: #4CAF50; }
        .metric-value.medium { color: #FF9800; }
        .metric-value.hard { color: #F44336; }

        .key-players,
        .upcoming-games {
          margin-bottom: 1.5rem;
        }

        .key-players h4,
        .upcoming-games h4 {
          font-family: var(--primary-font);
          color: var(--burnt-orange);
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }

        .players-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .player-tag {
          background: rgba(191, 87, 0, 0.2);
          color: var(--magnolia-white);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .games-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .game-item {
          background: rgba(191, 87, 0, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: rgba(250, 250, 250, 0.9);
          font-size: 0.9rem;
        }

        .team-action {
          width: 100%;
          background: linear-gradient(135deg, var(--burnt-orange), var(--volunteer-orange));
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.3s ease;
        }

        .team-action:hover {
          transform: translateY(-2px);
        }

        /* Enhanced Analytics Styles */
        .analytics-dashboard {
          display: grid;
          gap: 2rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .analytics-card {
          background: rgba(20, 33, 61, 0.8);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(191, 87, 0, 0.2);
        }

        .analytics-card h3 {
          font-family: var(--primary-font);
          color: var(--burnt-orange);
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
        }

        .comparison-matrix {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .matrix-header,
        .matrix-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem;
          border-radius: 8px;
        }

        .matrix-header {
          background: rgba(191, 87, 0, 0.2);
          color: var(--burnt-orange);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .matrix-row {
          background: rgba(191, 87, 0, 0.1);
          color: var(--magnolia-white);
        }

        .player-name {
          font-weight: 600;
        }

        .rating-badge {
          background: var(--burnt-orange);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .grade {
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .grade.elite {
          background: #4CAF50;
          color: white;
        }

        .grade.high {
          background: #FF9800;
          color: white;
        }

        .grade.solid {
          background: #2196F3;
          color: white;
        }

        .draft-projections {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .projection-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(191, 87, 0, 0.1);
          border-radius: 12px;
        }

        .projection-player {
          display: flex;
          flex-direction: column;
        }

        .projection-player .player-name {
          font-weight: 600;
          color: var(--magnolia-white);
          margin-bottom: 0.25rem;
        }

        .projection-player .player-pos {
          font-size: 0.8rem;
          color: rgba(250, 250, 250, 0.7);
        }

        .projection-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .draft-round {
          font-weight: 600;
          color: var(--burnt-orange);
        }

        .draft-pick {
          font-size: 0.9rem;
          color: rgba(250, 250, 250, 0.8);
        }

        .confidence {
          font-size: 0.8rem;
          color: rgba(250, 250, 250, 0.6);
        }

        .video-analysis {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analysis-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(191, 87, 0, 0.1);
          border-radius: 12px;
        }

        .analysis-feature i {
          font-size: 2rem;
          color: var(--burnt-orange);
          min-width: 40px;
        }

        .feature-content h4 {
          font-family: var(--primary-font);
          color: var(--magnolia-white);
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .feature-content p {
          color: rgba(250, 250, 250, 0.8);
          margin: 0;
          font-size: 0.9rem;
        }

        .upload-video {
          background: linear-gradient(135deg, var(--burnt-orange), var(--volunteer-orange));
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.3s ease;
        }

        .upload-video:hover {
          transform: translateY(-2px);
        }

        /* Reports Section Styles */
        .reports-dashboard {
          display: grid;
          gap: 3rem;
        }

        .report-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .report-category {
          background: rgba(20, 33, 61, 0.8);
          border-radius: 24px;
          padding: 2rem;
          border: 2px solid rgba(191, 87, 0, 0.2);
          text-align: center;
          transition: all 0.3s ease;
        }

        .report-category:hover {
          border-color: var(--burnt-orange);
          transform: translateY(-5px);
        }

        .report-category i {
          font-size: 3rem;
          color: var(--burnt-orange);
          margin-bottom: 1rem;
        }

        .report-category h3 {
          font-family: var(--primary-font);
          color: var(--magnolia-white);
          margin: 0 0 1rem 0;
          font-size: 1.4rem;
        }

        .report-category p {
          color: rgba(250, 250, 250, 0.8);
          margin: 0 0 1.5rem 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .report-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .report-stats span {
          color: rgba(250, 250, 250, 0.6);
          font-size: 0.8rem;
        }

        .category-action {
          background: linear-gradient(135deg, var(--burnt-orange), var(--volunteer-orange));
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .category-action:hover {
          transform: translateY(-2px);
        }

        .recent-reports h3 {
          font-family: var(--primary-font);
          color: var(--burnt-orange);
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .report-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(20, 33, 61, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(191, 87, 0, 0.2);
          transition: all 0.3s ease;
        }

        .report-item:hover {
          border-color: var(--burnt-orange);
          transform: translateX(5px);
        }

        .report-icon {
          min-width: 50px;
        }

        .report-icon i {
          font-size: 2rem;
          color: var(--burnt-orange);
        }

        .report-details {
          flex: 1;
        }

        .report-details h4 {
          font-family: var(--primary-font);
          color: var(--magnolia-white);
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .report-details p {
          color: rgba(250, 250, 250, 0.8);
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .report-meta {
          color: rgba(250, 250, 250, 0.6);
          font-size: 0.8rem;
        }

        .report-actions {
          display: flex;
          gap: 0.5rem;
        }

        .view-report,
        .download-report {
          background: rgba(191, 87, 0, 0.2);
          color: var(--burnt-orange);
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-report:hover,
        .download-report:hover {
          background: var(--burnt-orange);
          color: white;
        }

        @media (max-width: 968px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .header-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .section-nav {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .dashboard-charts,
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .prospects-grid,
          .teams-grid {
            grid-template-columns: 1fr;
          }

          .nav-button {
            flex: 1;
            justify-content: center;
          }

          .matrix-header,
          .matrix-row {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.5rem;
          }

          .matrix-header span:nth-child(3),
          .matrix-header span:nth-child(4),
          .matrix-row span:nth-child(3),
          .matrix-row span:nth-child(4) {
            display: none;
          }

          .report-categories {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .blazescout-content {
            padding: 1rem;
          }

          .prospect-card,
          .team-card {
            padding: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .report-item {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .report-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BlazeScout;