// ── 猫咪食物数据库（离线 JSON）─────────────────────────────
// 约 60KB，嵌入小程序本地，完全离线可用

const foods = [
  // ═══ 肉类 ═══
  { id:"m1", name:"鸡胸肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪，富含维生素B6和烟酸", effect:"优质蛋白质来源，易消化，促进肌肉生长，对猫咪健康极好", advice:"水煮或蒸熟后切小块喂食，不加任何调味料。建议占日常肉类的50%以上", warning:"务必完全煮熟，生鸡肉可能含沙门氏菌", recipes:[{name:"鸡肉胡萝卜饭", scene:"日常营养"},{name:"鸡胸肉南瓜泥", scene:"肠胃调理"}] },
  { id:"m2", name:"牛肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含铁、锌、维生素B12，蛋白质含量高", effect:"补血、增强免疫力，适合术后恢复和贫血猫咪", advice:"煮熟后切碎喂食，去除筋膜。每周2-3次，不宜过量", warning:"生牛肉有寄生虫风险，必须完全煮熟" },
  { id:"m3", name:"猪瘦肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"含硫胺素（维生素B1）", effect:"补充能量，猪瘦肉是安全的肉类来源", advice:"煮至全熟，去掉脂肪，切小块喂食", warning:"猪肉必须全熟！生猪肉可能携带伪狂犬病毒，对猫致命；禁止喂肥肉和加工猪肉制品（火腿、培根含高钠）" },
  { id:"m4", name:"鸭肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含铁、磷、B族维生素", effect:"滋阴补血，适合热性体质的猫咪", advice:"去皮煮熟后喂食，鸭皮脂肪含量高应去掉", warning:"务必完全煮熟" },
  { id:"m5", name:"羊肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含L-肉碱和共轭亚油酸", effect:"补气暖身，适合体寒猫咪", advice:"煮熟后去骨切碎，适量喂食", warning:"脂肪含量较高，肥胖猫咪控制量" },

  // ═══ 内脏 ═══
  { id:"o1", name:"鸡肝", category:"organ", categoryLabel:"内脏", safety:"caution", safetyLabel:"谨慎", nutrition:"富含维生素A、铁、叶酸", effect:"补充铁质，改善贫血，促进视力健康", advice:"每周不超过1-2次，每次不超过总食量的5%", warning:"⚠️ 过量会导致维生素A中毒！不可作为主食" },
  { id:"o2", name:"鸡心", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"富含牛磺酸、辅酶Q10、铁", effect:"牛磺酸对猫咪心脏和视力至关重要，猫咪自身无法合成足够牛磺酸", advice:"煮熟切碎，每周可喂2-3次", warning:"彻底煮熟，不要加调料" },

  // ═══ 海鲜 ═══
  { id:"s1", name:"三文鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"富含Omega-3脂肪酸、优质蛋白", effect:"美毛护肤，抗炎，促进大脑发育", advice:"完全煮熟后去刺喂食。每周1-2次", warning:"必须煮熟！生三文鱼可能含寄生虫和硫胺酶（破坏维生素B1）。不可喂烟熏三文鱼（高钠）", recipes:[{name:"三文鱼南瓜泥", scene:"美毛护肤"}] },
  { id:"s2", name:"虾", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、低脂肪，含虾青素", effect:"补充蛋白质和抗氧化物质", advice:"去头去壳去虾线，完全煮熟后喂食。每周不超过1-2只", warning:"部分猫咪对虾过敏，首次喂食观察反应。虾壳难消化必须去掉" },
  { id:"s3", name:"金枪鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白，Omega-3", effect:"补充蛋白质", advice:"偶尔作为零食，不可常吃", warning:"⚠️ 长期大量喂食会导致汞中毒、维生素E缺乏（黄脂病）。金枪鱼罐头的油/盐水对猫有害" },

  // ═══ 蔬菜 ═══
  { id:"v1", name:"胡萝卜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含β-胡萝卜素、膳食纤维", effect:"促进消化，有益视力", advice:"煮熟后捣碎或打成泥，少量混入肉中喂食", warning:"生胡萝卜难以消化，必须煮熟" },
  { id:"v2", name:"南瓜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含膳食纤维、维生素A、钾", effect:"缓解便秘和腹泻（双向调节），促进肠胃健康", advice:"煮熟后打成泥，混入主食中。便秘时每餐加1-2小勺", warning:"南瓜籽需去除，南瓜皮难消化" },
  { id:"v3", name:"西兰花", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含维生素C、膳食纤维、抗氧化物质", effect:"增强免疫力，促进消化", advice:"煮熟切碎，少量添加", warning:"过量可能导致胀气" },

  // ═══ 水果 ═══
  { id:"f1", name:"蓝莓", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"富含花青素、维生素C、抗氧化剂", effect:"抗氧化，有益泌尿道健康", advice:"洗净后压碎，每次1-2颗即可", warning:"去蒂，整颗可能导致噎住" },
  { id:"f2", name:"西瓜", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"水分含量高，含少量维生素A/C", effect:"夏季补水消暑", advice:"去掉籽和皮，少量喂食瓜肉", warning:"西瓜籽含氰化物，必须去除；含糖量较高不宜多喂" },
  { id:"f3", name:"葡萄", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 对猫狗有剧毒！", advice:"禁止喂食任何形式的葡萄、葡萄干、葡萄汁", warning:"☠️ 即使是微量也可能导致急性肾衰竭！24小时内出现呕吐嗜睡症状，需立即就医！" },
  { id:"f4", name:"苹果", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"含果胶、维生素C", effect:"助消化", advice:"去皮去核去籽，切成极小碎块，偶尔少量喂食", warning:"苹果籽含氰化物，必须去除！果皮难消化" },

  // ═══ 谷物 ═══
  { id:"g1", name:"大米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"碳水化合物，易消化", effect:"提供能量，温和不刺激肠胃", advice:"煮成白粥或软饭，混入肉类中", warning:"不能作为主食，猫是肉食动物" },
  { id:"g2", name:"燕麦", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"富含可溶性膳食纤维、B族维生素", effect:"助消化，缓解便秘", advice:"煮熟后少量添加", warning:"不能替代肉类主食" },

  // ═══ 乳制品 ═══
  { id:"d1", name:"牛奶", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"含乳糖", effect:"☠️ 大多数成年猫咪乳糖不耐受", advice:"禁止喂普通牛奶", warning:"☠️ 会导致腹泻、呕吐、脱水。如需补充奶类，选用0乳糖宠物专用奶" },
  { id:"d2", name:"无糖酸奶", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"益生菌、钙、蛋白质", effect:"益生菌助消化，发酵过程分解了大部分乳糖", advice:"选择无糖原味酸奶，首次极少量尝试，观察是否腹泻", warning:"部分猫咪仍可能不耐受，观察后无异常再少量喂" },

  // ═══ 调味品 ═══
  { id:"sp1", name:"洋葱", category:"seasoning", categoryLabel:"调味品", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含正丙基二硫化物，破坏猫咪红细胞", advice:"绝对禁止！包括洋葱粉、洋葱汁、生洋葱、熟洋葱", warning:"☠️ 会导致溶血性贫血！症状：呕吐、腹泻、精神萎靡、牙龈苍白。葱蒜家族（洋葱、大蒜、韭菜、香葱）全部禁止！" },
  { id:"sp2", name:"大蒜", category:"seasoning", categoryLabel:"调味品", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 毒性比洋葱更强", advice:"绝对禁止！任何形式包含大蒜的食物都不可以", warning:"☠️ 比洋葱毒性强5倍！微量即可能造成伤害。" },

  // ═══ 有毒植物 ═══
  { id:"t1", name:"百合花", category:"toxic_plant", categoryLabel:"有毒植物", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 所有部位（花瓣、叶子、花粉、花蕊，甚至花瓶水）对猫都有剧毒", advice:"绝对不要让猫咪接触百合花！家里不要养任何百合", warning:"☠️ 即使舔到少量花粉也可能导致急性肾衰竭！症状：呕吐、嗜睡、食欲不振。6小时内送医还有救" },
  { id:"t2", name:"巧克力", category:"toxic_plant", categoryLabel:"有毒植物", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含可可碱和咖啡因，猫无法代谢", advice:"绝对禁止！所有巧克力制品（黑巧克力毒性最强）", warning:"☠️ 中毒症状：呕吐、腹泻、心跳加速、震颤、癫痫。严重可致死。黑巧克力毒性是牛奶巧克力的10倍" },

  // ═══ 其他 ═══
  { id:"x1", name:"鸡蛋", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"蛋黄含卵磷脂、维生素A/D，蛋白含优质蛋白质", effect:"美毛护肤，补充蛋白质", advice:"只喂熟蛋黄！蛋白必须煮熟。每周1-2个蛋黄即可", warning:"⚠️ 生蛋白含抗生物素蛋白，会破坏维生素B7吸收导致皮肤问题。必须完全煮熟再喂" },
];

// ═══════════════════════════════════════════════════════════
// 猫饭配方库（离线可用）
// ═══════════════════════════════════════════════════════════

const RECIPES = [
  // ── 日常营养 ──
  {
    id: 'r1', name: '鸡肉胡萝卜饭',
    scene: '日常营养', sceneTag: '每日健康',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '60g', foodId: 'm1' },
      { name: '胡萝卜', amount: '20g', foodId: 'v1' },
      { name: '大米', amount: '20g', foodId: 'g1' },
    ],
    steps: [
      '鸡胸肉洗净，放入沸水中煮至完全变白（约8分钟），捞出沥干',
      '胡萝卜去皮切小块，煮至软烂（约10分钟）',
      '大米煮成软饭或白粥',
      '将鸡肉撕成细丝，胡萝卜捣成泥',
      '所有材料混合拌匀，放凉至室温后喂食',
    ],
    tips: '不加任何调味料（盐、酱油、油均不放）。每次制作量不超过2天食量，剩余冷藏保存。',
    suitable: '所有成年猫咪，尤其适合挑食的猫',
  },
  {
    id: 'r2', name: '牛肉蔬菜丁',
    scene: '日常营养', sceneTag: '高蛋白',
    time: '20分钟', difficulty: '简单',
    ingredients: [
      { name: '瘦牛肉', amount: '60g', foodId: 'm2' },
      { name: '南瓜', amount: '20g', foodId: 'v2' },
      { name: '西兰花', amount: '10g', foodId: 'v3' },
    ],
    steps: [
      '牛肉去筋膜切小丁，沸水煮至全熟（约10分钟）',
      '南瓜去皮切块，蒸/煮至软烂捣泥',
      '西兰花切小朵煮软，切碎',
      '混合拌匀，放凉喂食',
    ],
    tips: '牛肉不可半生，必须全熟。每周喂2-3次即可，不宜每天吃。',
    suitable: '需要补铁补血、术后恢复的猫咪',
  },
  {
    id: 'r3', name: '鸡心鸭肉双拼',
    scene: '日常营养', sceneTag: '牛磺酸补充',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡心', amount: '30g', foodId: 'o2' },
      { name: '鸭肉', amount: '50g', foodId: 'm4' },
      { name: '南瓜', amount: '15g', foodId: 'v2' },
    ],
    steps: [
      '鸡心对半切开洗净血水，鸭肉去皮切丁',
      '一起入沸水煮至全熟（约8分钟）',
      '捞出鸡心和鸭肉切碎',
      '南瓜蒸熟捣泥，拌入肉碎',
    ],
    tips: '鸡心是天然牛磺酸来源，对猫咪心脏和视力至关重要。每周2-3次。',
    suitable: '所有猫咪，尤其需要补充牛磺酸的室内猫',
  },

  // ── 肠胃调理 ──
  {
    id: 'r4', name: '鸡胸肉南瓜泥',
    scene: '肠胃调理', sceneTag: '温和养胃',
    time: '12分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '50g', foodId: 'm1' },
      { name: '南瓜', amount: '40g', foodId: 'v2' },
    ],
    steps: [
      '鸡胸肉煮熟撕成极细的丝',
      '南瓜去皮蒸熟，充分捣成细腻泥状',
      '二者混合搅拌均匀，呈糊状',
    ],
    tips: '这是最温和的配方。腹泻期间可额外加一勺南瓜。便秘时增加南瓜比例到50%。',
    suitable: '肠胃敏感、腹泻或便秘调理期猫咪',
  },
  {
    id: 'r5', name: '鸡胸肉燕麦糊',
    scene: '肠胃调理', sceneTag: '止泻配方',
    time: '10分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '40g', foodId: 'm1' },
      { name: '燕麦', amount: '20g', foodId: 'g2' },
    ],
    steps: [
      '鸡胸肉煮熟切极碎',
      '燕麦加少量水煮成粘稠糊状',
      '混合鸡肉碎和燕麦糊，搅匀放凉',
    ],
    tips: '燕麦的黏稠质地可缓解轻微腹泻。腹泻严重时请及时就医。',
    suitable: '轻微腹泻、肠胃不适的猫咪',
  },

  // ── 美毛护肤 ──
  {
    id: 'r6', name: '三文鱼南瓜泥',
    scene: '美毛护肤', sceneTag: 'Omega-3滋养',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '三文鱼', amount: '60g', foodId: 's1' },
      { name: '南瓜', amount: '20g', foodId: 'v2' },
      { name: '鸡蛋黄', amount: '半个', foodId: 'x1' },
    ],
    steps: [
      '三文鱼去骨去刺，蒸/煮熟（约8分钟）',
      '仔细检查去除所有鱼刺，将鱼肉捣碎',
      '南瓜蒸熟捣泥，熟蛋黄压碎',
      '三者混合拌匀',
    ],
    tips: '三文鱼必须全熟！每周1-2次即可。Omega-3美毛效果约坚持2-3周可见。',
    suitable: '毛色暗淡、掉毛严重或皮肤干燥的猫咪',
  },
  {
    id: 'r7', name: '蛋黄鸡丝拌饭',
    scene: '美毛护肤', sceneTag: '卵磷脂滋养',
    time: '12分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '50g', foodId: 'm1' },
      { name: '鸡蛋黄', amount: '1个', foodId: 'x1' },
      { name: '大米', amount: '15g', foodId: 'g1' },
    ],
    steps: [
      '鸡蛋煮熟取蛋黄，压碎备用',
      '鸡胸肉煮熟撕丝，大米煮成软饭',
      '三者拌匀即可',
    ],
    tips: '蛋黄含丰富卵磷脂，有助美毛。每周1-2次，每次1个蛋黄即可，不可过量。',
    suitable: '日常美毛保养，适合所有猫咪',
  },

  // ── 术后/恢复期 ──
  {
    id: 'r8', name: '牛肉肝泥营养糊',
    scene: '术后恢复', sceneTag: '补血益气',
    time: '18分钟', difficulty: '中等',
    ingredients: [
      { name: '瘦牛肉', amount: '50g', foodId: 'm2' },
      { name: '鸡肝', amount: '10g', foodId: 'o1' },
      { name: '胡萝卜', amount: '15g', foodId: 'v1' },
    ],
    steps: [
      '牛肉去筋煮熟切碎',
      '鸡肝煮熟（务必全熟），切极细碎',
      '胡萝卜煮熟捣泥',
      '所有材料混合，加少量温水调成糊状（方便病后食欲差的猫咪舔食）',
    ],
    tips: '鸡肝量严格控制（不超过总重10%），仅恢复期使用。连续喂食不超过5天，防止维生素A过量。',
    suitable: '术后、产后、大病初愈需要补血补气的猫咪',
  },

  // ── 夏季消暑 ──
  {
    id: 'r9', name: '鸭肉冬瓜羹',
    scene: '夏季消暑', sceneTag: '清热补水',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鸭肉', amount: '60g', foodId: 'm4' },
      { name: '冬瓜', amount: '30g', foodId: null },
    ],
    steps: [
      '鸭肉去皮切丁煮熟',
      '冬瓜去皮去瓤切小块，煮至透明软烂',
      '鸭肉撕碎，和冬瓜一起用少量汤调成羹状',
    ],
    tips: '鸭肉性凉，冬瓜清热利尿，适合夏天。猫咪不爱喝水时这个配方可补水。冬瓜需去皮去籽。',
    suitable: '夏季炎热、喝水少的猫咪',
  },

  // ── 减肥配方 ──
  {
    id: 'r10', name: '低脂鸡胸西兰花',
    scene: '体重管理', sceneTag: '低脂高蛋白',
    time: '12分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '70g', foodId: 'm1' },
      { name: '西兰花', amount: '20g', foodId: 'v3' },
    ],
    steps: [
      '鸡胸肉去皮（鸡皮脂肪高必须去），煮熟切丁',
      '西兰花煮软切碎',
      '拌匀即可，可加少量温水',
    ],
    tips: '超低脂配方。减肥期间每日总食量需配合兽医建议。配合增加运动量（逗猫棒每日20分钟）。',
    suitable: '超重、需要控制体重的猫咪',
  },
];

// ── 导出 ──────────────────────────────────────────────────

module.exports = foods;
module.exports.FOODS = foods;
module.exports.RECIPES = RECIPES;
module.exports.getByCategory = (cat) => foods.filter(f => f.category === cat);
module.exports.getBySafety = (level) => foods.filter(f => f.safety === level);
module.exports.getById = (id) => foods.find(f => f.id === id) || RECIPES.find(r => r.id === id);
module.exports.searchFoods = (query) => {
  const q = (query || '').toLowerCase();
  if (!q) return foods;
  return foods.filter(f =>
    f.name.toLowerCase().includes(q) ||
    (f.effect || '').toLowerCase().includes(q) ||
    (f.categoryLabel || '').includes(q)
  );
};
module.exports.getRecipesByScene = (scene) => RECIPES.filter(r => r.scene === scene);
