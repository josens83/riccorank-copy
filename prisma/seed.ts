import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.news.deleteMany();
  await prisma.themeStock.deleteMany();
  await prisma.marketIndex.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: '재이고ㅡ',
      password: '$2a$10$YourHashedPasswordHere', // bcrypt hashed password
      provider: 'email',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'investor@example.com',
      name: '투자전문가',
      password: '$2a$10$YourHashedPasswordHere',
      provider: 'email',
    },
  });

  console.log('✅ Created users');

  // Create Stocks
  const stocks = await Promise.all([
    prisma.stock.create({
      data: {
        symbol: '005930',
        name: '삼성전자',
        market: 'KOSPI',
        currentPrice: 100700,
        change: -3500,
        changePercent: -3.60,
        volume: 5753888,
        marketCap: 3008709,
        sales: 327260,
        operatingIncome: 344514,
        netIncome: 19.64,
        per: 19.64,
        pbr: 1.68,
        score: 97.50,
        rank: 1,
      },
    }),
    prisma.stock.create({
      data: {
        symbol: '005380',
        name: '현대차',
        market: 'KOSPI',
        currentPrice: 272500,
        change: 0,
        changePercent: 0.00,
        volume: 557965,
        marketCap: 1752312,
        sales: 142396,
        operatingIncome: 132299,
        netIncome: 5.92,
        per: 5.92,
        pbr: 0.67,
        score: 97.40,
        rank: 2,
      },
    }),
    prisma.stock.create({
      data: {
        symbol: '000660',
        name: 'SK하이닉스',
        market: 'KOSPI',
        currentPrice: 605000,
        change: -45000,
        changePercent: -8.47,
        volume: 4076813,
        marketCap: 661930,
        sales: 234673,
        operatingIncome: 197969,
        netIncome: 20.6,
        per: 20.6,
        pbr: 5.36,
        score: 97.38,
        rank: 3,
      },
    }),
    prisma.stock.create({
      data: {
        symbol: '000270',
        name: '기아',
        market: 'KOSPI',
        currentPrice: 117500,
        change: -500,
        changePercent: -0.43,
        volume: 460733,
        marketCap: 1074488,
        sales: 126671,
        operatingIncome: 97750,
        netIncome: 4.79,
        per: 4.79,
        pbr: 0.83,
        score: 97.31,
        rank: 4,
      },
    }),
    prisma.stock.create({
      data: {
        symbol: '105560',
        name: 'KB금융',
        market: 'KOSPI',
        currentPrice: 127400,
        change: -2100,
        changePercent: -1.62,
        volume: 493993,
        marketCap: 304914,
        sales: 80453,
        operatingIncome: 50286,
        netIncome: 10.19,
        per: 10.19,
        pbr: 0.86,
        score: 97.14,
        rank: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${stocks.length} stocks`);

  // Create Market Indices
  const indices = await Promise.all([
    prisma.marketIndex.create({
      data: {
        name: '코스피지수',
        symbol: 'KOSPI',
        value: 4089.25,
        change: 79.54,
        changePercent: 1.94,
        country: '국내',
      },
    }),
    prisma.marketIndex.create({
      data: {
        name: '코스닥',
        symbol: 'KOSDAQ',
        value: 902.72,
        change: 4.86,
        changePercent: 0.54,
        country: '국내',
      },
    }),
    prisma.marketIndex.create({
      data: {
        name: '다우존스',
        symbol: 'DJI',
        value: 47147.48,
        change: -306.22,
        changePercent: -0.65,
        country: '해외',
      },
    }),
    prisma.marketIndex.create({
      data: {
        name: 'S&P 500',
        symbol: 'SPX',
        value: 6734.11,
        change: -33.36,
        changePercent: -0.05,
        country: '해외',
      },
    }),
  ]);

  console.log(`✅ Created ${indices.length} market indices`);

  // Create Theme Stocks
  const themes = await Promise.all([
    prisma.themeStock.create({
      data: {
        name: '반도체 대장주(생산)',
        description: '시장을 주도하는 대형 금융주',
        stockSymbols: JSON.stringify(['005930', '000660']),
        changePercent: 5.28,
        isHot: true,
      },
    }),
    prisma.themeStock.create({
      data: {
        name: '3D 프린터',
        description: '3D 프린팅 관련 기업',
        stockSymbols: JSON.stringify(['035420']),
        changePercent: 4.91,
        isHot: false,
      },
    }),
  ]);

  console.log(`✅ Created ${themes.length} theme stocks`);

  // Create News
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: '[특징주] 그린광학, 코스닥 상장 첫날 43% 상승 마감(종합)',
        content: '상장 주관사 삼영증권 MTS 오류 소동..."콜라우드는 네트워크상 문제" 업은건 황철환 기자 = 그린광학이 코스닥 시장 상장 첫날인 17일 공모가의 1.4배 수준에서 장을 마감...',
        summary: '그린광학이 코스닥 시장 상장 첫날 43% 상승',
        source: '마지막 업데이트',
        isHot: true,
        category: '국내',
        views: 1100,
        publishedAt: new Date(Date.now() - 24 * 60 * 1000),
      },
    }),
    prisma.news.create({
      data: {
        title: '[특징주 분석] AI 반도체 투자 확대... 파이썬, 자유전문 소재 관련주 입...',
        content: 'KRX 정보데이터시스템에 따르면 파이썬[005690] 주가는 1만9,270원으로, 전일 대비 10.30% 상승세를 나타냈다...',
        summary: 'AI 반도체 관련주 상승세',
        source: '특징주 분석',
        isHot: true,
        category: '국내',
        views: 1100,
        publishedAt: new Date(Date.now() - 29 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${news.length} news items`);

  // Create Posts
  const post1 = await prisma.post.create({
    data: {
      title: '한국전력(015760) — AI 시대의 전력 인프라, 턴어라운드의 정석',
      content: '2025년 11월 14일 기준, 한국전력은 47,400원에 마감하며 연초 대비 +118% 상승을 기록했습니다. 기술적 분석과 펀더멘털 분석을 종합해보면...',
      category: 'stock',
      tags: '한국전력',
      views: 1100,
      isPopular: true,
      isPinned: false,
      userId: user1.id,
      stockId: stocks[0].id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: '발표와 재강의 괴리',
      content: '반도체 등이 주도하는 산업생성, 설립투자 후행 자료는 정부발표와 다르게 작년 대비 출하가 29% 감소했다는 통계가...',
      category: 'free',
      tags: '종목토론글',
      views: 61,
      isPopular: false,
      isPinned: false,
      userId: user2.id,
    },
  });

  console.log(`✅ Created posts`);

  // Create Comments
  const comment1 = await prisma.comment.create({
    data: {
      content: '좋은 분석 감사합니다!',
      userId: user2.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: '동의합니다. 추가 상승 여력이 있어 보입니다.',
      userId: user1.id,
      postId: post1.id,
    },
  });

  // Create reply
  const reply1 = await prisma.comment.create({
    data: {
      content: '저도 그렇게 생각합니다.',
      userId: user2.id,
      postId: post1.id,
      parentId: comment2.id,
    },
  });

  console.log(`✅ Created comments and replies`);

  // Create Likes
  const like1 = await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  console.log(`✅ Created likes`);

  // Create Bookmarks
  const bookmark1 = await prisma.bookmark.create({
    data: {
      userId: user1.id,
      stockId: stocks[0].id,
    },
  });

  console.log(`✅ Created bookmarks`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
