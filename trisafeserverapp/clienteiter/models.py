import requests
import json
from comum.retorno import Retorno

class ClienteIter():
    
    @classmethod
    def tratarRespostaHTTP(cls, respostaHTTP):
        
        if respostaHTTP.status_code < 200 or respostaHTTP.status_code > 300:
            retorno = Retorno(False, respostaHTTP.text, respostaHTTP.status_code)
        else:
            retorno = Retorno(True)
            retorno.dados = respostaHTTP.json()['user']

        return retorno

    def obter(self, idCliente):
        token = ClienteIter.autenticarIter(self)
        headers = {'Authorization': 'Bearer %s' %token,
                'Content-Type' : 'application/json' }
        url = "https://cnxs-api.itertelemetria.com/v1/users/{0}".format(idCliente)
        print(url)
        print(headers)
        r = requests.get(url, headers=headers)
        return ClienteIter.tratarRespostaHTTP(r)
        
    def autenticarIter(self):
        headers = {'Authorization': 'Basic ZG9jdW1lbnRhY2FvQGl0ZXIuc2M6ZG9jdW1lbnRhY2FvMTIz'}
        r = requests.get("http://cnxs-api.itertelemetria.com/v1/sign_in", headers=headers)
        
        #TODO:Fazer tratamentos de erro.
        respostaJson = r.json()
        return respostaJson["token"]

    #TODO: passar para a classe ClienteIter
    def incluir(self, cliente):
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
                "district": cliente.bairro,
                "city": cliente.cidade,
                "state": cliente.uf,
                "active": True
            }
        })

        token = ClienteIter.autenticarIter(self)
        headers = {'Authorization': 'Bearer %s' %token,
                   'Content-Type' : 'application/json' }
        
        r = requests.post("https://cnxs-api.itertelemetria.com/v1/users", headers=headers, data=jsonCliente)
        
        return ClienteIter.tratarRespostaHTTP(r)