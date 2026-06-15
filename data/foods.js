// ── 猫咪食物数据库（离线 JSON）─────────────────────────────
// 约 ~200KB，嵌入小程序本地，完全离线可用
// 8 个分类 · ~200+ 食物 · 宁缺毋滥原则

const foods = [

  // ═══════════════════════════════════════════════════════════
  // 1. 肉类 (~20 种)
  // ═══════════════════════════════════════════════════════════
  { id:"m1", name:"鸡胸肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪，富含维生素B6和烟酸", effect:"优质蛋白质来源，易消化，促进肌肉生长", advice:"水煮或蒸熟后切小块喂食，不加调味料。建议占日常肉类的50%以上", warning:"务必完全煮熟，生鸡肉可能含沙门氏菌", recipes:[{name:"鸡肉胡萝卜饭", scene:"日常营养"},{name:"鸡胸肉南瓜泥", scene:"肠胃调理"}] },
  { id:"m2", name:"牛肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含铁、锌、维生素B12，蛋白质含量高", effect:"补血、增强免疫力，适合术后恢复和贫血猫咪", advice:"煮熟后切碎喂食，去除筋膜。每周2-3次，不宜过量", warning:"生牛肉有寄生虫风险，必须完全煮熟" },
  { id:"m3", name:"猪瘦肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"含硫胺素（维生素B1）", effect:"补充能量，猪瘦肉是安全的肉类来源", advice:"煮至全熟，去掉脂肪，切小块喂食", warning:"猪肉必须全熟！生猪肉可能携带伪狂犬病毒，对猫致命；禁止喂肥肉和加工猪肉制品" },
  { id:"m4", name:"鸭肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含铁、磷、B族维生素", effect:"滋阴补血，适合热性体质的猫咪", advice:"去皮煮熟后喂食，鸭皮脂肪含量高应去掉", warning:"务必完全煮熟" },
  { id:"m5", name:"羊肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含L-肉碱和共轭亚油酸", effect:"补气暖身，适合体寒猫咪", advice:"煮熟后去骨切碎，适量喂食", warning:"脂肪含量较高，肥胖猫咪控制量" },
  { id:"m6", name:"鸡腿肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、含铁锌、B族维生素", effect:"优质动物蛋白来源，相比鸡胸肉脂肪略高但更香嫩", advice:"去骨去皮后水煮熟切小块。脂肪含量比鸡胸高，肥胖猫适量", warning:"必须完全煮熟，去骨防止刺伤消化道" },
  { id:"m7", name:"鸡软骨", category:"meat", categoryLabel:"肉类", safety:"caution", safetyLabel:"谨慎", nutrition:"含胶原蛋白、软骨素、钙", effect:"关节保健，天然磨牙", advice:"煮熟后切小丁，每周1-2次作零食。不能替代主食", warning:"切小防止噎住；过量可能导致便秘" },
  { id:"m8", name:"鸭腿肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含铁、磷、B族维生素，比鸭胸脂肪更低", effect:"滋阴补血，适合热性体质", advice:"去皮去骨煮熟后切碎喂食", warning:"鸭皮脂肪高必须去除" },
  { id:"m9", name:"猪里脊", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪、含硫胺素", effect:"猪身上最瘦的部位，优质蛋白来源", advice:"煮至全熟切小块，去除可见脂肪", warning:"必须全熟！生猪肉可能携带伪狂犬病毒" },
  { id:"m10", name:"猪排骨肉", category:"meat", categoryLabel:"肉类", safety:"caution", safetyLabel:"谨慎", nutrition:"蛋白质+骨髓营养", advice:"剔除骨头后取瘦肉部分，煮熟喂食。骨头绝对不能给！", warning:"⚠️ 煮熟的骨头会碎裂，刺伤食道和肠道！只给肉不给骨" },
  { id:"m11", name:"牛里脊", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、铁锌丰富、低脂肪", effect:"补血养气，优质红肉蛋白", advice:"煮熟后切碎喂食。每周2-3次", warning:"必须全熟" },
  { id:"m12", name:"牛腩", category:"meat", categoryLabel:"肉类", safety:"caution", safetyLabel:"谨慎", nutrition:"蛋白质+适量脂肪", effect:"口感软烂，猫咪通常爱吃", advice:"炖煮至软烂后取瘦肉部分，去除脂肪和筋膜", warning:"脂肪含量较高，肥胖猫咪少吃" },
  { id:"m13", name:"羊腿肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"富含L-肉碱、铁、锌", effect:"补气暖身，适合体寒猫咪", advice:"煮熟后去骨切碎，适量喂食", warning:"脂肪含量较高" },
  { id:"m14", name:"兔肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"超高蛋白(约21%)、超低脂肪(约8%)、富含烟酸", effect:"低过敏优质蛋白来源，适合肥胖/过敏猫咪", advice:"煮熟后去骨切碎。适合作为日常主要肉类", warning:"必须完全煮熟，野兔可能有寄生虫风险" },
  { id:"m15", name:"火鸡肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白低脂肪，富含色氨酸", effect:"优质白肉蛋白，比鸡肉更瘦", advice:"去皮煮熟后切碎喂食", warning:"必须完全煮熟" },
  { id:"m16", name:"鹌鹑肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪、富含脑磷脂", effect:"滋补强身，猫咪易消化", advice:"去骨煮熟后切碎，小型禽类骨头细软更要仔细去骨", warning:"必须完全煮熟，确保去净碎骨" },
  { id:"m17", name:"鸽子肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白(约22%)、富含铁铜", effect:"滋补气血，传统认为有利术后愈合", advice:"去骨煮熟后喂食，适量即可", warning:"来源不明的鸽子可能有药物残留，建议正规渠道购买" },
  { id:"m18", name:"鹿肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪、富含铁和B12", effect:"低敏高蛋白红肉，适合过敏体质猫咪", advice:"煮熟后切碎喂食", warning:"来源较稀少，需确保正规渠道" },
  { id:"m19", name:"鸡皮", category:"meat", categoryLabel:"肉类", safety:"caution", safetyLabel:"谨慎", nutrition:"高脂肪、少量胶原蛋白", effect:"高热量，猫咪通常很爱吃", advice:"极少量作为零食调味，不可常喂", warning:"⚠️ 高脂肪可能导致胰腺炎！肥胖猫、胰腺炎史猫咪禁止喂食" },
  { id:"m20", name:"肥肉/猪油渣", category:"meat", categoryLabel:"肉类", safety:"danger", safetyLabel:"危险", nutrition:"纯脂肪", effect:"☠️ 高脂肪难以消化", advice:"禁止喂食任何形式的肥肉、猪油渣", warning:"☠️ 高脂肪可引发急性胰腺炎！症状：剧烈腹痛、呕吐、脱水。需立即就医" },

  // ═══════════════════════════════════════════════════════════
  // 2. 内脏 (~9 种)
  // ═══════════════════════════════════════════════════════════
  { id:"o1", name:"鸡肝", category:"organ", categoryLabel:"内脏", safety:"caution", safetyLabel:"谨慎", nutrition:"富含维生素A、铁、叶酸", effect:"补充铁质，改善贫血，促进视力健康", advice:"每周不超过1-2次，每次不超过总食量的5%", warning:"⚠️ 过量会导致维生素A中毒！不可作为主食" },
  { id:"o2", name:"鸡心", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"富含牛磺酸、辅酶Q10、铁", effect:"牛磺酸对猫咪心脏和视力至关重要，猫咪自身无法合成足够牛磺酸", advice:"煮熟切碎，每周可喂2-3次", warning:"彻底煮熟，不要加调料" },
  { id:"o3", name:"牛肝", category:"organ", categoryLabel:"内脏", safety:"caution", safetyLabel:"谨慎", nutrition:"富含维生素A、B12、铁、铜", effect:"高效补血，营养密度极高", advice:"每周不超过1次，每次不超过总食量5%。比鸡肝维生素A含量更高更需控制", warning:"⚠️ 维生素A中毒风险高于鸡肝！严格控制量" },
  { id:"o4", name:"猪肝", category:"organ", categoryLabel:"内脏", safety:"caution", safetyLabel:"谨慎", nutrition:"含维生素A、铁、叶酸", effect:"补血效果强", advice:"每周不超过1次，每次极少量的作为营养补充", warning:"⚠️ 同样有维生素A过量风险。必须全熟" },
  { id:"o5", name:"鸡胗", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白低脂肪，含胃蛋白酶、铁", effect:"助消化，补充蛋白质和铁", advice:"煮熟切碎，可常喂。口感Q弹猫咪喜欢", warning:"务必煮熟，清洗干净去除内膜" },
  { id:"o6", name:"猪腰(肾)", category:"organ", categoryLabel:"内脏", safety:"caution", safetyLabel:"谨慎", nutrition:"富含铁、锌、硒、B12", effect:"补充微量元素", advice:"煮熟切碎，每周最多1次。去除白筋减少腥味", warning:"胆固醇较高；一定要全熟" },
  { id:"o7", name:"牛百叶/毛肚", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白低脂肪，胶原蛋白", effect:"优质蛋白零食，耐嚼磨牙", advice:"清水煮熟（不加火锅底料！），切小条喂食", warning:"只能喂白水煮的！火锅牛百叶含大量盐和调味料对猫有害" },
  { id:"o8", name:"猪脑", category:"organ", categoryLabel:"内脏", safety:"caution", safetyLabel:"谨慎", nutrition:"高胆固醇、含脑磷脂", advice:"极少量偶尔喂食。高胆固醇不适合常喂", warning:"⚠️ 胆固醇极高！肥胖和老年猫不建议喂" },
  { id:"o9", name:"猪血/鸭血", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"富含血红素铁、蛋白质", effect:"高效补血，吸收率远超植物铁", advice:"煮熟后切小丁，每周1-2次少量喂食", warning:"不要买加工血豆腐（可能含盐/添加剂），选纯动物血自己煮熟" },

  // ═══════════════════════════════════════════════════════════
  // 3. 海鲜 (~21 种)
  // ═══════════════════════════════════════════════════════════
  { id:"s1", name:"三文鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"富含Omega-3脂肪酸、优质蛋白", effect:"美毛护肤，抗炎，促进大脑发育", advice:"完全煮熟后去刺喂食。每周1-2次", warning:"必须煮熟！生三文鱼可能含寄生虫和硫胺酶。不可喂烟熏三文鱼（高钠）", recipes:[{name:"三文鱼南瓜泥", scene:"美毛护肤"}] },
  { id:"s2", name:"虾", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、低脂肪，含虾青素", effect:"补充蛋白质和抗氧化物质", advice:"去头去壳去虾线，完全煮熟后喂食。每周不超过1-2只", warning:"部分猫咪对虾过敏，首次喂食观察反应。虾壳难消化必须去掉" },
  { id:"s3", name:"金枪鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白，Omega-3", effect:"补充蛋白质", advice:"偶尔作为零食，不可常吃", warning:"⚠️ 长期大量喂食会导致汞中毒、维生素E缺乏（黄脂病）。金枪鱼罐头的油/盐水对猫有害" },
  { id:"s4", name:"鳕鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪、含Omega-3", effect:"易消化的优质白肉鱼，对肠胃友好", advice:"蒸/煮熟后去刺，可常喂", warning:"必须去净鱼刺" },
  { id:"s5", name:"鲈鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"蛋白质丰富，含铜、碘", effect:"肉质细嫩，很适合猫咪", advice:"清蒸去刺后喂食，不加调料", warning:"细刺多，务必仔细去除" },
  { id:"s6", name:"龙利鱼/巴沙鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白低脂肪，无小刺", effect:"安全易处理的鱼类，适合猫咪", advice:"蒸/煮熟后喂食", warning:"市售冷冻鱼柳可能泡过磷酸盐保水，选无添加的" },
  { id:"s7", name:"秋刀鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"富含Omega-3、维生素D、钙", effect:"美毛护肤，补钙", advice:"烤/蒸熟后去大刺，鱼肉捣碎", warning:"小刺多，仔细去刺" },
  { id:"s8", name:"马鲛鱼(鲅鱼)", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、Omega-3丰富", effect:"美毛，补充DHA", advice:"煮熟去刺后喂食", warning:"部分海水鱼嘌呤较高，肾功能不好的猫咪要注意" },
  { id:"s9", name:"沙丁鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"富含Omega-3、钙、维生素D", effect:"美毛护肤，补钙强骨", advice:"选清水浸泡无盐罐装或鲜鱼煮熟，去骨后少量喂食", warning:"⚠️ 不能喂油浸/盐渍/调味罐装沙丁鱼！高钠油腻" },
  { id:"s10", name:"罗非鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"高蛋白、低脂肪、价格亲民", effect:"安全实惠的日常鱼类蛋白", advice:"蒸/煮熟后去刺喂食", warning:"养殖罗非鱼可能存在药物残留问题，选正规渠道" },
  { id:"s11", name:"鳟鱼", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"类似三文鱼，富含Omega-3", effect:"美毛护肤，优质蛋白", advice:"完全煮熟后去刺喂食", warning:"必须煮熟！生鳟鱼可能含寄生虫" },
  { id:"s12", name:"鳗鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、高脂肪、富含维A", effect:"高热量营养补充", advice:"偶尔极少量，只喂白水煮的鳗鱼肉", warning:"⚠️ 蒲烧鳗鱼含大量酱油和糖对猫有害；生鳗鱼血有毒必须煮熟" },
  { id:"s13", name:"扇贝", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、含牛磺酸、锌、B12", effect:"补充牛磺酸（猫必需），营养密度高", advice:"去壳取贝柱，清水煮熟后切小丁。每周1-2个", warning:"必须熟！生贝类可能含致病菌。部分猫咪贝类过敏" },
  { id:"s14", name:"蛤蜊/花甲", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"富含铁、B12、牛磺酸", effect:"补充牛磺酸和铁", advice:"吐沙后清水煮熟，去壳取肉切碎。少量喂食", warning:"必须煮熟！沙子吐不干净会刺激肠胃" },
  { id:"s15", name:"牡蛎/生蚝", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"含锌量最高的食物之一，富含牛磺酸", effect:"补锌、补牛磺酸", advice:"必须彻底煮熟！极少量偶尔喂食", warning:"⚠️ 绝对不能生吃！生蚝携带大量细菌和寄生虫。高锌也不能常喂" },
  { id:"s16", name:"鲍鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、含多种微量元素", advice:"煮熟切小丁，极少量偶尔喂食", warning:"必须煮熟，过量不易消化" },
  { id:"s17", name:"螃蟹", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、含甲壳素", advice:"蒸熟后取蟹肉，去净壳渣，极少量喂食", warning:"⚠️ 蟹壳坚硬可能刺伤消化道！只给蟹肉不给壳。部分猫过敏" },
  { id:"s18", name:"鱿鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、含牛磺酸", advice:"白水煮熟后切细丝，少量偶尔喂食", warning:"⚠️ 不能喂铁板鱿鱼/烧烤鱿鱼（高油高盐调味料）！生的可能含寄生虫" },
  { id:"s19", name:"章鱼", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、含牛磺酸、铁", effect:"补充牛磺酸", advice:"白水煮熟后切碎，少量偶尔喂食", warning:"⚠️ 章鱼吸盘难以消化，务必切碎。不能喂生章鱼或调味章鱼" },
  { id:"s20", name:"鱼籽/鱼卵", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、高脂肪、高胆固醇", advice:"极少量偶尔喂食。营养密度极高", warning:"⚠️ 含盐量可能较高（尤其市售鱼籽），且胆固醇极高" },
  { id:"s21", name:"海带/昆布", category:"seafood", categoryLabel:"海鲜", safety:"caution", safetyLabel:"谨慎", nutrition:"富含碘、褐藻酸、膳食纤维", advice:"煮熟切碎，极少量混入肉类中", warning:"⚠️ 碘含量过高可能影响甲状腺功能！极少量即可" },

  // ═══════════════════════════════════════════════════════════
  // 4. 蔬菜 (~27 种)
  // ═══════════════════════════════════════════════════════════
  { id:"v1", name:"胡萝卜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含β-胡萝卜素、膳食纤维", effect:"促进消化，有益视力", advice:"煮熟后捣碎或打成泥，少量混入肉中喂食", warning:"生胡萝卜难以消化，必须煮熟" },
  { id:"v2", name:"南瓜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含膳食纤维、维生素A、钾", effect:"缓解便秘和腹泻（双向调节），促进肠胃健康", advice:"煮熟后打成泥，混入主食中。便秘时每餐加1-2小勺", warning:"南瓜籽需去除，南瓜皮难消化" },
  { id:"v3", name:"西兰花", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含维生素C、膳食纤维、抗氧化物质", effect:"增强免疫力，促进消化", advice:"煮熟切碎，少量添加", warning:"过量可能导致胀气" },
  { id:"v4", name:"红薯/地瓜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含β-胡萝卜素、膳食纤维、维生素C", effect:"助消化，提供缓释能量", advice:"蒸/烤熟后捣成泥，少量混入肉中", warning:"生红薯难消化；含糖量较高，糖尿病猫咪慎用" },
  { id:"v5", name:"土豆", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水化合物、钾、维生素C", effect:"提供能量，温和不刺激", advice:"必须完全煮熟后捣泥，少量添加", warning:"⚠️ 绝对不能喂生土豆或发芽土豆（含龙葵碱剧毒）！土豆皮也含毒素需削掉" },
  { id:"v6", name:"山药", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含黏蛋白、淀粉酶、膳食纤维", effect:"健脾胃，助消化", advice:"蒸熟去皮捣泥，少量混入肉类", warning:"生山药含草酸钙可能刺激口腔，必须煮熟" },
  { id:"v7", name:"芋头", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"含黏液蛋白、钾、膳食纤维", advice:"必须完全煮熟后少量喂食", warning:"生芋头含草酸钙刺激性极强，务必全熟" },
  { id:"v8", name:"莲藕", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含膳食纤维、维生素C、铁", effect:"助消化，清热", advice:"煮熟后切碎少量添加", warning:"生莲藕难消化" },
  { id:"v9", name:"萝卜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含消化酶、膳食纤维、维生素C", effect:"助消化，清热通气", advice:"煮熟后切碎少量添加", warning:"生萝卜辛辣且难消化，必须煮熟" },
  { id:"v10", name:"菠菜", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"富含铁、维生素K、叶酸", effect:"补血，补充叶酸", advice:"焯水去除草酸后切碎，少量喂食", warning:"⚠️ 含草酸较高，可能影响钙吸收、增加尿结石风险。有泌尿问题的猫咪避免" },
  { id:"v11", name:"小白菜/青菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含维生素C、钙、膳食纤维", effect:"补充维生素，助消化", advice:"焯水煮熟后切碎，少量混入肉中", warning:"清洗干净去除农药残留" },
  { id:"v12", name:"生菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"水分高、低热量、含少量纤维", effect:"补水，基本无害", advice:"洗净后少量添加，猫咪可能不感兴趣", warning:"营养价值不高，不能替代肉类" },
  { id:"v13", name:"油麦菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含维生素A/C、膳食纤维", advice:"焯水煮熟后切碎，少量喂食", warning:"清洗干净" },
  { id:"v14", name:"卷心菜/包菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含维生素U（抗溃疡因子）、膳食纤维", effect:"护胃，助消化", advice:"煮熟后切碎，少量添加", warning:"生卷心菜可能导致胀气" },
  { id:"v15", name:"芹菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"富含膳食纤维、钾、维生素K", effect:"助消化，利尿", advice:"去筋后煮熟切碎，少量添加", warning:"芹菜纤维较粗，需切碎防止噎住" },
  { id:"v16", name:"空心菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含叶绿素、维生素C、膳食纤维", advice:"焯水煮熟切碎，少量喂食", warning:"烹饪清淡不加调料" },
  { id:"v17", name:"黄瓜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"水分极高(约96%)、低热量", effect:"补水、消暑", advice:"洗净去皮切小丁，夏季少量喂食", warning:"营养价值低，当零食补水就好不能当正餐" },
  { id:"v18", name:"冬瓜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"水分高、低热量、含少量维生素C", effect:"清热利尿、夏季补水", advice:"去皮去籽煮熟后切碎，混入肉中", warning:"偏寒凉，肠胃敏感猫咪少量尝试" },
  { id:"v19", name:"番茄/西红柿", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"含番茄红素、维生素C、钾", effect:"抗氧化", advice:"只喂红色熟果肉！去皮去籽少量喂食", warning:"⚠️ 青番茄和番茄茎叶含茄碱（有毒）！部分猫咪对番茄过敏。不要喂番茄酱/番茄罐头（高盐）" },
  { id:"v20", name:"茄子", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"含花青素、膳食纤维", advice:"完全煮熟后去皮少量喂食", warning:"⚠️ 生茄子含茄碱！必须煮熟。部分猫咪可能过敏" },
  { id:"v21", name:"西葫芦", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"低热量、水分高、含维生素A/C", effect:"易消化，温和补水", advice:"煮熟后捣泥少量添加", warning:"清洗干净" },
  { id:"v22", name:"玉米", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水化合物、膳食纤维", effect:"提供能量", advice:"煮熟后剥粒，少量偶尔喂食", warning:"⚠️ 玉米粒整颗吞可能噎住或堵塞肠道！务必切碎。玉米芯绝对不能喂" },
  { id:"v23", name:"豌豆", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含植物蛋白、膳食纤维、维生素K", effect:"补充膳食纤维", advice:"煮熟后压碎，少量混入肉中", warning:"必须煮熟" },
  { id:"v24", name:"豆芽", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"水分高、低热量、含维生素C", advice:"煮熟后切碎少量添加", warning:"生豆芽可能含细菌，务必煮熟" },
  { id:"v25", name:"青椒/彩椒", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"维生素C含量极高（比橙子高）、β-胡萝卜素", effect:"抗氧化，补充维C", advice:"去籽煮熟后切碎，少量添加", warning:"辣椒素集中在籽和白膜中，要去净。不能喂辣椒（辣的）" },
  { id:"v26", name:"蘑菇/口蘑", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"含β-葡聚糖、硒、B族维生素", effect:"增强免疫力", advice:"买超市常见的养殖蘑菇（口蘑/香菇/杏鲍菇），彻底煮熟后切碎少量喂食", warning:"⚠️ 绝对不能喂野生蘑菇！很多对猫剧毒！不确定品种的蘑菇不要喂" },
  { id:"v27", name:"秋葵", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含黏液蛋白、膳食纤维、钙", effect:"护胃，助消化", advice:"煮熟后切小段，少量添加", warning:"黏液可能黏在猫咪胡须上" },

  // ═══════════════════════════════════════════════════════════
  // 5. 水果 (~24 种)
  // ═══════════════════════════════════════════════════════════
  { id:"f1", name:"蓝莓", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"富含花青素、维生素C、抗氧化剂", effect:"抗氧化，有益泌尿道健康", advice:"洗净后压碎，每次1-2颗即可", warning:"去蒂，整颗可能导致噎住" },
  { id:"f2", name:"西瓜", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"水分含量高，含少量维生素A/C", effect:"夏季补水消暑", advice:"去掉籽和皮，少量喂食瓜肉", warning:"西瓜籽含氰化物必须去除；含糖量较高不宜多喂" },
  { id:"f3", name:"葡萄", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 对猫狗有剧毒！", advice:"禁止喂食任何形式的葡萄、葡萄干、葡萄汁", warning:"☠️ 即使是微量也可能导致急性肾衰竭！24小时内出现呕吐嗜睡症状，需立即就医！" },
  { id:"f4", name:"苹果", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"含果胶、维生素C", effect:"助消化", advice:"去皮去核去籽，切成极小碎块，偶尔少量喂食", warning:"苹果籽含氰化物必须去除！果皮难消化" },
  { id:"f5", name:"香蕉", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"富含钾、维生素B6、膳食纤维", effect:"助消化，补钾", advice:"去皮切极小块，偶尔少量喂食（指甲盖大小）", warning:"⚠️ 糖分和碳水化合物较高，糖尿病/肥胖猫咪禁食。过量导致便秘" },
  { id:"f6", name:"草莓", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"富含维生素C、花青素、叶酸", effect:"抗氧化，低糖低热量", advice:"洗净去蒂切小块，每次1-2小颗", warning:"清洗去除农药残留" },
  { id:"f7", name:"哈密瓜", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"富含维生素A/C、β-胡萝卜素", effect:"补水，补充维生素", advice:"去皮去籽切小丁，少量喂食", warning:"糖分中等，适量即可" },
  { id:"f8", name:"木瓜", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"含木瓜蛋白酶、维生素C/A", effect:"助消化蛋白质分解", advice:"去皮去籽切小丁，少量喂食", warning:"不要喂未成熟的木瓜（含乳胶质）" },
  { id:"f9", name:"芒果", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"富含维生素A/C、β-胡萝卜素", advice:"去皮去核切极小丁，极少量偶尔喂食", warning:"⚠️ 芒果皮和核含漆酚类物质可能引起过敏。糖分较高" },
  { id:"f10", name:"菠萝", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"含菠萝蛋白酶、维生素C", advice:"去皮去芯切极小丁，极少量喂食", warning:"⚠️ 菠萝蛋白酶可能刺激口腔和肠胃。有些猫过敏。糖分较高" },
  { id:"f11", name:"樱桃", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 对猫狗有毒", advice:"禁止喂食！", warning:"☠️ 樱桃的核、茎、叶含氰化物，果肉也可能导致中毒症状。全部有毒！" },
  { id:"f12", name:"橙子/橘子", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"维生素C极高、柠檬酸", advice:"极少量果肉偶尔尝试，不要喂皮和籽", warning:"⚠️ 柑橘类精油和柠檬酸对猫有刺激性，多数猫讨厌柑橘味。过量导致肠胃不适" },
  { id:"f13", name:"柠檬", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 柑橘精油和柠檬酸对猫有毒刺激", advice:"禁止喂食！连皮都不要让猫接触", warning:"☠️ 含高浓度柠檬酸和精油，刺激肠胃和神经系统。多数猫会主动避开" },
  { id:"f14", name:"梨", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"水分高、含果胶、维生素C", advice:"去皮去核去籽切极小丁，少量偶尔喂食", warning:"梨籽含氰苷（分解产生氰化物），必须去净！果皮难消化" },
  { id:"f15", name:"桃子", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"含维生素A/C、膳食纤维", advice:"去皮去核切极小丁，极少量偶尔喂食", warning:"⚠️ 桃核含氰化物！必须去除。桃皮绒毛可能刺激肠胃" },
  { id:"f16", name:"李子", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"禁止喂食！", warning:"☠️ 李子的核和果肉对猫有潜在毒性，可能导致氰化物中毒" },
  { id:"f17", name:"椰子", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"椰子肉含中链甘油三酯和饱和脂肪", advice:"极少量新鲜椰肉偶尔喂食。不要喂椰子水", warning:"⚠️ 椰子水含钾量极高不适合猫。椰肉高脂肪不宜多喂" },
  { id:"f18", name:"猕猴桃", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"维生素C极高、含猕猴桃蛋白酶", advice:"去皮切极小丁，极少量偶尔喂食", warning:"含蛋白酶可能刺激口腔，糖分中等" },
  { id:"f19", name:"牛油果/鳄梨", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含 persin（鳄梨毒素）", advice:"绝对禁止！果肉、果核、叶子都有毒", warning:"☠️ Persin 对猫狗均有毒，导致呕吐、腹泻、呼吸困难。虽然狗比猫敏感但猫也应禁止" },
  { id:"f20", name:"荔枝", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"高糖、含维生素C", advice:"去壳去核取极少量果肉偶尔喂食", warning:"⚠️ 含糖量极高！糖尿病/肥胖猫咪禁食。核含氰苷必须去除" },
  { id:"f21", name:"榴莲", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"极高热量、高糖、高脂肪", advice:"极少量（指甲盖大小）偶尔尝试即可", warning:"⚠️ 高糖高脂高热量，极易导致肥胖和肠胃不适。多数猫被味道劝退" },
  { id:"f22", name:"石榴", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"富含花青素、维生素C、抗氧化物质", advice:"只喂极少量果肉（石榴籽包裹的汁囊），去籽", warning:"石榴籽难以消化可能堵塞肠道；果皮和根皮含生物碱有毒" },
  { id:"f23", name:"火龙果", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"低热量、高纤维、含花青素（红心）", effect:"助消化，抗氧化", advice:"去皮切极小丁，少量喂食", warning:"含籽较多但不影响消化" },
  { id:"f24", name:"杨梅", category:"fruit", categoryLabel:"水果", safety:"caution", safetyLabel:"谨慎", nutrition:"含有机酸、维生素C", advice:"去核取极少量果肉喂食", warning:"酸性较高可能刺激肠胃。核不能喂" },

  // ═══════════════════════════════════════════════════════════
  // 6. 谷物 (~12 种)
  // ═══════════════════════════════════════════════════════════
  { id:"g1", name:"大米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"碳水化合物，易消化", effect:"提供能量，温和不刺激肠胃", advice:"煮成白粥或软饭，混入肉类中", warning:"不能作为主食，猫是肉食动物" },
  { id:"g2", name:"燕麦", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"富含可溶性膳食纤维、B族维生素", effect:"助消化，缓解便秘", advice:"煮熟后少量添加", warning:"不能替代肉类主食" },
  { id:"g3", name:"小米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"富含B族维生素、铁、易消化碳水化合物", effect:"养胃易消化，适合肠胃敏感猫咪", advice:"煮成小米粥，少量混入肉食", warning:"不能作为主食" },
  { id:"g4", name:"糙米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"膳食纤维比白米高，含B族维生素", effect:"缓释能量，助消化", advice:"煮至软烂后少量混入", warning:"比白米难消化一些，需煮得非常软。不能作为主食" },
  { id:"g5", name:"黑米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"含花青素、铁、膳食纤维", effect:"抗氧化，补血", advice:"煮烂后少量添加", warning:"外壳较硬需长时间煮烂" },
  { id:"g6", name:"玉米面/玉米碴", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"碳水化合物、叶黄素", advice:"煮成玉米糊少量添加", warning:"许多猫粮中已有玉米成分，额外添加意义不大" },
  { id:"g7", name:"薏米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"含薏苡仁酯、膳食纤维", effect:"健脾祛湿，利尿", advice:"煮烂后少量添加", warning:"偏寒凉，肠胃敏感的猫咪少量尝试" },
  { id:"g8", name:"藜麦", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"完全蛋白（含9种必需氨基酸）、高纤维", effect:"优质植物蛋白来源，营养全面", advice:"煮熟后少量混入肉类", warning:"含皂苷需清洗后烹饪" },
  { id:"g9", name:"荞麦", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"含芦丁（黄酮类）、蛋白质较高", effect:"抗氧化", advice:"煮熟后少量混入", warning:"不能替代肉类主食" },
  { id:"g10", name:"面条/意面", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水化合物", advice:"偶尔极少量原味煮熟的面条，不要加任何酱料", warning:"⚠️ 只是空热量没有营养。不能喂含盐/油/酱的面条" },
  { id:"g11", name:"面包", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水化合物为主", advice:"极少量原味白面包偶尔作为零食", warning:"⚠️ 不能喂含葡萄干/巧克力/大蒜/洋葱的面包！全麦面包酵母和盐对猫不好" },
  { id:"g12", name:"馒头", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"纯碳水，营养密度极低", advice:"极少量偶尔给，猫咪可能喜欢嚼", warning:"没有任何营养，纯粹空热量。不能替代主食" },

  // ═══════════════════════════════════════════════════════════
  // 7. 乳制品 (~7 种)
  // ═══════════════════════════════════════════════════════════
  { id:"d1", name:"牛奶", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"含乳糖", effect:"☠️ 大多数成年猫咪乳糖不耐受", advice:"禁止喂普通牛奶", warning:"☠️ 会导致腹泻、呕吐、脱水。如需补充奶类，选用0乳糖宠物专用奶" },
  { id:"d2", name:"无糖酸奶", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"益生菌、钙、蛋白质", effect:"益生菌助消化，发酵过程分解了大部分乳糖", advice:"选择无糖原味酸奶，首次极少量尝试，观察是否腹泻", warning:"部分猫咪仍可能不耐受，观察后无异常再少量喂" },
  { id:"d3", name:"宠物专用奶(0乳糖)", category:"dairy", categoryLabel:"乳制品", safety:"safe", safetyLabel:"安全", nutrition:"去除乳糖，保留蛋白质和钙", effect:"安全补充奶类营养", advice:"按包装说明喂食，替代水饮用", warning:"必须是真正的0乳糖宠物奶！普通舒化奶乳糖虽降低但仍可能不耐受" },
  { id:"d4", name:"奶酪", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白高钙，发酵过程降低乳糖", effect:"高蛋白零食", advice:"选低钠硬质奶酪（如茅屋奶酪），极少量偶尔喂食", warning:"⚠️ 高钠高脂！蓝纹奶酪/调味奶酪/奶油奶酪绝对不能喂" },
  { id:"d5", name:"黄油/奶油", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"纯脂肪", advice:"禁止喂食！", warning:"☠️ 高脂肪极易引发急性胰腺炎。还含乳糖。完全禁止" },
  { id:"d6", name:"冰淇淋", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 高糖+高脂+乳糖+可能含巧克力/木糖醇，四重危害！完全禁止" },
  { id:"d7", name:"炼乳", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 含糖量极高+乳糖，对猫极其不健康" },
  { id:"d8", name:"宠物羊奶粉", category:"dairy", categoryLabel:"乳制品", safety:"safe", safetyLabel:"安全", nutrition:"0乳糖、含羊奶天然营养（钙、蛋白质、维生素A/B群）", effect:"安全补充奶类营养，特别适合幼猫、哺乳期母猫、术后恢复猫咪", advice:"按包装说明用温水冲泡，可替代水饮用或泡软猫粮。幼猫断奶过渡首选", warning:"必须是猫咪专用0乳糖羊奶粉！不要用人喝的羊奶粉替代（成分和乳糖处理不同）" },
  { id:"d9", name:"人类羊奶粉", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"乳糖含量比牛奶低约10-20%，脂肪球小易消化", effect:"比牛奶更易耐受，但仍有乳糖", advice:"选纯羊奶无添加糖/香精的品种，极少量冲泡尝试，观察是否腹泻", warning:"⚠️ 并非所有猫都能耐受！仍含乳糖，只是比牛奶少。有乳糖不耐受的猫仍可能拉肚子。优先选宠物专用羊奶粉更安全" },

  // ═══════════════════════════════════════════════════════════
  // 8. 其他 (~80 种) — 调味品 · 有毒植物 · 观赏植物 · 坚果种子 · 饮品 · 加工食品 · 药品化学品 · 杂项
  // ═══════════════════════════════════════════════════════════

  // ── 调味品/香料 ──
  { id:"sp1", name:"洋葱", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含正丙基二硫化物，破坏猫咪红细胞", advice:"绝对禁止！包括洋葱粉、洋葱汁、生洋葱、熟洋葱", warning:"☠️ 会导致溶血性贫血！症状：呕吐、腹泻、精神萎靡、牙龈苍白。葱蒜家族全部禁止！" },
  { id:"sp2", name:"大蒜", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 毒性比洋葱更强", advice:"绝对禁止！任何形式包含大蒜的食物都不可以", warning:"☠️ 比洋葱毒性强5倍！微量即可能造成伤害" },
  { id:"sp3", name:"葱/大葱", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 同洋葱家族，含正丙基二硫化物", advice:"绝对禁止！和洋葱一样危险", warning:"☠️ 导致溶血性贫血！葱油饼/葱油面等含葱食物都不能喂" },
  { id:"sp4", name:"韭菜", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 葱属植物，同洋葱毒性", advice:"绝对禁止！韭菜饺子/韭菜盒子等不能喂", warning:"☠️ 同洋葱，导致溶血性贫血" },
  { id:"sp5", name:"盐", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 高钠", advice:"猫的食物不需要加盐！人类的含盐食物不要喂猫", warning:"☠️ 过量钠导致电解质紊乱、高血压、肾脏负担。薯片/火腿/咸鱼等含盐食物均禁止" },
  { id:"sp6", name:"糖", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 猫无法有效代谢糖", advice:"任何含糖食物都不应该给猫", warning:"☠️ 导致肥胖、糖尿病、牙齿问题。猫不需要糖" },
  { id:"sp7", name:"木糖醇", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 对猫可能引发低血糖和肝损伤", advice:"绝对禁止！检查无糖食品（口香糖、牙膏、花生酱）配料表", warning:"☠️ 虽然猫对木糖醇的敏感度不如狗，但仍极具危险性！少量即可引发严重低血糖" },
  { id:"sp8", name:"辣椒/花椒", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 辣椒素刺激消化道", advice:"禁止喂食任何辣味食物", warning:"☠️ 刺激肠胃导致呕吐腹泻、口腔灼痛。猫咪不需要也不应该吃辣" },
  { id:"sp9", name:"胡椒", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"—", advice:"烹饪猫食时不要放任何调料包括胡椒", warning:"刺激肠胃，可能导致呕吐。虽然不像洋葱有毒但也不应该给" },
  { id:"sp10", name:"酱油", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含盐量极高（约15-18%）", advice:"绝对禁止！猫的食物不需要调味", warning:"☠️ 高钠+含小麦（可能过敏），对猫百害无利" },
  { id:"sp11", name:"味精/鸡精", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"禁止添加到猫食中", warning:"☠️ 高钠+谷氨酸钠对猫代谢有负担" },
  { id:"sp12", name:"生姜", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"含姜辣素", advice:"极少量姜末偶尔混入食物（有些猫饭食谱用），但大多数猫不需要", warning:"大量刺激肠胃。不是必需添加物" },
  { id:"sp13", name:"肉桂", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"含香豆素", advice:"不要让猫接触肉桂粉/肉桂棒", warning:"⚠️ 大量摄入有肝毒性；吸入肉桂粉可刺激呼吸道" },
  { id:"sp14", name:"咖喱", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"禁止！", warning:"☠️ 咖喱含多种对猫有害的香料（洋葱粉、大蒜粉、辣椒等），复合调味极不安全" },

  // ── 有毒植物/花卉 ──
  { id:"t1", name:"百合花", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 所有部位（花瓣、叶子、花粉、花蕊，甚至花瓶水）对猫都有剧毒", advice:"绝对不要让猫咪接触百合花！家里不要养任何百合", warning:"☠️ 即使舔到少量花粉也可能导致急性肾衰竭！症状：呕吐、嗜睡、食欲不振。6小时内送医还有救" },
  { id:"t2", name:"郁金香", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 球茎含毒素（郁金香碱）", advice:"家里不要养郁金香，尤其不要让猫接触球茎", warning:"☠️ 啃食球茎导致流口水、恶心、呕吐。大量摄入可能影响心脏" },
  { id:"t3", name:"水仙花", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 全株有毒（含石蒜碱），球茎毒性最强", advice:"绝对不要让猫接触！尤其春节前后常见水仙", warning:"☠️ 中毒症状：呕吐、腹泻、心律失常、抽搐。球茎毒性最强，甚至花瓶水都有毒" },
  { id:"t4", name:"绿萝", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含草酸钙结晶", advice:"家里有绿萝的放高处或挂起来，不要让猫啃", warning:"☠️ 啃咬后口腔剧痛、流口水、呕吐、吞咽困难。常见家养植物中猫中毒率第一" },
  { id:"t5", name:"龟背竹", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含草酸钙结晶", advice:"网红植物但对猫有毒，最好不养", warning:"☠️ 同绿萝，啃咬导致口腔剧痛、肿胀" },
  { id:"t6", name:"夹竹桃", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含强心苷，全株剧毒（叶、花、茎、根、树汁）", advice:"绝对不要让猫接触", warning:"☠️ 剧毒！极少量即可导致心律失常、呕吐、腹泻甚至死亡" },
  { id:"t7", name:"杜鹃花", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含木藜芦烷毒素", advice:"禁止让猫接触", warning:"☠️ 中毒症状：流口水、呕吐、腹泻、低血压、心律失常" },
  { id:"t8", name:"绣球花", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含氰苷", advice:"家里不要养", warning:"☠️ 啃食后释放氰化物，导致呼吸困难、呕吐、精神萎靡" },
  { id:"t9", name:"常春藤", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含三萜皂苷", advice:"室内不要养常春藤", warning:"☠️ 啃咬导致呕吐、腹泻、口腔刺激、呼吸困难" },
  { id:"t10", name:"芦荟", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含蒽醌类化合物和皂苷", advice:"常见多肉但对猫有毒，别让猫啃", warning:"☠️ 啃食导致呕吐、腹泻、精神萎靡、尿液变色" },
  { id:"t11", name:"富贵竹", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含皂苷", advice:"家里常见的风水植物但对猫有毒", warning:"☠️ 啃咬导致呕吐（可能带血）、腹泻、瞳孔散大" },
  { id:"t12", name:"一品红/圣诞红", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 汁液含刺激性物质", advice:"圣诞节常见但要远离猫", warning:"☠️ 汁液刺激口腔和肠胃，导致流口水、呕吐、腹泻" },
  { id:"t13", name:"康乃馨", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 对猫有毒（毒性成分未完全明确）", advice:"母亲节常见花束，猫家庭注意", warning:"☠️ 啃食后呕吐、腹泻" },
  { id:"t14", name:"菊花", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含除虫菊酯", advice:"不要让猫接触菊花", warning:"☠️ 除虫菊酯对猫毒性较高（猫无法代谢）。流口水、呕吐、共济失调" },
  { id:"t15", name:"薰衣草", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"—", effect:"含芳樟醇和乙酸芳樟酯，对猫可能有害", advice:"不要让猫啃食薰衣草植物，精油类产品远离猫", warning:"⚠️ 薰衣草精油对猫毒性更强（猫肝脏无法代谢酚类化合物）。少量啃食可能无害但最好避免" },
  { id:"t16", name:"尤加利/桉树", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含桉叶油素，对猫剧毒", advice:"花束配叶常见但危险，猫家庭避免", warning:"☠️ 啃食导致流口水、呕吐、腹泻、精神萎靡、虚弱" },
  { id:"t17", name:"铃兰", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含强心苷，全株剧毒", advice:"禁止接触", warning:"☠️ 剧毒！极少量即可导致心律失常、呕吐、昏倒甚至死亡。花瓶水也有毒" },
  { id:"t18", name:"曼陀罗/天使喇叭", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含莨菪碱，剧毒", advice:"禁止接触", warning:"☠️ 剧毒！导致瞳孔散大、心跳加速、幻觉、抽搐、死亡" },
  { id:"t19", name:"铁线莲", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含原白头翁素", advice:"花园常见但对猫有毒", warning:"☠️ 啃食导致流口水、呕吐、腹泻" },

  // ── 坚果/种子 ──
  { id:"n1", name:"核桃", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"禁止喂食！", warning:"☠️ 高脂肪+可能含霉菌毒素（对猫神经毒性）+可能有梗阻风险。黑核桃毒性更强" },
  { id:"n2", name:"杏仁", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"禁止喂食！", warning:"☠️ 含氰苷（苦杏仁尤其高），且坚硬有噎住/肠梗阻风险。高脂肪" },
  { id:"n3", name:"花生", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"高蛋白、高脂肪、含维生素E", advice:"极少量原味无盐花生酱偶尔作为零食（抹一点在鼻子上让猫舔）。整颗花生需压碎", warning:"⚠️ 必须无盐无糖无木糖醇！整颗花生有窒息风险。高脂肪不宜多喂。部分猫花生过敏" },
  { id:"n4", name:"瓜子/葵花籽", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"含维生素E、健康脂肪", advice:"去壳后极少量偶尔喂食，必须原味无盐", warning:"高脂肪热量炸弹，带壳瓜子有窒息和肠梗阻风险" },
  { id:"n5", name:"腰果", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"高脂肪、含镁铜", advice:"原味无盐腰果极少量偶尔喂食（≤1/4颗）", warning:"⚠️ 高脂肪+高磷（肾病猫要注意）。生腰果含漆酚类刺激物，要喂熟制无盐的" },
  { id:"n6", name:"榛子", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"不建议喂食", warning:"高脂肪且坚硬，有肠梗阻风险" },
  { id:"n7", name:"夏威夷果", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 对狗剧毒，对猫毒性数据不全但极不安全！导致呕吐、体温升高、后肢瘫痪（狗症状）" },
  { id:"n8", name:"芝麻", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"含钙、铁、芝麻素", advice:"极少量熟芝麻偶尔撒在猫食上", warning:"高脂肪高热量，少量即可" },
  { id:"n9", name:"南瓜籽", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"含锌、镁、健康脂肪酸、葫芦素（天然驱虫）", effect:"可能帮助驱除消化道寄生虫（民间用法）", advice:"去壳后烤熟（无盐无油），研磨成粉少量拌入食物", warning:"整颗南瓜籽难消化。驱虫效果未经科学验证，不能替代兽用驱虫药" },

  // ── 饮品 ──
  { id:"dr1", name:"茶", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含咖啡因和茶碱", advice:"绝对不要让猫喝茶（绿茶红茶乌龙茶普洱茶全部）", warning:"☠️ 咖啡因和茶碱对猫有毒，导致心跳加速、震颤、呕吐、癫痫" },
  { id:"dr2", name:"咖啡", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含咖啡因", advice:"绝对禁止！包括咖啡渣和咖啡豆", warning:"☠️ 咖啡因对猫半致死量约为80-150mg/kg体重。一杯咖啡约含95mg咖啡因。中毒可致死" },
  { id:"dr3", name:"酒/酒精", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 乙醇对猫剧毒", advice:"绝对禁止！啤酒、红酒、白酒、料酒、含酒精甜点全部禁止", warning:"☠️ 极少量乙醇即可导致酒精中毒：呕吐、昏迷、呼吸抑制、死亡。猫体内无法有效代谢酒精" },
  { id:"dr4", name:"碳酸饮料", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 高糖+二氧化碳+咖啡因+可能含木糖醇（无糖版）=多重危害" },
  { id:"dr5", name:"果汁", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"不要喂果汁", warning:"☠️ 浓缩糖分+可能含对猫有毒的水果（葡萄汁等）。猫不需要水果糖分" },
  { id:"dr6", name:"纯净水/凉白开", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"生命必需", effect:"最佳饮品", advice:"确保猫咪随时有新鲜干净的饮用水。每天换水", warning:"唯一猫咪需要的饮品" },

  // ── 加工食品 ──
  { id:"p1", name:"巧克力", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含可可碱和咖啡因，猫无法代谢", advice:"绝对禁止！所有巧克力制品（黑巧克力毒性最强）", warning:"☠️ 中毒症状：呕吐、腹泻、心跳加速、震颤、癫痫。严重可致死。黑巧克力毒性是牛奶巧克力的10倍" },
  { id:"p2", name:"火腿/培根", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 超高钠+高脂肪+亚硝酸盐（防腐剂），对猫肾脏和胰腺危害极大" },
  { id:"p3", name:"香肠/热狗", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 高钠高脂+含葱蒜粉（常见配料）+防腐剂。多重危害" },
  { id:"p4", name:"薯片/膨化食品", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 高钠高脂+调味粉（可能含洋葱/大蒜粉）。对猫有百害而无一利" },
  { id:"p5", name:"饼干/曲奇", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"不要喂食", warning:"☠️ 高糖高脂+可能含巧克力/葡萄干/坚果+小麦（过敏源）" },
  { id:"p6", name:"宠物零食（商业）", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"各品牌差异大", advice:"选择猫咪专用零食，查看配料表避免过多添加剂。零食不应超过日总食量10%", warning:"不要喂狗零食给猫（可能缺乏牛磺酸等猫必需营养）" },

  // ── 药品/化学品 ──
  { id:"ch1", name:"人用感冒药/退烧药", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含对乙酰氨基酚/布洛芬等对猫剧毒成分", advice:"绝对不要给猫吃人的药！即使极小剂量也可能致命", warning:"☠️ 对乙酰氨基酚（泰诺等）对猫剧毒——1片即可致死！导致高铁血红蛋白血症、肝坏死。布洛芬同样危险" },
  { id:"ch2", name:"消毒液/漂白剂", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 含次氯酸钠等腐蚀性化学物", advice:"使用时隔离猫咪，待完全干燥挥发后再让猫进入", warning:"☠️ 舔舐导致口腔和消化道严重化学灼伤。吸入蒸气刺激呼吸道" },
  { id:"ch3", name:"驱蚊产品（含DEET/拟除虫菊酯）", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 拟除虫菊酯对猫剧毒（猫肝脏无法代谢）", advice:"猫家庭不要用含拟除虫菊酯的蚊香/电蚊液/驱蚊喷雾", warning:"☠️ 中毒症状：流口水、震颤、共济失调、癫痫、死亡。狗用驱虫项圈也含此成分不能让猫接触" },
  { id:"ch4", name:"精油（茶树油/薄荷油/柑橘油等）", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 酚类化合物猫肝脏无法代谢", advice:"猫家庭慎用任何精油香薰！尤其茶树油对猫剧毒", warning:"☠️ 即使通过皮肤吸收或吸入香薰蒸气也可能中毒。症状：流口水、呕吐、共济失调、肝损伤" },

  // ── 杂项 ──
  { id:"x1", name:"鸡蛋", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"蛋黄含卵磷脂、维生素A/D，蛋白含优质蛋白质", effect:"美毛护肤，补充蛋白质", advice:"只喂熟蛋黄！蛋白必须煮熟。每周1-2个蛋黄即可", warning:"⚠️ 生蛋白含抗生物素蛋白，会破坏维生素B7吸收导致皮肤问题。必须完全煮熟再喂" },
  { id:"x2", name:"生肉/生骨肉", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", effect:"☠️ 生肉含细菌和寄生虫", advice:"不推荐生食喂养！", warning:"☠️ 生肉（无论鸡鸭牛羊鱼）可能携带沙门氏菌、大肠杆菌、弓形虫、伪狂犬病毒等多种病原体。对人和猫都有风险" },
  { id:"x3", name:"猫粮（商品干粮）", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"按AAFCO标准平衡营养", effect:"方便安全的日常主食", advice:"选择优质品牌猫粮作为主食。查看配料表前三位是动物蛋白", warning:"劣质猫粮含过多谷物填充物和人工添加剂，长期影响健康" },
  { id:"x4", name:"猫罐头（主食罐）", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"高水分高蛋白，通常比干粮更接近猫的自然饮食", effect:"补水+优质营养", advice:"主食罐可作为每日主要食物。开封后冷藏48小时内吃完", warning:"注意区分主食罐和零食罐（零食罐营养不均衡不能当主食）" },
  { id:"x5", name:"猫草（小麦草/燕麦草）", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"膳食纤维、叶绿素", effect:"帮助排出毛球，缓解肠胃不适", advice:"可以自己种的猫草。猫咪自己会啃食适量", warning:"室外草坪可能含农药/寄生虫，不建议让猫啃室外草" },
  { id:"x6", name:"蜂蜜", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"纯糖+微量酶和维生素", effect:"几乎无营养价值", advice:"极少量偶尔舔食即可。不要常喂", warning:"⚠️ 高糖分；某些生蜂蜜可能含肉毒杆菌孢子（对幼猫危险）" },
  { id:"x7", name:"酵母面团/生面团", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"—", advice:"绝对禁止！", warning:"☠️ 生面团在胃内发酵产生酒精+膨胀，导致酒精中毒+胃肠阻塞双重危害" },
  { id:"x8", name:"猫薄荷", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"—", effect:"约50-70%的猫有兴奋愉悦反应（遗传决定）", advice:"少量给猫咪玩耍/嗅闻，每次一小撮。可撒在玩具上", warning:"不是所有猫都有反应。过量可能导致短暂嗜睡。安全无毒" },
  { id:"x9", name:"木天蓼", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"含猕猴桃碱和木天蓼内酯", effect:"类似猫薄荷的兴奋愉悦效果，多数猫反应比猫薄荷更强", advice:"木天蓼棒/粉末少量给猫咪啃咬或玩耍", warning:"安全无毒。有些猫反应过于兴奋无需担心" },
  { id:"x10", name:"薄荷（猫用）", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"—", advice:"可以少量喂猫薄荷（catnip），不要喂人用的胡椒薄荷/留兰香", warning:"⚠️ 人用薄荷品种可能含对猫刺激的精油成分，不能用人类的薄荷替代猫薄荷" },

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
      { name: '冬瓜', amount: '30g', foodId: 'v18' },
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

  // ── 新增种子食谱 ──
  {
    id: 'r11', name: '兔肉蔬菜轻食',
    scene: '体重管理', sceneTag: '低脂高蛋白',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '兔肉', amount: '60g', foodId: 'm14' },
      { name: '西兰花', amount: '10g', foodId: 'v3' },
      { name: '红薯', amount: '20g', foodId: 'v4' },
    ],
    steps: [
      '兔肉去骨煮熟切丁',
      '西兰花煮软切碎，红薯蒸熟捣泥',
      '混合拌匀即可',
    ],
    tips: '兔肉是超低脂肉类，适合需要减肥的猫咪。每周可喂3-4次。',
    photoUrl: '',
    author: { nickName: '橘猫铲屎官', avatarUrl: '' },
    createdAt: '2026-06-10',
    likeCount: 56,
  },
  {
    id: 'r12', name: '鳕鱼山药羹',
    scene: '肠胃调理', sceneTag: '温和易消化',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鳕鱼', amount: '60g', foodId: 's4' },
      { name: '山药', amount: '30g', foodId: 'v6' },
    ],
    steps: [
      '鳕鱼蒸熟去刺捣碎',
      '山药蒸熟去皮捣泥',
      '混合加少量温水调成羹状',
    ],
    tips: '鳕鱼肉质细嫩低脂，山药养胃，非常适合肠胃敏感的猫咪。',
    photoUrl: '',
    author: { nickName: '布偶妈妈', avatarUrl: '' },
    createdAt: '2026-06-12',
    likeCount: 38,
  },
  {
    id: 'r13', name: '鸡胗南瓜助消餐',
    scene: '日常营养', sceneTag: '助消化健胃',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胗', amount: '40g', foodId: 'o5' },
      { name: '鸡胸肉', amount: '40g', foodId: 'm1' },
      { name: '南瓜', amount: '20g', foodId: 'v2' },
    ],
    steps: [
      '鸡胗去除内膜洗净，沸水煮熟切碎',
      '鸡胸肉煮熟撕丝',
      '南瓜蒸熟捣泥',
      '三者混合拌匀',
    ],
    tips: '鸡胗含天然胃蛋白酶，帮助猫咪消化。口感Q弹猫咪超爱。',
    photoUrl: '',
    author: { nickName: '三花小主', avatarUrl: '' },
    createdAt: '2026-06-14',
    likeCount: 72,
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
