import cryptography
from cryptography.fernet import Fernet
from decouple import config
import base64
import encodings
import requests
import json
from comum.retorno import Retorno

class ClienteIter():
    
    @classmethod
    def tratarRespostaHTTP(cls, respostaHTTP):
        
        if respostaHTTP.status_code < 200 or respostaHTTP.status_code > 300:
            retorno = Retorno(False, respostaHTTP.text, '', respostaHTTP.status_code)
        else:
            retorno = Retorno(True)
            dadosRetorno = respostaHTTP.json()
            
            if isinstance(dadosRetorno, list):
                if len(dadosRetorno) > 0:
                    retorno.dados = dadosRetorno[0]
                else:
                    # nao localizado
                    retorno = Retorno(False, respostaHTTP.text, '', 404)
            elif 'user' in dadosRetorno:
                retorno.dados = dadosRetorno['user']

        return retorno

    def obter(self, m_cliente):
        token = ClienteIter.autenticarIter(self, m_cliente.chave_iter)
        headers = {'Authorization': 'Bearer %s' %token,
                'Content-Type' : 'application/json' }
        url = "https://cnxs-api.itertelemetria.com/v1/users/{0}".format(m_cliente.id_cliente_iter)
        
        r = requests.get(url, headers=headers)
        m_cliente_iter = ClienteIter()
        # tenta obter por id_iter.
        retorno = m_cliente_iter.tratarRespostaHTTP(r)
        
        if not retorno.estado.ok:
            # tenta obter por cpf.
            retorno = m_cliente_iter.obterPorDocumento(m_cliente)
        
        return retorno
    
    def obterPorDocumento(self, m_cliente):
        token = ClienteIter.autenticarIter(self, m_cliente.chave_iter)
        headers = {'Authorization': 'Bearer %s' %token,
                'Content-Type' : 'application/json' }
        url = "https://cnxs-api.itertelemetria.com/v1/users/?by_document={0}".format(m_cliente.cpf)
        
        r = requests.get(url, headers=headers)
        return ClienteIter.tratarRespostaHTTP(r)
        
    def autenticarIter(self, chave_iter_cliente):
        print('chave_iter_cliente = ' + chave_iter_cliente)
        
        chave_iter_servidor = config('CHAVE_ITER')
        print('chave_iter_servidor =' + chave_iter_servidor)
        
        arquivo_iter = open('.env_cred_iter', 'rb')
        cred_iter_cripto = arquivo_iter.read()
        
        chave_iter = chave_iter_cliente + chave_iter_servidor
        print('chave_iter = ' + chave_iter)

        chaveb64 = base64.b64encode(chave_iter.encode())
        f = Fernet(chaveb64)

        credenciais_iter = f.decrypt(cred_iter_cripto)
        headers = {'Authorization': 'Basic %s' %credenciais_iter.decode()}
        r = requests.get("http://cnxs-api.itertelemetria.com/v1/sign_in", headers=headers)
        
        #TODO:Fazer tratamentos de erro.
        respostaJson = r.json()
        return respostaJson["token"]

    def incluir(self, m_cliente):
        d_cliente_iter = self._montar_dic_cliente(m_cliente)

        token = ClienteIter.autenticarIter(self, m_cliente.chave_iter)
        headers = {'Authorization': 'Bearer %s' %token,
                   'Content-Type' : 'application/json' }
        
        r = requests.post("https://cnxs-api.itertelemetria.com/v1/users", headers=headers, data=d_cliente_iter)
        
        return ClienteIter.tratarRespostaHTTP(r)
    
    def alterar(self, cliente):
        d_cliente_iter = self._montar_dic_cliente(cliente)

        token = ClienteIter.autenticarIter(self, cliente.chave_iter)
        headers = {'Authorization': 'Bearer %s' %token,
                   'Content-Type' : 'application/json' }
        
        r = requests.put("https://cnxs-api.itertelemetria.com/v1/users/%s" % (cliente.id_cliente_iter), headers=headers, data=d_cliente_iter)
        
        return ClienteIter.tratarRespostaHTTP(r)

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