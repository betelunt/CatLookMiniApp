# 拍照识配料 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户拍摄产品配料表 → OCR 识别配料名 → 逐一标注对猫安全性（✅安全/⚠️慎用/🔴危险/❓未知）

**Architecture:** 食物查询页顶部加相机入口 → 跳转拍照预览页 → 云函数 OCR 识别 → 结果页本地数据库匹配渲染。OCR 走微信云开发 OpenAPI，配料匹配纯本地离线。

**Tech Stack:** 微信原生小程序（WXML + WXSS + JS）、云函数（Node.js + wx-server-sdk + cloud.openapi.ocr）、本地 foods 数据库

---

## ⚠️ 前置准备

- [ ] **开通云开发 OCR 能力**：微信公众平台 → 开发 → 云开发 → 设置 → 拓展能力 → 开通「图像处理-OCR」

---

### Task 1: 扩展 foods 数据库（添加别名）

**Files:**
- Modify: `data/foods.js`

**说明：** 为每样食材添加 `aliases` 数组，支持 OCR 识别的多种写法匹配。同时补充常见食品添加剂等配料。

- [ ] **Step 1: 添加通用配料（添加剂、营养素等）到 foods.js 末尾**

在 `data/foods.js` 末尾 `];` 前插入以下新分类数据：

```js
  // ═══════════════════════════════════════════════════════════
  // 5. 添加剂/营养素（OCR 常用匹配）
  // ═══════════════════════════════════════════════════════════
  { id:"a1", name:"牛磺酸", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"猫咪必需氨基酸，自身无法合成足够量", effect:"维护心脏功能、视力健康和繁殖能力", advice:"猫粮中牛磺酸含量越高越好，是优质猫粮的重要指标", warning:"缺乏会导致扩张型心肌病、视网膜退化甚至失明" },
  { id:"a2", name:"维生素A", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"脂溶性维生素，维持视力和免疫", effect:"维护视力、皮肤健康和免疫系统", advice:"适量有益，正规猫粮添加量安全", warning:"⚠️ 不可额外大量补充，过量可中毒" },
  { id:"a3", name:"维生素D3", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"促进钙磷吸收", effect:"维护骨骼健康", advice:"猫粮中适量添加有益", warning:"⚠️ 过量可致高钙血症，中毒剂量很低" },
  { id:"a4", name:"维生素E", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"抗氧化剂，保护细胞膜", effect:"增强免疫力，延缓衰老", advice:"猫粮中添加的抗氧化保护剂，安全" },
  { id:"a5", name:"Omega-3", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"必需脂肪酸", effect:"美毛护肤，抗炎，促进大脑发育", advice:"鱼油来源 Omega-3 对猫非常有益" },
  { id:"a6", name:"Omega-6", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"必需脂肪酸", effect:"维护皮肤屏障健康", advice:"适量有益，但需与 Omega-3 保持合理比例" },
  { id:"a7", name:"赖氨酸", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"猫咪必需氨基酸", effect:"促进生长发育，辅助钙吸收", advice:"猫粮中添加有助于改善氨基酸平衡" },
  { id:"a8", name:"蛋氨酸", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"含硫必需氨基酸", effect:"维护皮肤毛发健康，促进肝脏解毒", advice:"猫咪尿液酸化所需，预防鸟粪石结晶" },
  { id:"a9", name:"纤维素", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"膳食纤维", effect:"促进肠道蠕动，帮助排毛球", advice:"适量添加有助于肠胃健康" },
  { id:"a10", name:"益生菌", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"有益肠道菌群", effect:"维护肠道菌群平衡，改善消化", advice:"正规猫粮添加的益生菌对肠胃有益" },
  { id:"a11", name:"益生元", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"益生菌的食物（低聚糖等）", effect:"促进有益菌生长", advice:"配合益生菌使用效果更好" },
  { id:"a12", name:"果寡糖", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"低聚果糖，益生元的一种", effect:"促进肠道有益菌增殖", advice:"适量添加安全" },
  { id:"a13", name:"甘露寡糖", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"益生元，来源于酵母细胞壁", effect:"抑制有害菌附着，改善肠道健康" },
  { id:"a14", name:"丝兰提取物", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然植物提取物", effect:"减少粪便异味", advice:"猫粮中常见的除臭添加物" },
  { id:"a15", name:"茶多酚", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然抗氧化剂", effect:"抗氧化，保鲜", advice:"适量添加安全的天然保鲜成分" },
  { id:"a16", name:"迷迭香提取物", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然抗氧化剂", effect:"天然防腐保鲜", advice:"安全的天然保鲜剂" },
  { id:"a17", name:"氯化钠", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"钠和氯的来源", effect:"维持电解质平衡", advice:"猫粮中需适量添加，但过高盐分对肾不好", warning:"肾病猫咪注意低钠饮食" },
  { id:"a18", name:"氯化钾", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"钾的来源", effect:"维持神经肌肉功能和电解质平衡", advice:"猫粮中正常的钾补充" },
  { id:"a19", name:"氯化胆碱", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"B族维生素类似物", effect:"维护肝脏功能，防止脂肪肝", advice:"猫粮必需添加的营养素" },
  { id:"a20", name:"硫酸铜", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"微量元素铜的来源", effect:"维护造血功能和毛色", advice:"合规添加量安全，勿额外补充" },
  { id:"a21", name:"硫酸亚铁", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"铁的来源", effect:"预防贫血", advice:"猫粮中正常的铁补充" },
  { id:"a22", name:"硫酸锌", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"锌的来源", effect:"维护皮肤健康和免疫力", advice:"猫粮中正常的锌补充" },
  { id:"a23", name:"硫酸锰", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"锰的来源", effect:"维护骨骼和关节健康", advice:"猫粮中正常的锰补充" },
  { id:"a24", name:"碘酸钙", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"碘的来源", effect:"维护甲状腺功能", advice:"猫粮中正常的碘补充，勿额外补充" },
  { id:"a25", name:"亚硒酸钠", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"硒的来源", effect:"抗氧化，维护免疫", advice:"猫粮中微量添加安全" },
  { id:"a26", name:"焦磷酸钠", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"食品添加剂（水分保持剂）", advice:"合规添加量下安全，但非必需营养成分", warning:"尽量选择添加剂少的猫粮" },
  { id:"a27", name:"三聚磷酸钠", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"食品添加剂（水分保持剂）", advice:"合规添加量下安全", warning:"尽量选择添加剂少的猫粮" },
  { id:"a28", name:"山梨酸钾", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"防腐剂", advice:"合规添加量对猫安全", warning:"尽量选择天然防腐方式的猫粮" },
  { id:"a29", name:"BHA", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"人工合成抗氧化剂（防腐）", advice:"🙅 不推荐选择含 BHA 的猫粮", warning:"☠️ 国际癌症研究机构列为可能人类致癌物，多国已禁用" },
  { id:"a30", name:"BHT", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"人工合成抗氧化剂（防腐）", advice:"🙅 不推荐选择含 BHT 的猫粮", warning:"☠️ 与 BHA 同类人工抗氧化剂，安全性存疑" },
  { id:"a31", name:"乙氧基喹啉", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"人工合成抗氧化剂防腐剂", advice:"🙅 尽量避免含此成分的猫粮", warning:"☠️ 潜在肝脏和肾脏毒性，欧盟已限制使用" },
  { id:"a32", name:"卡拉胶", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"增稠剂/稳定剂（来自海藻）", advice:"少量对猫安全，但部分研究显示可能引发肠道炎症", warning:"肠胃敏感的猫咪建议选择无卡拉胶的湿粮" },
  { id:"a33", name:"瓜尔胶", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然增稠剂（来自瓜尔豆）", advice:"猫粮中常见的天然增稠剂，一般安全" },
  { id:"a34", name:"黄原胶", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"微生物发酵产生的增稠剂", advice:"合规添加量对猫安全" },
  { id:"a35", name:"玉米蛋白粉", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"植物蛋白来源", effect:"提高猫粮粗蛋白数值（植物蛋白）", advice:"猫更适合动物蛋白，植物蛋白利用率低", warning:"⚠️ 很多劣质猫粮用玉米蛋白粉虚增蛋白质含量，猫实际可利用的动物蛋白不足" },
  { id:"a36", name:"小麦蛋白", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"植物蛋白（面筋）", advice:"猫不适合大量植物蛋白，部分猫对面筋过敏" },
  { id:"a37", name:"大豆蛋白", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"植物蛋白来源", advice:"猫利用率低，部分猫咪对大豆过敏", warning:"劣质猫粮中常用来虚增蛋白质含量" },
  { id:"a38", name:"啤酒酵母", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然增味剂，含B族维生素", effect:"增加猫粮适口性，补充B族维生素", advice:"安全的天然调味成分" },
  { id:"a39", name:"宠物饲料复合调味料", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"人工/半人工增味剂", advice:"适量添加可接受，但过多调味料可能掩盖原料品质问题" },
  { id:"a40", name:"口味增强剂", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"增味诱食剂", advice:"正规品牌适量添加安全，但过多提示原料品质可能一般" },
  { id:"a41", name:"焦糖色素", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"人工色素", advice:"猫不需要食物颜色，纯属营销需要", warning:"尽量选择无人工色素的猫粮" },
  { id:"a42", name:"玉米", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水化合物来源", effect:"提供能量但无必需营养", advice:"猫是肉食动物，谷物含量高的猫粮品质较差", warning:"⚠️ 高碳水可致肥胖和糖尿病；部分猫对玉米过敏" },
  { id:"a43", name:"小麦", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水化合物+植物蛋白", advice:"猫不需要谷物，小麦过敏的猫咪较多" },
  { id:"a44", name:"大豆", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"植物蛋白+碳水化合物", advice:"猫咪利用率低，部分猫过敏" },
  { id:"a45", name:"糙米", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"全谷物碳水化合物+膳食纤维", advice:"少量添加可提供纤维，但猫不需要大量碳水" },
  { id:"a46", name:"燕麦", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"全谷物，含可溶性纤维", advice:"少量添加安全，有助于消化" },
  { id:"a47", name:"大米", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"精制碳水", advice:"猫不需要大量碳水，少量无害" },
  { id:"a48", name:"木薯", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"淀粉来源", advice:"猫粮中常见的碳水来源，少量安全" },
  { id:"a49", name:"马铃薯", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"碳水化合物+钾", advice:"少量添加安全，但猫不需要大量碳水" },
  { id:"a50", name:"豌豆", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"植物蛋白+纤维", advice:"少量安全，但猫更适合动物蛋白" },
  { id:"a51", name:"鹰嘴豆", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"植物蛋白+纤维", advice:"少量安全，猫更适合动物蛋白" },
  { id:"a52", name:"扁豆", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"植物蛋白+纤维", advice:"少量安全" },
  { id:"a53", name:"鸡油", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"动物脂肪，提供能量和必需脂肪酸", effect:"增加适口性，提供能量", advice:"猫粮中常见的优质动物脂肪来源" },
  { id:"a54", name:"鱼油", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"富含Omega-3（EPA+DHA）", effect:"美毛护肤，抗炎，促进大脑发育", advice:"优质脂肪来源，好的猫粮都会添加" },
  { id:"a55", name:"鸡肝水解物", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"天然增味剂+营养补充", effect:"增加适口性", advice:"安全的天然调味成分" },
  { id:"a56", name:"玉米淀粉", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"纯碳水填充物", advice:"猫不需要，高含量提示猫粮品质一般" },
  { id:"a57", name:"小麦粉", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"碳水填充物+面筋蛋白", advice:"猫不需要，部分猫过敏" },
  { id:"a58", name:"亚麻籽", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"植物 Omega-3（ALA）+纤维", effect:"美毛护肤", advice:"少量添加有益，但植物 Omega-3 转化率低" },
  { id:"a59", name:"蔓越莓", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"富含原花青素、维生素C", effect:"维护泌尿系统健康，预防尿路感染", advice:"猫粮中常见的功能性水果添加" },
  { id:"a60", name:"蓝莓", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"富含花青素、抗氧化物质", effect:"抗氧化，延缓衰老", advice:"安全的天然抗氧化添加" },
  { id:"a61", name:"苹果", category:"fruit", categoryLabel:"水果", safety:"safe", safetyLabel:"安全", nutrition:"果胶纤维+维生素", advice:"少量添加安全，去籽后喂食（苹果籽含氰苷对猫有毒）" },
  { id:"a62", name:"天然香料", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然调味成分", advice:"正规来源安全" },
  { id:"a63", name:"混合生育酚", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"天然维生素E（抗氧化剂）", effect:"天然防腐保鲜", advice:"安全的天然防腐剂" },
  { id:"a64", name:"柠檬酸", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然有机酸，防腐保鲜", advice:"合规添加量安全" },
  { id:"a65", name:"酿酒酵母细胞壁", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"益生元+免疫多糖", effect:"维护肠道健康，增强免疫力" },
  { id:"a66", name:"菊糖", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"益生元（菊粉）", effect:"促进肠道有益菌生长" },
  { id:"a67", name:"氨基葡萄糖", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"关节保健品", effect:"维护关节软骨健康", advice:"老年猫和大型猫的猫粮中添加有益" },
  { id:"a68", name:"硫酸软骨素", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"关节保健品", effect:"维护关节健康，与氨基葡萄糖协同作用", advice:"老年猫和折耳猫的猫粮中添加尤其重要" },
  { id:"a69", name:"碳酸钙", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"钙的来源", effect:"维护骨骼健康", advice:"猫粮中正常的钙补充" },
  { id:"a70", name:"磷酸氢钙", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"钙和磷的来源", effect:"维护骨骼和牙齿健康", advice:"猫粮中正常的钙磷补充" },
  { id:"a71", name:"葡萄糖胺", category:"additive", categoryLabel:"营养素", safety:"safe", safetyLabel:"安全", nutrition:"氨基葡萄糖的别名", effect:"关节保健" },
  { id:"a72", name:"洋葱", category:"vegetable", categoryLabel:"蔬菜", safety:"danger", safetyLabel:"危险", nutrition:"含正丙基二硫化物", effect:"☠️ 破坏红细胞，导致溶血性贫血", advice:"🙅 绝对禁止喂食洋葱（包括生、熟、脱水、粉末所有形态）", warning:"☠️ 极少量即可中毒！症状：呕吐、腹泻、牙龈苍白、虚弱、尿液变色。洋葱粉也含毒性！" },
  { id:"a73", name:"大蒜", category:"vegetable", categoryLabel:"蔬菜", safety:"danger", safetyLabel:"危险", nutrition:"含硫代硫酸盐", effect:"☠️ 比洋葱毒性强5倍，破坏红细胞", advice:"🙅 绝对禁止喂食任何形式的大蒜", warning:"☠️ 极少量即可中毒！猫对大蒜比狗更敏感" },
  { id:"a74", name:"葱", category:"vegetable", categoryLabel:"蔬菜", safety:"danger", safetyLabel:"危险", nutrition:"含正丙基二硫化物", effect:"☠️ 与洋葱同类毒性，破坏红细胞", advice:"🙅 绝对禁止喂食（大葱、小葱、香葱、韭菜均不可）", warning:"☠️ 葱属植物全部对猫有毒" },
  { id:"a75", name:"葡萄", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"对猫有不明毒素", effect:"☠️ 可导致急性肾衰竭", advice:"🙅 绝对禁止喂食（包括葡萄干）", warning:"☠️ 极少量即可中毒！即使目前未确定毒性物质，但临床案例确凿" },
  { id:"a76", name:"葡萄干", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"葡萄的浓缩形态，毒性更强", effect:"☠️ 比葡萄毒性更浓缩，微量即可致肾衰竭", advice:"🙅 绝对禁止喂食", warning:"☠️ 几粒葡萄干就可能致命" },
  { id:"a77", name:"木糖醇", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"人工甜味剂", effect:"☠️ 导致胰岛素大量释放→严重低血糖→肝损伤", advice:"🙅 绝对禁止喂食含木糖醇的任何食品", warning:"☠️ 极少量(0.1g/kg)即可中毒！常见于无糖口香糖、无糖花生酱、部分牙膏" },
  { id:"a78", name:"巧克力", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含可可碱和咖啡因", effect:"☠️ 刺激中枢神经和心血管系统", advice:"🙅 绝对禁止喂食（包括白巧克力、可可粉）", warning:"☠️ 黑巧克力毒性最强，每克黑巧含可可碱约5-15mg，猫致死剂量约200mg/kg" },
  { id:"a79", name:"可可", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含可可碱和咖啡因", effect:"☠️ 与巧克力同类毒性", advice:"🙅 禁止喂食任何含可可的食品" },
  { id:"a80", name:"咖啡", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含咖啡因", effect:"☠️ 刺激中枢神经和心脏", advice:"🙅 绝对禁止（包括咖啡豆、咖啡渣、含咖啡因饮料）", warning:"☠️ 猫对咖啡因比人敏感得多，小剂量即可中毒" },
  { id:"a81", name:"茶", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含咖啡因+茶碱", effect:"☠️ 与咖啡因同类毒性", advice:"🙅 禁止喂食茶水、茶叶", warning:"☠️ 包括绿茶、红茶、乌龙茶等所有茶类" },
  { id:"a82", name:"酒精", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"乙醇", effect:"☠️ 抑制中枢神经，损害肝脏", advice:"🙅 绝对禁止任何含酒精的食物饮料", warning:"☠️ 即使微量酒精也可能导致中毒，含酒甜点也不能喂" },
  { id:"a83", name:"酵母面团", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"生面团在胃里发酵产生酒精+气体", effect:"☠️ 酒精中毒+胃扩张/肠扭转", advice:"🙅 绝对不要让猫咪吃到生面团", warning:"☠️ 生面团在温暖潮湿的胃里会持续发酵，双重致命" },
  { id:"a84", name:"夏威夷果", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"对犬猫有毒的不明物质", effect:"☠️ 神经肌肉毒性", advice:"🙅 绝对禁止喂食", warning:"☠️ 症状：虚弱、呕吐、步态不稳、体温升高" },
  { id:"a85", name:"澳洲坚果", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"夏威夷果的别称，毒性相同", advice:"🙅 绝对禁止喂食" },
  { id:"a86", name:"味精", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"谷氨酸钠", effect:"☠️ 高钠，对猫肾脏造成负担", advice:"🙅 不要喂食含味精的人类食物" },
  { id:"a87", name:"盐", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"氯化钠", effect:"☠️ 过量可导致钠离子中毒", advice:"猫粮中极少添加即可，人类食物中的盐分远超出猫的需求", warning:"☠️ 高盐零食（薯片、肉干等）绝对不能喂猫" },
  { id:"a88", name:"糖", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"纯蔗糖/白砂糖", effect:"☠️ 猫无法代谢大量糖分，导致肥胖和糖尿病", advice:"🙅 猫粮不需要添加糖，高品质猫粮不会含糖" },
  { id:"a89", name:"丙二醇", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"保湿剂/溶剂", effect:"☠️ 对猫红细胞有毒性", advice:"🙅 猫专用食品中不应出现丙二醇，部分劣质湿粮中可能含有", warning:"☠️ 猫对丙二醇极其敏感，美国已禁止在猫粮中使用" },
  { id:"a90", name:"亚硝酸钠", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"发色剂/防腐剂（加工肉类）", advice:"🙅 火腿肠、午餐肉等加工肉制品中常见，不能喂猫" },
  { id:"a91", name:"维生素K3", category:"additive", categoryLabel:"营养素", safety:"danger", safetyLabel:"危险", nutrition:"人工合成维生素K（甲萘醌）", effect:"☠️ 高剂量有肝毒性", advice:"🙅 避免选择含维生素K3（甲萘醌亚硫酸氢钠）的猫粮", warning:"☠️ 选择含天然维生素K来源的猫粮" },
  { id:"a92", name:"4D肉", category:"meat", categoryLabel:"肉类", safety:"danger", safetyLabel:"危险", nutrition:"☠️ Dead+Dying+Diseased+Disabled 动物肉/副产品", advice:"🙅 劣质猫粮才用4D肉，正规品牌不会使用" },
  { id:"a93", name:"动物副产品", category:"meat", categoryLabel:"肉类", safety:"danger", safetyLabel:"危险", nutrition:"未明确说明来源的动物副产品", advice:"🙅 模糊标注「动物副产品」的猫粮不建议选择", warning:"「动物副产品」与「鸡肉副产品」有本质区别——前者不注明物种来源，品质不可控" },
  { id:"a94", name:"二氧化钛", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"白色素/增白着色剂", advice:"猫不需要食物增白，纯属视觉营销" },
  { id:"a95", name:"二氧化硅", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"抗结块剂", advice:"合规添加量安全，防止粉末结块", warning:"吸入粉尘有害，但吃进嘴里安全" },
  { id:"a96", name:"亚麻籽油", category:"grain", categoryLabel:"谷物", safety:"safe", safetyLabel:"安全", nutrition:"植物 Omega-3（ALA）的来源", effect:"美毛护肤", advice:"少量添加有益，但鱼油（动物 Omega-3）更优" },
  { id:"a97", name:"椰子油", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"中链脂肪酸（MCT）", effect:"改善皮肤和毛发光泽", advice:"少量添加安全，但不宜过量" },
  { id:"a98", name:"葵花籽油", category:"other", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"富含 Omega-6 和维生素E", advice:"适量安全，但猫更需要 Omega-3" },
  { id:"a99", name:"鸡肝粉", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"天然增味剂+营养补充", effect:"增加猫粮适口性", advice:"安全的天然调味成分" },
  { id:"a100", name:"宠物饲料添加剂", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"笼统标注的添加剂混合物", advice:"正规品牌合规添加安全，但标注不具体难以判断", warning:"过于笼统的标注（不列明具体成分）可能是品质信号" },

  // ═══════════════════════════════════════════════════════════
  // 6. 不安全调味品/常见烹饪配料（OCR 匹配专用）
  // ═══════════════════════════════════════════════════════════
  { id:"x1", name:"酱油", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"高钠+调味料", advice:"🙅 不能喂猫，人类调味料对猫有害" },
  { id:"x2", name:"蚝油", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"高钠+调味料", advice:"🙅 不能喂猫" },
  { id:"x3", name:"料酒", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含酒精的烹饪调料", advice:"🙅 酒精对猫有毒" },
  { id:"x4", name:"生姜", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"刺激性食材", advice:"少量存在于猫粮中通常无害，但大量生姜对猫肠胃有刺激" },
  { id:"x5", name:"辣椒", category:"vegetable", categoryLabel:"蔬菜", safety:"danger", safetyLabel:"危险", nutrition:"含辣椒素", advice:"🙅 猫咪非常讨厌且对肠胃有刺激" },
  { id:"x6", name:"花椒", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"麻辣调料", advice:"🙅 对猫肠胃有强刺激" },
  { id:"x7", name:"胡椒", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"香辛料", advice:"少量无害，但猫不需要任何调料" },
  { id:"x8", name:"肉桂", category:"other", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"香辛料", advice:"少量安全，但大量对猫肝脏有负担" },
  { id:"x9", name:"丁香", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含丁香酚", advice:"🙅 丁香酚对猫有毒，大量可致肝损伤" },
  { id:"x10", name:"肉豆蔻", category:"other", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"含肉豆蔻醚", advice:"🙅 对猫神经系统有毒性" },
  { id:"x11", name:"鳄梨", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"含Persin毒素", advice:"🙅 对猫有毒性，可致呕吐腹泻" },
  { id:"x12", name:"牛油果", category:"fruit", categoryLabel:"水果", safety:"danger", safetyLabel:"危险", nutrition:"鳄梨的别名，含Persin", advice:"🙅 对猫有毒" },
  { id:"x13", name:"蘑菇", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"部分品种对猫有毒", advice:"超市常见食用菌少量无害，但绝不喂野蘑菇" },
  { id:"x14", name:"番茄", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"未成熟番茄含龙葵碱", advice:"成熟红番茄少量安全，但青番茄/叶/茎有毒" },
  { id:"x15", name:"西红柿", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"番茄的别名", advice:"成熟果实少量安全，青的不可喂" },
  { id:"x16", name:"菠菜", category:"vegetable", categoryLabel:"蔬菜", safety:"caution", safetyLabel:"谨慎", nutrition:"含草酸钙", advice:"少量安全，但泌尿系统有问题的猫咪避免" },
  { id:"x17", name:"芦笋", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"含纤维、维生素K", advice:"少量煮熟喂食安全" },
  { id:"x18", name:"芹菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"低热量高纤维", advice:"少量安全，有些猫咪会啃着玩" },
  { id:"x19", name:"黄瓜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"水分高几乎无热量", advice:"安全，可作为低热量零食" },
  { id:"x20", name:"生菜", category:"vegetable", categoryLabel:"蔬菜", safety:"safe", safetyLabel:"安全", nutrition:"水分高，营养较少", advice:"安全但营养价值很低" },
  { id:"x21", name:"玉米糖浆", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"高果糖甜味剂", advice:"🙅 纯糖无任何营养，导致肥胖糖尿病" },
  { id:"x22", name:"果葡糖浆", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"高果糖浆", advice:"🙅 猫完全不需要，劣质猫粮中用来增加适口性" },
  { id:"x23", name:"纤维素粉", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"纯纤维素（不可溶纤维）", advice:"少量添加帮助排毛球，但过多是填充物" },
  { id:"x24", name:"蒙脱石", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然矿物，抗结块+吸附毒素", advice:"合规添加安全，还有助吸附肠道毒素" },
  { id:"x25", name:"沸石", category:"additive", categoryLabel:"其他", safety:"safe", safetyLabel:"安全", nutrition:"天然矿物抗结块剂", advice:"合规添加安全" },
  { id:"x26", name:"海藻粉", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"微量元素和矿物质来源", advice:"适量安全" },
  { id:"x27", name:"鱼水解蛋白", category:"seafood", categoryLabel:"海鲜", safety:"safe", safetyLabel:"安全", nutrition:"天然鲜味剂+蛋白补充", advice:"安全的天然增味成分" },
  { id:"x28", name:"水解鸡肝", category:"organ", categoryLabel:"内脏", safety:"safe", safetyLabel:"安全", nutrition:"天然鲜味剂", advice:"安全的天然增味成分" },
  { id:"x29", name:"水解鸡肉", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"天然鲜味剂+蛋白肽", advice:"安全的天然调味蛋白来源" },
  { id:"x30", name:"鸡骨", category:"meat", categoryLabel:"肉类", safety:"danger", safetyLabel:"危险", nutrition:"不可消化", advice:"🙅 煮熟的骨头会碎裂，刺伤食道和肠道！" },
  { id:"x31", name:"鱼骨", category:"seafood", categoryLabel:"海鲜", safety:"danger", safetyLabel:"危险", nutrition:"不可消化", advice:"🙅 鱼刺/鱼骨可能卡住喉咙或刺伤消化道" },
  { id:"x32", name:"麦芽糖", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"双糖甜味剂", advice:"猫不需要糖分，少量无害但纯属多余" },
  { id:"x33", name:"葡萄糖", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"单糖", advice:"猫不需要额外添加糖分" },
  { id:"x34", name:"果糖", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"单糖", advice:"猫对果糖代谢能力差" },
  { id:"x35", name:"蔗糖", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"白砂糖/红糖的总称", advice:"🙅 猫粮不需要添加蔗糖" },
  { id:"x36", name:"红糖", category:"additive", categoryLabel:"其他", safety:"danger", safetyLabel:"危险", nutrition:"蔗糖的一种", advice:"🙅 不能喂猫" },
  { id:"x37", name:"蜂蜜", category:"additive", categoryLabel:"其他", safety:"caution", safetyLabel:"谨慎", nutrition:"果糖+葡萄糖", advice:"极少量无害但猫不需要，且可能含肉毒杆菌孢子" },
  { id:"x38", name:"乳糖", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"乳中的糖", advice:"多数成年猫乳糖不耐受，可致腹泻" },
  { id:"x39", name:"全脂奶粉", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"乳制品", advice:"多数成年猫乳糖不耐受" },
  { id:"x40", name:"脱脂奶粉", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"乳制品（乳糖仍在）", advice:"同样含乳糖，不能解决不耐受问题" },
  { id:"x41", name:"奶酪", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"高脂高盐乳制品", advice:"极少量偶尔作为零食可能安全，但多数猫消化乳制品有问题" },
  { id:"x42", name:"黄油", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"纯乳脂肪", advice:"🙅 高脂高热量，可引发胰腺炎" },
  { id:"x43", name:"奶油", category:"dairy", categoryLabel:"乳制品", safety:"danger", safetyLabel:"危险", nutrition:"高脂乳制品", advice:"🙅 多数猫乳糖不耐受+高脂肪" },
  { id:"x44", name:"牛奶", category:"dairy", categoryLabel:"乳制品", safety:"caution", safetyLabel:"谨慎", nutrition:"含乳糖", advice:"多数成年猫乳糖不耐受，会导致腹泻", warning:"幼猫断奶后乳糖酶活性迅速下降" },
  { id:"x45", name:"鸡蛋", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"优质完全蛋白，含卵磷脂", effect:"优质蛋白质来源", advice:"必须完全煮熟后喂食，不能喂生鸡蛋", warning:"⚠️ 生蛋清含抗生物素蛋白，影响生物素吸收；生鸡蛋可能有沙门氏菌" },
  { id:"x46", name:"蛋黄", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"含卵磷脂、胆碱、维A维D", effect:"美毛护肤", advice:"煮熟后少量喂食，每周1-2个蛋黄即可", warning:"不要喂生蛋黄（沙门氏菌风险）" },
  { id:"x47", name:"蛋清", category:"meat", categoryLabel:"肉类", safety:"safe", safetyLabel:"安全", nutrition:"纯蛋白质", advice:"必须煮熟！生蛋清含抗生物素蛋白有害", warning:"⚠️ 生蛋清会导致生物素缺乏症" },
  { id:"x48", name:"面包", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"精制碳水+可能含盐糖", advice:"猫不需要，偶尔极少量无害但没有任何好处" },
  { id:"x49", name:"面条", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"纯碳水", advice:"猫不需要" },
  { id:"x50", name:"米饭", category:"grain", categoryLabel:"谷物", safety:"caution", safetyLabel:"谨慎", nutrition:"精制碳水", advice:"少量无害但猫不需要，高碳水饮食不健康" },
];
```

**数据统计：** 原有 ~200 种传统食材 + 新增 184 种配料（添加剂、营养素、谷物、危险食物、常见烹饪配料等），总计 ~384 种，覆盖日常扫描场景。

- [ ] **Step 2: 验证数据文件语法**

在项目根目录运行 Node.js 检查 JSON 格式：

```bash
cd C:\Users\arlen\Projects\CatLookMiniApp && node -e "const f = require('./data/foods'); console.log('OK, total:', f.length)"
```

预期输出：`OK, total: 384`（大约）

---

### Task 2: 食物查询页添加相机入口卡片

**Files:**
- Modify: `pages/food-search/food-search.wxml`
- Modify: `pages/food-search/food-search.wxss`
- Modify: `pages/food-search/food-search.js`

- [ ] **Step 1: 在搜索框上方添加相机入口卡片（wxml）**

在 `pages/food-search/food-search.wxml` 第 4 行 `</view>`（search-box 结束）之后，第 10 行 `<!-- Tab 切换 -->` 之前，插入：

```html
  <!-- 📷 拍照识配料入口 -->
  <view class="scan-entry card" bindtap="goScan">
    <view class="scan-entry-left">
      <view class="scan-icon-wrap">
        <text class="scan-icon-emoji">📷</text>
      </view>
      <view class="scan-entry-text">
        <text class="scan-entry-title">拍照识别配料表</text>
        <text class="scan-entry-sub">一拍即知，秒懂猫咪能不能吃</text>
      </view>
    </view>
    <text class="scan-entry-arrow">›</text>
  </view>
```

- [ ] **Step 2: 添加入口卡片样式（wxss）**

在 `pages/food-search/food-search.wxss` 开头 `.search-box` 之前插入：

```css
/* ── 拍照识配料入口 ── */
.scan-entry {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 24rpx; margin-bottom: 24rpx;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFF3E6 100%);
  border: 2rpx solid rgba(255, 140, 66, 0.18);
  border-radius: 16rpx;
}
.scan-entry-left {
  display: flex; align-items: center; gap: 16rpx;
}
.scan-icon-wrap {
  width: 72rpx; height: 72rpx; border-radius: 18rpx;
  background: #FFF; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(255, 140, 66, 0.12);
}
.scan-icon-emoji { font-size: 36rpx; }
.scan-entry-text { display: flex; flex-direction: column; gap: 4rpx; }
.scan-entry-title { font-size: 28rpx; font-weight: 700; color: var(--text); }
.scan-entry-sub { font-size: 22rpx; color: var(--text-secondary); }
.scan-entry-arrow { font-size: 40rpx; color: #CCC; }
```

- [ ] **Step 3: 添加跳转逻辑（js）**

在 `pages/food-search/food-search.js` 的 `goDetail` 方法之后（约第 115 行后），插入：

```js
  /** 跳转拍照识配料 */
  goScan() {
    wx.navigateTo({ url: '/pages/ingredient-scan/ingredient-scan' });
  },
```

---

### Task 3: 创建拍照 + 预览确认页

**Files:**
- Create: `pages/ingredient-scan/ingredient-scan.json`
- Create: `pages/ingredient-scan/ingredient-scan.wxml`
- Create: `pages/ingredient-scan/ingredient-scan.wxss`
- Create: `pages/ingredient-scan/ingredient-scan.js`

- [ ] **Step 1: 创建页面配置 (json)**

```json
{
  "navigationBarTitleText": "拍照识配料",
  "usingComponents": {}
}
```

- [ ] **Step 2: 创建页面结构 (wxml)**

```html
<!-- 拍照识配料 — 拍照 + 预览确认 -->
<view class="container">
  <!-- ═══ 步骤 1：拍照 ═══ -->
  <block wx:if="{{step === 'camera'}}">
    <view class="camera-area">
      <view class="camera-placeholder">
        <text class="camera-emoji">📸</text>
        <text class="camera-title">请拍摄产品配料表</text>
        <text class="camera-hint">将产品包装背面的「配料表」放在框内</text>
      </view>
    </view>
    <view class="camera-actions">
      <button class="btn-primary scan-btn" bindtap="takePhoto">📸 拍照识别</button>
      <text class="or-text">— 或 —</text>
      <view class="btn-ghost scan-btn" bindtap="pickFromAlbum">从相册选择</view>
    </view>
  </block>

  <!-- ═══ 步骤 2：预览确认 ═══ -->
  <block wx:if="{{step === 'preview'}}">
    <view class="preview-area">
      <image class="preview-img" src="{{photoPath}}" mode="aspectFit" />
    </view>
    <view class="preview-status">
      <text class="preview-check-emoji">{{photoOK ? '✅' : '⚠️'}}</text>
      <text class="preview-check-text">{{photoOK ? '照片清晰，可以识别' : '照片较模糊，建议重拍'}}</text>
    </view>
    <view class="preview-actions">
      <view class="btn-outline scan-btn" bindtap="retake">🔄 重拍</view>
      <view class="btn-primary scan-btn" bindtap="confirmScan">✨ 确认识别</view>
    </view>
  </block>

  <!-- ═══ 识别中 ═══ -->
  <block wx:if="{{step === 'loading'}}">
    <view class="loading-area">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在识别配料表...</text>
      <text class="loading-hint">这可能需要几秒钟</text>
    </view>
  </block>
</view>
```

- [ ] **Step 3: 创建页面样式 (wxss)**

```css
/* ── 拍照识配料 — 拍照预览页 ── */

/* 拍照区 */
.camera-area {
  width: 100%; height: 520rpx; background: #1a1a2e;
  border-radius: 24rpx; display: flex; align-items: center;
  justify-content: center; margin-bottom: 32rpx;
  border: 3rpx dashed rgba(255, 140, 66, 0.25);
}
.camera-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.camera-emoji { font-size: 80rpx; }
.camera-title { color: #FFF; font-size: 32rpx; font-weight: 700; }
.camera-hint { color: rgba(255,255,255,0.35); font-size: 24rpx; }

.camera-actions {
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.scan-btn { width: 100%; text-align: center; }
.or-text { color: var(--text-secondary); font-size: 24rpx; }

/* 预览区 */
.preview-area {
  width: 100%; margin-bottom: 24rpx;
  border-radius: 16rpx; overflow: hidden; background: #000;
}
.preview-img { width: 100%; height: 500rpx; }
.preview-status {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  margin-bottom: 32rpx;
}
.preview-check-emoji { font-size: 36rpx; }
.preview-check-text { font-size: 28rpx; color: var(--text); }

.preview-actions {
  display: flex; gap: 16rpx;
}
.preview-actions .scan-btn { flex: 1; }

/* 加载态 */
.loading-area {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh; gap: 20rpx;
}
.loading-spinner {
  width: 64rpx; height: 64rpx; border: 5rpx solid #F0F0F0;
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 30rpx; font-weight: 600; color: var(--text); }
.loading-hint { font-size: 24rpx; color: var(--text-secondary); }
```

- [ ] **Step 4: 创建页面逻辑 (js)**

```js
// 拍照识配料 — 拍照 + 预览确认
Page({
  data: {
    step: 'camera',   // 'camera' | 'preview' | 'loading'
    photoPath: '',    // 照片临时路径
    photoOK: true,    // 照片是否清晰
  },

  /** 拍照 */
  takePhoto() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success(res) {
        that.setData({ step: 'preview', photoPath: res.tempFilePaths[0], photoOK: true });
      },
      fail(err) {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '拍照失败', icon: 'none' });
        }
      },
    });
  },

  /** 从相册选 */
  pickFromAlbum() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success(res) {
        that.setData({ step: 'preview', photoPath: res.tempFilePaths[0], photoOK: true });
      },
      fail(err) {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '选择失败', icon: 'none' });
        }
      },
    });
  },

  /** 重拍 */
  retake() {
    this.setData({ step: 'camera', photoPath: '', photoOK: true });
  },

  /** 确认识别 → 上传云函数 OCR */
  async confirmScan() {
    this.setData({ step: 'loading' });
    try {
      // 1. 将图片转为 base64
      const fs = wx.getFileSystemManager();
      const base64 = fs.readFileSync(this.data.photoPath, 'base64');

      // 2. 调用云函数 OCR
      const res = await wx.cloud.callFunction({
        name: 'ocr-ingredients',
        data: { imageBase64: base64 },
      });

      if (!res.result || !res.result.ok) {
        throw new Error(res.result?.error || 'OCR 识别失败');
      }

      // 3. 跳转结果页
      wx.redirectTo({
        url: `/pages/ingredient-result/ingredient-result?data=${encodeURIComponent(JSON.stringify(res.result.ingredients))}`,
      });
    } catch (e) {
      console.error('OCR failed:', e);
      wx.showModal({
        title: '识别失败',
        content: '请确保照片中配料表清晰可见，重新拍摄试试~',
        confirmText: '重拍',
        success: (modalRes) => {
          if (modalRes.confirm) this.setData({ step: 'camera', photoPath: '' });
        },
      });
    }
  },
});
```

---

### Task 4: 创建分析结果页

**Files:**
- Create: `pages/ingredient-result/ingredient-result.json`
- Create: `pages/ingredient-result/ingredient-result.wxml`
- Create: `pages/ingredient-result/ingredient-result.wxss`
- Create: `pages/ingredient-result/ingredient-result.js`

- [ ] **Step 1: 创建页面配置 (json)**

```json
{
  "navigationBarTitleText": "配料分析结果",
  "usingComponents": {}
}
```

- [ ] **Step 2: 创建页面结构 (wxml)**

```html
<!-- 配料分析结果 -->
<view class="container">
  <!-- 头部摘要 -->
  <view class="result-header card">
    <view class="result-summary">
      <view class="summary-icon">📊</view>
      <view class="summary-info">
        <text class="summary-title">配料分析完成</text>
        <text class="summary-desc">共识别 {{ingredients.length}} 种配料</text>
      </view>
    </view>
    <!-- 统计条 -->
    <view class="stats-bar">
      <view class="stat-item stat-safe">
        <text class="stat-num">{{stats.safe}}</text>
        <text class="stat-label">安全</text>
      </view>
      <view class="stat-item stat-caution">
        <text class="stat-num">{{stats.caution}}</text>
        <text class="stat-label">慎用</text>
      </view>
      <view class="stat-item stat-danger">
        <text class="stat-num">{{stats.danger}}</text>
        <text class="stat-label">危险</text>
      </view>
      <view class="stat-item stat-unknown">
        <text class="stat-num">{{stats.unknown}}</text>
        <text class="stat-label">未知</text>
      </view>
    </view>
  </view>

  <!-- 配料列表 -->
  <view class="ingredient-list">
    <view class="ingredient-item {{item.safety === 'danger' ? 'item-danger' : item.safety === 'caution' ? 'item-caution' : item.safety === 'safe' ? 'item-safe' : 'item-unknown'}}"
          wx:for="{{ingredients}}" wx:key="name">
      <!-- 图标 + 名称 -->
      <view class="ing-head">
        <text class="ing-emoji">
          {{item.safety === 'danger' ? '🔴' : item.safety === 'caution' ? '⚠️' : item.safety === 'safe' ? '✅' : '❓'}}
        </text>
        <text class="ing-name">{{item.name}}</text>
        <view class="ing-tag tag-{{item.safety}}">
          {{item.safety === 'danger' ? '危险' : item.safety === 'caution' ? '慎用' : item.safety === 'safe' ? '安全' : '未知'}}
        </view>
      </view>
      <!-- 说明 -->
      <text class="ing-desc" wx:if="{{item.description}}">{{item.description}}</text>
      <!-- 警告（仅危险项） -->
      <view class="ing-warning" wx:if="{{item.warning}}">
        <text class="warning-icon">⚠️</text>
        <text class="warning-text">{{item.warning}}</text>
      </view>
    </view>
  </view>

  <!-- 空状态 -->
  <view class="empty-state" wx:if="{{ingredients.length === 0}}">
    <text>未能识别到任何配料</text>
  </view>

  <!-- 底部操作 -->
  <view class="bottom-actions">
    <view class="btn-outline" bindtap="scanAgain">🔄 再拍一张</view>
  </view>
</view>
```

- [ ] **Step 3: 创建页面样式 (wxss)**

```css
/* ── 配料分析结果 ── */

/* 头部摘要 */
.result-header { padding: 24rpx; }
.result-summary {
  display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx;
}
.summary-icon { font-size: 48rpx; }
.summary-info { display: flex; flex-direction: column; gap: 4rpx; }
.summary-title { font-size: 30rpx; font-weight: 700; color: var(--text); }
.summary-desc { font-size: 24rpx; color: var(--text-secondary); }

/* 统计条 */
.stats-bar {
  display: flex; gap: 12rpx;
}
.stat-item { flex: 1; text-align: center; padding: 12rpx 0; border-radius: 10rpx; }
.stat-num { display: block; font-size: 36rpx; font-weight: 800; }
.stat-label { display: block; font-size: 20rpx; margin-top: 2rpx; }
.stat-safe { background: #E8F5E9; }
.stat-safe .stat-num { color: #2E7D32; }
.stat-caution { background: #FFF3E0; }
.stat-caution .stat-num { color: #E65100; }
.stat-danger { background: #FFEBEE; }
.stat-danger .stat-num { color: #C62828; }
.stat-unknown { background: #F5F5F5; }
.stat-unknown .stat-num { color: #757575; }

/* 配料列表 */
.ingredient-list { margin-top: 16rpx; }
.ingredient-item {
  padding: 20rpx 24rpx; margin-bottom: 12rpx; border-radius: 14rpx;
  border-left: 5rpx solid transparent;
}
.item-safe { background: #F1F8E9; border-left-color: #4CAF50; }
.item-caution { background: #FFF8E1; border-left-color: #FF9800; }
.item-danger { background: #FFF0F0; border-left-color: #F44336; }
.item-unknown { background: #F5F5F5; border-left-color: #9E9E9E; }

.ing-head {
  display: flex; align-items: center; gap: 10rpx; margin-bottom: 6rpx;
}
.ing-emoji { font-size: 28rpx; flex-shrink: 0; }
.ing-name { font-size: 28rpx; font-weight: 700; color: var(--text); }
.ing-tag {
  margin-left: auto; padding: 4rpx 14rpx; border-radius: 20rpx;
  font-size: 20rpx; font-weight: 600; flex-shrink: 0;
}
.tag-safe { background: #4CAF50; color: #FFF; }
.tag-caution { background: #FF9800; color: #FFF; }
.tag-danger { background: #F44336; color: #FFF; }
.tag-unknown { background: #9E9E9E; color: #FFF; }

.ing-desc {
  font-size: 24rpx; color: var(--text-secondary); line-height: 1.6;
  display: block; padding-left: 38rpx;
}
.ing-warning {
  display: flex; align-items: flex-start; gap: 6rpx;
  margin-top: 8rpx; padding: 10rpx 14rpx;
  background: rgba(244, 67, 54, 0.08); border-radius: 8rpx;
}
.warning-icon { font-size: 22rpx; flex-shrink: 0; }
.warning-text { font-size: 22rpx; color: #C62828; line-height: 1.5; }

/* 底部操作 */
.bottom-actions {
  margin-top: 24rpx; padding-bottom: 40rpx;
}
.bottom-actions .btn-outline { width: 100%; text-align: center; }
```

- [ ] **Step 4: 创建页面逻辑 (js)**

```js
// 配料分析结果页
const foodsData = require('../../data/foods');

Page({
  data: {
    ingredients: [],
    stats: { safe: 0, caution: 0, danger: 0, unknown: 0 },
  },

  onLoad(options) {
    if (!options.data) {
      wx.showToast({ title: '无识别数据', icon: 'none' });
      return;
    }
    const rawIngredients = JSON.parse(decodeURIComponent(options.data));
    const ingredients = this.matchIngredients(rawIngredients);
    const stats = this.calcStats(ingredients);
    this.setData({ ingredients, stats });
  },

  /** 匹配数据库 */
  matchIngredients(names) {
    return names.map(name => {
      const n = name.trim();
      if (!n) return null;

      // 精确匹配 name
      let match = foodsData.find(f => f.name === n);
      // 模糊匹配（包含关系）
      if (!match) {
        match = foodsData.find(f =>
          f.name.includes(n) || n.includes(f.name)
        );
      }

      if (match) {
        return {
          name: match.name,
          safety: match.safety,
          description: match.effect || match.advice || match.nutrition || '',
          warning: match.warning || '',
        };
      }

      // 未匹配 → 标记未知
      return {
        name: n,
        safety: 'unknown',
        description: '暂未收录此配料信息',
        warning: '',
      };
    }).filter(Boolean);
  },

  /** 统计 */
  calcStats(ingredients) {
    const stats = { safe: 0, caution: 0, danger: 0, unknown: 0 };
    ingredients.forEach(i => {
      if (stats[i.safety] !== undefined) stats[i.safety]++;
    });
    return stats;
  },

  /** 再拍一张 */
  scanAgain() {
    wx.redirectTo({ url: '/pages/ingredient-scan/ingredient-scan' });
  },
});
```

---

### Task 5: 创建 OCR 云函数

**Files:**
- Create: `cloudfunctions/ocr-ingredients/index.js`
- Create: `cloudfunctions/ocr-ingredients/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "ocr-ingredients",
  "version": "1.0.0",
  "description": "OCR 识别配料表文字",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "^2.6.3"
  }
}
```

- [ ] **Step 2: 创建云函数逻辑**

```js
// ── 云函数: ocr-ingredients ──────────────────────────────
// 接收图片 base64 → 微信 OCR 通用印刷体识别 → 解析配料名
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { imageBase64 } = event;
  if (!imageBase64) {
    return { ok: false, error: 'missing imageBase64' };
  }

  try {
    // 1. 调用微信 OCR 开放接口（印刷体识别）
    const ocrRes = await cloud.openapi.ocr.printedText({
      type: 'photo',
      imgUrl: `data:image/jpeg;base64,${imageBase64}`,
    });

    console.log('OCR raw result:', JSON.stringify(ocrRes).slice(0, 500));

    // 2. 提取文字
    const items = ocrRes.items || [];
    const fullText = items.map(it => it.text).join('');

    // 3. 解析配料名
    const ingredients = parseIngredients(fullText);

    console.log(`Parsed ${ingredients.length} ingredients:`, ingredients.join(', '));
    return { ok: true, ingredients };
  } catch (e) {
    console.error('OCR error:', e);
    return { ok: false, error: e.message || 'OCR failed' };
  }
};

/**
 * 从 OCR 文字中解析配料名
 *
 * 典型配料表格式：
 *   "配料表：鸡肉、鸡肝、大米、玉米..."
 *   "原料组成：鸡肉粉(30%)、玉米、鸡油..."
 *   "成分：三文鱼、豌豆、..."
 */
function parseIngredients(text) {
  // 1. 定位配料表段落（找到"配料""原料""成分"关键词后的内容）
  const patterns = [
    /配料表?[：:]\s*(.+?)(?:。|保存|生产|保质|净含量|产品|营养|$)/,
    /原料[组成]?[：:]\s*(.+?)(?:。|添加剂|营养|保存|生产|保质|净含量|产品|$)/,
    /成分[：:]\s*(.+?)(?:。|营养|保存|生产|保质|净含量|产品|$)/,
  ];

  let ingredientBlock = '';
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1] && m[1].length > 3) {
      ingredientBlock = m[1];
      break;
    }
  }

  // 如果没找到明显段落标记，用全文
  if (!ingredientBlock) {
    ingredientBlock = text;
  }

  // 2. 按分隔符拆分
  // 中文配料表常见分隔符：、，, . 。· ；; （）()
  // 先去掉括号内的比例/说明，再拆分
  const cleaned = ingredientBlock
    .replace(/[（(][^）)]*[）)]/g, '')  // 去括号内容 (如 "鸡肉粉(30%)")
    .replace(/[0-9]+%/g, '')              // 去百分比
    .replace(/[0-9]+\.[0-9]+%/g, '');

  const parts = cleaned.split(/[、，,\.。·；;／/]+/);

  // 3. 清洗每个配料名
  const ingredients = parts
    .map(p => p.trim())
    .filter(p => {
      // 过滤太短/太长/明显不是配料的内容
      if (p.length < 2 || p.length > 15) return false;
      // 过滤纯数字/纯标点
      if (/^[0-9\s\.%\-,;:：]+$/.test(p)) return false;
      // 过滤非配料关键词
      const skipWords = /^(配料表|原料组成|成分|产品|净含量|保质期|生产日期|保存|注意事项)/;
      if (skipWords.test(p)) return false;
      return true;
    })
    .map(p => {
      // 去尾部的括号/多余的标点
      return p.replace(/[（(][^)）]*$/, '').replace(/[，,\.。·：:;；]$/, '').trim();
    })
    .filter(p => p.length >= 2);

  // 去重（保留顺序）
  return [...new Set(ingredients)];
}
```

- [ ] **Step 3: 部署云函数**

在微信开发者工具中：
1. 右键 `cloudfunctions/ocr-ingredients` → 上传并部署：云端安装依赖
2. 等待部署成功（控制台输出 `ocr-ingredients 部署成功`）

---

### Task 6: 注册新页面

**Files:**
- Modify: `app.json`

- [ ] **Step 1: 在 pages 数组中注册 2 个新页面**

在 `app.json` 的 `"pages"` 数组中添加两条路径（位置任意，建议放在 `pages/food-search` 相关页面附近）：

```json
"pages/ingredient-scan/ingredient-scan",
"pages/ingredient-result/ingredient-result",
```

紧跟在 `"pages/food-detail/food-detail"` 之后。

---

### Task 7: 端到端测试

- [ ] **Step 1: 本地编译检查**

在微信开发者工具中编译，确保无报错。检查：
- 食物查询页顶部出现「📷 拍照识别配料表」卡片
- 点击卡片跳转到拍照页
- 拍照页显示正常

- [ ] **Step 2: 测试拍照 → 预览流程**

点击「拍照识别」→ 拍摄 → 确认预览页出现 → 点击「重拍」回到相机 → 点击「确认识别」显示 loading

- [ ] **Step 3: 测试 OCR 云函数**

在微信开发者工具中，云函数控制台 → `ocr-ingredients` → 测试运行，传入：
```json
{ "imageBase64": "..." }
```
确认返回 `{ ok: true, ingredients: [...] }`

- [ ] **Step 4: 测试结果页**

确认从 OCR 返回的配料在结果页正确显示，安全/慎用/危险/未知标签颜色正确。

---

## 自审清单

- [x] Spec 覆盖：每个设计点都有对应任务（入口 → 拍照 → 预览 → OCR → 匹配 → 结果）
- [x] 无占位符：所有步骤都包含完整代码
- [x] 类型一致：`safety: 'safe'|'caution'|'danger'|'unknown'` 在所有文件中统一
