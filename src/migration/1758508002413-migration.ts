import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1758508002413 implements MigrationInterface {
  name = 'Migration1758508002413';

  private meanings: Record<string, string> = {
    R: 'Realistic',
    I: 'Investigative',
    A: 'Artistic',
    S: 'Social',
    E: 'Enterprising',
    C: 'Conventional',
  };

  private descriptions: Record<string, string> = {
    R: 'Thực tế: Thích làm việc tay chân, kỹ thuật, vận hành máy móc.',
    I: 'Nghiên cứu: Thích tìm tòi, phân tích, làm việc với dữ liệu, khoa học.',
    A: 'Nghệ thuật: Thích sự sáng tạo, tự do, biểu đạt nghệ thuật.',
    S: 'Xã hội: Thích giúp đỡ, giao tiếp, hướng dẫn, phát triển con người.',
    E: 'Quản lý/Kinh doanh: Thích lãnh đạo, thuyết phục, kinh doanh, quản lý.',
    C: 'Truyền thống: Thích công việc tổ chức, hành chính, quy củ, dữ liệu.',
  };

  private codes = this.generateCombinations();

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const code of this.codes) {
      const fullName = code
        .split('')
        .map((c) => this.meanings[c])
        .join(' – ');
      const desc = code
        .split('')
        .map((c) => this.descriptions[c])
        .join(' | ');
      await queryRunner.query(`
        INSERT INTO "suitability_types" (id, name, full_name, description, image_url, created_at, updated_at)
        VALUES (uuid_generate_v4(), '${code}', '${fullName}', '${desc}', '/images/holland/${code}.png', now(), now());
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "suitability_types"
      WHERE name IN (${this.codes.map((c) => `'${c}'`).join(',')});
    `);
  }

  private generateCombinations(): string[] {
    const letters = ['R', 'I', 'A', 'S', 'E', 'C'];
    const result: string[] = [];
    for (let i = 0; i < letters.length; i++) {
      for (let j = i + 1; j < letters.length; j++) {
        for (let k = j + 1; k < letters.length; k++) {
          result.push(`${letters[i]}${letters[j]}${letters[k]}`);
        }
      }
    }
    return result;
  }
}
