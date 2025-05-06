import { Test, TestingModule } from '@nestjs/testing';
import { IndicationController } from './indication.controller';

describe('IndicationController', () => {
  let controller: IndicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndicationController],
    }).compile();

    controller = module.get<IndicationController>(IndicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
