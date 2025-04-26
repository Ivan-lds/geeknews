# 🎮 GeekNews

## 📝 Descrição

GeekNews é um blog de notícias sobre cultura geek, animes e personagens. Desenvolvido com React e Vite, o projeto oferece uma plataforma para leitura e publicação de notícias relacionadas ao universo geek.

## 🚀 Funcionalidades

- 📰 Visualização de notícias em destaque
- 🔍 Sistema de busca de conteúdo
- 👤 Cadastro e login de usuários
- ✏️ Criação e edição de posts (para administradores)
- 📱 Design responsivo para diferentes dispositivos
- 🎯 Categorias específicas (Animes, Personagens)
- 🔐 Área administrativa para gerenciamento de conteúdo

## 🔧 Como utilizar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. Clone este repositório
2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

### Executando o projeto

1. Inicie o servidor JSON para simular a API:

```bash
npm run dev
# ou
yarn dev
```

2. Em outro terminal, inicie a aplicação React:

```bash
npm run start
# ou
yarn start
```

3. Acesse o projeto em: http://localhost:3000

### Build para produção

```bash
npm run build
# ou
yarn build
```

## 💻 Tecnologias utilizadas

- React.js
- Vite
- React Router DOM
- Axios para requisições HTTP
- JSON Server (para simular API)
- React Icons
- React Slick (para carrosséis)

## 📚 Estrutura do projeto

- `/src/api` - Configurações de API
- `/src/axios` - Configurações do Axios
- `/src/components` - Componentes reutilizáveis
- `/src/routes` - Páginas da aplicação

## 🌐 Rotas disponíveis

- `/` - Página inicial com notícias em destaque
- `/login` - Página de login
- `/cadastro` - Página de cadastro
- `/search` - Resultados de busca
- `/new` - Criação de nova notícia
- `/animes` - Notícias sobre animes
- `/personagens` - Notícias sobre personagens
- `/admin` - Painel administrativo
- `/Notices/:id` - Visualização de notícia específica
- `/Notices/edit/:id` - Edição de notícia

## 📋 Scripts disponíveis

- `dev` - Inicia o JSON Server na porta 5000
- `build` - Gera a versão de produção
- `preview` - Visualiza a versão de produção
- `start` - Inicia a aplicação React
- `lint` - Executa o linter para verificar o código

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir um issue ou enviar um pull request.

---

Desenvolvido com React e Vite 🎓
