// Detachment library: reference data for all Adeptus Mechanicus detachments (rule/enhancements/stratagems),
// picked from when setting up a roster's detachment, adding a stratagem, or giving a unit an enhancement.
// Effect text here is paraphrased for personal reference, not copied verbatim from any rulebook.
(() => {
  const uid = () => W40K.uid();

  // The 7 official 11th-edition Adeptus Mechanicus detachments (Faction Pack v1.2), extracted from
  // Wahapedia (docs/wahapedia-cache branch) and translated to own-words Japanese, same source/policy
  // as js/unitlibrary-seed.js. Correctable any time via "デタッチメントマスタ編集" without losing data.
  const SEED = [
    {
      name: "ラドゾーン軍団",
      forceType: "迎撃戦",
      dp: 2,
      rule: "放射線爆撃: 第1ラウンド開始時、相手の配置エリア内の敵ユニットごとに「防御姿勢」か「隠れる」かを相手が選択。防御姿勢ならD6で3+ごとに致命傷D3。隠れるを選ぶとバトルショック状態になり5+で致命傷D3。第2〜5ラウンドの指揮フェイズ開始時は、相手の配置エリア内の敵ユニットごとにD6を振り、3+で致命傷1とバトルショックテストを強制。",
      enhancements: [
        { name: "放射拡散", points: 25, text: "第2ラウンド以降、放射線爆撃のフォールアウト効果解決時、装備者が盤上にいれば、相手の配置エリアの6インチ以内の敵ユニットにも追加でD6を振る。" },
        { name: "マルフォニックの囁き", points: 20, text: "装備者が部隊を率いている間、その部隊は隠密能力を得る。" },
        { name: "比類なき殲滅者", points: 20, text: "装備者が部隊を率いている間、その部隊の射撃武器は「連続命中1」を得る。", modifiers: [{ kind: "keyword", scope: "ranged", value: "連続命中1" }] },
        { name: "オートクレイヴの断罪", points: 15, text: "装備者の射撃武器は「対インファントリー2+」「対モンスター4+」を得る。", modifiers: [{ kind: "keyword", scope: "ranged", value: "対インファントリー2+" }, { kind: "keyword", scope: "ranged", value: "対モンスター4+" }] },
      ],
      stratagems: [
        { name: "禍々しき光輪", cost: 2, phase: "格闘フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍帝国技術局ユニット（乗物除く。バトルラインなら6インチ以内の友軍スキタリも追加可）を対象。ターン終了まで、それを狙う攻撃のウーンドロールに-1。" },
        { name: "殲滅命令", cost: 1, phase: "あなたの指揮フェイズ", text: "24インチ以内の目標物範囲内の敵ユニットごとにD6、4+で致命傷1とバトルショックテストを強制。" },
        { name: "攻撃命令", cost: 1, phase: "あなたの移動フェイズ", text: "まだ移動していない友軍スキタリ部隊（バトルラインなら6インチ以内の友軍スキタリも追加可）を対象。そのフェイズの間、前進の際ロールせず、代わりに移動特性+6インチ。" },
        { name: "事前較正殲滅解", cost: 1, phase: "あなたの射撃フェイズ", text: "まだ射撃していない友軍帝国技術局ユニット（バトルラインなら6インチ以内の友軍スキタリも追加可）を対象。相手配置エリア内の敵を狙う射撃攻撃は命中ロールをリロール可。" },
        { name: "致死量投与", cost: 1, phase: "あなたの射撃フェイズ", text: "まだ射撃していない友軍帝国技術局ユニットを対象。そのフェイズの間、射撃武器は「会心ヒット」を得る。" },
        { name: "防壁命令", cost: 2, phase: "相手の射撃フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍スキタリ部隊（バトルラインなら6インチ以内の友軍スキタリも追加可）を対象。そのフェイズの間、特防4+を得る。" },
      ],
    },
    {
      name: "ヘイロースクリード・バトルクレイド",
      forceType: "優先資産",
      dp: 3,
      rule: "ノウアスフィア転写: 指揮フェイズに、戦闘サイズに応じた数（強行1/主力2/殲滅3）の帝国技術局ユニットを選択し、次の指揮フェイズまで「ヘイローオーバーライド」キーワードを付与。さらに以下から1つ選び、そのキーワードを持つ全ユニットに次の指揮フェイズまで適用: 電動機励起=移動+2インチ／微小アクチュエータ補強=耐久+1／捕食プロトコル=前進したターンでもチャージ可／静音サーボモーター=隠密能力を得る。",
      enhancements: [
        { name: "トランスオラキュラー・ダイアド・ウェハー", points: 15, text: "カステラン・ロボット部隊に随伴させると、戦闘終了までその部隊は「ヘイローオーバーライド」キーワードを得る（その部隊はノウアスフィア転写の対象選択には使えなくなる）。", restrict: "サイバネティカ・データスミス" },
        { name: "認知力強化", points: 30, text: "装備者の部隊は征服命令と迎撃命令の両方が常時有効。", exclude: "サイバネティカ・データスミス" },
        { name: "聖別された兵装", points: 10, text: "装備者の部隊の射撃武器の射程+6インチ。またその部隊が危険テストを行う際はリロール可。" },
        { name: "継承された殺傷力", points: 15, text: "装備者の白兵武器の攻撃回数+3、ダメージ+1。", restrict: "テックプリースト・ドミナス/テックプリースト・マニピュラス" },
      ],
      stratagems: [
        { name: "殲滅プロトコル", cost: 1, phase: "あなたの射撃フェイズまたは格闘フェイズ", text: "まだ射撃・格闘していない友軍帝国技術局ユニットを対象。そのフェイズの間、攻撃時ウーンドロールの1をリロール可（ヘイローオーバーライドユニットなら命中ロールの1もリロール可）。" },
        { name: "照準オーバーライド", cost: 1, phase: "あなたの射撃フェイズまたは格闘フェイズ", text: "まだ射撃・格闘していない友軍帝国技術局ユニットを対象。そのフェイズの間、未修正命中ロール5+で会心ヒット扱い。" },
        { name: "神経過負荷", cost: 1, phase: "あなたの移動フェイズ", text: "友軍帝国技術局ユニットを対象。ヘイローオーバーライドユニットなら致命傷D3を受けつつオーバーライド能力を1つ選択し次の指揮フェイズまで適用（複数のオーバーライド能力を重ねられる）。そうでなければ致命傷なしでオーバーライド能力1つを得る。" },
        { name: "攻撃衝動", cost: 1, phase: "あなたの移動フェイズ", text: "まだ移動していない友軍スコルピウス・デューンライダーを対象。ターン終了まで、それから降車するユニットは強襲降車移動を行える。" },
        { name: "誘導退却", cost: 1, phase: "あなたの移動フェイズ、友軍帝国技術局ユニットが撤退移動した直後", text: "その帝国技術局ユニットを対象。ターン終了まで、撤退したターンでも射撃・チャージ宣言可（ヘイローオーバーライドユニットなら決死の脱出テストもリロール可）。" },
        { name: "分析による占術", cost: 1, phase: "相手の移動フェイズ、敵ユニットが移動を終えた直後", text: "その敵の8インチ以内・交戦距離外の友軍帝国技術局インファントリーユニット（カタフロン除く）を対象。通常移動D6インチ（ヘイローオーバーライドユニットなら6インチ）が可能。" },
      ],
    },
    {
      name: "スキタリ・ハンター・コホート",
      forceType: "偵察",
      dp: 2,
      rule: "隠密最適化: 友軍のスキタリ・インファントリー・スキタリ騎乗・アイアンストライダー・バリスタリイは隠密能力を持つ。",
      enhancements: [
        { name: "詠唱スロールネット", points: 25, text: "バトルラウンド開始時、12インチ以内の友軍スキタリ部隊を1つ選択。次のバトルラウンド開始まで、その部隊は迎撃命令・征服命令の両方が有効。", restrict: "スキタリ・マーシャル" },
        { name: "隠密の潜入者", points: 15, text: "装備者、およびその率いる部隊は「浸透戦術」と「斥候6インチ」を得る。", restrict: "スキタリ" },
        { name: "覆いを纏う狩人", points: 10, text: "両陣営の配置完了後、友軍スキタリ・インファントリー部隊を最大3つ再配置可能。その際、戦略予備の上限にかかわらず戦略予備に入れられる。", restrict: "スキタリ・マーシャル" },
        { name: "戦域中継アップリンク", points: 25, text: "射撃フェイズに装備者の部隊が射撃した後、交戦距離外なら通常移動6インチ可能（その場合そのターンはチャージ不可）。", restrict: "スキタリ" },
      ],
      stratagems: [
        { name: "生体機械の忍耐", cost: 1, phase: "相手の射撃フェイズまたは格闘フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍シカリアン/プテラクシイ/シドニアンユニットを対象。そのフェイズの間、「痛みを知らぬ者5+」を得る。" },
        { name: "二進法の攻勢", cost: 2, phase: "あなたの射撃フェイズまたは格闘フェイズ開始時", text: "まだ射撃・格闘していない友軍スキタリ2部隊と敵ユニット1つを対象。そのフェイズの間、両部隊の武器の貫通値+1（ただしその敵ユニット以外を対象にできなくなる）。" },
        { name: "迅速な粛清プロトコル", cost: 1, phase: "あなたのチャージフェイズ", text: "友軍スキタリユニットを対象。そのフェイズの間、前進したターンでもチャージ宣言可。" },
        { name: "分離撃滅", cost: 1, phase: "あなたの射撃フェイズ", text: "まだ射撃していない友軍シカリアン/プテラクシイ/シドニアン/アイアンストライダー・バリスタリイ/スキタリ騎乗ユニットを対象。そのフェイズの間、狙った敵の6インチ以内に他の敵がいなければウーンドロールに+1。" },
        { name: "遮蔽プロトコル", cost: 1, phase: "相手の射撃フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍スキタリ・インファントリーユニットを対象。そのフェイズの間、18インチ以上離れたモデルからは狙われない。" },
        { name: "計画的撤収", cost: 1, phase: "相手の格闘フェイズ終了時", text: "友軍シカリアン最大2部隊、またはスキタリ・インファントリー/騎乗1部隊を対象（全モデルが敵から3インチ以上離れていること）。盤上から取り除き戦略予備に戻す。" },
      ],
    },
    {
      name: "データ詠唱コンクラーベ",
      forceType: "撹乱",
      dp: 2,
      rule: "オムニシアの祝福: 第1ラウンド開始時、以下からカルト・メカニクスユニット全体に戦闘終了まで有効な祝福を1つ選択: 悲愴の行進=半分の射程内を狙う射撃攻撃の貫通値+1／蛮勇の称賛=このターンにチャージしたユニットが格闘に選ばれた際、そのフェイズの間白兵武器の攻撃力・攻撃回数+1。",
      enhancements: [
        { name: "メカニクスの代官", points: 5, text: "装備者の統率特性は6+。1戦闘に1回、任意のフェイズ開始時、12インチ以内のバトルショック状態の友軍カルト・メカニクス部隊を選択、バトルショックを解除できる。", restrict: "テックプリースト" },
        { name: "グノースティカークの外套", points: 10, text: "装備者に配分された攻撃のダメージ特性は1になる。", restrict: "テックプリースト" },
        { name: "データ聖別説教", points: 15, text: "1戦闘に1回、指揮フェイズ開始時、第1ラウンドで選ばなかった方のオムニシアの祝福を選択でき、次の指揮フェイズまで現在有効な祝福に加えて装備者の部隊にも適用される。", restrict: "テックプリースト" },
        { name: "テンポルコピア", points: 20, text: "装備者の部隊は「先手」能力を得る。", restrict: "テックプリースト" },
      ],
      stratagems: [
        { name: "鉄の魂の詠唱", cost: 1, phase: "任意のフェイズ、友軍カルト・メカニクスモデルに致命傷を割り振った直後", text: "そのモデルの部隊を対象。そのフェイズの間、致命傷に対して「痛みを知らぬ者4+」を得る。" },
        { name: "無慈悲な鉄拳の詠唱", cost: 1, phase: "格闘フェイズ", text: "まだ格闘していない友軍カルト・メカニクスユニットを対象。そのフェイズの間、白兵攻撃のウーンドロールに+1。" },
        { name: "復讐の詩篇", cost: 1, phase: "格闘フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍カルト・メカニクスユニットを対象。そのフェイズの間、モデルが撃破されまだ格闘していなければD6ロール、4+でそのモデルは除去されず、攻撃側の格闘終了後に格闘してから除去される。" },
        { name: "熱烈な崇敬の捧げ物", cost: 1, phase: "あなたの移動フェイズ開始時", text: "友軍カルト・メカニクスユニットと18インチ以内の敵ユニット1つを対象。その敵はバトルショックテストを強制され、失敗すると次の指揮フェイズまで攻撃の命中ロールに-1。" },
        { name: "電導術師の連禱", cost: 1, phase: "あなたの射撃フェイズ", text: "友軍カルト・メカニクスユニットを対象。6インチ以内の敵ユニットごとにD6（そのモデルがエレクトロプリーストなら+1）、5+で致命傷D3。" },
        { name: "光輝の祝福", cost: 1, phase: "相手の射撃フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍カルト・メカニクスユニットを対象。そのフェイズの間、特防4+を得る。" },
      ],
    },
    {
      name: "エクスプロラトール・マニプル",
      forceType: "優先資産",
      dp: 2,
      rule: "何としても確保せよ: 指揮フェイズ開始時、目標物を1つ選び「確保目標」に設定。次の指揮フェイズまで、帝国技術局モデルの攻撃で、そのモデルの部隊または攻撃対象が確保目標の範囲内にあれば、ウーンドロールの1をリロール可。",
      enhancements: [
        { name: "マゴス", points: 10, text: "指揮フェイズ終了時、装備者が確保目標の範囲内にいればD6ロール、4+でCP1点獲得。", restrict: "テックプリースト" },
        { name: "ジェネター", points: 20, text: "装備者が確保目標の範囲内にある部隊を率いている間、その部隊は特防4+を得る。", restrict: "テックプリースト" },
        { name: "ロギス", points: 15, text: "装備者が部隊を率いている間、その部隊が確保目標の範囲内の敵を攻撃する際、命中ロールに+1。", restrict: "テックプリースト" },
        { name: "アルティザン", points: 10, text: "装備者が確保目標の範囲内にある部隊を率いている間、1フェイズに1回、その部隊の命中ロール・ウーンドロール・セーブロールいずれか1つを未修正6の結果に変更できる。", restrict: "テックプリースト" },
      ],
      stratagems: [
        { name: "備蓄された確保", cost: 1, phase: "任意のフェイズ（確保目標範囲内で撃破された直後でも使用可）", text: "確保目標の範囲内で撃破された友軍帝国技術局ユニットを対象。その目標物の支配権を、相手が支配するまで維持する。" },
        { name: "優先回収", cost: 1, phase: "格闘フェイズ、友軍帝国技術局ユニットが再集結する直前", text: "そのユニットを対象（3インチ以内に敵がいると使用不可）。そのフェイズの間、再集結移動が3インチではなく6インチまで可能（確保目標範囲内で終える必要あり）。" },
        { name: "情報奴隷スカル", cost: 1, phase: "あなたの指揮フェイズ", text: "友軍テックプリーストと24インチ以内の目標物（既存の確保目標を除く）を対象。次の指揮フェイズまで、その目標物も確保目標として扱われる。" },
        { name: "自動神託回収", cost: 2, phase: "あなたの射撃フェイズ", text: "このターンにトランスポートから降車した友軍帝国技術局ユニットを対象。確保目標範囲内の敵を狙う射撃はウーンドロールに+1。" },
        { name: "香煙排気", cost: 1, phase: "相手の射撃フェイズ、敵ユニットが目標を選択した直後", text: "選択された友軍帝国技術局インファントリーユニットと、6インチ以内の友軍SMOKEユニットを対象。そのフェイズの間、両方とも隠密能力と遮蔽の恩恵を得る。" },
        { name: "反応的防護", cost: 1, phase: "相手のチャージフェイズ、敵がチャージを宣言した直後", text: "チャージされた確保目標範囲内の友軍帝国技術局インファントリーユニットと6インチ以内の友軍トランスポートを対象（全モデルがそのトランスポートの3インチ以内かつ収容枠が十分な場合）。そのトランスポートに乗車できる。" },
      ],
    },
    {
      name: "コホート・サイバネティカ",
      forceType: "迎撃戦",
      dp: 2,
      rule: "サイバー詠唱プログラミング: 友軍のレギオ・サイバネティカ・ユニットの移動特性+2インチ。さらにバトルショック状態でなければ、そのユニットの確保特性+1。",
      ruleRestrict: "レギオ・サイバネティカ",
      ruleModifiers: [{ kind: "numeric", scope: "profile", field: "move", value: 2 }, { kind: "numeric", scope: "profile", field: "oc", value: 1, requiresNotBattleShock: true }],
      enhancements: [
        { name: "死せざる機工師", points: 20, text: "1バトルラウンドに1回、12インチ以内の友軍レギオ・サイバネティカまたは帝国技術局乗物モデルのセーブロールが失敗した時に使用可。使用すると、その攻撃のダメージ特性を0にする。", restrict: "テックプリースト" },
        { name: "機械の君主", points: 15, text: "1ターンに1回、相手の射撃フェイズ開始時、12インチ以内かつ視認できる敵乗物部隊を選択、統率テストを強制。成功されるとそのフェイズの間その部隊の攻撃の命中ロールに-1、失敗するとそのフェイズ射撃不可。", restrict: "テックプリースト" },
        { name: "無感情なる明晰", points: 10, text: "1ターンに1回、12インチ以内の友軍レギオ・サイバネティカまたは帝国技術局乗物モデル（恐るべき最期を持つ）が撃破された時に使用可。使用すると、恐るべき最期の判定ロールを行わず自動的に致命傷が発生する。", restrict: "テックプリースト" },
        { name: "筆頭阻止者", points: 5, text: "装備者の射撃武器は「対乗物4+」を得る。", restrict: "テックプリースト", modifiers: [{ kind: "keyword", scope: "ranged", value: "対乗物4+" }] },
      ],
      stratagems: [
        { name: "起動命令", cost: 1, phase: "あなたの指揮フェイズ", text: "友軍帝国技術局乗物ユニットを対象。次の指揮フェイズまで、移動特性+3インチ、前進・チャージロールに+1。" },
        { name: "自動神託照準", cost: 1, phase: "あなたの指揮フェイズ", text: "友軍レギオ・サイバネティカまたは帝国技術局乗物ユニットと目標物1つを対象。次の指揮フェイズまで、その部隊の射撃武器の技能は3+、「遮蔽無効」を得るが、選んだ目標物の範囲内しか狙えなくなる。" },
        { name: "機械霊の甦り", cost: 1, phase: "あなたの指揮フェイズ", text: "開始戦力を下回っている友軍レギオ・サイバネティカまたは帝国技術局乗物ユニットを対象。次の指揮フェイズまで攻撃の命中ロールをリロール可（半数以下ならウーンドロールもリロール可）。" },
        { name: "機械の優越", cost: 1, phase: "あなたの指揮フェイズ", text: "友軍レギオ・サイバネティカまたは帝国技術局乗物ユニットを対象。ターン終了まで、撤退したターンでも射撃可能で、特性・ロール・テストへの修正（セーブロール除く）を無視できる。" },
        { name: "超越した思考", cost: 1, phase: "あなたの指揮フェイズ", text: "友軍レギオ・サイバネティカまたは帝国技術局乗物ユニットを対象。次の指揮フェイズまで征服命令と迎撃命令の両方が有効。" },
        { name: "オムニシアの恩寵", cost: 1, phase: "あなたの指揮フェイズ", text: "友軍レギオ・サイバネティカまたは帝国技術局乗物ユニットを対象。次の指揮フェイズまで「痛みを知らぬ者6+」（致命傷に対しては5+）を得る。" },
      ],
    },
    {
      name: "エラディケーション・コホート",
      forceType: "掃討戦",
      dp: 3,
      rule: "殺戮命令: 友軍スキタリ・ユニットの攻撃時、迎撃命令が有効なら命中ロールの1をリロール可、征服命令が有効ならウーンドロールの1をリロール可。",
      enhancements: [
        { name: "万物思考機関", points: 25, text: "装備者の部隊は征服命令と迎撃命令の両方が常時有効。", restrict: "スキタリ・マーシャル" },
        { name: "軍用信号増幅器", points: 15, text: "装備者の部隊のモデルはSKITARIIキーワードを得る。", restrict: "テックプリースト" },
        { name: "ベリコサ級キャパシタ・ヴェーン", points: 25, text: "装備者の部隊の射撃武器の射程+6インチ、攻撃力+1。" },
        { name: "オムニシアの激怒", points: 10, text: "装備者の白兵武器の攻撃回数+2、貫通値・ダメージそれぞれ1向上。", restrict: "スキタリ・マーシャル" },
      ],
      stratagems: [
        { name: "サーヴォ駆動突撃", cost: 1, phase: "格闘フェイズ", text: "まだ格闘していない友軍帝国技術局ユニットを対象。そのフェイズの間、白兵武器は「ランス」を得る。" },
        { name: "容赦なき攻勢", cost: 1, phase: "あなたの移動フェイズ、友軍帝国技術局ユニットが撤退した直後", text: "そのユニットを対象。ターン終了まで、撤退したターンでも射撃可能（SKITARIIキーワードがあればチャージも宣言可）。" },
        { name: "解放された怒り", cost: 1, phase: "あなたの射撃フェイズ", text: "まだ射撃していない友軍スキタリユニットを対象。そのフェイズの間、射撃武器に「連続命中1」または「会心ヒット」（もしくは両方＋「危険」）を付与できる。" },
        { name: "脅威演算照準機", cost: 1, phase: "あなたの射撃フェイズ", text: "まだ射撃していない友軍スキタリ乗物ユニットを対象。そのフェイズの間、モンスター/乗物への射撃ダメージロールをリロール可。" },
        { name: "精密猛攻", cost: 1, phase: "あなたのチャージフェイズ、友軍シカリアンユニットがチャージを宣言した直後", text: "そのユニットを対象。チャージ移動終了時、交戦距離内の敵1つを選び、交戦距離内のモデル数分D6、4+ごとに致命傷1。" },
        { name: "分析による反撃", cost: 1, phase: "相手の射撃フェイズ、敵が射撃した直後", text: "その攻撃でモデルを失った友軍スキタリ・インファントリーユニットを対象。自分の射撃フェイズであるかのように射撃可能（その敵ユニットのみを対象にできる場合に限る）。" },
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
      ruleRestrict: d.ruleRestrict || "",
      ruleModifiers: d.ruleModifiers || [],
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
      if (d.ruleModifiers === undefined) {
        d.ruleRestrict = seedDetachment.ruleRestrict || "";
        d.ruleModifiers = seedDetachment.ruleModifiers || [];
        backfilled = true;
      }
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
        return { name: name || "無名デタッチメント", forceType: forceType || "", dp: Number(W40K.toHalfWidthDigits(dp)) || 0, rule: rule || "" };
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
        return { detachment, name: name || "無名強化", points: Number(W40K.toHalfWidthDigits(points)) || 0, text: text2 || "", restrict, exclude: exclude || "" };
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
        return { detachment, name: name || "無名策略", cost: Number(W40K.toHalfWidthDigits(cost)) || 1, phase: phase || "", text: text2 || "" };
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
        return { id: uid(), name: name || "無名策略", cost: Number(W40K.toHalfWidthDigits(cost)) || 1, phase: phase || "", text: text2 || "" };
      });

  const serializeCoreStratagems = (list) => (list || []).map((s) => [s.name, s.cost, s.phase, s.text].join(", ")).join("\n");

  const rebuildFromEditedText = (basicsText, enhancementsText, stratagemsText, coreStratagemsText) => {
    const basics = parseBasics(basicsText);
    const enhancementRows = parseEnhancements(enhancementsText);
    const stratagemRows = parseStratagems(stratagemsText);
    const coreStratagemRows = parseCoreStratagems(coreStratagemsText);

    // One combined warning across all four sections, rather than a separate popup for each -
    // this screen replaces the whole master dataset in one save, so a column mistake anywhere
    // is worth flagging before it silently overwrites everything.
    const badSections = [
      [basics, "無名デタッチメント", "デタッチメント基本情報"],
      [enhancementRows, "無名強化", "強化一覧"],
      [stratagemRows, "無名策略", "策略一覧"],
      [coreStratagemRows, "無名策略", "コア策略一覧"],
    ]
      .map(([items, fallback, label]) => ({ label, count: items.filter((it) => it.name === fallback).length }))
      .filter((s) => s.count > 0);
    if (badSections.length > 0) {
      const summary = badSections.map((s) => `${s.label}: ${s.count}件`).join("、");
      if (!confirm(`次の項目が正しく読み取れませんでした（${summary}）。列の区切り（カンマ）が正しいか確認してください。このまま保存しますか？`)) {
        return false;
      }
    }

    library = basics.map((b) => {
      // Computed rule modifiers (for detachment rules that are simple flat keyword-conditional stat
      // buffs) aren't part of the bulk-text format; reattach them from the seed by name so a save
      // from this screen doesn't silently drop the auto-calculation.
      const seedDetachment = SEED.find((s) => s.name === b.name);
      return {
        id: uid(),
        name: b.name,
        forceType: b.forceType,
        dp: b.dp,
        rule: b.rule,
        ruleRestrict: (seedDetachment && seedDetachment.ruleRestrict) || "",
        ruleModifiers: (seedDetachment && seedDetachment.ruleModifiers) || [],
        enhancements: enhancementRows
          .filter((e) => e.detachment === b.name)
          .map((e) => {
            // Computed modifiers (for the handful of enhancements that are simple flat stat/weapon
            // buffs) aren't part of the bulk-text format; reattach them from the seed by name so a
            // save from this screen doesn't silently drop the auto-calculation.
            const seedEnh = seedDetachment && seedDetachment.enhancements.find((se) => se.name === e.name);
            return { id: uid(), name: e.name, points: e.points, text: e.text, restrict: e.restrict, exclude: e.exclude, modifiers: (seedEnh && seedEnh.modifiers) || [] };
          }),
        stratagems: stratagemRows.filter((s) => s.detachment === b.name).map((s) => ({ id: uid(), name: s.name, cost: s.cost, phase: s.phase, text: s.text })),
      };
    });
    persist();
    coreStratagems = coreStratagemRows;
    persistCore();
    return true;
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
      const saved = rebuildFromEditedText(
        document.getElementById("detachments-basics-input").value,
        document.getElementById("detachments-enhancements-input").value,
        document.getElementById("detachments-stratagems-input").value,
        document.getElementById("detachments-core-stratagems-input").value
      );
      if (!saved) return;
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

  // Explicit, user-triggered overwrite (unlike the first-run seed above, this replaces whatever is
  // there now). Only the detachment library, not core stratagems - those aren't Wahapedia-derived.
  const resetToSeed = () => {
    library = buildSeed();
    persist();
    document.dispatchEvent(new CustomEvent("w40k:detachments-changed"));
    return true;
  };

  W40K.Detachments = {
    init,
    getAll: () => library,
    getByName: (name) => library.find((d) => d.name === name),
    getCoreStratagems: () => coreStratagems,
    replaceAll,
    resetToSeed,
  };
})();
