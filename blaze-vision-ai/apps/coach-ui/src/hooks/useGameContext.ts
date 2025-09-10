/**
 * useGameContext Hook - Baseball game situation management
 * Calculates leverage index and pressure context for Grit Index weighting
 */

import { useState, useCallback } from 'react';

export interface GameSituation {
  inning: number;
  outs: number;
  bases: string; // "000" to "111" format
  score_diff: number;
}

export interface GameContext extends GameSituation {
  leverage_index: number;
  pressure_context: 'low' | 'medium' | 'high' | 'critical';
  inning_description: string;
  situation_description: string;
}

interface GameContextHook {
  gameContext: GameContext;
  currentLeverage: number;
  updateGameSituation: (situation: Partial<GameSituation>) => void;
  resetGame: () => void;
}

// Baseball Leverage Index calculation
const calculateLeverageIndex = (situation: GameSituation): number => {
  const { inning, outs, bases, score_diff } = situation;
  
  // Base leverage by inning (9th inning = highest)
  const inningMultiplier = inning >= 9 ? 2.0 : Math.min(1.0 + (inning - 1) * 0.1, 1.8);
  
  // Outs multiplier (2 outs = highest pressure)
  const outsMultiplier = outs === 2 ? 1.5 : outs === 1 ? 1.2 : 1.0;
  
  // Runners on base (more runners = higher leverage)
  const runnersOn = bases.split('').reduce((sum, base) => sum + parseInt(base), 0);
  const runnersMultiplier = 1.0 + (runnersOn * 0.3);
  
  // Score difference impact (close games = higher leverage)
  const scoreDiffImpact = Math.abs(score_diff) <= 1 ? 1.5 : 
                         Math.abs(score_diff) <= 3 ? 1.2 : 
                         Math.abs(score_diff) <= 5 ? 0.8 : 0.5;
  
  return Math.round((inningMultiplier * outsMultiplier * runnersMultiplier * scoreDiffImpact) * 100) / 100;
};

// Convert leverage to pressure context
const getPressureContext = (leverage: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (leverage >= 2.5) return 'critical';
  if (leverage >= 1.8) return 'high';
  if (leverage >= 1.2) return 'medium';
  return 'low';
};

// Generate human-readable descriptions
const getInningDescription = (inning: number): string => {
  if (inning <= 6) return 'Early innings';
  if (inning <= 8) return 'Late innings';
  return 'Closing time';
};

const getSituationDescription = (context: GameContext): string => {
  const { outs, bases, score_diff, pressure_context } = context;
  const runnersOn = bases.split('').reduce((sum, base) => sum + parseInt(base), 0);
  
  let desc = '';
  
  // Outs
  if (outs === 2) desc += 'Two outs, ';
  else if (outs === 1) desc += 'One out, ';
  else desc += 'No outs, ';
  
  // Runners
  if (runnersOn === 0) desc += 'bases empty';
  else if (bases === '100') desc += 'runner on first';
  else if (bases === '010') desc += 'runner on second';
  else if (bases === '001') desc += 'runner on third';
  else if (bases === '110') desc += 'runners on first and second';
  else if (bases === '101') desc += 'runners on first and third';
  else if (bases === '011') desc += 'runners on second and third';
  else if (bases === '111') desc += 'bases loaded';
  
  // Score context
  if (Math.abs(score_diff) <= 1) {
    desc += score_diff === 0 ? ', tied game' : score_diff > 0 ? ', up by 1' : ', down by 1';
  } else if (Math.abs(score_diff) <= 3) {
    desc += score_diff > 0 ? `, up by ${score_diff}` : `, down by ${Math.abs(score_diff)}`;
  }
  
  return desc;
};

const defaultSituation: GameSituation = {
  inning: 1,
  outs: 0,
  bases: '000',
  score_diff: 0
};

export const useGameContext = (): GameContextHook => {
  const [situation, setSituation] = useState<GameSituation>(defaultSituation);

  const updateGameSituation = useCallback((updates: Partial<GameSituation>) => {
    setSituation(prev => {
      const newSituation = { ...prev, ...updates };
      
      // Validate bounds
      newSituation.inning = Math.max(1, Math.min(15, newSituation.inning));
      newSituation.outs = Math.max(0, Math.min(2, newSituation.outs));
      newSituation.score_diff = Math.max(-50, Math.min(50, newSituation.score_diff));
      
      // Validate bases format
      if (!/^[01]{3}$/.test(newSituation.bases)) {
        newSituation.bases = prev.bases;
      }
      
      return newSituation;
    });
  }, []);

  const resetGame = useCallback(() => {
    setSituation(defaultSituation);
  }, []);

  // Calculate current game context
  const leverage_index = calculateLeverageIndex(situation);
  const pressure_context = getPressureContext(leverage_index);
  const inning_description = getInningDescription(situation.inning);
  const gameContext: GameContext = {
    ...situation,
    leverage_index,
    pressure_context,
    inning_description,
    situation_description: getSituationDescription({
      ...situation,
      leverage_index,
      pressure_context,
      inning_description
    } as GameContext)
  };

  return {
    gameContext,
    currentLeverage: leverage_index,
    updateGameSituation,
    resetGame
  };
};