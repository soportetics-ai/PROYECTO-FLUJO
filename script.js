document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const row = toggle.closest("tr");
      const group = row.dataset.group;

      if (!group) return;

      // alternar visibilidad de hijos
      const rows = document.querySelectorAll(`.${group}`);
      const isVisible = [...rows].some(r => r.style.display === "table-row");

      rows.forEach(r => {
        r.style.display = isVisible ? "none" : "table-row";
      });

      // cambiar el signo (+) ↔ (–)
      toggle.textContent = isVisible ? "+" : "–";
    });
  });
});
