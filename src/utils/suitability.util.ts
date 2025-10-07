import { AnswerEntity } from '@/modules/answer/answer.entity';
import { HollandType, SuitabilityType } from './enum/suitability.enum';

export interface SuiScore {
  A: number;
  I: number;
  C: number;
  E: number;
  S: number;
  R: number;
}

export interface SuiResult {
  suitabilityType: HollandType;
  scores: SuiScore;
  percentages: SuiScore;
}

export class SuitabilityCalculator {
  static calculateSuitabilityResult(answers: AnswerEntity[]): SuiResult {
    const scores: SuiScore = {
      A: 0,
      I: 0,
      C: 0,
      E: 0,
      S: 0,
      R: 0,
    };
    console.log('Hello answers', answers);
    answers.forEach((answer) => {
      const score = answer.score;
      switch (answer.question.suitabilityType) {
        case SuitabilityType.A:
          scores.A += score;
          break;
        case SuitabilityType.I:
          scores.I += score;
          break;
        case SuitabilityType.C:
          scores.C += score;
          break;
        case SuitabilityType.E:
          scores.E += score;
          break;
        case SuitabilityType.S:
          scores.S += score;
          break;
        case SuitabilityType.R:
          scores.R += score;
          break;
      }
    });
    return {
      suitabilityType: this.determineSuitabilityType(scores),
      scores,
      percentages: this.calculatePercentages(scores),
    };
  }

  public static determineSuitabilityType(scores: SuiScore): HollandType {
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    const topThree = sortedScores.map(([type]) => type).join('');

    return topThree as HollandType;
  }

  public static calculatePercentages(scores: SuiScore): SuiScore {
    const total = (Object.values(scores) as number[]).reduce(
      (sum: number, score: number) => sum + score,
      0,
    );

    return {
      A: total > 0 ? Math.round((scores.A / total) * 100) : 0,
      I: total > 0 ? Math.round((scores.I / total) * 100) : 0,
      C: total > 0 ? Math.round((scores.C / total) * 100) : 0,
      E: total > 0 ? Math.round((scores.E / total) * 100) : 0,
      S: total > 0 ? Math.round((scores.S / total) * 100) : 0,
      R: total > 0 ? Math.round((scores.R / total) * 100) : 0,
    };
  }
}
