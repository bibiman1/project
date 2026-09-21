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
        { name: "探索者の特典", points: 20, text: "スキタリ・マーシャルのみ。このユニットは潜入を得る。" },
        { name: "ステルス投影サイバー犬", points: 15, text: "セルベリス・レイダーのみ。単独工作員15\"を得る。" },
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
        { name: "アルデブラク・ヴィーンの力織チップ", points: 25, text: "サイバネティカ・データスミスのみ。第1バトルラウンド開始時、合流ユニットであればバトル終了まで高機動を持つ。" },
        { name: "TL-4Ø9", points: 30, text: "テックプリーストのみ。専用武器を得る（射程24\"・攻撃回数3・技能2+・攻撃力11・貫通-2・ダメージD3+2、会心ウーンズ／危険物）。" },
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
        { name: "ヴォルターガイストの聖遺物", points: 15, text: "テックプリーストのみ。敵ユニットは即応射撃でこのユニットを対象にできない。" },
        { name: "電磁瘴気香炉", points: 10, text: "テックプリーストのみ。このユニットは隠密能力を持つ。" },
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
        { name: "万算機", points: 25, text: "スキタリ・マーシャルのみ。装備者のユニットに迎撃命令と征服命令が両方有効になる。" },
        { name: "戦闘印章増幅器", points: 15, text: "テックプリーストのみ。装備者のユニット内の兵はスキタリのキーワードを得る。" },
        { name: "ベリコサ級蓄電フィン", points: 25, text: "帝国技術局のみ。装備者のユニットの射撃武器は射程+6mv、攻撃力+1。" },
        { name: "万機神の激情", points: 10, text: "スキタリ・マーシャルのみ。装備者の白兵戦武器は攻撃回数+2、貫通値とダメージ量+1。" },
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
        { name: "汎預見ダイアドチップ", points: 30, text: "サイバネティカ・データスミスのみ。カステラン・ロボットに合流時、そのユニットは精神強制処理キーワードを得る。" },
        { name: "認知科学的増援", points: 35, text: "帝国技術局のみ（データスミスを除く）。征服命令と迎撃命令が同時に有効になる。" },
        { name: "聖別されし砲弾", points: 10, text: "帝国技術局のみ。装備者のユニットの射撃武器は射程+6mv、暴発判定をリロールできる。" },
        { name: "致命的破壊力、入力完了", points: 15, text: "テックプリースト・ドミヌスまたはマニプルスのみ。白兵戦武器は攻撃回数+3、ダメージ量+1。" },
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
        { name: "ネクロメカニック", points: 20, text: "テックプリーストのみ。バトルラウンド1回、12mv以内の味方レギオ・サイバネティカ/帝国技術局・ビークルのセーヴ失敗時にダメージを0にできる。" },
        { name: "マシンの君主", points: 15, text: "テックプリーストのみ。敵射撃フェイズ開始時1回、12mv以内の敵ビークルに統率テストを課し、失敗なら射撃不可、成功でも自軍へのヒット-1。" },
        { name: "感情なき明晰", points: 10, text: "テックプリーストのみ。12mv以内の即死アビリティ持ちレギオ・サイバネティカ/ビークルが撃破された時、致命的ダメージを自動適用に変える。" },
        { name: "大否定者", points: 5, text: "テックプリーストのみ。装備者の射撃武器に対ビークル4+を付与。" },
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
        { name: "放射拡散", points: 25, text: "2ラウンド目以降、追加判定の範囲を相手配置ゾーン外6mvまで拡張する。" },
        { name: "不協和音の呟き", points: 20, text: "装備者が率いるユニットに隠密能力を付与。" },
        { name: "完全なる根絶者", points: 20, text: "装備者が率いるユニットの射撃武器に連続命中1を付与。" },
        { name: "生体忌避の宣告", points: 15, text: "装備者の射撃武器に対インファントリー2+と対モンスター4+を付与。" },
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
        { name: "カンティック・スロールネット", points: 25, text: "スキタリ・マーシャルのみ。ラウンド開始時、12mv以内の味方スキタリ1個を選択、次のラウンド開始まで迎撃命令と征服命令を両方有効にできる。" },
        { name: "秘匿の浸透者", points: 15, text: "スキタリのみ。潜入と偵察6\"を得る。" },
        { name: "覆われし狩人", points: 10, text: "スキタリ・マーシャルのみ。両軍配置直後、味方スキタリ・インファントリーを最大3個まで再配置可能（戦略的予備戦力への配置も可）。" },
        { name: "戦域アップリンク", points: 25, text: "スキタリのみ。射撃フェイズ後、非接敵なら最大6mv追加移動できる（そのターン突撃不可になる）。" },
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
        { name: "メカニクス・ロクム", points: 5, text: "テックプリーストのみ。統率6+になり、バトル中1回、戦闘ショック状態の味方カルト・メカニクス・ユニットの戦闘ショックを解除できる。" },
        { name: "グノスティカーチの外套", points: 10, text: "テックプリーストのみ。被弾時のダメージを1に固定する。" },
        { name: "データ祝された自動説教", points: 15, text: "テックプリーストのみ。バトル中1回、指揮フェイズにもう片方のベネディクションも自ユニットに追加で有効にできる。" },
        { name: "テンポルコピア", points: 20, text: "テックプリーストのみ。装備者のユニットはファイトファーストを得る。" },
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
        { name: "マグス", points: 10, text: "テックプリーストのみ。指揮フェイズ終了時、取得目標マーカー範囲内ならD6判定4+でCP+1。" },
        { name: "ジェネター", points: 20, text: "テックプリーストのみ。率いるユニットが取得目標マーカー範囲内にいる間、無効セーヴ4+を得る。" },
        { name: "ロギス", points: 15, text: "テックプリーストのみ。率いるユニットが取得目標マーカー範囲内の敵を攻撃する時、ヒットロール+1。" },
        { name: "アルチザン", points: 10, text: "テックプリーストのみ。率いるユニットが取得目標マーカー範囲内にいる間、1フェイズ1回、ヒット/ウーンズ/セーヴいずれかの出目を無修正6に変更できる。" },
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
  }

  const persist = () => W40K.save(W40K.KEYS.DETACHMENT_LIBRARY, library);

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

  // Each line: "デタッチメント名, 強化名, ポイント, 説明"
  const parseEnhancements = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [detachment, name, points, text2] = line.split(/\t|,/).map((p) => p.trim());
        return { detachment, name: name || "無名強化", points: Number(points) || 0, text: text2 || "" };
      });

  const serializeEnhancements = (list) =>
    (list || []).flatMap((d) => d.enhancements.map((e) => [d.name, e.name, e.points, e.text].join(", ")))
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

  const rebuildFromEditedText = (basicsText, enhancementsText, stratagemsText) => {
    const basics = parseBasics(basicsText);
    const enhancementRows = parseEnhancements(enhancementsText);
    const stratagemRows = parseStratagems(stratagemsText);
    library = basics.map((b) => ({
      id: uid(),
      name: b.name,
      forceType: b.forceType,
      dp: b.dp,
      rule: b.rule,
      enhancements: enhancementRows.filter((e) => e.detachment === b.name).map((e) => ({ id: uid(), name: e.name, points: e.points, text: e.text })),
      stratagems: stratagemRows.filter((s) => s.detachment === b.name).map((s) => ({ id: uid(), name: s.name, cost: s.cost, phase: s.phase, text: s.text })),
    }));
    persist();
  };

  const openEditModal = () => {
    document.getElementById("detachments-basics-input").value = serializeBasics(library);
    document.getElementById("detachments-enhancements-input").value = serializeEnhancements(library);
    document.getElementById("detachments-stratagems-input").value = serializeStratagems(library);
    document.getElementById("modal-detachments").showModal();
  };

  const init = () => {
    document.getElementById("btn-edit-detachments").addEventListener("click", () => openEditModal());
    document.getElementById("form-detachments").addEventListener("submit", (e) => {
      e.preventDefault();
      rebuildFromEditedText(
        document.getElementById("detachments-basics-input").value,
        document.getElementById("detachments-enhancements-input").value,
        document.getElementById("detachments-stratagems-input").value
      );
      document.getElementById("modal-detachments").close();
      document.dispatchEvent(new CustomEvent("w40k:detachments-changed"));
    });
  };

  W40K.Detachments = { init, getAll: () => library, getByName: (name) => library.find((d) => d.name === name) };
})();
