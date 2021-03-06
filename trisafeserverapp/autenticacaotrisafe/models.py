import json
import os
import base64
from decouple import config
from trisafeserverapp.settings import BASE_DIR
from comum.credencial import Credencial
from comum.retorno import Retorno

from gerenciadorlog.models import GerenciadorLog
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User

### Descomentar as linhas abaixo para que gere um token de autenticacao no momento do login do usuario pelo admin do django.

# from django.conf import settings
# from django.db.models.signals import post_save
# from django.dispatch import receiver
from rest_framework.authtoken.models import Token

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     Token.objects.get_or_create(user=instance)

## Nao expor esta classe via URL.

class AutenticacaoTriSafe(GerenciadorLog):
    def __init__(self, objeto_contexto):
        self.autenticado = False
        self.credencial = None
        self.headers_iter = None
        self.retorno_autenticacao = None
        
        objeto_contexto.definir_contexto(self)
        self.__autenticarTrisafe()

    #TODO: avaliar a possibilidade de fazer autenticacao por usuario, identificando pelo id do dispositivo.
    def __autenticarTrisafe(self):
        try:
            retorno = Retorno(False, self, 'Autenticação do aplicativo falhou.', 'UsuarioSenhaInvalidos')
            self.retorno_autenticacao = retorno
            self.autenticado = False

            chave_trisafe_cliente = None
            chave_trisafe_servidor = config('CHAVE_TRISAFE')
            token_trisafe = ''
            cred_trisafe_cripto_secund = ''
            
            if(self.credencial_trisafe):
                chave_trisafe_cliente = self.credencial_trisafe.chave_trisafe_cli
                token_trisafe = self.credencial_trisafe.token_trisafe
                cred_trisafe_cripto_secund = self.credencial_trisafe.credencial_trisafe_cripto_secundaria
            
            # Cria uma credencial completa, com a chave parcial do servidor, 
            # pois o parametro "credencial_cliente" vem soh com a chave parcial do cliente.
            self.credencial = Credencial(chave_trisafe_cliente, chave_trisafe_servidor)
            
            if token_trisafe and len(token_trisafe) > 0:
                self.credencial.token_trisafe = token_trisafe
                token_trisafe = self.credencial.get_token_trisafe()
                # Usa o token a partir do segundo acesso, depois que autenticou a primeira vez com as credenciais secundarias, ao abrir o aplicativo.
                token = Token.objects.get(key=token_trisafe)
                
                if(token and token.key):
                    self.autenticado = True
                    retorno = Retorno(True, self)

            elif cred_trisafe_cripto_secund:
                self.credencial.token_trisafe = cred_trisafe_cripto_secund
                
                credenciais_basicas_b64 = self.credencial.get_token_trisafe()
                credenciais_basicas = base64.b64decode(credenciais_basicas_b64).decode()
                credenciais_basicas = credenciais_basicas.split(sep=":")

                usuario = credenciais_basicas[0]
                senha = credenciais_basicas[1]
                
                # Obtem o usuario para validar a senha.
                lista_usuarios = User.objects.filter(username=usuario)
                if lista_usuarios:
                    m_usuario = lista_usuarios[0]
                    if m_usuario:
                        self.autenticado = m_usuario.check_password(senha)

                if self.autenticado:
                    retorno = Retorno(True, self)
                    
                    # Obtem o token.
                    token = Token.objects.get(user=m_usuario)
                    if(token and token.key):
                        # Atribui o token, criptografando.
                        self.credencial.set_token_trisafe(token.key)

                        # Atribui credencial para retornar o token para ao cliente.
                        retorno.dados = self.credencial
                    else:
                        retorno = Retorno(False, self, 'Não foi possível obter credencial de segurança do aplicativo. Contate o Administrador da Trisafe.', 'TokenNaoCadastrado')

            self.retorno_autenticacao = retorno
        except Exception as e:
            
            retorno = Retorno(False, self, 'Autenticação do aplicativo falhou.', None, None, e)
            self.retorno_autenticacao = retorno

class ExceptionAutenticacaoTriSafe(Exception):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)