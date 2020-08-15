import cryptography
from cryptography.fernet import Fernet
from decouple import config
import base64
import encodings
import requests
import json
from django.db import models
from comum.retorno import Retorno
from comum.credencial import Credencial

class ClienteIter(models.Model):
    
    def __init__(self, credencial):
        self.credencial = credencial

    def tratarRespostaHTTP(self, respostaHTTP):
        
        if respostaHTTP.status_code < 200 or respostaHTTP.status_code > 300:
            retorno = Retorno(False, 'Erro de comunicação com a Iter. %s' % respostaHTTP.text, 'ErroComunicacaoIter', respostaHTTP.status_code)
        else:
            retorno = Retorno(True)
            dadosRetorno = respostaHTTP.json()
            
            if dadosRetorno:
                retorno.dados = dadosRetorno

                if isinstance(dadosRetorno, list):
                    if len(dadosRetorno) > 0:
                        retorno.dados = dadosRetorno[0]
                    else:
                        # nao localizado
                        retorno = Retorno(False, respostaHTTP.text, '', 404)

                if 'token' in dadosRetorno:
                    self.credencial.set_token_iter(dadosRetorno['token'])
                    
        if(self.credencial):
            retorno.credencial = self.credencial
            
        return retorno

    def obter(self, m_cliente):
        retorno = self.__autenticarIter__()
 
        if not retorno.estado.ok:
            return retorno
        
        credencial = retorno.credencial
        token = credencial.get_token_iter()
        
        headers = {'Authorization': 'Bearer %s' %token,
                'Content-Type' : 'application/json' }
        url = "https://cnxs-api.itertelemetria.com/v1/users/{0}".format(m_cliente.id_cliente_iter)
        
        r = requests.get(url, headers=headers)
       # m_cliente_iter = ClienteIter()
        # tenta obter por id_iter.
        retorno = self.tratarRespostaHTTP(r)
        
        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario
        else:
            # tenta obter por cpf.
            retorno = self.obterPorDocumento(m_cliente)
        
        return retorno
    
    def obterPorDocumento(self, m_cliente):
        retorno = self.__autenticarIter__()
        
        if not retorno.estado.ok:
            return retorno

        credencial = retorno.credencial    
        token = credencial.get_token_iter()

        headers = {'Authorization': 'Bearer %s' %token,
                'Content-Type' : 'application/json' }
        url = "https://cnxs-api.itertelemetria.com/v1/users/?by_document={0}".format(m_cliente.cpf)
        
        r = requests.get(url, headers=headers)
        
        retorno = self.tratarRespostaHTTP(r)
        
        if(retorno.estado.ok):
            usuario = retorno.dados['user']
            retorno.dados = usuario
        
        retorno.credencial = credencial

        return retorno
        
    
    def incluir(self, m_cliente):
        d_cliente_iter = self._montar_dic_cliente(m_cliente)

        retorno = self.__autenticarIter__()

        if not retorno.estado.ok:
            return retorno
        
        credencial = retorno.credencial
        token = credencial.get_token_iter()

        headers = {'Authorization': 'Bearer %s' %token,
                   'Content-Type' : 'application/json' }
        
        r = requests.post("https://cnxs-api.itertelemetria.com/v1/users", headers=headers, data=d_cliente_iter)
        
        retorno = self.tratarRespostaHTTP(r)

        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario

        retorno.credencial = credencial
        return retorno
    
    def alterar(self, cliente):
        # d_cliente_iter = self._montar_dic_cliente(cliente)

        retorno = self.__autenticarIter__()
    
        if not retorno.estado.ok:
            return retorno
        
        credencial = retorno.credencial
        token = credencial.get_token_iter()

        headers = {'Authorization': 'Bearer %s' %token,
                   'Content-Type' : 'application/json' }
        
        r = requests.put("https://cnxs-api.itertelemetria.com/v1/users/%s" % (cliente.id_cliente_iter), headers=headers, data=d_cliente_iter)
        
        retorno = self.tratarRespostaHTTP(r)

        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario

        retorno.credencial = credencial

        return retorno

    def _montar_dic_cliente(self, cliente):
        jsonCliente = json.dumps({
            "user": {
                "email": cliente.email,
                "username": cliente.nome_usuario,
                "name": cliente.nome,
                "document": cliente.cpf,
                "expire_date": "2050-01-01 00:00:00",
                "phone": cliente.telefone,
                "language": "pt-BR",
                "time_zone": "Brasilia",
                "company_id": 8,
                "password": "123456",
                "password_confirmation": "123456",
                "access_level": 0,
                "zipcode": cliente.cep,
                "street": cliente.rua,
                "number": cliente.numero,
                "complement_address": cliente.complemento,
                "district": cliente.bairro,
                "city": cliente.cidade,
                "state": cliente.uf,
                "active": True
            }
        })
        return jsonCliente

    def __autenticarIter__(self):
        chave_iter_cliente = self.credencial.chave_iter_cli
        chave_iter_servidor = config('CHAVE_ITER')
        token_iter = ''

        if(self.credencial):
            token_iter = self.credencial.token_iter
        
        self.credencial = Credencial(chave_iter_cliente, chave_iter_servidor)
        self.credencial.token_iter = token_iter

        if self.credencial.token_iter and len(self.credencial.token_iter) > 0:
            
            retorno = Retorno(True)
            retorno.credencial = self.credencial
        else:
            arquivo_iter = open('.env_cred_iter', 'rb')
            
            cred_iter_cripto = arquivo_iter.read()
            if(cred_iter_cripto):
                self.credencial.token_iter = cred_iter_cripto
            
            headers = {'Authorization': 'Basic %s' %self.credencial.get_token_iter()}
            r = requests.get("http://cnxs-api.itertelemetria.com/v1/sign_in", headers=headers)
            
            retorno = self.tratarRespostaHTTP(r)

            if not retorno.estado.ok:
                return retorno

        return retorno

    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        ret = {
            "token_iter": self.token_iter,
            "chave_iter": self.chave_ter
            }
        return ret

    def __str__(self):
        return self.nome