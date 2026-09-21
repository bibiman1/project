// Backup/restore for the personal reference libraries (weapon armory, keyword library, detachment
// library incl. core stratagems) as a single JSON file, independent of any one roster's export.
(() => {
  const exportMasterData = () => {
    const data = {
      kind: "w40k-roster-master-data",
      version: 1,
      exportedAt: new Date().toISOString(),
      weaponLibrary: W40K.Armory.getAll(),
      keywordLibrary: W40K.Keywords.getAll(),
      abilityLibrary: W40K.Abilities.getAll(),
      unitLibrary: W40K.UnitLibrary.getAll(),
      detachmentLibrary: W40K.Detachments.getAll(),
      coreStratagemLibrary: W40K.Detachments.getCoreStratagems(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `w40k_master_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMasterData = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.weaponLibrary) || !Array.isArray(data.keywordLibrary) || !Array.isArray(data.detachmentLibrary)) {
          throw new Error("invalid format");
        }
        if (!confirm("現在のマスタデータ（武器庫・キーワード帳・アビリティ辞書・ユニットマスタ・デタッチメントマスタ）をすべて上書きします。よろしいですか？")) return;
        W40K.Armory.replaceAll(data.weaponLibrary);
        W40K.Keywords.replaceAll(data.keywordLibrary);
        // Older exports predate the ability/unit libraries; leave the current ones alone rather than wiping them.
        if (Array.isArray(data.abilityLibrary)) W40K.Abilities.replaceAll(data.abilityLibrary);
        if (Array.isArray(data.unitLibrary)) W40K.UnitLibrary.replaceAll(data.unitLibrary);
        W40K.Detachments.replaceAll(data.detachmentLibrary, data.coreStratagemLibrary || []);
        alert("マスタデータを読み込みました。");
      } catch (err) {
        alert("読み込みに失敗しました。マスタデータの書き出しで作成したJSONファイルか確認してください。");
      }
    };
    reader.readAsText(file);
  };

  const init = () => {
    document.getElementById("btn-export-master-data").addEventListener("click", exportMasterData);
    document.getElementById("master-data-import-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importMasterData(file);
      e.target.value = "";
    });
  };

  W40K.MasterData = { init };
})();
