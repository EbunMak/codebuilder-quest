// HubScene.js — The central hub world where players start
// Handles hub-specific rendering and portal transitions

const HubScene = (() => {
  // Portals that lead to other scenes
  const portals = [
    { x: 700, y: 300, width: 40, height: 60, label: 'Tower', targetScene: 'TowerScene' },
  ];

  function checkPortals(player, onSceneChange) {
    for (const portal of portals) {
      if (
        player.x > portal.x &&
        player.x < portal.x + portal.width &&
        player.y > portal.y &&
        player.y < portal.y + portal.height
      ) {
        onSceneChange(portal.targetScene);
        return;
      }
    }
  }

  function draw(ctx, canvas) {
    // Ground
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    // Hub title
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('== Codebuilder Hub ==', canvas.width / 2, 50);
    ctx.textAlign = 'left';

    // Draw portals
    for (const portal of portals) {
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(portal.label, portal.x + portal.width / 2, portal.y - 6);
      ctx.textAlign = 'left';
    }
  }

  return { draw, checkPortals };
})();

if (typeof module !== 'undefined') module.exports = HubScene;
