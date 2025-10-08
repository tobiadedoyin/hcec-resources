import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AddVerseDto {
  @IsNumber()
  number: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  stanza?: number;
}
