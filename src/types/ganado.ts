export interface Ganado {
  _id: string;
  nombre: string;
  raza: string;
  peso: number;
  edad: number;
  estado: string;
  fechaIngreso: string;
  numeroIdentificacion: string;
  sexo: "macho" | "hembra";
  categoria: "vaca" | "toro" | "ternero" | "vaquilla" | "novillo";
  estadoReproductivo?: "vacia" | "preñada" | "lactando" | "seca";
  fechaUltimoCelo?: string;
  fechaUltimaMonta?: string;
  fechaInseminacion?: string;
  toroPadre?: string;
  fechaEsperadaParto?: string;
  tiempoSeca?: number;
  diasLactancia?: number;
  numeroPartos?: number;
  ultimaProduccionLeche?: number;
  historialVacunas?: string[];
  proximaVacuna?: string;
  observaciones?: string;
  user: string;
  createdBy?: {
    _id: string;
    email: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGanadoData {
  nombre: string;
  raza: string;
  peso: number;
  edad: number;
  estado: string;
  fechaIngreso: string;
  numeroIdentificacion: string;
  sexo: "macho" | "hembra";
  categoria: "vaca" | "toro" | "ternero" | "vaquilla" | "novillo";
  estadoReproductivo?: "vacia" | "preñada" | "lactando" | "seca";
  fechaUltimoCelo?: string;
  fechaUltimaMonta?: string;
  fechaInseminacion?: string;
  toroPadre?: string;
  fechaEsperadaParto?: string;
  tiempoSeca?: number;
  diasLactancia?: number;
  numeroPartos?: number;
  ultimaProduccionLeche?: number;
  historialVacunas?: string[];
  proximaVacuna?: string;
  observaciones?: string;
}

export interface GanadoFormData {
  nombre: string;
  raza: string;
  peso: number;
  edad: number;
  estado: string;
  fechaIngreso: Date;
  numeroIdentificacion: string;
  sexo: "macho" | "hembra";
  categoria: "vaca" | "toro" | "ternero" | "vaquilla" | "novillo";
  estadoReproductivo?: "vacia" | "preñada" | "lactando" | "seca";
  fechaUltimoCelo?: Date | null;
  fechaUltimaMonta?: Date | null;
  fechaInseminacion?: Date | null;
  toroPadre?: string;
  fechaEsperadaParto?: Date | null;
  tiempoSeca?: number;
  diasLactancia?: number;
  numeroPartos?: number;
  ultimaProduccionLeche?: number;
  historialVacunas?: string[];
  proximaVacuna?: Date | null;
  observaciones?: string;
}

export interface UpdateGanadoData {
  nombre?: string;
  raza?: string;
  peso?: number;
  edad?: number;
  estado?: string;
  fechaIngreso?: string;
  numeroIdentificacion?: string;
  sexo?: "macho" | "hembra";
  categoria?: "vaca" | "toro" | "ternero" | "vaquilla" | "novillo";
  estadoReproductivo?: "vacia" | "preñada" | "lactando" | "seca";
  fechaUltimoCelo?: string;
  fechaUltimaMonta?: string;
  fechaInseminacion?: string;
  toroPadre?: string;
  fechaEsperadaParto?: string;
  tiempoSeca?: number;
  diasLactancia?: number;
  numeroPartos?: number;
  ultimaProduccionLeche?: number;
  historialVacunas?: string[];
  proximaVacuna?: string;
  observaciones?: string;
}

export interface GanadoResponse {
  data: Ganado[];
  total: number;
}

export interface GanadoFilters {
  search?: string;
  categoria?: string;
  estado?: string;
  estadoReproductivo?: string;
  sexo?: string;
  page?: number;
  limit?: number;
}

export interface GanadoFormData {
  nombre: string;
  raza: string;
  peso: number;
  edad: number;
  estado: string;
  fechaIngreso: string;
  numeroIdentificacion: string;
  sexo: "macho" | "hembra";
  categoria: "vaca" | "toro" | "ternero" | "vaquilla" | "novillo";
  estadoReproductivo?: "vacia" | "preñada" | "lactando" | "seca";
  fechaUltimoCelo?: string;
  fechaUltimaMonta?: string;
  fechaInseminacion?: string;
  toroPadre?: string;
  fechaEsperadaParto?: string;
  tiempoSeca?: number;
  diasLactancia?: number;
  numeroPartos?: number;
  ultimaProduccionLeche?: number;
  historialVacunas?: string[];
  proximaVacuna?: string;
  observaciones?: string;
}
