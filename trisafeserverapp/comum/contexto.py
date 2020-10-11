import cryptography
from cryptography.fernet import Fernet
from decouple import config
from comum.credencial import Credencial
import base64
import encodings
import json

class Contexto:
    def __init__(self):
        # dados do dispositivo
        self.d_dados_dispositivo = None
        self.dados_dispositivo_str = ''
        # metodo url chamado
        self.url_requisicao = ''
        self.url_requisicao_str = ''
        self.credencial_trisafe = None
        self.credencial_iter = None
        self.credencial_clicksign = None

    def set_dados_dispositivo(self, d_dados_dispositivo):
        self.d_dados_dispositivo = d_dados_dispositivo
        self.dados_dispositivo_str = '[%s %s %s %s]' % (self.d_dados_dispositivo['nome_sistema'], self.d_dados_dispositivo['versao_sistema'], self.d_dados_dispositivo['fabricante'], self.d_dados_dispositivo['device_id'])

    def get_dados_dispositivo(self):
        return self.d_dados_dispositivo
    
    def get_dados_dispositivo_str(self):
        return self.dados_dispositivo_str
    
    def get_url_requisicao(self):
        return self.url_requisicao
    
    def get_url_requisicao_str(self):
        return self.url_requisicao_str
    
    def set_url_requisicao(self, url_requisicao):
        self.url_requisicao = url_requisicao
        self.url_requisicao_str = '[Metodo URL: %s]' % self.url_requisicao

    def inicializar_contexto(self, request):
        if 'dados_dispositivo' in request.data:
            self.set_dados_dispositivo(request.data['dados_dispositivo'])
        
        self.apropriar_credenciais_http(request.data)
        
        self.set_url_requisicao(request.stream.path)

    def definir_contexto(self, objeto_definir):
        objeto_definir.set_dados_dispositivo(self.get_dados_dispositivo())
        objeto_definir.set_url_requisicao(self.get_url_requisicao())
        objeto_definir.credencial_trisafe = self.credencial_trisafe
        objeto_definir.credencial_iter = self.credencial_iter
        objeto_definir.credencial_clicksign = self.credencial_clicksign

        return objeto_definir
    
    def apropriar_credenciais_http(self, d_dados_requisicao):
        if 'chaves' in d_dados_requisicao:
            d_chaves = d_dados_requisicao['chaves']

            if('chave_trisafe' in d_chaves):
                chave_trisafe = d_chaves['chave_trisafe']
                token_trisafe = d_chaves['token_trisafe']
                
                self.credencial_trisafe = Credencial(chave_trisafe, '')
                self.credencial_trisafe.token_trisafe = token_trisafe.encode()
                
                if('credencial_secundaria' in d_chaves):
                    credencial_secundaria = d_chaves['credencial_secundaria']
                    self.credencial_trisafe.credencial_trisafe_cripto_secundaria = credencial_secundaria
        
            if('chave_iter' in d_chaves):
                chave_iter = d_chaves['chave_iter']
                token_iter = d_chaves['token_iter']

                self.credencial_iter = Credencial(chave_iter, '')
                self.credencial_iter.token_iter = token_iter

            if('chave_clicksign' in d_chaves):
                chave_clicksign = d_chaves['chave_clicksign']
                token_clicksign = d_chaves['token_clicksign']

                self.credencial_clicksign = Credencial(chave_clicksign, '')
                self.credencial_clicksign.token_clicksign = token_clicksign

    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        ret = {
            # Atribui token_trisafe criptografado.
            "dados_dispositivo": self.d_dados_dispositivo
        }
        
        return ret

    def __str__(self):
        return json.dumps(self.__criar_json__())