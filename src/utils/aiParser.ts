import { ParsedMatchInput, CourtType, MatchType, SetScore, MatchResult } from '@/types/match';

export function parseMatchInput(input: string): ParsedMatchInput {
  const result: ParsedMatchInput = {};

  const opponentMatch = input.match(/[和与跟](\S+?)(?:双打|单打|打|在)/);
  if (opponentMatch) {
    result.opponent = opponentMatch[1];
  }

  const partnerMatch = input.match(/(?:搭档|配合)(\S+?)(?:双打|打|，|。|$)/);
  if (partnerMatch) {
    result.partner = partnerMatch[1];
  }

  if (input.includes('双打')) {
    result.matchType = 'doubles';
  } else if (input.includes('单打')) {
    result.matchType = 'singles';
  }

  const scorePattern = /(\d+)\s*[:：]\s*(\d+)/g;
  let scoreMatch;
  const scores: SetScore[] = [];
  while ((scoreMatch = scorePattern.exec(input)) !== null) {
    const mine = parseInt(scoreMatch[1], 10);
    const opponent = parseInt(scoreMatch[2], 10);
    scores.push({ mine, opponent });
  }
  if (scores.length > 0) {
    result.scores = scores;
    const totalMine = scores.reduce((acc, s) => acc + s.mine, 0);
    const totalOpponent = scores.reduce((acc, s) => acc + s.opponent, 0);
    result.result = totalMine > totalOpponent ? 'win' : 'lose';
  }

  const durationMatch = input.match(/(\d+)\s*(?:小时|小时左右|h)/);
  if (durationMatch) {
    result.duration = parseInt(durationMatch[1], 10) * 60;
  }

  const halfHourMatch = input.match(/半(?:小时|钟)/);
  if (halfHourMatch && result.duration) {
    result.duration += 30;
  }

  if (input.includes('硬地')) result.courtType = 'hard';
  else if (input.includes('红土')) result.courtType = 'clay';
  else if (input.includes('草地')) result.courtType = 'grass';

  const courtMatch = input.match(/在(\S+?)(?:打了|打|的)/);
  if (courtMatch) {
    result.court = courtMatch[1];
  }

  if (input.includes('昨晚') || input.includes('昨天')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    result.date = yesterday.toISOString().split('T')[0];
  } else if (input.includes('前天')) {
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    result.date = dayBefore.toISOString().split('T')[0];
  }

  if (input.includes('赢了') || input.includes('胜了') || input.includes('赢了')) {
    result.result = 'win';
  } else if (input.includes('输了') || input.includes('败了') || input.includes('负了')) {
    result.result = 'lose';
  }

  const moodPatterns = [
    { pattern: /状态好|超好|不错|很好/, mood: 'good' },
    { pattern: /状态差|很差|糟糕|不好/, mood: 'bad' },
    { pattern: /一般|还行|凑合/, mood: 'normal' }
  ];
  for (const { pattern, mood } of moodPatterns) {
    if (pattern.test(input)) {
      result.mood = mood;
      break;
    }
  }

  const techPatterns = [
    { pattern: /发球.*(?:差|不好|失误)/, techIssue: '发球不稳定' },
    { pattern: /反手.*(?:差|不好|失误)/, techIssue: '反手薄弱' },
    { pattern: /正手.*(?:差|不好|失误)/, techIssue: '正手失误多' },
    { pattern: /网前.*(?:差|不好|失误)/, techIssue: '网前技术不足' },
    { pattern: /体能.*(?:差|不好|不够)/, techIssue: '体能不足' },
    { pattern: /移动.*(?:慢|差|不好)/, techIssue: '脚步移动慢' }
  ];
  for (const { pattern, techIssue } of techPatterns) {
    if (pattern.test(input)) {
      result.techIssue = techIssue;
      break;
    }
  }

  result.notes = input;

  return result;
}

export function generateAISummary(parsed: ParsedMatchInput): string {
  const parts: string[] = [];

  if (parsed.result === 'win') {
    parts.push('本场比赛获胜');
  } else if (parsed.result === 'lose') {
    parts.push('本场比赛遗憾落败');
  }

  if (parsed.scores && parsed.scores.length > 0) {
    const lastSet = parsed.scores[parsed.scores.length - 1];
    if (parsed.scores.length >= 3) {
      parts.push('三盘大战展现了不错的韧性');
    }
    if (lastSet.tiebreak) {
      parts.push('抢七阶段表现关键');
    }
  }

  if (parsed.mood === 'good') {
    parts.push('整体状态良好，击球质量较高');
  } else if (parsed.mood === 'bad') {
    parts.push('状态需要调整，建议增加热身时间');
  }

  if (parsed.techIssue) {
    parts.push(`${parsed.techIssue}是本场比赛的主要问题，建议针对性训练`);
  }

  if (parsed.courtType === 'clay') {
    parts.push('红土场需要更多耐心和旋转变化');
  } else if (parsed.courtType === 'grass') {
    parts.push('草地场发球上网战术可以更多尝试');
  }

  if (parts.length === 0) {
    parts.push('继续保持训练节奏，稳步提升水平');
  }

  return parts.join('。') + '。';
}
