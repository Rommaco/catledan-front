export interface DashboardResumen {
  totalGanado: number;
  totalReportes: number;
  totalIngresos: number;
  totalGastos: number;
}

export interface FinanzaMensual {
  _id: number; // mes
  ingresos: number;
  gastos: number;
}

export interface GanadoPorEstado {
  _id: string; // estado
  cantidad: number;
}

export interface ProduccionLeche {
  _id: number; // mes
  totalLitros: number;
}

export interface CultivoDashboard {
  _id: string; // tipo de cultivo
  cantidad: number;
  area: number;
}

export interface DashboardStats {
  ganado: {
    total: number;
    activos: number;
    inactivos: number;
  };
  finanzas: {
    ingresos: number;
    gastos: number;
    balance: number;
  };
  produccion: {
    litros: number;
    animalesLactando: number;
  };
  cultivos: {
    total: number;
    areas: number;
  };
}
