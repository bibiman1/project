// Tab navigation + app bootstrap.
(() => {
  const initTabs = () => {
    const buttons = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".tab-panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });
        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.id === `tab-${target}`);
        });
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    W40K.Armory.init();
    W40K.Keywords.init();
    W40K.Abilities.init();
    W40K.Detachments.init();
    W40K.MasterData.init();
    W40K.Roster.init();
    W40K.Tracker.init();
    W40K.Rules.init();
  });
})();
