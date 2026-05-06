import { Post, Comment, MockProfile } from '../types';

const now = Date.now();
const min = 60 * 1000;
const hour = 60 * min;

export const mockProfiles: MockProfile[] = [
  {
    id: '1',
    username: 'andrei_dev',
    display_name: 'Andrei Popescu',
    avatar_url: null,
    bio: '💻 Full-stack developer | Iași, România\nOpen source enthusiast & coffee addict ☕',
    is_verified: true,
    followers_count: 1284,
    following_count: 312,
    posts_count: 97,
  },
  {
    id: '2',
    username: 'maria_ux',
    display_name: 'Maria Ionescu',
    avatar_url: null,
    bio: '🎨 UX/UI Designer la @TechStartup | Cluj-Napoca',
    is_verified: false,
    followers_count: 843,
    following_count: 201,
    posts_count: 54,
  },
  {
    id: '3',
    username: 'vlad_tech',
    display_name: 'Vlad Constantin',
    avatar_url: null,
    bio: 'Backend dev | Python & Go | Bucuresti',
    is_verified: false,
    followers_count: 2103,
    following_count: 489,
    posts_count: 203,
  },
  {
    id: '4',
    username: 'elena_startup',
    display_name: 'Elena Marinescu',
    avatar_url: null,
    bio: '🚀 Founder @YSocial | Building the future of Romanian social media',
    is_verified: true,
    followers_count: 15420,
    following_count: 730,
    posts_count: 441,
  },
  {
    id: '5',
    username: 'mihai_foto',
    display_name: 'Mihai Dumitrescu',
    avatar_url: null,
    bio: '📸 Fotograf | Natura si portrete | Sinaia',
    is_verified: false,
    followers_count: 6720,
    following_count: 1100,
    posts_count: 892,
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    user_id: '4',
    author: {
      id: '4',
      username: 'elena_startup',
      display_name: 'Elena Marinescu',
      avatar_url: null,
      is_verified: true,
    },
    content:
      'Suntem extrem de bucurosi sa anuntam ca Y Social tocmai a depasit 10.000 de utilizatori inregistrati! 🎉\n\nMultumim intregii comunitati pentru sustinere. Acesta este doar inceputul! 🚀 #YSocial #Romania #SocialMedia',
    media_url: null,
    media_type: null,
    like_count: 342,
    comment_count: 47,
    repost_count: 89,
    liked_by_me: true,
    reposted_by_me: false,
    created_at: new Date(now - 2 * hour).toISOString(),
  },
  {
    id: '2',
    user_id: '2',
    author: {
      id: '2',
      username: 'maria_ux',
      display_name: 'Maria Ionescu',
      avatar_url: null,
      is_verified: false,
    },
    content:
      'Tocmai am terminat designul pentru Sprint 2 al aplicatiei Y! 🎨\n\nNoua interfata aduce: feed redesignat, profil utilizator complet, si modul de creare postari cu contor de caractere.\n\nCe parere aveti? #design #ux #sprint2',
    media_url: null,
    media_type: null,
    like_count: 87,
    comment_count: 12,
    repost_count: 9,
    liked_by_me: false,
    reposted_by_me: false,
    created_at: new Date(now - 4 * hour).toISOString(),
  },
  {
    id: '3',
    user_id: '3',
    author: {
      id: '3',
      username: 'vlad_tech',
      display_name: 'Vlad Constantin',
      avatar_url: null,
      is_verified: false,
    },
    content:
      'Reminder pentru toti backend dev-ii: indexati coloanele pe care faceti JOIN si WHERE!\n\nAm optimizat azi un query de la 4.2s la 38ms doar adaugand un index compozit. 🔥\n\n#postgresql #performance #backend',
    media_url: null,
    media_type: null,
    like_count: 203,
    comment_count: 31,
    repost_count: 67,
    liked_by_me: false,
    reposted_by_me: true,
    created_at: new Date(now - 6 * hour).toISOString(),
  },
  {
    id: '4',
    user_id: '1',
    author: {
      id: '1',
      username: 'andrei_dev',
      display_name: 'Andrei Popescu',
      avatar_url: null,
      is_verified: true,
    },
    content:
      'TypeScript strict mode la inceput: 😤 "de ce imi da atatea erori?"\n\nTypeScript strict mode dupa o luna: 🥹 "multumesc ca m-ai salvat de 47 de bug-uri"\n\n#typescript #webdev',
    media_url: null,
    media_type: null,
    like_count: 512,
    comment_count: 43,
    repost_count: 134,
    liked_by_me: true,
    reposted_by_me: false,
    created_at: new Date(now - 12 * hour).toISOString(),
  },
  {
    id: '5',
    user_id: '5',
    author: {
      id: '5',
      username: 'mihai_foto',
      display_name: 'Mihai Dumitrescu',
      avatar_url: null,
      is_verified: false,
    },
    content:
      'Weekend-ul acesta am urcat pe Bucegi la rasarit. Nu exista nimic mai frumos decat Romania de sus. 🏔️❤️\n\n#bucegi #natura #romania #fotografie #rasarit',
    media_url: null,
    media_type: null,
    like_count: 1204,
    comment_count: 88,
    repost_count: 201,
    liked_by_me: false,
    reposted_by_me: false,
    created_at: new Date(now - 24 * hour).toISOString(),
  },
  {
    id: '6',
    user_id: '2',
    author: {
      id: '2',
      username: 'maria_ux',
      display_name: 'Maria Ionescu',
      avatar_url: null,
      is_verified: false,
    },
    content:
      'Hot take: dark mode nu e optionala, e o necesitate in 2026. Ochii utilizatorilor va multumesc. 🌙\n\n#darkmode #uxdesign #accessibility',
    media_url: null,
    media_type: null,
    like_count: 445,
    comment_count: 67,
    repost_count: 112,
    liked_by_me: false,
    reposted_by_me: false,
    created_at: new Date(now - 36 * hour).toISOString(),
  },
  {
    id: '7',
    user_id: '4',
    author: {
      id: '4',
      username: 'elena_startup',
      display_name: 'Elena Marinescu',
      avatar_url: null,
      is_verified: true,
    },
    content:
      'Cautam React Native developer pentru echipa Y Social! 🚀\n\n✅ Remote-first\n✅ Equity package\n✅ Proiect cu impact real\n\nDM daca esti interesat sau tag un prieten bun! #jobs #reactnative #romania #hiring',
    media_url: null,
    media_type: null,
    like_count: 178,
    comment_count: 54,
    repost_count: 203,
    liked_by_me: false,
    reposted_by_me: false,
    created_at: new Date(now - 48 * hour).toISOString(),
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    user_id: '1',
    post_id: '1',
    author: {
      id: '1',
      username: 'andrei_dev',
      display_name: 'Andrei Popescu',
      avatar_url: null,
      is_verified: true,
    },
    content: 'Felicitari! Meritati tot succesul 🎉 Aplicatia e geniala!',
    like_count: 24,
    created_at: new Date(now - 90 * min).toISOString(),
  },
  {
    id: 'c2',
    user_id: '3',
    post_id: '1',
    author: {
      id: '3',
      username: 'vlad_tech',
      display_name: 'Vlad Constantin',
      avatar_url: null,
      is_verified: false,
    },
    content: 'Un milestone urias! Urmatoarea tinta: 100k 💪',
    like_count: 18,
    created_at: new Date(now - 75 * min).toISOString(),
  },
  {
    id: 'c3',
    user_id: '5',
    post_id: '1',
    author: {
      id: '5',
      username: 'mihai_foto',
      display_name: 'Mihai Dumitrescu',
      avatar_url: null,
      is_verified: false,
    },
    content: 'Romania are nevoie de o retea sociala proprie. Bravo echipei! 🇷🇴',
    like_count: 31,
    created_at: new Date(now - 60 * min).toISOString(),
  },
  {
    id: 'c4',
    user_id: '2',
    post_id: '1',
    author: {
      id: '2',
      username: 'maria_ux',
      display_name: 'Maria Ionescu',
      avatar_url: null,
      is_verified: false,
    },
    content: 'Sprint 2 vine cu interface refresh! Va place ce am pregatit 👀',
    like_count: 15,
    created_at: new Date(now - 45 * min).toISOString(),
  },
];

export const trendingHashtags = [
  { tag: 'Romania', posts: 12400 },
  { tag: 'YSocial', posts: 8900 },
  { tag: 'ReactNative', posts: 5600 },
  { tag: 'webdev', posts: 4200 },
  { tag: 'TypeScript', posts: 3800 },
  { tag: 'design', posts: 3100 },
  { tag: 'startup', posts: 2700 },
  { tag: 'javascript', posts: 2300 },
];

export const suggestedUsers = [mockProfiles[3], mockProfiles[2], mockProfiles[4]];

export function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'acum';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}z`;
  return new Date(dateString).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function getAvatarColor(username: string): string {
  const colors = ['#1DA1F2', '#E0245E', '#17BF63', '#FFAD1F', '#794BC4', '#F45D22', '#00B8D4'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
