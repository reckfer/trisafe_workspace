import mimetypes
from datetime import datetime
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from django.db import models
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.request import Request, HttpRequest
from rest_framework import mixins
from rest_framework.renderers import JSONRenderer
from contrato.models import Contrato
from comum.retorno import Retorno
from comum.credencial import Credencial

from gerenciadorlog.models import GerenciadorLog
from autenticacaotrisafe.models import AutenticacaoTriSafe
from autenticacaotrisafe.models import ExceptionAutenticacaoTriSafe
import json
import traceback
import sys
import logging
from django_wsgi import middleware

# Create your views here.
class AutenticacaoTriSafeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = AutenticacaoTriSafe
        fields = ()

# ViewSets define the view behavior.
class AutenticacaoTriSafeViewSet(viewsets.ModelViewSet, permissions.BasePermission, GerenciadorLog):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = AutenticacaoTriSafeSerializer

    # Sobrescreve para fazer autenticacao com a Trisafe.
    def initial(self, request, *args, **kwargs):

        self.inicializar_contexto(request)
        self.registrar_info('Iniciando autenticacao Trisafe')
        
        init = super().initial(request, *args, **kwargs)
                
        if not (self.get_url_requisicao() == '/autenticacoestrisafe/autenticar_cliente/'):
            configuracao = AutenticacaoTriSafe(self)

            if not configuracao.retorno_autenticacao.estado.ok:
                raise ExceptionAutenticacaoTriSafe(configuracao.retorno_autenticacao.estado.mensagem)

        return init

    # Sobrescreve para capturar erros de autenticacao com a Trisafe.
    def handle_exception(self, exc):
        
        mensagem = ''
        if exc and len(exc.args) > 0:
            mensagem = exc.args[0]
        
        response = super().handle_exception(exc)

        retorno = Retorno(False, self, mensagem, '', response.status_code, exc)

        return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def autenticar_cliente(self, request):
        try:
            configuracao = AutenticacaoTriSafe(self)

            return configuracao.retorno_autenticacao.gerar_resposta_http()
            
        except Exception as e:
            
            retorno = Retorno(False, self, 'Autenticação do aplicativo falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    # @classmethod
    # def apropriar_credenciais_http(cls, request):
    #     chave_trisafe = ''
    #     token_trisafe = ''
    #     credencial_secundaria = ''
    #     d_dados_app = request.data

    #     if 'chaves' in d_dados_app:
    #         d_chaves = d_dados_app['chaves']
    #         chave_trisafe = d_chaves['chave_trisafe']
    #         token_trisafe = d_chaves['token_trisafe']
    #         if('credencial_secundaria' in d_chaves):
    #             credencial_secundaria = d_chaves['credencial_secundaria']

    #     credencial = Credencial(chave_trisafe, '')
    #     credencial.token_trisafe = token_trisafe.encode()
    #     credencial.credencial_trisafe_cripto_secundaria = credencial_secundaria

    #     return credencial