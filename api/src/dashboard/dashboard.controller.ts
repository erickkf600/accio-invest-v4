import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardDataDto } from './dto/dashboard-data.dto';
import { ProximoPagamentoDto } from './dto/proximo-pagamento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obter dados consolidados do dashboard (BFF)' })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano para filtrar rendimentos (default: ano atual)' })
  async getDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('ano') ano?: string,
  ): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboard(user.sub, ano);
  }

  @Get('years')
  @ApiOperation({ summary: 'Listar anos disponíveis com base nos registros de compra' })
  async getAvailableYears(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ years: number[] }> {
    const years = await this.dashboardService.getAvailableYears(user.sub);
    return { years };
  }

  @Get('proximos-pagamentos')
  @ApiOperation({ summary: 'Obter próximos pagamentos do mês corrente' })
  async getProximosPagamentos(
    @CurrentUser() user: JwtPayload,
  ): Promise<ProximoPagamentoDto[]> {
    return this.dashboardService.getProximosPagamentos(user.sub);
  }
}
