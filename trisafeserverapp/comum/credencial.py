import cryptography
from cryptography.fernet import Fernet
from decouple import config
import base64
import encodings
import json

class Credencial:
    def __init__(self, chave_cliente = '', chave_servidor = ''):
        # chave parcial da iter do cliente
        self.chave_trisafe_cli = chave_cliente
        # chave parcial da iter do servidor
        self.chave_trisafe_serv = chave_servidor
        # token iter criptografado.
        self.token_trisafe = ''
        # usada somente quando o aplicativo eh aberto, para obter o token_trisafe do usuario da autenticacao secundaria.
        self.credencial_trisafe_cripto_secundaria = ''

        # chave parcial da iter do cliente
        self.chave_iter_cli = chave_cliente
        # chave parcial da iter do servidor
        self.chave_iter_serv = chave_servidor
        # token iter criptografado.
        self.token_iter = ''

        # chave parcial da clicksign do cliente
        self.chave_clicksign_cli = chave_cliente
        # chave parcial da clicksign do servidor
        self.chave_clicksign_serv = chave_servidor
        # token clicksign criptografado.
        self.token_clicksign = ''

    def set_token_trisafe(self, token):
        cripto = self.__preparar_cripto_trisafe__()

        if(cripto):
            if(isinstance(token, str)):
                token = token.encode()

            self.token_trisafe = cripto.encrypt(token)
        else:
            self.token_trisafe = token
    
    def get_token_trisafe(self):
        cripto = self.__preparar_cripto_trisafe__()
        
        if(cripto):
            if(isinstance(self.token_trisafe, str)):
                self.token_trisafe = self.token_trisafe.encode()

            token = cripto.decrypt(self.token_trisafe)
            return token.decode()

        return self.token_trisafe

    def set_token_iter(self, token):
        cripto = self.__preparar_cripto_iter__()

        if(cripto):
            if(isinstance(token, str)):
                token = token.encode()

            self.token_iter = cripto.encrypt(token)
        else:
            self.token_iter = token
    
    def get_token_iter(self):
        cripto = self.__preparar_cripto_iter__()
        
        if(cripto):
            if(isinstance(self.token_iter, str)):
                self.token_iter = self.token_iter.encode()

            token = cripto.decrypt(self.token_iter)
            return token.decode()

        return self.token_iter

    def set_token_clicksign(self, token):
        cripto = self.__preparar_cripto_clicksign__()

        if(cripto):
            if(isinstance(token, str)):
                token = token.encode()

            self.token_clicksign = cripto.encrypt(token)
        else:
            self.token_clicksign = token
    
    def get_token_clicksign(self):
        cripto = self.__preparar_cripto_clicksign__()
        
        if(cripto):
            if(isinstance(self.token_clicksign, str)):
                self.token_clicksign = self.token_clicksign.encode()

            token_b = cripto.decrypt(self.token_clicksign)
            token_b64 = token_b.decode()
            token = base64.b64decode(token_b64)

            if(not isinstance(token, str)):
                token = token.decode()

            return token

        return self.token_click

    def json(self):
        return self.__criar_json__()

    def __preparar_cripto_trisafe__(self):
        if((self.chave_trisafe_cli and len(self.chave_trisafe_cli) > 0) 
            and (self.chave_trisafe_serv and len(self.chave_trisafe_serv) > 0)):
            
            chave_trisafe = self.chave_trisafe_cli + self.chave_trisafe_serv
            chave_trisafe = chave_trisafe.encode()
            
            chaveb64 = base64.b64encode(chave_trisafe)
            
            fernet = Fernet(chaveb64)

            return fernet
        return None

    def __preparar_cripto_iter__(self):
        if((self.chave_iter_cli and len(self.chave_iter_cli) > 0) 
            and (self.chave_iter_serv and len(self.chave_iter_serv) > 0)):
            
            chave_iter = self.chave_iter_cli + self.chave_iter_serv
            chave_iter = chave_iter.encode()
            
            chaveb64 = base64.b64encode(chave_iter)
            
            fernet = Fernet(chaveb64)

            return fernet
        return None
    
    def __preparar_cripto_clicksign__(self):
        if((self.chave_clicksign_cli and len(self.chave_clicksign_cli) > 0) 
            and (self.chave_clicksign_serv and len(self.chave_clicksign_serv) > 0)):
            
            chave_clicksign = self.chave_clicksign_cli + self.chave_clicksign_serv
            chave_clicksign = chave_clicksign.encode()
            
            chaveb64 = base64.b64encode(chave_clicksign)
            
            fernet = Fernet(chaveb64)

            return fernet
        return None

    def __criar_json__(self):
        ret = {
            # Atribui token_trisafe criptografado.
            "token_trisafe": self.token_trisafe,
            # Atribui token_iter criptografado.
            "token_iter": self.token_iter,
            # Atribui token_clicksign criptografado.
            "token_clicksign": self.token_clicksign
        }
        
        return ret

    def __str__(self):
        return json.dumps(self.__criar_json__())