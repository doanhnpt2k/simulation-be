import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { QuestionType } from '@/utils/enum/mbti-category.enum';

@ValidatorConstraint({ name: 'isQuestionTypeValid', async: false })
export class IsQuestionTypeValidConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const questionType = object.type as QuestionType;

    // Nếu type là MBTI, thì mbtiType phải có giá trị và suitabilityType phải undefined
    if (questionType === QuestionType.MBTI) {
      return (
        object.mbtiType !== undefined && object.suitabilityType === undefined
      );
    }

    // Nếu type là SUITABILITY, thì suitabilityType phải có giá trị và mbtiType phải undefined
    if (questionType === QuestionType.SUITABILITY) {
      return (
        object.suitabilityType !== undefined && object.mbtiType === undefined
      );
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const questionType = object.type as QuestionType;

    if (questionType === QuestionType.MBTI) {
      return 'When type is MBTI, mbtiType is required and suitabilityType must be undefined';
    }

    if (questionType === QuestionType.SUITABILITY) {
      return 'When type is SUITABILITY, suitabilityType is required and mbtiType must be undefined';
    }

    return 'Invalid question type configuration';
  }
}

export function IsQuestionTypeValid(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsQuestionTypeValidConstraint,
    });
  };
}
