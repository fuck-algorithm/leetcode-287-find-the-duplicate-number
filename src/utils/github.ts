import { getCache, saveCache, isCacheValid } from './indexedDB';

const GITHUB_REPO = 'fuck-algorithm/leetcode-287-find-the-duplicate-number';
const CACHE_KEY = 'github-stars';
const CACHE_TTL = 60 * 60 * 1000; // 1小时

export interface GitHubRepoInfo {
  stargazers_count: number;
}

export async function getGitHubStars(): Promise<number> {
  // 检查缓存是否有效
  const isValid = await isCacheValid(CACHE_KEY);
  
  if (isValid) {
    const cached = await getCache<number>(CACHE_KEY);
    if (cached !== null) {
      return cached;
    }
  }
  
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub stars');
    }
    
    const data: GitHubRepoInfo = await response.json();
    const stars = data.stargazers_count;
    
    // 保存到缓存
    await saveCache(CACHE_KEY, stars, CACHE_TTL);
    
    return stars;
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    
    // 尝试获取过期的缓存作为fallback
    const cached = await getCache<number>(CACHE_KEY);
    if (cached !== null) {
      return cached;
    }
    
    // 没有缓存，返回默认值0
    return 0;
  }
}

export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;
