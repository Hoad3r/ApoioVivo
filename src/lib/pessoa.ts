import { listarRostos } from "@/lib/face/registro";
import { getDataStore } from "@/lib/data";

/**
 * Nome da pessoa assistida a exibir/falar: prioriza o rosto cadastrado como
 * "idoso" (o que o usuário registrou no reconhecimento facial); se não houver,
 * cai para o usuário da camada local.
 */
export function nomeDaPessoa(): string {
  const idoso = listarRostos().find((r) => r.papel === "idoso");
  if (idoso?.nome?.trim()) return idoso.nome.trim();
  try {
    return getDataStore().getUsuario().nome;
  } catch {
    return "";
  }
}
