'use strict'

const base_error = {
  token: '401',
  user: '001',
  order: '002',
  upload: '003',
  shared: '004',
  driver: '005',
  password: '006',
  parameters: '998',
  error: '999',
}

const error_code = {
  token: {
    '00001': 'Token de acesso inválido!',
    '00002': '<Authorization> não informado no Header!',
    '00003': 'Token não informado ou em formato inválido!',
    '00004': 'Seu acesso expirou!',
  },
  user: {
    '00001': 'Usuário não encontrado.',
    '00002': 'Usuário não cadastrado em nossa base.',
    '00003': 'Por favor, preencha todos os campos.',
    '00004': 'Senha de usuário inválida.',
    '00005': 'Já existe um usuário cadastrado com esse e-mail.',
    '00006': 'Já existe um usuário cadastrado com esse CPF.',
    '00007': 'Já existe um usuário cadastrado com esse CNPJ.',
    '00008': 'Usuário sem permissão para utilizar o App, exclusivo para motoristas.',
    '00009': 'Usuário sem permissão para utilizar o App, documentação pendente.',
    '00010': 'Usuário temporariamente bloqueado para acesso nas plataformas SameDay, verique com o nosso suporte.',
    '00011': 'Não é possível desativar o usuário Administrador.',
    '00012': 'Já existe um usuário cadastrado com esse telefone.',
    '00013': 'Por favor, selecione um tipo "pessoa fisíca ou jurídica".',
    '00014': 'Você não possui histórico, cadastre um pedido e tente novamente!',
  },
  order: {
    '00001': 'Pedido não encontrado.',
    '00002': 'Não foi possível criar o pedido.',
    '00003': 'Não foi possível alterar o pedido.',
    '00004': 'Não foi possível excluir o pedido.',
    '00005': 'Pedido em execução não pode ser editado.',
    '00006': 'Pedido cancelado não pode ser editado.',
    '00007': 'Pedido finalizado não pode ser editado.',
    '00008': 'Pedido em execução não pode ser excluído.',
    '00009': 'Pedido cancelado não pode ser excluído.',
    '00010': 'Pedido finalizado não pode ser excluído.',
    '00011': 'Código (ID) do Pedido não informado.',
    '00012': 'Já existe uma fatura para o pedido.',
    '00013': 'Por favor, envie o parâmetro type valido - (collect - destination)!',
    '00014': 'Código vazio ou inválido. Informe o código e tente novamente!',
  },
  upload: {
    '00001': 'Nenhum arquivo encontrado.',
    '00002': 'Erro ao localizar arquivo, verifique sua conexão com a Internet e tente novamente.',
    '00003': 'Faça upload de uma imagem.'
  },
  driver: {
    '00001': 'Usuário não é um motorista. Verique com o nosso suporte!',
    '00002': 'O prazo para aceitar o pedido expirou, aguarde a próxima entrega',
    '00003': '(ID) do motorista não informado.',
  },
  password: {
    '00001': 'Telefone de usuário não informado!',
    '00002': 'Telefone não encontrado em nenhum cadastro em nossa base!',
    '00003': 'Não foi possível continuar com a recuperação de senha. Usuário temporariamente bloqueado para acesso nas plataformas SameDay, verique com o nosso suporte.',
    '00004': 'Código não informado!',
    '00005': 'Houve um erro. Acesse a opção esqueceu sua senha e tente novamente!',
    '00006': 'Código de segurança expirou. Acesse a opção esqueceu sua senha e tente novamente!',
    '00007': 'Este código não funcionou. Verifique o código e tente novamente!',
    '00008': 'Senha não atende os requisitos de segurança. Exemplo de senha Válida: SameDay@1',
  },
  shared: {
    '00001': 'CEP não encontrado!',
    '00002': 'Não foi possível obter as coordenadas.'
  },
  error: {
    '00001': 'Erro inesperado!',
    '00002': 'Erro interno!',
    '00003': 'Muitas requisições em poucos segundos!',
    '00004': 'Falha na autenticação da API.',
    '00005': 'Usuário logado, sem permissão de administrador!',
    '00006': 'Por favor, verifique a conexão com a internet e tente novamente.',
  },
  parameters: {
    '00001': 'Nenhum parâmetro informado',
    '00002': 'Um ou mais parâmetros incompatíveis.',
    '00003': 'Alguns erros foram encontrados',
    '00004': 'É necessário informar o motivo da falha.',
  },
  userBank: {
    '00001': 'Nenhum registro encontrado'
  }
}

class ErrorController {
  /**
   * Returns the error according to the input data
   *
   * @param {*} _base Base of Errors
   * @param {*} _code Error Code
   * @param {*} [_additional=null] Additional error data (STACK)
   * @param {*} [_additionalFriendly=null] Friendly error message
   * @returns
   * @memberof ErrorController
   */

  error(_base, _code, _additional = null, _additionalFriendly = null) {
    let retorno = null

    try {
      retorno = {
        status: 'error',
        code: base_error[_base] + '.' + _code,
        base_error: _base,
        error_code: _code,
        additional: !_additional ? '' : _additional,
        additionalFriendly: !_additionalFriendly ? '' : _additionalFriendly,
        message: error_code[_base][_code],
      }
    } catch (err) {
      retorno = {
        status: 'error',
        code: '999.99999',
        base_error: '999',
        error_code: '99999',
        additional: err,
        additionalFriendly: 'Por favor, informar ao suporte.',
        message: 'Erro desconhecido!',
        now: new Date().valueOf(),
      }
    }

    return retorno
  }

  returnMsg(_base, _code) {
    return error_code[_base][_code]
  }
}

module.exports = ErrorController
