import { PanelProtegido } from '@/componentes/admin/panel-protegido';

/** Todas las páginas del panel (menos el login) pasan por la protección de sesión. */
export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-fondo">{<PanelProtegido>{children}</PanelProtegido>}</div>;
}
