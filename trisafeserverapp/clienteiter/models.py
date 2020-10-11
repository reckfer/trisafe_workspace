from decouple import config
import requests
import json
from django.db import models

from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno
from comum.credencial import Credencial

class ClienteIter(models.Model, GerenciadorLog):
    
    def __init__(self, objeto_contexto):
        self.headers_iter = None
        self.retorno_autenticacao = None

        objeto_contexto.definir_contexto(self)
        self.__autenticarIter()

    def obter(self, m_cliente):

        url = "https://cnxs-api.itertelemetria.com/v1/users/{0}".format(m_cliente.id_cliente_iter)

        if(not self.headers_iter):
            return self.retorno_autenticacao

        r = requests.get(url, headers=self.headers_iter)

        # tenta obter por id_iter.
        retorno = self.__tratarRespostaHTTP(r)
        
        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario
        else:
            # tenta obter por cpf.
            retorno = self.obterPorDocumento(m_cliente)
        
        return retorno
    
    def obterPorDocumento(self, m_cliente):

        url = "https://cnxs-api.itertelemetria.com/v1/users/?by_document={0}".format(m_cliente.cpf)
                
        if(not self.headers_iter):
            return self.retorno_autenticacao

        r = requests.get(url, headers=self.headers_iter)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        if(retorno.estado.ok):
            usuario = retorno.dados['user']
            retorno.dados = usuario
        
        return retorno
        
    def incluir(self, m_cliente):

        url = "https://cnxs-api.itertelemetria.com/v1/users"

        d_cliente_iter = self.__montar_dic_cliente(m_cliente)
        
        if(not self.headers_iter):
            return self.retorno_autenticacao

        r = requests.post(url, headers=self.headers_iter, data=d_cliente_iter)
        
        retorno = self.__tratarRespostaHTTP(r)

        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario

        return retorno
    
    def alterar(self, m_cliente):

        url = "https://cnxs-api.itertelemetria.com/v1/users/%s" % (m_cliente.id_cliente_iter)
        
        if(not self.headers_iter):
            return self.retorno_autenticacao

        d_cliente_iter = self.__montar_dic_cliente(m_cliente)
        r = requests.put(url, headers=self.headers_iter, data=d_cliente_iter)
        
        retorno = self.__tratarRespostaHTTP(r)

        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario

        return retorno

    def __montar_dic_cliente(self, m_cliente):
        jsonCliente = json.dumps({
            "user": {
                "email": m_cliente.email,
                "username": m_cliente.nome_usuario,
                "name": m_cliente.nome,
                "document": m_cliente.cpf,
                "expire_date": "2050-01-01 00:00:00",
                "phone": m_cliente.telefone,
                "language": "pt-BR",
                "time_zone": "Brasilia",
                "company_id": 8,
                "password": "123456",
                "password_confirmation": "123456",
                "access_level": 0,
                "zipcode": m_cliente.cep,
                "street": m_cliente.rua,
                "number": m_cliente.numero,
                "complement_address": m_cliente.complemento,
                "district": m_cliente.bairro,
                "city": m_cliente.cidade,
                "state": m_cliente.uf,
                "active": True
            }
        })
        return jsonCliente
    
    def __tratarRespostaHTTP(self, respostaHTTP):
        
        if respostaHTTP.status_code < 200 or respostaHTTP.status_code > 300:
            retorno = Retorno(False, self, 'Erro de comunicação com a Iter. %s' % respostaHTTP.text, 'ErroComunicacaoIter', respostaHTTP.status_code)
        else:
            retorno = Retorno(True, self)
            dadosRetorno = respostaHTTP.json()
            
            if isinstance(dadosRetorno, list):
                if len(dadosRetorno) > 0:
                    dadosRetorno = dadosRetorno[0]
                else:
                    dadosRetorno = None

            if dadosRetorno:
                retorno.dados = dadosRetorno

                if 'token' in dadosRetorno:
                    self.credencial_iter.set_token_iter(dadosRetorno['token'])
                    retorno.credencial = self.credencial_iter
            else:
                # nao localizado
                retorno = Retorno(False, self, respostaHTTP.text, '', 404)

        self.registrar_retorno(retorno, 'Retorno da Iter.')
        return retorno

    def __autenticarIter(self):
        self.headers_iter = None
        chave_iter_cliente = None
        chave_iter_servidor = config('CHAVE_ITER')
        token_iter = ''

        if(self.credencial_iter):
            chave_iter_cliente = self.credencial_iter.chave_iter_cli
            token_iter = self.credencial_iter.token_iter
        
        # Atribui as chaves, parcial do servidor e parcial do cliente para descriptografar/criptografar o token.
        self.credencial_iter.chave_iter_cli = chave_iter_cliente
        self.credencial_iter.chave_iter_serv = chave_iter_servidor
        self.credencial_iter.token_iter = token_iter
        
        if token_iter and len(token_iter) > 0:

            retorno = Retorno(True, self)
            retorno.credencial = self.credencial_iter
        else:
            arquivo_iter = open('.env_cred_iter', 'rb')
            
            cred_iter_cripto = arquivo_iter.read()
            if(cred_iter_cripto):
                # atribui usuario e senha criptografados para descriptografar com get_token_iter()
                self.credencial_iter.token_iter = cred_iter_cripto
            
            headers = {'Authorization': 'Basic %s' % self.credencial_iter.get_token_iter()}
            r = requests.get("http://cnxs-api.itertelemetria.com/v1/sign_in", headers=headers)
            
            retorno = self.__tratarRespostaHTTP(r)

        self.retorno_autenticacao = retorno

        if self.retorno_autenticacao.estado.ok:
            # self.credencial = retorno.credencial
            token = self.credencial_iter.get_token_iter()
            
            self.headers_iter = {'Authorization': 'Bearer %s' %token,
                    'Content-Type' : 'application/json' }

    # def json(self):
    #     return self.__criar_json()

    # def __criar_json(self):
    #     ret = {
    #         "token_iter": self.token_iter,
    #         "chave_iter": self.chave_ter
    #         }
    #     return ret

    # def __str__(self):
    #     return self.nome