import { MbtiType, MbtiCategory } from '@/utils/enum/mbti-category.enum';
import { MbtiAnswerEntity } from '@/modules/mbti/entities/mbti-answer.entity';

export interface MbtiScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface MbtiPercentages {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface MbtiCalculationResult {
  mbtiType: MbtiType;
  scores: MbtiScores;
  percentages: MbtiPercentages;
}

export class MbtiCalculator {
  static calculateMbtiResult(
    answers: MbtiAnswerEntity[],
  ): MbtiCalculationResult {
    const scores: MbtiScores = {
      E: 0,
      I: 0,
      S: 0,
      N: 0,
      T: 0,
      F: 0,
      J: 0,
      P: 0,
    };

    // Tính điểm cho từng câu trả lời (-3..3)
    answers.forEach((answer) => {
      const category = answer.question.category;
      const score = answer.score; // -3..3

      switch (category) {
        case MbtiCategory.E_I:
          if (score >= 0) scores.E += score;
          else scores.I += -score;
          break;
        case MbtiCategory.S_N:
          if (score >= 0) scores.S += score;
          else scores.N += -score;
          break;
        case MbtiCategory.T_F:
          if (score >= 0) scores.T += score;
          else scores.F += -score;
          break;
        case MbtiCategory.J_P:
          if (score >= 0) scores.J += score;
          else scores.P += -score;
          break;
      }
    });

    // Tính phần trăm
    const percentages = this.calculatePercentages(scores);

    // Xác định MBTI type
    const mbtiType = this.determineMbtiType(percentages);

    return {
      mbtiType,
      scores,
      percentages,
    };
  }

  private static calculatePercentages(scores: MbtiScores): MbtiPercentages {
    const percentages: MbtiPercentages = {
      E: 0,
      I: 0,
      S: 0,
      N: 0,
      T: 0,
      F: 0,
      J: 0,
      P: 0,
    };

    // Tổng độ lớn từng cặp (đều không âm)
    const eTotal = scores.E + scores.I;
    const sTotal = scores.S + scores.N;
    const tTotal = scores.T + scores.F;
    const jTotal = scores.J + scores.P;

    percentages.E =
      eTotal > 0 ? Number(((scores.E / eTotal) * 100).toFixed(2)) : 50;
    percentages.I =
      eTotal > 0 ? Number(((scores.I / eTotal) * 100).toFixed(2)) : 50;

    percentages.S =
      sTotal > 0 ? Number(((scores.S / sTotal) * 100).toFixed(2)) : 50;
    percentages.N =
      sTotal > 0 ? Number(((scores.N / sTotal) * 100).toFixed(2)) : 50;

    percentages.T =
      tTotal > 0 ? Number(((scores.T / tTotal) * 100).toFixed(2)) : 50;
    percentages.F =
      tTotal > 0 ? Number(((scores.F / tTotal) * 100).toFixed(2)) : 50;

    percentages.J =
      jTotal > 0 ? Number(((scores.J / jTotal) * 100).toFixed(2)) : 50;
    percentages.P =
      jTotal > 0 ? Number(((scores.P / jTotal) * 100).toFixed(2)) : 50;

    return percentages;
  }

  private static determineMbtiType(percentages: MbtiPercentages): MbtiType {
    const first = percentages.E >= percentages.I ? 'E' : 'I';
    const second = percentages.S >= percentages.N ? 'S' : 'N';
    const third = percentages.T >= percentages.F ? 'T' : 'F';
    const fourth = percentages.J >= percentages.P ? 'J' : 'P';

    const mbtiString = `${first}${second}${third}${fourth}` as MbtiType;
    return mbtiString;
  }
}
