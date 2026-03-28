// bridgePuzzle.js — A code-completion puzzle that builds a bridge
// Players fill in missing code to extend the bridge and cross a gap

const BridgePuzzle = (() => {
  const state = {
    solved: false,
    bridgeSegments: 0,
    maxSegments: 5,
    answer: 'for',   // The correct keyword to complete the loop
    prompt: 'Complete the loop to build the bridge:\n___(let i=0; i<5; i++) { buildSegment(i); }',
  };

  function attempt(input, socket, scene) {
    if (state.solved) return { success: false, message: 'Bridge already built!' };

    if (input.trim().toLowerCase() === state.answer) {
      state.solved = true;
      state.bridgeSegments = state.maxSegments;

      // Broadcast the puzzle effect to all players
      if (socket) {
        socket.emit('puzzleEffect', {
          scene,
          effect: 'bridgeBuilt',
          payload: { segments: state.maxSegments },
        });
      }

      return { success: true, message: 'Correct! The bridge is built!' };
    }

    return { success: false, message: 'Not quite — try again.' };
  }

  function draw(ctx, x, y) {
    // Draw the gap
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, 200, 30);

    // Draw built segments
    const segWidth = 200 / state.maxSegments;
    ctx.fillStyle = '#8B4513';
    for (let i = 0; i < state.bridgeSegments; i++) {
      ctx.fillRect(x + i * segWidth, y, segWidth - 2, 30);
    }

    // Puzzle prompt
    if (!state.solved) {
      ctx.fillStyle = '#f1c40f';
      ctx.font = '13px monospace';
      ctx.fillText('[ Bridge Puzzle — press P to attempt ]', x, y - 10);
    } else {
      ctx.fillStyle = '#2ecc71';
      ctx.font = '13px monospace';
      ctx.fillText('Bridge complete!', x + 50, y - 10);
    }
  }

  function getPrompt() {
    return state.prompt;
  }

  function isSolved() {
    return state.solved;
  }

  return { attempt, draw, getPrompt, isSolved };
})();

if (typeof module !== 'undefined') module.exports = BridgePuzzle;
