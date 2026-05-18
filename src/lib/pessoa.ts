import { listarRostos } from "@/lib/face/registro";
import { lerPerfilLocal } from "@/lib/idoso/perfil";
import { getDataStore } from "@/lib/data";

/**
 * Nome da pessoa assistida a exibir/falar: prioriza o perfil do idoso definido
 * na configuração do dispositivo; depois o rosto cadastrado como "idoso" no
 * reconhecimento facial; por fim, o usuário da camada local.
 */
export function nomeDaPessoa(): string {
  const perfil = lerPerfilLocal();
  if (perfil?.nome?.trim()) return perfil.nome.trim();
  const idoso = listarRostos().find((r) => r.papel === "idoso");
  if (idoso?.nome?.trim()) return idoso.nome.trim();
  try {
    return getDataStore().getUsuario().nome;
  } catch {
    return "";
  }
}
