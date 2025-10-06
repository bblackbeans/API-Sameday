# SameDay API - Documentação de Endpoints

## Informações Gerais

**Base URL**: `http://localhost:3004` (desenvolvimento)  
**Porta**: 3004  
**Autenticação**: JWT (apenas rotas administrativas)

---

## Endpoints Públicos (Sem Autenticação)

### 1. Health Check
```http
GET /health
```

**Resposta de Sucesso (200)**:
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T12:02:17.354Z",
  "uptime": 14.552373657,
  "environment": "development"
}
```

---

## Gestão de Parceiros - Endpoints Públicos

### 2. Cadastrar Embarcador
```http
POST /v2/partners/shippers
Content-Type: application/json
```

**Body**:
```json
{
  "companyName": "Empresa Teste Ltda",
  "cnpj": "12.345.678/0001-90",
  "contactName": "João Silva",
  "email": "joao@empresa.com",
  "phone": "11999999999",
  "address": "Rua Teste, 123 - São Paulo, SP",
  "businessType": "E-commerce",
  "monthlyVolume": "100-500 entregas",
  "description": "Descrição opcional da empresa"
}
```

**Campos Obrigatórios**:
- `companyName` (string)
- `cnpj` (string)
- `contactName` (string)
- `email` (string)
- `phone` (string)
- `address` (string)

**Resposta de Sucesso (201)**:
```json
{
  "message": "Embarcador cadastrado com sucesso!",
  "shipper": {
    "id": 1,
    "company_name": "Empresa Teste Ltda",
    "cnpj": "12.345.678/0001-90",
    "contact_name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "11999999999",
    "address": "Rua Teste, 123 - São Paulo, SP",
    "business_type": "E-commerce",
    "monthly_volume": "100-500 entregas",
    "description": "Descrição opcional da empresa",
    "status": "pending",
    "created_at": "2025-09-30 09:02:20",
    "updated_at": "2025-09-30 09:02:20"
  }
}
```

**Possíveis Erros**:
- `400`: Campo obrigatório ausente
- `409`: CNPJ já cadastrado
- `500`: Erro interno do servidor

---

### 3. Cadastrar Transportador
```http
POST /v2/partners/carriers
Content-Type: application/json
```

**Body**:
```json
{
  "companyName": "Transportadora XYZ",
  "cnpj": "98.765.432/0001-10",
  "contactName": "Maria Santos",
  "email": "maria@transportadora.com",
  "phone": "11888888888",
  "address": "Av. Logística, 456 - São Paulo, SP",
  "rntrc": "12345678",
  "fleetSize": "10-20 veículos",
  "vehicleTypes": "Van, Caminhão",
  "operationAreas": "São Paulo, Rio de Janeiro",
  "experience": "5-10 anos",
  "description": "Transportadora com experiência em entregas urbanas"
}
```

**Campos Obrigatórios**:
- `companyName` (string)
- `cnpj` (string)
- `contactName` (string)
- `email` (string)
- `phone` (string)
- `address` (string)
- `rntrc` (string)

**Resposta de Sucesso (201)**:
```json
{
  "message": "Transportador cadastrado com sucesso!",
  "carrier": {
    "id": 1,
    "company_name": "Transportadora XYZ",
    "cnpj": "98.765.432/0001-10",
    "contact_name": "Maria Santos",
    "email": "maria@transportadora.com",
    "phone": "11888888888",
    "address": "Av. Logística, 456 - São Paulo, SP",
    "rntrc": "12345678",
    "fleet_size": "10-20 veículos",
    "vehicle_types": "Van, Caminhão",
    "operation_areas": "São Paulo, Rio de Janeiro",
    "experience": "5-10 anos",
    "description": "Transportadora com experiência em entregas urbanas",
    "status": "pending",
    "created_at": "2025-09-30 09:02:24",
    "updated_at": "2025-09-30 09:02:24"
  }
}
```

---

### 4. Cadastrar Parceiro Stock Store
```http
POST /v2/partners/stock-store
Content-Type: application/json
```

**Body**:
```json
{
  "ownerName": "Pedro Oliveira",
  "email": "pedro@armazem.com",
  "phone": "11777777777",
  "cpfCnpj": "123.456.789-00",
  "propertyType": "Galpão",
  "address": "Rua Armazenagem, 789 - São Paulo, SP",
  "spaceSize": "500m²",
  "availability": "Imediata",
  "experience": "Armazenamento de produtos diversos",
  "description": "Galpão com infraestrutura completa"
}
```

**Campos Obrigatórios**:
- `ownerName` (string)
- `email` (string)
- `phone` (string)
- `cpfCnpj` (string)
- `propertyType` (string)
- `address` (string)

**Resposta de Sucesso (201)**:
```json
{
  "message": "Interesse enviado com sucesso!",
  "partner": {
    "id": 1,
    "owner_name": "Pedro Oliveira",
    "email": "pedro@armazem.com",
    "phone": "11777777777",
    "cpf_cnpj": "123.456.789-00",
    "property_type": "Galpão",
    "address": "Rua Armazenagem, 789 - São Paulo, SP",
    "space_size": "500m²",
    "availability": "Imediata",
    "experience": "Armazenamento de produtos diversos",
    "description": "Galpão com infraestrutura completa",
    "status": "pending",
    "created_at": "2025-09-30 09:02:27",
    "updated_at": "2025-09-30 09:02:27"
  }
}
```

---

### 5. Enviar Contato
```http
POST /v2/partners/contacts
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Ana Costa",
  "email": "ana@email.com",
  "phone": "11666666666",
  "subject": "Dúvida sobre parcerias",
  "message": "Gostaria de saber mais informações sobre como me tornar parceiro",
  "userType": "shipper"
}
```

**Campos Obrigatórios**:
- `name` (string)
- `email` (string)
- `subject` (string)
- `message` (string)

**Valores Válidos para `userType`**:
- `shipper` (Embarcador)
- `carrier` (Transportador)
- `partner` (Parceiro Stock Store)
- `other` (Outro)

**Resposta de Sucesso (201)**:
```json
{
  "message": "Mensagem enviada com sucesso!",
  "contact": {
    "id": 1,
    "name": "Ana Costa",
    "email": "ana@email.com",
    "phone": "11666666666",
    "subject": "Dúvida sobre parcerias",
    "message": "Gostaria de saber mais informações sobre como me tornar parceiro",
    "user_type": "shipper",
    "status": "new",
    "created_at": "2025-09-30 09:02:30",
    "updated_at": "2025-09-30 09:02:30"
  }
}
```

---

## Endpoints Administrativos (Requer Autenticação)

**Header obrigatório**:
```http
Authorization: Bearer {token}
```

### 6. Listar Embarcadores
```http
GET /portal/v2/partners/shippers?page=1&per_page=10&status=pending
```

**Query Parameters**:
- `page` (number, opcional) - Página atual (padrão: 1)
- `per_page` (number, opcional) - Itens por página (padrão: 10)
- `status` (string, opcional) - Filtrar por status: `pending`, `approved`, `rejected`

**Resposta de Sucesso (200)**:
```json
{
  "shippers": [...],
  "total": 50,
  "pages": 5,
  "current_page": 1
}
```

---

### 7. Obter Embarcador Específico
```http
GET /portal/v2/partners/shippers/:id
```

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "company_name": "Empresa Teste Ltda",
  "cnpj": "12.345.678/0001-90",
  ...
}
```

---

### 8. Atualizar Embarcador
```http
PUT /portal/v2/partners/shippers/:id
Content-Type: application/json
```

**Body** (todos os campos são opcionais):
```json
{
  "companyName": "Nova Razão Social",
  "contactName": "Novo Contato",
  "email": "novo@email.com",
  "phone": "11999999999",
  "address": "Novo Endereço",
  "businessType": "Novo Tipo",
  "monthlyVolume": "Novo Volume",
  "description": "Nova Descrição"
}
```

---

### 9. Atualizar Status do Embarcador
```http
PUT /portal/v2/partners/shippers/:id/status
Content-Type: application/json
```

**Body**:
```json
{
  "status": "approved"
}
```

**Valores Válidos**:
- `pending` - Pendente
- `approved` - Aprovado
- `rejected` - Rejeitado

**Resposta de Sucesso (200)**:
```json
{
  "message": "Status atualizado com sucesso!",
  "shipper": {...}
}
```

---

### 10. Deletar Embarcador
```http
DELETE /portal/v2/partners/shippers/:id
```

**Resposta de Sucesso (204)**: Sem conteúdo

---

### 11. Listar Transportadores
```http
GET /portal/v2/partners/carriers?page=1&per_page=10&status=pending
```

**Mesma estrutura de query parameters e resposta dos Embarcadores**

---

### 12. Operações com Transportadores
Similar aos Embarcadores, substituindo `/shippers` por `/carriers`:

- `GET /portal/v2/partners/carriers/:id` - Obter transportador
- `PUT /portal/v2/partners/carriers/:id` - Atualizar transportador
- `PUT /portal/v2/partners/carriers/:id/status` - Atualizar status
- `DELETE /portal/v2/partners/carriers/:id` - Deletar transportador

---

### 13. Listar Parceiros Stock Store
```http
GET /portal/v2/partners/stock-store?page=1&per_page=10&status=pending
```

**Mesma estrutura de query parameters e resposta**

---

### 14. Operações com Parceiros Stock Store
Similar aos Embarcadores, substituindo `/shippers` por `/stock-store`:

- `GET /portal/v2/partners/stock-store/:id` - Obter parceiro
- `PUT /portal/v2/partners/stock-store/:id` - Atualizar parceiro
- `PUT /portal/v2/partners/stock-store/:id/status` - Atualizar status
- `DELETE /portal/v2/partners/stock-store/:id` - Deletar parceiro

---

### 15. Listar Contatos
```http
GET /portal/v2/partners/contacts?page=1&per_page=10&status=new&user_type=shipper
```

**Query Parameters**:
- `page` (number, opcional)
- `per_page` (number, opcional)
- `status` (string, opcional) - `new`, `in_progress`, `resolved`
- `user_type` (string, opcional) - `shipper`, `carrier`, `partner`, `other`

---

### 16. Operações com Contatos

- `GET /portal/v2/partners/contacts/:id` - Obter contato
- `PUT /portal/v2/partners/contacts/:id` - Atualizar contato
- `PUT /portal/v2/partners/contacts/:id/status` - Atualizar status
- `DELETE /portal/v2/partners/contacts/:id` - Deletar contato

---

## Dashboard de Parceiros

### 17. Obter Estatísticas
```http
GET /portal/v2/partners/dashboard/stats
```

**Resposta de Sucesso (200)**:
```json
{
  "totals": {
    "shippers": 50,
    "carriers": 30,
    "partners": 20,
    "contacts": 100
  },
  "shippers": {
    "pending": 10,
    "approved": 35,
    "rejected": 5
  },
  "carriers": {
    "pending": 5,
    "approved": 20,
    "rejected": 5
  },
  "partners": {
    "pending": 8,
    "approved": 10,
    "rejected": 2
  },
  "contacts": {
    "new": 30,
    "in_progress": 40,
    "resolved": 30
  }
}
```

---

### 18. Obter Atividades Recentes
```http
GET /portal/v2/partners/dashboard/recent?limit=10
```

**Query Parameters**:
- `limit` (number, opcional) - Número de itens recentes (padrão: 10)

**Resposta de Sucesso (200)**:
```json
{
  "recent_shippers": [...],
  "recent_carriers": [...],
  "recent_partners": [...],
  "recent_contacts": [...]
}
```

---

### 19. Exportar Dados
```http
GET /portal/v2/partners/dashboard/export/:entityType
```

**Tipos Válidos** (`:entityType`):
- `shippers` - Exportar embarcadores
- `carriers` - Exportar transportadores
- `partners` - Exportar parceiros
- `contacts` - Exportar contatos

**Resposta de Sucesso (200)**:
Arquivo CSV para download

**Headers de Resposta**:
```
Content-Type: text/csv
Content-Disposition: attachment; filename=shippers_export.csv
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (deleção bem-sucedida) |
| 400 | Requisição inválida (campo obrigatório ausente) |
| 401 | Não autorizado (token inválido ou ausente) |
| 404 | Recurso não encontrado |
| 409 | Conflito (CNPJ já cadastrado) |
| 500 | Erro interno do servidor |

---

## Exemplos de Uso com cURL

### Cadastrar Embarcador (Público)
```bash
curl -X POST http://localhost:3004/v2/partners/shippers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Empresa Teste",
    "cnpj": "12.345.678/0001-90",
    "contactName": "João Silva",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "address": "Rua Teste, 123"
  }'
```

### Listar Embarcadores (Admin)
```bash
curl -X GET "http://localhost:3004/portal/v2/partners/shippers?page=1&per_page=10" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar Status (Admin)
```bash
curl -X PUT http://localhost:3004/portal/v2/partners/shippers/1/status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

---

## Notas Importantes

1. **Autenticação**: Endpoints sob `/portal/v2` requerem autenticação JWT
2. **CORS**: Habilitado para todas as origens em desenvolvimento
3. **Paginação**: Padrão de 10 itens por página
4. **Status**: Todos os cadastros iniciam com status `pending`
5. **Validação**: CNPJs devem ser únicos para embarcadores e transportadores

---

## Como Iniciar o Servidor

```bash
# Desenvolvimento
cd /home/kaue/Área\ de\ Trabalho/sameday-api-main
NODE_ENV=development node server.js

# Executar migrações
NODE_ENV=development node ace migration:run
```

O servidor estará disponível em: `http://localhost:3004`

---

## Suporte

Para dúvidas ou problemas, consulte:
- `UNIFICATION_SUMMARY.md` - Resumo da unificação
- `README.md` - Documentação geral
- `start/routes.js` - Definição de rotas
