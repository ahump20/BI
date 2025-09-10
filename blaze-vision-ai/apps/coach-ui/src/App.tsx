/**
 * Blaze Vision AI Coach Interface - Main App Component
 * Real-time Tell Detector with preserved Blaze Intelligence OS design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from './components/HeroSection';
import VisionTimeline from './components/VisionTimeline';
import GritIndexDisplay from './components/GritIndexDisplay';
import CoachingCues from './components/CoachingCues';
import GameSituationControl from './components/GameSituationControl';
import VideoFeeds from './components/VideoFeeds';
import ComponentBreakdown from './components/ComponentBreakdown';
import SystemStatus from './components/SystemStatus';
import { useVisionAI } from './hooks/useVisionAI';
import { useGameContext } from './hooks/useGameContext';
import type { SessionConfig } from '@blaze/capture-sdk';

const App: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [pitcherName, setPitcherName] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);

  // Vision AI integration
  const {
    currentGritScore,
    isCapturing,
    systemStats,
    startSession,
    stopSession,
    error
  } = useVisionAI();

  // Game context management
  const {
    gameContext,
    updateGameSituation,
    currentLeverage
  } = useGameContext();

  const handleStartSession = async () => {
    if (!pitcherName.trim()) {
      alert('Please enter pitcher name');
      return;
    }

    const sessionConfig: SessionConfig = {
      session_id: crypto.randomUUID(),
      player_id: pitcherName.toLowerCase().replace(/\s+/g, '_'),
      sport: 'baseball',
      target_fps: 60,
      enable_face: true,
      enable_pose: true,
      enable_rpg: false,
      baseline_duration_ms: 5000
    };

    const success = await startSession(sessionConfig);
    if (success) {
      setIsSessionActive(true);
      setShowDashboard(true);
    }
  };

  const handleStopSession = async () => {
    await stopSession();
    setIsSessionActive(false);
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroSection
              onStartSession={handleStartSession}
              pitcherName={pitcherName}
              setPitcherName={setPitcherName}
              isLoading={isCapturing}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="dashboard-container"
          >
            <DashboardLayout
              pitcherName={pitcherName}
              currentGritScore={currentGritScore}
              isSessionActive={isSessionActive}
              gameContext={gameContext}
              systemStats={systemStats}
              onStopSession={handleStopSession}
              onUpdateGameSituation={updateGameSituation}
              onBackToHero={() => setShowDashboard(false)}
              error={error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DashboardLayoutProps {
  pitcherName: string;
  currentGritScore: any;
  isSessionActive: boolean;
  gameContext: any;
  systemStats: any;
  onStopSession: () => void;
  onUpdateGameSituation: (situation: any) => void;
  onBackToHero: () => void;
  error: string | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  pitcherName,
  currentGritScore,
  isSessionActive,
  gameContext,
  systemStats,
  onStopSession,
  onUpdateGameSituation,
  onBackToHero,
  error
}) => {
  return (
    <div className="min-h-screen p-4 relative z-10">
      {/* Header */}
      <motion.header 
        className="glass-panel p-6 mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center text-2xl font-black text-black"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🔥
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold font-mono bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                BLAZE VISION AI
              </h1>
              <p className="text-gray-400">Real-time Tell Detector • {pitcherName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <SystemStatus 
              stats={systemStats} 
              isActive={isSessionActive}
              error={error}
            />
            <button
              onClick={onStopSession}
              className="px-6 py-2 bg-red-600/20 border border-red-500 rounded-full text-red-400 hover:bg-red-600/30 transition-all"
            >
              Stop Session
            </button>
            <button
              onClick={onBackToHero}
              className="px-6 py-2 bg-gray-600/20 border border-gray-500 rounded-full text-gray-400 hover:bg-gray-600/30 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Analytics */}
        <div className="xl:col-span-2 space-y-6">
          {/* Grit Index Display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GritIndexDisplay 
              gritScore={currentGritScore}
              gameContext={gameContext}
            />
          </motion.div>

          {/* Vision Timeline */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <VisionTimeline 
              sessionActive={isSessionActive}
              gameContext={gameContext}
            />
          </motion.div>

          {/* Component Breakdown */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ComponentBreakdown 
              gritScore={currentGritScore}
            />
          </motion.div>
        </div>

        {/* Right Column - Controls & Feeds */}
        <div className="space-y-6">
          {/* Game Situation Control */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <GameSituationControl
              gameContext={gameContext}
              onUpdate={onUpdateGameSituation}
            />
          </motion.div>

          {/* Coaching Cues */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <CoachingCues 
              gritScore={currentGritScore}
              gameContext={gameContext}
            />
          </motion.div>

          {/* Video Feeds */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <VideoFeeds 
              isSessionActive={isSessionActive}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default App;