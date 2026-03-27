# InspectAI

## Descrição

O InspectAI é um sistema para detecção automática de defeitos em placas
eletrônicas a partir de imagens e vídeos. A aplicação permite
identificar, classificar e armazenar defeitos, além de fornecer
mecanismos de análise e geração de relatórios para apoio ao controle de
qualidade.

------------------------------------------------------------------------

## Tecnologias Utilizadas

-   Front-end e Back-end: Next.js (JavaScript)
-   Estilização: Tailwind CSS
-   Banco de Dados: MySQL
-   Containerização: Docker

------------------------------------------------------------------------

## Funcionalidades

### 1. Detecção em Imagens

O sistema permite a análise de uma ou múltiplas imagens contendo
componentes eletrônicos.

**Entrada:** 
- Uma ou mais imagens

**Saída:** 
- Identificação dos defeitos presentes 
- Recorte automático das regiões com defeito (com zoom) 
- Classificação do tipo de defeito 
- Navegação entre defeitos detectados

------------------------------------------------------------------------

### 2. Detecção em Vídeos

O sistema realiza a detecção de defeitos a partir de vídeos.

**Funcionalidades:** 
- Processamento contínuo de vídeo com detecção de
defeitos 
- Registro automático de data e hora de cada detecção 
- Processamento em lote:
    - Definição da quantidade de placas a serem analisadas
    - Geração de relatório consolidado ao final do processamento

------------------------------------------------------------------------

### 3. Banco de Dados de Defeitos

O sistema mantém um repositório estruturado de defeitos.

**Requisitos:** 
- Armazenamento de tipos de defeitos por tipo de componente 
- Associação dos defeitos às placas analisadas 
- Geração de métricas: 
  - Quantidade de ocorrências 
  - Percentual em relação ao total de defeitos

------------------------------------------------------------------------

### 4. Controle de Usuários

#### Administrador

-   Gerenciamento de usuários e permissões
-   Definição de acessos (visualização, edição e validação)
-   Marcação de detecções como falso positivo

#### Funcionário

-   Visualização dos defeitos detectados
-   Interação com o sistema conforme permissões atribuídas

------------------------------------------------------------------------

### 5. Geração de Relatórios

O sistema permite a criação de relatórios detalhados contendo:

-   Informações dos defeitos detectados
-   Origem da detecção (imagem, vídeo ou lote)
-   Data e hora das ocorrências
-   Quantidade e classificação dos defeitos
