// Full app backup: every key this app keeps in localStorage (all rosters, the in-progress battle,
// rules notes, the phase checklist template, and every reference library) as one JSON file - for
// moving to a new device/browser, where a plain localStorage copy isn't an option.
(() => {
  const exportFullBackup = () => {
    const data = {
      kind: "w40k-roster-full-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: Object.fromEntries(Object.values(W40K.KEYS).map((key) => [key, W40K.load(key, null)])),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `w40k_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFullBackup = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.kind !== "w40k-roster-full-backup" || typeof parsed.data !== "object" || !parsed.data) {
          throw new Error("invalid format");
        }
        if (!confirm("このブラウザに保存されている全データ（ロスター・進行中の対戦・ルールメモ・各種マスタ）をすべて上書きします。よろしいですか？")) return;
        // Write every key straight to localStorage rather than going through each module's own
        // in-memory state/replaceAll - simpler and can't miss a key, but means already-loaded modules
        // won't see the new data until the page reloads.
        Object.values(W40K.KEYS).forEach((key) => {
          if (parsed.data[key] !== undefined) W40K.save(key, parsed.data[key]);
        });
        alert("全データを読み込みました。ページを再読み込みします。");
        location.reload();
      } catch (err) {
        alert("読み込みに失敗しました。全データバックアップの書き出しで作成したJSONファイルか確認してください。");
      }
    };
    reader.readAsText(file);
  };

  const init = () => {
    document.getElementById("btn-export-full-backup").addEventListener("click", exportFullBackup);
    document.getElementById("full-backup-import-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importFullBackup(file);
      e.target.value = "";
    });
  };

  W40K.Backup = { init };
})();
