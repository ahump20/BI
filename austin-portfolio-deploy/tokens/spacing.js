// Blaze Sports Intel - Spacing Tokens
// Version: 1.1.0
// Updated: 2025-09-26

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',

  // Sport-specific spacing
  sports: {
    baseball: {
      basePath: '90px',
      moundDistance: '60.5px',
      plateWidth: '17px'
    },
    football: {
      fieldWidth: '160px',
      endzone: '30px',
      hashWidth: '53.33px'
    },
    basketball: {
      courtLength: '94px',
      keyWidth: '16px',
      threePoint: '23.75px'
    },
    track: {
      laneWidth: '48px',
      exchangeZone: '20px',
      startLine: '5px'
    }
  }
};