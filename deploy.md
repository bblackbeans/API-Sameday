# 🚀 Deploy da API SameDay no EasyPanel

## 📋 **PASSOS PARA DEPLOY:**

### **1. PREPARAR REPOSITÓRIO GITHUB**

```bash
# No diretório sameday-api-main
git init
git add .
git commit -m "Initial commit - API SameDay"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sameday-api.git
git push -u origin main
```

### **2. CONFIGURAR BANCO MYSQL NO EASYPANEL**

1. **No EasyPanel** (`89.116.27.28:3000`):
   - Clicar em **"+ Serviço"**
   - Escolher **"MySQL"**
   - Nome: `sameday-mysql`
   - Configurações:
     ```
     Database: sameday_db
     Username: sameday_user
     Password: sameday_password123
     ```
   - Clicar **"Deploy"**

### **3. CONFIGURAR API NO EASYPANEL**

1. **Criar novo serviço**:
   - Clicar em **"+ Serviço"**
   - Escolher **"Docker Compose"** ou **"Custom"**
   - Nome: `sameday-api`

2. **Configurar build**:
   ```
   Repository: https://github.com/bblackbeans/API-Sameday
   Branch: main
   Dockerfile: ./Dockerfile
   ```

3. **Variáveis de ambiente**:
   ```
   NODE_ENV=production
   PORT=3004
   DB_CONNECTION=mysql
   DB_HOST=sameday-mysql (nome do serviço MySQL)
   DB_PORT=3306
   DB_USER=sameday_user
   DB_PASSWORD=sameday_password123
   DB_DATABASE=sameday_db
   APP_KEY=sua_app_key_aqui
   JWT_SECRET=seu_jwt_secret_aqui
   ```

4. **Ports**:
   ```
   Host Port: 3004
   Container Port: 3004
   ```

### **4. EXECUTAR MIGRATIONS**

Após o deploy, executar migrations:

```bash
# No terminal do EasyPanel ou via SSH
cd /app
npm run migration
npm run seed
```

### **5. CONFIGURAR DOMAIN (Opcional)**

- Adicionar domain personalizado
- Configurar SSL automático
- Exemplo: `api.sameday.com.br`

---

## 🔧 **COMANDOS ÚTEIS:**

```bash
# Ver logs
docker logs sameday-api

# Entrar no container
docker exec -it sameday-api sh

# Executar migrations
docker exec -it sameday-api npm run migration

# Reiniciar serviço
docker restart sameday-api
```

---

## 📱 **ATUALIZAR APP PARA USAR API ONLINE:**

No arquivo `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: {
    development: 'http://SEU_IP_DO_EASYPANEL:3004',
    production: 'https://api.sameday.com.br',
  },
  // ...
}
```

---

## ✅ **TESTE FINAL:**

1. API funcionando: `http://SEU_IP:3004/health`
2. Login funcionando: `POST http://SEU_IP:3004/v2/drivers/login`
3. App conectando na API online

**🎉 PRONTO! API NO AR!**