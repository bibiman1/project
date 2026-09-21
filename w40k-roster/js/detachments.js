// Detachment library: reference data for all Adeptus Mechanicus detachments (rule/enhancements/stratagems),
// picked from when setting up a roster's detachment, adding a stratagem, or giving a unit an enhancement.
// Effect text here is paraphrased for personal reference, not copied verbatim from any rulebook.
(() => {
  const uid = () => W40K.uid();

  // Names/costs/text below are the author's own paraphrase; where the official Japanese term isn't
  // confirmed yet, it can be corrected later via the "デタッチメントマスタ編集" screen without losing data.
  const SEED = [
    {
      name: "奪取戦闘班",
      forceType: "偵察",
      dp: 1,
      rule: "味方プテラクシィ/インフィルトレイター/レンジャー/セルベリス・レイダー/セルベリス・サルファーハウンド・ユニットは偵察占術機を持つ。偵察占術機ユニットは、自軍側射撃フェイズ中12mv以内の視認可能な敵1体を分析状態にし、その敵への発見範囲+3mvの強化占術機アビリティを得る。",
      enhancements: [
        { name: "探索者の特典", points: 20, text: "スキタリ・マーシャルのみ。このユニットは潜入を得る。", restrict: "スキタリ・マーシャル" },
        { name: "ステルス投影サイバー犬", points: 15, text: "セルベリス・レイダーのみ。単独工作員15\"を得る。", restrict: "セルベリス・レイダー" },
      ],
      stratagems: [
        { name: "欠陥精査", cost: 1, phase: "自軍側射撃フェイズ", text: "味方帝国技術局ユニットが射撃宣言時。味方偵察占術機ユニットの12mv以内の視認可能な敵1体を選択、その敵は遮蔽無効の対象になる。" },
        { name: "占術機の再分極", cost: 1, phase: "敵軍移動フェイズ開始時", text: "味方の非接敵状態の偵察占術機ユニット1個を対象。そのターン終了時まで自軍ユニットの発見範囲は-3mvの修正。" },
        { name: "秘匿再配置命令", cost: 1, phase: "敵軍白兵フェイズ終了時", text: "味方の非接敵状態のインフィルトレイター/プテラクシィ・ユニット1個を戦略的予備戦力に配置する。" },
      ],
    },
    {
      name: "炉を統べし者たち",
      forceType: "優先資産",
      dp: 1,
      rule: "味方テックプリースト・兵は特防4+、痛みを知らぬもの5+を持つ。加えて自軍側射撃フェイズに射撃宣言した非戦闘ショック状態のユニットは、D6を1回ロールし、2+で12mv以内の敵ビークルに-1修正の戦闘ショックロールを強制、+2でその隠密状態を解除しない。",
      enhancements: [
        { name: "アルデブラク・ヴィーンの力織チップ", points: 25, text: "サイバネティカ・データスミスのみ。第1バトルラウンド開始時、合流ユニットであればバトル終了まで高機動を持つ。", restrict: "サイバネティカ・データスミス" },
        { name: "TL-4Ø9", points: 30, text: "テックプリーストのみ。専用武器を得る（射程24\"・攻撃回数3・技能2+・攻撃力11・貫通-2・ダメージD3+2、会心ウーンズ／危険物）。", restrict: "テックプリースト" },
      ],
      stratagems: [
        { name: "聖典予測", cost: 1, phase: "敵軍射撃/白兵フェイズ", text: "作戦目標の確保範囲内にいる味方テックプリーストユニットが攻撃対象に選ばれた時、その敵の攻撃に-1ヒット修正。" },
        { name: "緊急過負荷指令", cost: 1, phase: "自軍側移動フェイズ", text: "味方テックプリーストユニットが退却移動を宣言した時、そのユニットは射撃/突撃を宣言できる。" },
        { name: "神聖なる強欲", cost: 1, phase: "自軍側射撃フェイズ", text: "味方テックプリーストユニットがアクションを開始した時、そのアクション中でも射撃を宣言できる。" },
      ],
    },
    {
      name: "輝かしき自動合唱",
      forceType: "撹乱",
      dp: 1,
      rule: "味方コーパスカリ・ユニットの射撃攻撃は会心ヒットを持つ。味方フルグライト・ユニットが白兵を行った時、そのユニットは負傷限界をD3ポイント回復する。（データ詩編タグの他デタッチメントとは併用不可）",
      enhancements: [
        { name: "ヴォルターガイストの聖遺物", points: 15, text: "テックプリーストのみ。敵ユニットは即応射撃でこのユニットを対象にできない。", restrict: "テックプリースト" },
        { name: "電磁瘴気香炉", points: 10, text: "テックプリーストのみ。このユニットは隠密能力を持つ。", restrict: "テックプリースト" },
      ],
      stratagems: [
        { name: "導管の戦の残響", cost: 1, phase: "自軍側射撃/白兵フェイズ", text: "味方エレクトロ・プリースト・ユニットが攻撃対象を作戦目標範囲内にしている場合、ヒットロールまたはウーンズロールの出目1をリロールできる。" },
        { name: "電磁牽引の聖歌", cost: 1, phase: "自軍側移動フェイズ", text: "味方エレクトロ・プリースト・バトルクレイド・ユニットが全力移動を宣言した時、そのユニットは突撃を宣言できる。" },
        { name: "運動量フィードバック", cost: 1, phase: "敵軍射撃フェイズ", text: "非接敵状態の味方エレクトロ・プリースト・ユニットが射撃対象にされた時、そのユニットは最大D6mvの進撃移動を行える。" },
      ],
    },
    {
      name: "根絶中隊",
      forceType: "殲滅",
      dp: 3,
      rule: "自軍側スキタリ・ユニットが行なう攻撃は、迎撃命令適用時にヒットロール出目1をリロール、征服命令適用時にウーンズロール出目1をリロールできる。",
      enhancements: [
        { name: "万算機", points: 25, text: "スキタリ・マーシャルのみ。装備者のユニットに迎撃命令と征服命令が両方有効になる。", restrict: "スキタリ・マーシャル" },
        { name: "戦闘印章増幅器", points: 15, text: "テックプリーストのみ。装備者のユニット内の兵はスキタリのキーワードを得る。", restrict: "テックプリースト" },
        {
          name: "ベリコサ級蓄電フィン",
          points: 25,
          text: "帝国技術局のみ。装備者のユニットの射撃武器は射程+6mv、攻撃力+1。",
          restrict: "帝国技術局",
          modifiers: [
            { kind: "numeric", scope: "ranged", field: "range", value: 6 },
            { kind: "numeric", scope: "ranged", field: "strength", value: 1 },
          ],
        },
        {
          name: "万機神の激情",
          points: 10,
          text: "スキタリ・マーシャルのみ。装備者の白兵戦武器は攻撃回数+2、貫通値とダメージ量+1。",
          restrict: "スキタリ・マーシャル",
          modifiers: [
            { kind: "numeric", scope: "melee", field: "attacks", value: 2 },
            { kind: "numeric", scope: "melee", field: "ap", value: -1 },
            { kind: "numeric", scope: "melee", field: "damage", value: 1 },
          ],
        },
      ],
      stratagems: [
        { name: "サーボ駆動突撃", cost: 1, phase: "白兵戦フェイズ", text: "まだ白兵戦を宣言していない味方帝国技術局ユニット1個。そのフェイズ終了時まで白兵戦武器はランスを得る。" },
        { name: "脅威考算照準器", cost: 1, phase: "自軍側射撃フェイズ", text: "まだ射撃していない味方スキタリ・ピークル・ユニット1個。モンスター/ピークルへのダメージ量ロールを何度でもリロールできる。" },
        { name: "揺るぎなき攻撃性", cost: 1, phase: "自軍側移動フェイズ", text: "退却直後の味方帝国技術局ユニット。そのターン終了時まで退却していても射撃宣言可能（スキタリなら突撃も可）。" },
        { name: "精密殺戮", cost: 1, phase: "自軍側突撃フェイズ", text: "突撃直後の味方シカリアン・ユニット。フェイズ終了時に接敵範囲内の敵ユニット1個へ、兵ごとにD6ロールし出目4+で致命的ダメージ1。" },
        { name: "揺るがざる憤怒", cost: 1, phase: "自軍側射撃フェイズ", text: "まだ射撃していない味方スキタリ・ユニット1個。連続命中1か会心ヒットのいずれかを得る（または射撃武器に連続命中1/会心ヒット/暴発を付与）。" },
        { name: "分析的報復", cost: 1, phase: "敵軍射撃フェイズ", text: "敵の射撃で1体以上撃破された味方スキタリ・インファントリー・ユニットが、その敵ユニットのみを対象に即座に射撃できる。" },
      ],
    },
    {
      name: "聖典戦闘群",
      forceType: "優先資産",
      dp: 3,
      rule: "思考転移：自軍側指揮フェイズに帝国技術局ユニットを規模に応じた数（インカージョン1/ストライクフォース2/オンスロート3）まで選択。次の指揮フェイズ開始まで精神強制処理キーワードを得て、電動的活性化(移動+2mv)/極小防御装置作動(耐久+1)/略奪プロトコル(全力移動後も突撃宣言可)/サーボモーター静音化(隠密能力)から1つの強制処理アビリティを持つ。",
      enhancements: [
        { name: "汎預見ダイアドチップ", points: 30, text: "サイバネティカ・データスミスのみ。カステラン・ロボットに合流時、そのユニットは精神強制処理キーワードを得る。", restrict: "サイバネティカ・データスミス" },
        { name: "認知科学的増援", points: 35, text: "帝国技術局のみ（データスミスを除く）。征服命令と迎撃命令が同時に有効になる。", restrict: "帝国技術局", exclude: "データスミス" },
        {
          name: "聖別されし砲弾",
          points: 10,
          text: "帝国技術局のみ。装備者のユニットの射撃武器は射程+6mv、暴発判定をリロールできる。",
          restrict: "帝国技術局",
          modifiers: [{ kind: "numeric", scope: "ranged", field: "range", value: 6 }],
        },
        {
          name: "致命的破壊力、入力完了",
          points: 15,
          text: "テックプリースト・ドミヌスまたはマニプルスのみ。白兵戦武器は攻撃回数+3、ダメージ量+1。",
          restrict: ["テックプリースト・ドミヌス", "テックプリースト・マニプルス"],
          modifiers: [
            { kind: "numeric", scope: "melee", field: "attacks", value: 3 },
            { kind: "numeric", scope: "melee", field: "damage", value: 1 },
          ],
        },
      ],
      stratagems: [
        { name: "根絶プロトコル", cost: 1, phase: "自軍側射撃/白兵フェイズ", text: "まだ攻撃を宣言していない味方帝国技術局ユニット1個。攻撃のウーンズロール出目1をリロール（精神強制処理ユニットならヒットロールも）。" },
        { name: "目標変更", cost: 1, phase: "自軍側射撃/白兵フェイズ", text: "まだ攻撃を宣言していない味方帝国技術局ユニット1個。そのフェイズ終了時までヒットロール出目5+はクリティカルヒット。" },
        { name: "神経への過剰負荷", cost: 1, phase: "自軍側指揮フェイズ", text: "味方帝国技術局ユニット1個。精神強制処理ユニットなら致命的ダメージD3を受け、強制処理アビリティを1つ選び次の指揮フェイズまで得る。" },
        { name: "攻撃衝動", cost: 1, phase: "自軍側移動フェイズ", text: "まだ移動していない味方スコルピウス・デューンライダー1体。降車したユニットもそのターン中に突撃を宣言できる。" },
        { name: "計画的撤退", cost: 1, phase: "自軍側移動フェイズ", text: "退却直後の味方帝国技術局ユニット。そのターン終了時まで退却中でも射撃・突撃可能（精神強制処理ユニットなら決死の脱出テストをリロール可）。" },
        { name: "分析的予見", cost: 1, phase: "敵軍移動フェイズ", text: "全力移動/退却を終えた敵の9mv以内で非接敵の味方帝国技術局・インファントリー（カタフロン除く）1個が最大D6mv移動（精神強制処理なら最大6mv）。" },
      ],
    },
    {
      name: "コホート・サイバネティカ（機人大隊）",
      forceType: "迎撃戦",
      dp: 2,
      rule: "自軍側レギオ・サイバネティカ・ユニットは移動+2mv。戦闘ショック状態でなければ確保+1。",
      enhancements: [
        { name: "ネクロメカニック", points: 20, text: "テックプリーストのみ。バトルラウンド1回、12mv以内の味方レギオ・サイバネティカ/帝国技術局・ビークルのセーヴ失敗時にダメージを0にできる。", restrict: "テックプリースト" },
        { name: "マシンの君主", points: 15, text: "テックプリーストのみ。敵射撃フェイズ開始時1回、12mv以内の敵ビークルに統率テストを課し、失敗なら射撃不可、成功でも自軍へのヒット-1。", restrict: "テックプリースト" },
        { name: "感情なき明晰", points: 10, text: "テックプリーストのみ。12mv以内の即死アビリティ持ちレギオ・サイバネティカ/ビークルが撃破された時、致命的ダメージを自動適用に変える。", restrict: "テックプリースト" },
        {
          name: "大否定者",
          points: 5,
          text: "テックプリーストのみ。装備者の射撃武器に対ビークル4+を付与。",
          restrict: "テックプリースト",
          modifiers: [{ kind: "keyword", scope: "ranged", value: "対ビークル4+" }],
        },
      ],
      stratagems: [
        { name: "起動命令", cost: 1, phase: "自軍側指揮フェイズ", text: "味方帝国技術局・ビークル・ユニット1個。次の指揮フェイズまで移動+3mv、前進・突撃ロール+1。" },
        { name: "自動占術照準", cost: 1, phase: "自軍側指揮フェイズ", text: "味方レギオ・サイバネティカ/ビークル・ユニット1個と作戦目標1個。次の指揮フェイズまで射撃技能3+と遮蔽無効を得るが、その目標範囲内のみ攻撃可。" },
        { name: "機魂の再興", cost: 1, phase: "自軍側指揮フェイズ", text: "初期戦力未満の味方レギオ・サイバネティカ/ビークル1個。次の指揮フェイズまでヒットロールをリロール（半壊ならウーンズも）。" },
        { name: "機械の優越", cost: 1, phase: "自軍側指揮フェイズ", text: "味方レギオ・サイバネティカ/ビークル1個。そのターン終了時まで退却していても射撃可能、セーヴ以外の修正を無視できる。" },
        { name: "超越した思考", cost: 1, phase: "自軍側指揮フェイズ", text: "味方レギオ・サイバネティカ/ビークル1個。次の指揮フェイズまで征服命令と迎撃命令が両方有効。" },
        { name: "万機神の慈悲", cost: 1, phase: "自軍側指揮フェイズ", text: "味方レギオ・サイバネティカ/ビークル1個。次の指揮フェイズまで痛みを知らぬもの6+（致命的ダメージには5+）を得る。" },
      ],
    },
    {
      name: "放射能汚染地帯戦闘団",
      forceType: "迎撃戦",
      dp: 2,
      rule: "初回バトルラウンド開始時、相手配置ゾーン内の各敵ユニットに遮蔽か踏みとどまりを選ばせD6判定（踏みとどまり3+でD3致命傷／遮蔽なら戦闘ショック、5+で追加でD3致命傷）。2ラウンド目以降の各指揮フェイズ開始時にも同様の追加判定あり。",
      enhancements: [
        { name: "放射拡散", points: 25, text: "帝国技術局のみ。2ラウンド目以降、追加判定の範囲を相手配置ゾーン外6mvまで拡張する。", restrict: "帝国技術局" },
        { name: "不協和音の呟き", points: 20, text: "帝国技術局のみ。装備者が率いるユニットに隠密能力を付与。", restrict: "帝国技術局" },
        {
          name: "完全なる根絶者",
          points: 20,
          text: "帝国技術局のみ。装備者が率いるユニットの射撃武器に連続命中1を付与。",
          restrict: "帝国技術局",
          modifiers: [{ kind: "keyword", scope: "ranged", value: "連続命中1" }],
        },
        {
          name: "生体忌避の宣告",
          points: 15,
          text: "帝国技術局のみ。装備者の射撃武器に対インファントリー2+と対モンスター4+を付与。",
          restrict: "帝国技術局",
          modifiers: [
            { kind: "keyword", scope: "ranged", value: "対インファントリー2+" },
            { kind: "keyword", scope: "ranged", value: "対モンスター4+" },
          ],
        },
      ],
      stratagems: [
        { name: "忌まわしき後光", cost: 2, phase: "白兵フェイズ", text: "攻撃対象になった味方帝国技術局ユニット（ビークル除く）。そのフェイズ終了時まで痛みを知らぬものを得る。" },
        { name: "絶滅命令", cost: 1, phase: "自軍側指揮フェイズ", text: "味方テックプリースト1体と24mv以内の作戦目標1個。その範囲内の各敵ユニットにD6判定、4+で致命的ダメージ1と戦闘ショックテスト。" },
        { name: "侵略命令", cost: 1, phase: "自軍側移動フェイズ", text: "まだ移動していない味方スキタリ・ユニット1個。そのフェイズ終了時まで前進ロール不要で移動+6mv扱いになる。" },
        { name: "事前算出殲滅解", cost: 1, phase: "自軍側射撃フェイズ", text: "まだ射撃していない味方帝国技術局ユニット1個。相手配置ゾーン内を対象にした射撃はヒットロールをリロール可能。" },
        { name: "致死的投薬", cost: 1, phase: "自軍側射撃フェイズ", text: "まだ射撃していない味方帝国技術局ユニット1個。そのフェイズ終了時まで射撃武器に致死ヒットを付与。" },
        { name: "防壁命令", cost: 2, phase: "敵軍射撃フェイズ", text: "攻撃対象になった味方スキタリユニット。そのフェイズ終了時まで無効セーヴ4+を得る。" },
      ],
    },
    {
      name: "スキタリ掃討大隊",
      forceType: "偵察",
      dp: 2,
      rule: "味方スキタリ・インファントリー/スキタリ・マウンテッド/アイアンストライダー・バリスタリ・ユニットに隠密能力を付与する。",
      enhancements: [
        { name: "カンティック・スロールネット", points: 25, text: "スキタリ・マーシャルのみ。ラウンド開始時、12mv以内の味方スキタリ1個を選択、次のラウンド開始まで迎撃命令と征服命令を両方有効にできる。", restrict: "スキタリ・マーシャル" },
        { name: "秘匿の浸透者", points: 15, text: "スキタリのみ。潜入と偵察6\"を得る。", restrict: "スキタリ" },
        { name: "覆われし狩人", points: 10, text: "スキタリ・マーシャルのみ。両軍配置直後、味方スキタリ・インファントリーを最大3個まで再配置可能（戦略的予備戦力への配置も可）。", restrict: "スキタリ・マーシャル" },
        { name: "戦域アップリンク", points: 25, text: "スキタリのみ。射撃フェイズ後、非接敵なら最大6mv追加移動できる（そのターン突撃不可になる）。", restrict: "スキタリ" },
      ],
      stratagems: [
        { name: "生体的耐久性", cost: 1, phase: "敵軍射撃/白兵フェイズ", text: "攻撃対象になった味方シカリアン/プテラクシィ/シドニアン・ユニット。そのフェイズ終了時まで痛みを知らぬものを得る。" },
        { name: "二進言語による攻勢", cost: 2, phase: "自軍側射撃/白兵フェイズ開始時", text: "まだ攻撃していない味方スキタリ2個と敵ユニット1個。両ユニットの武器の貫通値+1（攻撃対象はその敵ユニットのみ）。" },
        { name: "迅速なる浸透儀礼", cost: 1, phase: "自軍側突撃フェイズ", text: "味方スキタリ・ユニット1個。そのフェイズ終了時まで前進したターンでも突撃を宣言できる。" },
        { name: "孤立と殲滅", cost: 1, phase: "自軍側射撃フェイズ", text: "まだ射撃していない味方シカリアン/プテラクシィ/シドニアン/アイアンストライダー/スキタリ・マウンテッド1個。攻撃対象の6mv以内に他の敵がいなければウーンズロール+1。" },
        { name: "遮蔽儀典", cost: 1, phase: "敵軍射撃フェイズ", text: "攻撃対象になった味方スキタリ・インファントリー・ユニット。そのフェイズ終了時まで18\"以内からの射撃しか対象にされない。" },
        { name: "計画的撤退命令", cost: 1, phase: "敵軍白兵フェイズ終了時", text: "味方シカリアン最大2個、またはスキタリ・インファントリー/マウンテッド1個を戦略的予備戦力に配置する（全兵が敵の3mv以上離れている必要あり）。" },
      ],
    },
    {
      name: "データ賛歌密議団",
      forceType: "撹乱",
      dp: 2,
      rule: "初回バトルラウンド開始時、味方カルト・メカニクス・ユニットに適用するベネディクションを1つ選択（バトル終了まで）：荘厳なる行進（半径内攻撃の貫通+1）／獰猛なる称賛（突撃後の白兵攻撃力+1）。",
      enhancements: [
        { name: "メカニクス・ロクム", points: 5, text: "テックプリーストのみ。統率6+になり、バトル中1回、戦闘ショック状態の味方カルト・メカニクス・ユニットの戦闘ショックを解除できる。", restrict: "テックプリースト" },
        { name: "グノスティカーチの外套", points: 10, text: "テックプリーストのみ。被弾時のダメージを1に固定する。", restrict: "テックプリースト" },
        { name: "データ祝された自動説教", points: 15, text: "テックプリーストのみ。バトル中1回、指揮フェイズにもう片方のベネディクションも自ユニットに追加で有効にできる。", restrict: "テックプリースト" },
        { name: "テンポルコピア", points: 20, text: "テックプリーストのみ。装備者のユニットはファイトファーストを得る。", restrict: "テックプリースト" },
      ],
      stratagems: [
        { name: "鋼の魂の詠唱", cost: 1, phase: "任意のフェイズ", text: "致命的ダメージを受けた味方カルト・メカニクス・ユニット。そのフェイズ終了時まで致命的ダメージへの痛みを知らぬもの4+を得る。" },
        { name: "情け容赦なき拳の詠唱", cost: 1, phase: "白兵フェイズ", text: "まだ白兵していない味方カルト・メカニクス・ユニット1個。そのフェイズ終了時まで白兵攻撃のウーンズロール+1。" },
        { name: "復讐の詩篇", cost: 1, phase: "白兵フェイズ", text: "攻撃対象になった味方カルト・メカニクス・ユニット。撃破された兵はD6判定4+でその場に残り、攻撃側の後に1回戦ってから除去される。" },
        { name: "熱烈な崇敬の捧げ物", cost: 1, phase: "自軍側移動フェイズ開始時", text: "味方カルト・メカニクス1個と18mv以内の敵1個。その敵は戦闘ショックテストを受け、失敗時は次の指揮フェイズまでその敵の攻撃にヒット-1。" },
        { name: "電導術師の連禱", cost: 1, phase: "自軍側射撃フェイズ", text: "味方カルト・メカニクス・ユニット1個。6mv以内の各敵にD6判定（エレクトロ・プリーストなら+1）、5+でD3致命的ダメージ。" },
        { name: "燐光の祝福", cost: 1, phase: "敵軍射撃フェイズ", text: "攻撃対象になった味方カルト・メカニクス・ユニット。そのフェイズ終了時まで無効セーヴ4+を得る。" },
      ],
    },
    {
      name: "探索中隊",
      forceType: "優先資産",
      dp: 2,
      rule: "自軍側指揮フェイズに「取得目標マーカー」を1個選択（次の指揮フェイズまで維持）。その範囲内で行う/対象になる攻撃はウーンズロール出目1をリロールできる。",
      enhancements: [
        { name: "マグス", points: 10, text: "テックプリーストのみ。指揮フェイズ終了時、取得目標マーカー範囲内ならD6判定4+でCP+1。", restrict: "テックプリースト" },
        { name: "ジェネター", points: 20, text: "テックプリーストのみ。率いるユニットが取得目標マーカー範囲内にいる間、無効セーヴ4+を得る。", restrict: "テックプリースト" },
        { name: "ロギス", points: 15, text: "テックプリーストのみ。率いるユニットが取得目標マーカー範囲内の敵を攻撃する時、ヒットロール+1。", restrict: "テックプリースト" },
        { name: "アルチザン", points: 10, text: "テックプリーストのみ。率いるユニットが取得目標マーカー範囲内にいる間、1フェイズ1回、ヒット/ウーンズ/セーヴいずれかの出目を無修正6に変更できる。", restrict: "テックプリースト" },
      ],
      stratagems: [
        { name: "隠匿された獲得物", cost: 1, phase: "任意のフェイズ", text: "作戦目標範囲内で撃破された味方帝国技術局ユニットが確保していた目標マーカーを、相手が別途確保するまで自軍確保下に維持する。" },
        { name: "優先的回収", cost: 1, phase: "白兵フェイズ", text: "再編成移動直前の味方帝国技術局ユニット。そのフェイズ終了時まで再編成移動を6mvまで行える（取得目標マーカー範囲内で終える必要あり）。" },
        { name: "情報奴隷スカル", cost: 1, phase: "自軍側指揮フェイズ", text: "味方テックプリースト1体と24mv以内の目標マーカー1個。次の指揮フェイズまでその目標マーカーも取得目標マーカーとして扱う。" },
        { name: "自動神託の回収", cost: 2, phase: "自軍側射撃フェイズ", text: "このターン降車した味方帝国技術局ユニット1個。そのフェイズ終了時まで取得目標マーカー範囲内の敵へのウーンズロール+1。" },
        { name: "香煙排気", cost: 1, phase: "敵軍射撃フェイズ", text: "攻撃対象になった味方帝国技術局・インファントリーと6mv以内の味方帝国技術局・煙幕ユニット。両者に隠密能力と遮蔽の恩恵を得る。" },
        { name: "反応的防護", cost: 1, phase: "敵軍突撃フェイズ", text: "取得目標マーカー範囲内で突撃対象になった味方帝国技術局・インファントリーが、味方帝国技術局・輸送機に乗車できる。" },
      ],
    },
  ];

  // Core Stratagems (基本策略): usable by any army regardless of detachment. From the Core Rules book, §15.
  const CORE_STRATAGEM_SEED = [
    { name: "リロール命令", cost: 1, phase: "どのフェイズでも", text: "味方ユニットまたは兵1体を対象に、以下のロールのいずれか1つを直後にリロールする：全力移動ロール／突撃ロール／ダメージ量判定ロール／危機ロール／ヒットロール／セーブロール／ウーンズロール／いずれかの武器で行う攻撃回数を決めるロール（2個以上のダイスを同時にロールしている場合は1個を選んでリロール、突撃ロールの場合は全てのダイスをリロール）。" },
    { name: "英雄的挑戦", cost: 1, phase: "白兵フェイズ中、味方キャラクターが白兵を宣言した直後", text: "そのキャラクター・ユニット内の兵1体を選択。そのフェイズ終了時まで、その兵の白兵戦武器は精密攻撃アビリティを持つ。" },
    { name: "狂気の奮戦", cost: 1, phase: "自軍側指揮フェイズの戦闘ショックステップ中", text: "戦闘ショックロールを行う味方ユニット1個を対象に、そのロールを自動成功にする（バトル中1回のみ使用可）。" },
    { name: "爆発物使用", cost: 1, phase: "自軍側射撃フェイズ", text: "全力移動しておらず射撃可能な非接敵の味方爆発物/グレネード・ユニット1個を対象。その兵1体を選び、8mv以内の視認可能な非接敵の敵ユニット1個を選択。D6を6個ロールし、出目4+が出るたびその敵に致命的ダメージ1。" },
    { name: "激突", cost: 1, phase: "自軍側突撃フェイズ、味方モンスター/ビークルの突撃移動終了直後", text: "接敵中の敵ユニット1個と、それに接敵中の自軍の兵1体を選択。その兵の耐久と同じ数のD6をロールし、出目1で自軍側が1ポイント、出目5+で敵側が1ポイントの致命的ダメージ（1体につき最大6ポイントまで）。" },
    { name: "即応投入", cost: 1, phase: "敵軍側移動フェイズ終了時", text: "戦略的予備戦力の味方ユニット1個（航空機を除く）を対象に、突入移動を行わせる（第1バトルラウンドは使用不可）。" },
    { name: "警戒射撃", cost: 1, phase: "敵軍側移動フェイズ終了時", text: "非接敵の味方ユニット1個（巨大兵器を除く）を対象に、即応射撃（射撃フェイズ以外でも通常の射撃手順で射撃、ただし修正済みヒットロール出目6のみヒット成立・リロール不可）を行わせる。" },
    { name: "煙幕", cost: 1, phase: "敵軍側射撃フェイズ開始時", text: "味方煙幕ユニット1個を対象に、そのフェイズ終了時まで、そのユニットまたはそのユニットの兵によって完全視認を妨げられている敵からの攻撃に遮蔽物ボーナスを与える（第1バトルラウンドは使用不可）。" },
    { name: "英雄的介入", cost: 1, phase: "敵軍側突撃フェイズ開始時", text: "12mv以内に敵ユニットがいる非接敵の味方ユニット1個（ビークルはキャラクター/ウォーカーのみ）を対象に突撃を解決させる。前進防衛（このフェイズに突撃移動済みの範囲内の敵のみ選択可）か、+1CPで攻勢突進（突撃ロール6超えは6扱い、6mv以内かつ範囲内ならどの敵も選択可）を選ぶ。" },
    { name: "反攻戦術", cost: 2, phase: "敵軍側白兵フェイズ中、敵ユニットの攻撃解決直後", text: "白兵可能な味方ユニット1個を対象に、そのフェイズ終了時まで先手アビリティを付与する（自軍は次にそのユニットで白兵を宣言しなければならない）。" },
  ];

  const buildSeed = () =>
    SEED.map((d) => ({
      id: uid(),
      name: d.name,
      forceType: d.forceType,
      dp: d.dp,
      rule: d.rule,
      enhancements: d.enhancements.map((e) => ({ id: uid(), ...e })),
      stratagems: d.stratagems.map((s) => ({ id: uid(), ...s })),
    }));

  let library = W40K.load(W40K.KEYS.DETACHMENT_LIBRARY, null);
  if (!library) {
    library = buildSeed();
    W40K.save(W40K.KEYS.DETACHMENT_LIBRARY, library);
  } else {
    // Backfill restrict/exclude/modifiers for enhancements saved before those fields existed,
    // matching by detachment + enhancement name against the seed. Never touches an entry that
    // already has the field set (even a value explicitly cleared via bulk edit), so no user edits
    // are lost.
    let backfilled = false;
    library.forEach((d) => {
      const seedDetachment = SEED.find((s) => s.name === d.name);
      if (!seedDetachment) return;
      (d.enhancements || []).forEach((e) => {
        const seedEnh = seedDetachment.enhancements.find((se) => se.name === e.name);
        if (!seedEnh) return;
        if (e.restrict === undefined) {
          e.restrict = seedEnh.restrict || "";
          e.exclude = seedEnh.exclude || "";
          backfilled = true;
        }
        if (e.modifiers === undefined) {
          e.modifiers = seedEnh.modifiers || [];
          backfilled = true;
        }
      });
    });
    if (backfilled) W40K.save(W40K.KEYS.DETACHMENT_LIBRARY, library);
  }

  let coreStratagems = W40K.load(W40K.KEYS.CORE_STRATAGEM_LIBRARY, null);
  if (!coreStratagems) {
    coreStratagems = CORE_STRATAGEM_SEED.map((s) => ({ id: uid(), ...s }));
    W40K.save(W40K.KEYS.CORE_STRATAGEM_LIBRARY, coreStratagems);
  }

  const persist = () => W40K.save(W40K.KEYS.DETACHMENT_LIBRARY, library);
  const persistCore = () => W40K.save(W40K.KEYS.CORE_STRATAGEM_LIBRARY, coreStratagems);

  // Each line: "デタッチメント名, 陣形タイプ, DP, ルール概要"
  const parseBasics = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, forceType, dp, rule] = line.split(/\t|,/).map((p) => p.trim());
        return { name: name || "無名デタッチメント", forceType: forceType || "", dp: Number(dp) || 0, rule: rule || "" };
      });

  const serializeBasics = (list) => (list || []).map((d) => [d.name, d.forceType, d.dp, d.rule].join(", ")).join("\n");

  // Each line: "デタッチメント名, 強化名, ポイント, 説明, 対象制限[, 除外]"
  // 対象制限 is a keyword (or "A/B" for an "either A or B" restriction) matched against the unit's
  // name/keywords; blank means unrestricted. 除外 is an optional keyword that disqualifies a match.
  const parseEnhancements = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [detachment, name, points, text2, restrictText, exclude] = line.split(/\t|,/).map((p) => p.trim());
        const restrictParts = (restrictText || "").split("/").map((p) => p.trim()).filter(Boolean);
        const restrict = restrictParts.length > 1 ? restrictParts : restrictParts[0] || "";
        return { detachment, name: name || "無名強化", points: Number(points) || 0, text: text2 || "", restrict, exclude: exclude || "" };
      });

  const serializeEnhancements = (list) =>
    (list || [])
      .flatMap((d) =>
        d.enhancements.map((e) => {
          const restrictText = Array.isArray(e.restrict) ? e.restrict.join("/") : e.restrict || "";
          const fields = [d.name, e.name, e.points, e.text, restrictText];
          if (e.exclude) fields.push(e.exclude);
          return fields.join(", ");
        })
      )
      .join("\n");

  // Each line: "デタッチメント名, 策略名, CP, タイミング, 効果"
  const parseStratagems = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [detachment, name, cost, phase, text2] = line.split(/\t|,/).map((p) => p.trim());
        return { detachment, name: name || "無名策略", cost: Number(cost) || 1, phase: phase || "", text: text2 || "" };
      });

  const serializeStratagems = (list) =>
    (list || []).flatMap((d) => d.stratagems.map((s) => [d.name, s.name, s.cost, s.phase, s.text].join(", ")))
      .join("\n");

  // Each line: "策略名, CP, タイミング, 効果" (no detachment column - these apply to every army).
  const parseCoreStratagems = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, cost, phase, text2] = line.split(/\t|,/).map((p) => p.trim());
        return { id: uid(), name: name || "無名策略", cost: Number(cost) || 1, phase: phase || "", text: text2 || "" };
      });

  const serializeCoreStratagems = (list) => (list || []).map((s) => [s.name, s.cost, s.phase, s.text].join(", ")).join("\n");

  const rebuildFromEditedText = (basicsText, enhancementsText, stratagemsText, coreStratagemsText) => {
    const basics = parseBasics(basicsText);
    const enhancementRows = parseEnhancements(enhancementsText);
    const stratagemRows = parseStratagems(stratagemsText);
    library = basics.map((b) => ({
      id: uid(),
      name: b.name,
      forceType: b.forceType,
      dp: b.dp,
      rule: b.rule,
      enhancements: enhancementRows
        .filter((e) => e.detachment === b.name)
        .map((e) => {
          // Computed modifiers (for the handful of enhancements that are simple flat stat/weapon
          // buffs) aren't part of the bulk-text format; reattach them from the seed by name so a
          // save from this screen doesn't silently drop the auto-calculation.
          const seedDetachment = SEED.find((s) => s.name === b.name);
          const seedEnh = seedDetachment && seedDetachment.enhancements.find((se) => se.name === e.name);
          return { id: uid(), name: e.name, points: e.points, text: e.text, restrict: e.restrict, exclude: e.exclude, modifiers: (seedEnh && seedEnh.modifiers) || [] };
        }),
      stratagems: stratagemRows.filter((s) => s.detachment === b.name).map((s) => ({ id: uid(), name: s.name, cost: s.cost, phase: s.phase, text: s.text })),
    }));
    persist();
    coreStratagems = parseCoreStratagems(coreStratagemsText);
    persistCore();
  };

  const openEditModal = () => {
    document.getElementById("detachments-basics-input").value = serializeBasics(library);
    document.getElementById("detachments-enhancements-input").value = serializeEnhancements(library);
    document.getElementById("detachments-stratagems-input").value = serializeStratagems(library);
    document.getElementById("detachments-core-stratagems-input").value = serializeCoreStratagems(coreStratagems);
    document.getElementById("modal-detachments").showModal();
  };

  const init = () => {
    document.getElementById("btn-edit-detachments").addEventListener("click", () => openEditModal());
    document.getElementById("form-detachments").addEventListener("submit", (e) => {
      e.preventDefault();
      rebuildFromEditedText(
        document.getElementById("detachments-basics-input").value,
        document.getElementById("detachments-enhancements-input").value,
        document.getElementById("detachments-stratagems-input").value,
        document.getElementById("detachments-core-stratagems-input").value
      );
      document.getElementById("modal-detachments").close();
      document.dispatchEvent(new CustomEvent("w40k:detachments-changed"));
    });
  };

  const replaceAll = (newLibrary, newCoreStratagems) => {
    library = Array.isArray(newLibrary) ? newLibrary : [];
    persist();
    coreStratagems = Array.isArray(newCoreStratagems) ? newCoreStratagems : [];
    persistCore();
    document.dispatchEvent(new CustomEvent("w40k:detachments-changed"));
  };

  W40K.Detachments = {
    init,
    getAll: () => library,
    getByName: (name) => library.find((d) => d.name === name),
    getCoreStratagems: () => coreStratagems,
    replaceAll,
  };
})();
