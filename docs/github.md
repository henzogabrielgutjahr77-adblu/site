# Integração Git — Gitea (principal) + GitHub (espelho privado)

Documento de referência do fluxo de versionamento do site ADBlu Missões.

## Estrutura dos remotes

O projeto tem **dois remotes**. O `origin` aponta para o Gitea (repositório
principal, na rede local) e o `github` aponta para o repositório privado no
GitHub (backup e versionamento externo).

| Remote | URL | Uso |
|---|---|---|
| `origin` | `http://192.168.100.56:3011/gabriel/adblu-missoes.git` | Repositório principal do servidor (CMS e produção) |
| `github` | `git@github.com:henzogabrielgutjahr77-adblu/site.git` | Espelho privado (backup externo) |

### Autenticação

- **Gitea:** a URL do remote carrega as credenciais embutidas (em `.git/config`).
  A senha de administração fica em `/opt/docker/gitea/admin-creds.txt` no servidor.
- **GitHub:** usa deploy key SSH (`~/.ssh/id_ed25519_github`, configurada em
  `~/.ssh/config` para `github.com`), com permissão de escrita no repositório.

Para visualizar os remotes:

```sh
git remote -v
```

## Como enviar alterações para o Gitea

Fluxo padrão de edição (inclusive o usado pelo script de commit automático):

```sh
cd /media/dados/docker/adblu-missoes
git add -A
git commit -m "Descrição da alteração"
git push origin main
```

## Como enviar alterações para o GitHub

```sh
cd /media/dados/docker/adblu-missoes
git push github main
```

Para espelhar todas as branches e tags de uma vez:

```sh
git push github --all
git push github --tags
```

> A branch `main` tem upstream apenas para `origin` (Gitea). O push para o
> GitHub é sempre explícito, então a sincronização automática nunca passa
> pelo GitHub.

## Sincronização automática (cron)

O servidor sincroniza as edições feitas pelo CMS (commitadas no Gitea) para a
pasta do site a cada minuto (crontab do root):

```
* * * * * cd /media/dados/docker/adblu-missoes && /usr/bin/git pull --ff-only -q >/dev/null 2>&1
```

Como a sincronização usa o `origin` (Gitea), o GitHub não interfere no
funcionamento do site.

## Comandos úteis

```sh
# Status e histórico
git status
git log --oneline -10

# Buscar alterações
git pull --ff-only origin main
git fetch github

# Comparar remotes
git rev-list --count origin/main   # commits no Gitea
git rev-list --count github/main   # commits no GitHub

# Adicionar/remover remotes
git remote add origin  http://192.168.100.56:3011/gabriel/adblu-missoes.git
git remote add github  git@github.com:henzogabrielgutjahr77-adblu/site.git
git remote remove <nome>

# Integridade do repositório
git fsck
```

## Procedimento para restaurar o projeto

Reconstruir o projeto a partir de um dos repositórios em uma máquina nova:

1. Clonar a partir do **Gitea** (rápido, rede local) ou do **GitHub**
   (recurso externo):

   ```sh
   # Gitea
   git clone http://192.168.100.56:3011/gabriel/adblu-missoes.git adblu-missoes
   # ou GitHub (com deploy key SSH)
   git clone git@github.com:henzogabrielgutjahr77-adblu/site.git adblu-missoes
   ```

2. Instalar dependências e iniciar o site:

   ```sh
   cd adblu-missoes
   npm install
   npm run dev        # desenvolvimento
   # ou produção:
   # NODE_ENV=production npm run build && npm run start
   ```

3. Recriar o `public/admin/config.yml` (arquivo **ignorado pelo git** — não
   vem do repositório) apontando para o Gitea, para o Decap CMS funcionar.

4. Restaurar a configuração dos remotes, se necessário:

   ```sh
   git remote add origin http://192.168.100.56:3011/gabriel/adblu-missoes.git
   git remote add github git@github.com:henzogabrielgutjahr77-adblu/site.git
   ```

> O `public/admin/config.yml` contém configuração local (URL do Gitea) e por
> isso fica fora do versionamento. Mantenha uma cópia de segurança separada
> para restaurar o CMS.

## Observações de segurança

- O arquivo `public/admin/config.yml` e credenciais do Gitea **não** são
  versionados.
- A senha do Gitea fica apenas no `.git/config` local e em
  `/opt/docker/gitea/admin-creds.txt` — não a inclua em commits.
- A chave privada SSH do GitHub (`~/.ssh/id_ed25519_github`) é local do
  servidor e não deve ser copiada para outro lugar.
