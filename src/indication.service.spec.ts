import { Test, TestingModule } from '@nestjs/testing';
import { IndicationService } from './indication.service';

describe('IndicationService', () => {
  let service: IndicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicationService],
    }).compile();

    service = module.get<IndicationService>(IndicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
