/**
 * 预设形象库 - 三国 + 科幻主题（9:16竖版）
 * 30个图片形象 + 30个视频形象
 */

import type { Portrait } from './usePortraitStore'

// ==================== 图片形象（三国主题 - 9:16竖版）====================
export const THREE_KINGDOMS_IMAGES: Portrait[] = [
  // 蜀汉五虎将
  {
    id: 'tk_img_001',
    name: '关羽 - 义薄云天',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/guanyu.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_002',
    name: '张飞 - 虎威将军',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/zhangfei.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_003',
    name: '赵云 - 常胜将军',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/zhaoyun.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_004',
    name: '马超 - 锦马超',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/machao.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_005',
    name: '黄忠 - 老当益壮',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/huangzhong.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  },

  // 蜀汉谋士
  {
    id: 'tk_img_006',
    name: '诸葛亮 - 卧龙',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/zhugeliang.png',
    tags: ['三国', '蜀汉', '谋士', 'male', '图片']
  },
  {
    id: 'tk_img_007',
    name: '庞统 - 凤雏',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/pangtong.png',
    tags: ['三国', '蜀汉', '谋士', 'male', '图片']
  },
  {
    id: 'tk_img_008',
    name: '徐庶 - 智谋之士',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/fazheng.png',
    tags: ['三国', '蜀汉', '谋士', 'male', '图片']
  },

  // 曹魏阵营
  {
    id: 'tk_img_009',
    name: '曹操 - 魏武帝',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/caocao.png',
    tags: ['三国', '曹魏', '君主', 'male', '图片']
  },
  {
    id: 'tk_img_010',
    name: '司马懿 - 冢虎',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/simayi.png',
    tags: ['三国', '曹魏', '谋士', 'male', '图片']
  },
  {
    id: 'tk_img_011',
    name: '郭嘉 - 鬼才',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/guojia.png',
    tags: ['三国', '曹魏', '谋士', 'male', '图片']
  },
  {
    id: 'tk_img_012',
    name: '典韦 - 恶来',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/dianwei.png',
    tags: ['三国', '曹魏', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_013',
    name: '许褚 - 虎痴',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/xuchu.png',
    tags: ['三国', '曹魏', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_014',
    name: '张辽 - 威震逍遥津',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/zhangliao.png',
    tags: ['三国', '曹魏', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_015',
    name: '夏侯惇 - 独眼将军',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/xiahoudun.png',
    tags: ['三国', '曹魏', '武将', 'male', '图片']
  },

  // 东吴阵营
  {
    id: 'tk_img_016',
    name: '孙权 - 碧眼紫髯',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/sunquan.png',
    tags: ['三国', '东吴', '君主', 'male', '图片']
  },
  {
    id: 'tk_img_017',
    name: '周瑜 - 美周郎',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/zhouyu.png',
    tags: ['三国', '东吴', '谋士', 'male', '图片']
  },
  {
    id: 'tk_img_018',
    name: '陆逊 - 火烧连营',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/luxun.png',
    tags: ['三国', '东吴', '谋士', 'male', '图片']
  },
  {
    id: 'tk_img_019',
    name: '甘宁 - 锦帆贼',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/ganning.png',
    tags: ['三国', '东吴', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_020',
    name: '太史慈 - 神射手',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/taishici.png',
    tags: ['三国', '东吴', '武将', 'male', '图片']
  },

  // 女性角色
  {
    id: 'tk_img_021',
    name: '貂蝉 - 闭月',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/diaochan.png',
    tags: ['三国', '女性', 'female', '图片']
  },
  {
    id: 'tk_img_022',
    name: '大乔 - 国色天香',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/daqiao.png',
    tags: ['三国', '东吴', 'female', '图片']
  },
  {
    id: 'tk_img_023',
    name: '小乔 - 倾国倾城',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/xiaoqiao.png',
    tags: ['三国', '东吴', 'female', '图片']
  },
  {
    id: 'tk_img_024',
    name: '孙尚香 - 弓腰姬',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/sunshangxiang.png',
    tags: ['三国', '东吴', 'female', '图片']
  },

  // 其他知名角色
  {
    id: 'tk_img_025',
    name: '吕布 - 飞将',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/lvbu.png',
    tags: ['三国', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_026',
    name: '董卓 - 暴君',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/dongzhuo.png',
    tags: ['三国', '君主', 'male', '图片']
  },
  {
    id: 'tk_img_027',
    name: '袁绍 - 四世三公',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/yuanshao.png',
    tags: ['三国', '君主', 'male', '图片']
  },
  {
    id: 'tk_img_028',
    name: '刘备 - 仁德君主',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/liubei.png',
    tags: ['三国', '蜀汉', '君主', 'male', '图片']
  },
  {
    id: 'tk_img_029',
    name: '姜维 - 龙的传人',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/jiangwei.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  },
  {
    id: 'tk_img_030',
    name: '魏延 - 骁勇善战',
    type: 'preset',
    mediaType: 'image',
    path: '/portraits/3kingdoms/weiyan.png',
    tags: ['三国', '蜀汉', '武将', 'male', '图片']
  }
]

// ==================== 视频形象（科幻主题 - 9:16竖版）====================
export const SCIFI_VIDEOS: Portrait[] = [
  // 战斗型机器人
  {
    id: 'sf_vid_001',
    name: 'Atlas - 战神',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/atlas-warrior.mp4',
    thumbnail: '/portraits/temp/atlas-warrior.png',
    tags: ['科幻', '机器人', '战斗型', '视频']
  },
  {
    id: 'sf_vid_002',
    name: 'Titan - 巨神',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/titan-giant.mp4',
    thumbnail: '/portraits/temp/titan-giant.png',
    tags: ['科幻', '机器人', '战斗型', '视频']
  },
  {
    id: 'sf_vid_003',
    name: 'Sentinel - 哨兵',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/sentinel-guard.mp4',
    thumbnail: '/portraits/temp/sentinel-guard.png',
    tags: ['科幻', '机器人', '防御型', '视频']
  },
  {
    id: 'sf_vid_004',
    name: 'Striker - 突击者',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/striker-assault.mp4',
    thumbnail: '/portraits/temp/striker-assault.png',
    tags: ['科幻', '机器人', '战斗型', '视频']
  },
  {
    id: 'sf_vid_005',
    name: 'Phantom - 幽灵',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/phantom-stealth.mp4',
    thumbnail: '/portraits/temp/phantom-stealth.png',
    tags: ['科幻', '机器人', '隐形型', '视频']
  },

  // 智能型AI
  {
    id: 'sf_vid_006',
    name: 'Oracle - 预言者',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/oracle-ai.mp4',
    thumbnail: '/portraits/temp/oracle-ai.png',
    tags: ['科幻', 'AI', '智能型', '视频']
  },
  {
    id: 'sf_vid_007',
    name: 'Nexus - 网络核心',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/nexus-network.mp4',
    thumbnail: '/portraits/temp/nexus-network.png',
    tags: ['科幻', 'AI', '智能型', '视频']
  },
  {
    id: 'sf_vid_008',
    name: 'Cortex - 大脑',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/cortex-brain.mp4',
    thumbnail: '/portraits/temp/cortex-brain.png',
    tags: ['科幻', 'AI', '智能型', '视频']
  },
  {
    id: 'sf_vid_009',
    name: 'Cipher - 密码',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/cipher-code.mp4',
    thumbnail: '/portraits/temp/cipher-code.png',
    tags: ['科幻', 'AI', '智能型', '视频']
  },
  {
    id: 'sf_vid_010',
    name: 'Matrix - 矩阵',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/matrix-core.mp4',
    thumbnail: '/portraits/temp/matrix-core.png',
    tags: ['科幻', 'AI', '智能型', '视频']
  },

  // 辅助型机器人
  {
    id: 'sf_vid_011',
    name: 'Medic - 医疗兵',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/medic-robot.mp4',
    thumbnail: '/portraits/temp/medic-robot.png',
    tags: ['科幻', '机器人', '医疗型', '视频']
  },
  {
    id: 'sf_vid_012',
    name: 'Engineer - 工程师',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/engineer-bot.mp4',
    thumbnail: '/portraits/temp/engineer-bot.png',
    tags: ['科幻', '机器人', '工程型', '视频']
  },
  {
    id: 'sf_vid_013',
    name: 'Scout - 侦察兵',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/scout-drone.mp4',
    thumbnail: '/portraits/temp/scout-drone.png',
    tags: ['科幻', '机器人', '侦察型', '视频']
  },
  {
    id: 'sf_vid_014',
    name: 'Carrier - 运输者',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/carrier-transport.mp4',
    thumbnail: '/portraits/temp/carrier-transport.png',
    tags: ['科幻', '机器人', '运输型', '视频']
  },
  {
    id: 'sf_vid_015',
    name: 'Reaper - 收割者',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/reaper-destroyer.mp4',
    thumbnail: '/portraits/temp/reaper-destroyer.png',
    tags: ['科幻', '机器人', '战斗型', '视频']
  },

  // 赛博朋克风格
  {
    id: 'sf_vid_016',
    name: 'Neon - 霓虹黑客',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/neon-hacker.mp4',
    thumbnail: '/portraits/temp/neon-hacker.png',
    tags: ['科幻', '赛博朋克', '黑客', '视频']
  },
  {
    id: 'sf_vid_017',
    name: 'Chrome - 镀铬战士',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/chrome-cyborg.mp4',
    thumbnail: '/portraits/temp/chrome-cyborg.png',
    tags: ['科幻', '赛博朋克', '改造人', '视频']
  },
  {
    id: 'sf_vid_018',
    name: 'Ghost - 幽灵壳',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/ghost-shell.mp4',
    thumbnail: '/portraits/temp/ghost-shell.png',
    tags: ['科幻', '赛博朋克', '改造人', 'female', '视频']
  },
  {
    id: 'sf_vid_019',
    name: 'Blade - 刀锋跑者',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/blade-runner.mp4',
    thumbnail: '/portraits/temp/blade-runner.png',
    tags: ['科幻', '赛博朋克', '猎手', '视频']
  },
  {
    id: 'sf_vid_020',
    name: 'Pulse - 脉冲技师',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/pulse-tech.mp4',
    thumbnail: '/portraits/temp/pulse-tech.png',
    tags: ['科幻', '赛博朋克', '技术员', '视频']
  },

  // 未来战士
  {
    id: 'sf_vid_021',
    name: 'Nova - 新星战士',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/nova-soldier.mp4',
    thumbnail: '/portraits/temp/nova-soldier.png',
    tags: ['科幻', '未来战士', 'female', '视频']
  },
  {
    id: 'sf_vid_022',
    name: 'Vanguard - 先锋',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/vanguard-elite.mp4',
    thumbnail: '/portraits/temp/vanguard-elite.png',
    tags: ['科幻', '未来战士', 'male', '视频']
  },
  {
    id: 'sf_vid_023',
    name: 'Spectre - 幽魂特工',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/spectre-ops.mp4',
    thumbnail: '/portraits/temp/spectre-ops.png',
    tags: ['科幻', '未来战士', 'male', '视频']
  },
  {
    id: 'sf_vid_024',
    name: 'Aurora - 极光飞行员',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/aurora-pilot.mp4',
    thumbnail: '/portraits/temp/aurora-pilot.png',
    tags: ['科幻', '未来战士', 'female', '视频']
  },
  {
    id: 'sf_vid_025',
    name: 'Apex - 顶点猎人',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/apex-hunter.mp4',
    thumbnail: '/portraits/temp/apex-hunter.png',
    tags: ['科幻', '未来战士', 'male', '视频']
  },

  // 外星种族
  {
    id: 'sf_vid_026',
    name: 'Zephyr - 微风使者',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/zephyr-alien.mp4',
    thumbnail: '/portraits/temp/zephyr-alien.png',
    tags: ['科幻', '外星人', '视频']
  },
  {
    id: 'sf_vid_027',
    name: 'Xenon - 氙灯生命',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/xenon-being.mp4',
    thumbnail: '/portraits/temp/xenon-being.png',
    tags: ['科幻', '外星人', '视频']
  },
  {
    id: 'sf_vid_028',
    name: 'Void - 虚空实体',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/void-entity.mp4',
    thumbnail: '/portraits/temp/void-entity.png',
    tags: ['科幻', '外星人', '视频']
  },
  {
    id: 'sf_vid_029',
    name: 'Aether - 以太精灵',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/aether-spirit.mp4',
    thumbnail: '/portraits/temp/aether-spirit.png',
    tags: ['科幻', '能量体', '视频']
  },
  {
    id: 'sf_vid_030',
    name: 'Quantum - 量子存在',
    type: 'preset',
    mediaType: 'video',
    path: '/portraits/scifi/quantum-being.mp4',
    thumbnail: '/portraits/temp/quantum-being.png',
    tags: ['科幻', '能量体', '视频']
  }
]

// 导出所有形象（60个：30图片 + 30视频）
export const ALL_PORTRAITS: Portrait[] = [...THREE_KINGDOMS_IMAGES, ...SCIFI_VIDEOS]

// 兼容旧版导出
export const GALLERY_PORTRAITS = ALL_PORTRAITS
export const EMOJI_PORTRAITS: Portrait[] = [] // 已移除Emoji支持
