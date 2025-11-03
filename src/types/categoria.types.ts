export interface Categoria {
  id_categoria: number;
  nombre: string;
  tipo: string;
  total_registros: number;
}

export interface Categorias {
  ingreso: Categoria[];
  gasto: Categoria[];
}