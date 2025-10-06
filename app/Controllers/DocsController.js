'use strict'

class DocsController {
  async index({ response }) {
    response.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SameDay API v2 - Documentação</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .endpoint { background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .method { display: inline-block; padding: 4px 12px; border-radius: 15px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; margin-right: 10px; }
        .get { background: #28a745; color: white; }
        .post { background: #007bff; color: white; }
        .put { background: #ffc107; color: black; }
        .delete { background: #dc3545; color: white; }
        .path { font-family: monospace; background: #e9ecef; padding: 5px 10px; border-radius: 5px; margin: 10px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .test-links { text-align: center; margin-top: 30px; }
        .test-links a { display: inline-block; background: #007bff; color: white; padding: 10px 20px; margin: 0 10px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚚 SameDay API v2</h1>
            <p>Documentação completa da API para sistema de entregas</p>
        </div>

        <div class="section">
            <h2>🔍 Health Check</h2>
            <div class="endpoint">
                <span class="method get">GET</span>
                <div class="path">/health</div>
                <p>Verificar status da API</p>
            </div>
        </div>

        <div class="section">
            <h2>🔐 Autenticação</h2>
            <div class="endpoint">
                <span class="method post">POST</span>
                <div class="path">/v2/auth/login</div>
                <p>Autenticação de usuário</p>
            </div>
        </div>

        <div class="section">
            <h2>👥 Usuários</h2>
            <div class="endpoint">
                <span class="method post">POST</span>
                <div class="path">/v2/user</div>
                <p>Criar novo usuário</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <div class="path">/app/v2/user/:id</div>
                <p>Obter dados do usuário (requer auth)</p>
            </div>
        </div>

        <div class="section">
            <h2>📦 Pedidos</h2>
            <div class="endpoint">
                <span class="method get">GET</span>
                <div class="path">/app/v2/orders</div>
                <p>Listar pedidos (requer auth)</p>
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>
                <div class="path">/app/v2/orders</div>
                <p>Criar novo pedido (requer auth)</p>
            </div>
        </div>

        <div class="test-links">
            <a href="http://localhost:3004/health" target="_blank">🧪 Testar Health Check</a>
            <a href="http://localhost:3004/" target="_blank">🏠 Página Inicial</a>
            <a href="http://localhost:8080" target="_blank">🗄️ phpMyAdmin</a>
        </div>
    </div>
</body>
</html>
    `)
  }
}

module.exports = DocsController 