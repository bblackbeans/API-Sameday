# 🚀 DEPLOY EASYPANEL - CONFIGURAÇÃO COMPLETA

## 📧 **CONFIGURAÇÃO SMTP NO EASYPANEL**

### **1. 🥇 Gmail (Recomendado - GRATUITO)**

**Passo a passo:**
1. **Ativar autenticação de 2 fatores** no Gmail
2. **Gerar senha de app**: https://myaccount.google.com/apppasswords
3. **Configurar no Easypanel**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=SameDay <noreply@sameday.com>
CONTACT_EMAIL=kaue.ronald@blackbeans.com.br
APP_URL=https://sua-api.easypanel.host
```

### **2. 🥈 SendGrid (GRATUITO - 100 emails/dia)**

**Passo a passo:**
1. **Criar conta**: https://sendgrid.com
2. **Gerar API Key** no painel
3. **Configurar no Easypanel**:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.sua-api-key-aqui
SMTP_FROM=SameDay <noreply@sameday.com>
CONTACT_EMAIL=kaue.ronald@blackbeans.com.br
APP_URL=https://sua-api.easypanel.host
```

### **3. 🥉 Resend (GRATUITO - 3.000 emails/mês)**

**Passo a passo:**
1. **Criar conta**: https://resend.com
2. **Gerar API Key**
3. **Configurar no Easypanel**:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_sua-api-key-aqui
SMTP_FROM=SameDay <noreply@sameday.com>
CONTACT_EMAIL=kaue.ronald@blackbeans.com.br
APP_URL=https://sua-api.easypanel.host
```

---

## ⚙️ **VARIÁVEIS DE AMBIENTE COMPLETAS**

### **No Easypanel, adicione TODAS estas variáveis:**

```env
# Application
NODE_ENV=production
PORT=3004
APP_NAME=SameDay API v2
APP_KEY=sua-app-key-aqui
APP_URL=https://sua-api.easypanel.host

# Database
DB_CONNECTION=mysql
DB_HOST=seu-mysql-host
DB_PORT=3306
DB_USER=seu-db-user
DB_PASSWORD=sua-db-password
DB_DATABASE=sua-db-name

# Redis (se usar)
REDIS_CONNECTION=redis
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=sua-redis-password
REDIS_DB=0

# JWT
JWT_SECRET=sua-jwt-secret-aqui

# Email Configuration (ESCOLHA UMA OPÇÃO ACIMA)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=SameDay <noreply@sameday.com>
CONTACT_EMAIL=kaue.ronald@blackbeans.com.br

# Google Maps (se usar)
GOOGLE_API_KEY=sua-google-api-key
GOOGLE_API_URL=https://maps.googleapis.com/maps/api

# Cloudinary (se usar)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret

# OneSignal (se usar)
ONESIGNAL_APP_ID=sua-onesignal-app-id
ONESIGNAL_REST_API_KEY=sua-onesignal-rest-api-key

# Twilio (se usar)
TWILIO_ACCOUNT_SID=sua-twilio-account-sid
TWILIO_AUTH_TOKEN=sua-twilio-auth-token
TWILIO_PHONE_NUMBER=sua-twilio-phone-number

# Iugu (se usar)
IUGU_URL=https://api.iugu.com/v1
IUGU_AUTH_TOKEN=sua-iugu-token
```

---

## 🔧 **CONFIGURAÇÃO NO EASYPANEL**

### **Passo a Passo:**

1. **Acesse seu projeto** no Easypanel
2. **Vá em "Environment Variables"** ou "Variáveis de Ambiente"
3. **Clique em "Add Variable"** ou "Adicionar Variável"
4. **Adicione cada variável** uma por uma:
   - **Name**: `SMTP_HOST`
   - **Value**: `smtp.gmail.com`
   - **Save**
5. **Repita para todas as variáveis**
6. **Salve todas as configurações**
7. **Reinicie o serviço**

### **⚠️ IMPORTANTE:**
- **SMTP_PASS**: Use a senha de app do Gmail (não a senha normal)
- **CONTACT_EMAIL**: Seu email para receber os formulários
- **APP_URL**: URL da sua API no Easypanel

---

## 🧪 **TESTANDO APÓS DEPLOY**

### **1. Testar Endpoint:**
```bash
curl https://sua-api.easypanel.host/api/send-email/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Endpoint funcionando!",
  "timestamp": "2024-10-22T15:47:00.000Z",
  "availableFormTypes": ["contact", "embarcador", "transportador", "stock-store", "entregador"]
}
```

### **2. Testar Envio de Email:**
```bash
curl -X POST https://sua-api.easypanel.host/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "contact",
    "formData": {
      "name": "João Silva",
      "email": "joao@teste.com",
      "phone": "11999999999",
      "subject": "Teste de Email",
      "message": "Testando o serviço de email"
    },
    "timestamp": "2024-10-22T15:47:00.000Z"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Email enviado com sucesso!",
  "messageId": "<message-id>"
}
```

---

## 📧 **INTEGRAÇÃO COM SEU SITE**

### **No seu site, atualize o serviço de email:**

```javascript
// frontend/src/services/emailService.js
const sendEmailViaAPI = async (formData, formType) => {
  try {
    const response = await fetch('https://sua-api.easypanel.host/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formType: formType,
        formData: formData,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: 'Email enviado com sucesso!' };
    } else {
      throw new Error(result.message || 'Erro ao enviar email');
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, message: 'Erro ao enviar email' };
  }
};

// Usar nos formulários
const handleSubmit = async (formData) => {
  const result = await sendEmailViaAPI(formData, 'contact');
  
  if (result.success) {
    alert('Mensagem enviada com sucesso!');
  } else {
    alert('Erro ao enviar mensagem. Tente novamente.');
  }
};
```

---

## 📋 **FORMATOS DE DADOS SUPORTADOS**

### **1. Contato (`contact`)**
```json
{
  "formType": "contact",
  "formData": {
    "name": "Nome completo",
    "email": "email@exemplo.com",
    "phone": "11999999999",
    "subject": "Assunto",
    "message": "Mensagem",
    "userType": "Tipo de usuário"
  }
}
```

### **2. Embarcador (`embarcador`)**
```json
{
  "formType": "embarcador",
  "formData": {
    "companyName": "Nome da empresa",
    "cnpj": "00.000.000/0000-00",
    "contactName": "Nome do contato",
    "email": "email@exemplo.com",
    "phone": "11999999999",
    "monthlyVolume": "Volume mensal",
    "address": "Endereço",
    "businessType": "Tipo de negócio",
    "description": "Descrição",
    "agreeTerms": true
  }
}
```

### **3. Transportador (`transportador`)**
```json
{
  "formType": "transportador",
  "formData": {
    "companyName": "Nome da empresa",
    "cnpj": "00.000.000/0000-00",
    "contactName": "Nome do contato",
    "email": "email@exemplo.com",
    "phone": "11999999999",
    "address": "Endereço",
    "fleetSize": "Tamanho da frota",
    "vehicleTypes": "Tipos de veículos",
    "operationAreas": "Áreas de operação",
    "rntrc": "RNTRC",
    "experience": "Experiência",
    "description": "Descrição"
  }
}
```

### **4. Stock Store (`stock-store`)**
```json
{
  "formType": "stock-store",
  "formData": {
    "ownerName": "Nome do proprietário",
    "email": "email@exemplo.com",
    "phone": "11999999999",
    "cpfCnpj": "CPF/CNPJ",
    "propertyType": "Tipo de propriedade",
    "address": "Endereço",
    "spaceSize": "Tamanho do espaço",
    "availability": "Disponibilidade",
    "experience": "Experiência",
    "description": "Descrição"
  }
}
```

### **5. Entregador (`entregador`)**
```json
{
  "formType": "entregador",
  "formData": {
    "fullName": "Nome completo",
    "cpf": "000.000.000-00",
    "email": "email@exemplo.com",
    "phone": "11999999999",
    "vehicleType": "Tipo de veículo",
    "cnh": "CNH",
    "experience": "Experiência"
  }
}
```

---

## 🎯 **RESUMO DO QUE FAZER**

### **✅ No Easypanel:**
1. **Adicionar variáveis de ambiente** (especialmente SMTP)
2. **Configurar SMTP** (Gmail recomendado)
3. **Definir CONTACT_EMAIL** como seu email
4. **Reiniciar serviço**

### **✅ No seu site:**
1. **Atualizar URL da API** para o Easypanel
2. **Testar envio de formulários**
3. **Verificar se emails chegam**

### **✅ Testar:**
1. **Endpoint de teste**: `GET /api/send-email/test`
2. **Envio real**: `POST /api/send-email`
3. **Verificar caixa de entrada**

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns:**

1. **"SMTP connection failed"**
   - ✅ Verificar credenciais SMTP
   - ✅ Usar senha de app (não senha normal)
   - ✅ Verificar se 2FA está ativado

2. **"Email transporter not initialized"**
   - ✅ Verificar se variáveis estão no Easypanel
   - ✅ Reiniciar serviço após configurar

3. **"Authentication failed"**
   - ✅ Verificar usuário e senha
   - ✅ Testar credenciais em outro lugar

### **Verificar Logs:**
- No Easypanel, vá em "Logs" para ver erros
- Procure por mensagens de email

---

**🎉 Com isso, seus formulários do site enviarão emails reais para sua caixa de entrada!**
