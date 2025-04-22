import { IsString, IsNumber, Min, Max, Matches } from 'class-validator';

export class CreateServerDto {
  @IsString()
  name: string;

  @Matches(/^1\.\d+\.\d+$/, { message: 'Version must look like 1.20.1' })
  version: string;

  @IsNumber()
  @Min(1024)
  @Max(65535)
  port: number;
}
